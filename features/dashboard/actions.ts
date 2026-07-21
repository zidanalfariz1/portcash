"use server";

import { createClient } from "@/lib/supabase/server";

export async function getNetWorth() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("v_net_worth")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ?? { total_cash: 0, total_investment: 0, net_worth: 0 };
}

export async function getAllocationBreakdown() {
  const supabase = await createClient();

  const [{ data: accounts, error: accError }, { data: balances, error: balError }, { data: portfolio, error: pfError }] =
    await Promise.all([
      supabase.from("cash_accounts").select("id, is_goal").eq("is_archived", false),
      supabase.from("v_cash_account_balance").select("account_id, balance"),
      supabase.from("v_portfolio_value").select("asset_type, market_value"),
    ]);

  if (accError) throw new Error(accError.message);
  if (balError) throw new Error(balError.message);
  if (pfError) throw new Error(pfError.message);

  let freeCash = 0;
  let savings = 0;
  for (const acc of accounts ?? []) {
    const bal = balances?.find((b) => b.account_id === acc.id)?.balance ?? 0;
    if (acc.is_goal) savings += bal;
    else freeCash += bal;
  }

  const stock = (portfolio ?? [])
    .filter((d) => d.asset_type === "stock")
    .reduce((s, d) => s + (d.market_value ?? 0), 0);
  const crypto = (portfolio ?? [])
    .filter((d) => d.asset_type === "crypto")
    .reduce((s, d) => s + (d.market_value ?? 0), 0);

  return { freeCash, savings, stock, crypto };
}

export async function getCurrentMonthCashFlow() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("v_monthly_cash_flow")
    .select("*")
    .order("month", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ?? { income: 0, expense: 0 };
}

export async function getTopHoldings(limit = 5) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("v_portfolio_value")
    .select("*")
    .order("market_value", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getRecentActivity(limit = 6) {
  const supabase = await createClient();

  const [{ data: cashTx }, { data: invTx }, { data: goalAccounts }] = await Promise.all([
    supabase
      .from("cash_transactions")
      .select("id, type, amount, date, note, categories(name)")
      .neq("type", "transfer")
      .order("date", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(limit),
    supabase
      .from("investment_transactions")
      .select("id, side, symbol, quantity, price, fee, date")
      .order("date", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(limit),
    supabase.from("cash_accounts").select("id").eq("is_goal", true),
  ]);

  const goalAccountIds = (goalAccounts ?? []).map((g: any) => g.id);

  let goalTx: any[] = [];
  if (goalAccountIds.length > 0) {
    const { data } = await supabase
      .from("cash_transactions")
      .select("id, amount, date, note")
      .eq("type", "transfer")
      .in("to_account_id", goalAccountIds)
      .order("date", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(limit);
    goalTx = data ?? [];
  }

  const merged = [
    ...(cashTx ?? []).map((t: any) => ({
      id: t.id,
      label: t.categories?.name ?? (t.type === "income" ? "Pemasukan" : "Pengeluaran"),
      amount: t.type === "income" ? t.amount : -t.amount,
      date: t.date,
    })),
    ...(invTx ?? []).map((t: any) => ({
      id: t.id,
      label: `${t.side === "buy" ? "Buy" : "Sell"} ${t.symbol}`,
      amount:
        t.side === "buy"
          ? -(t.quantity * t.price + t.fee)
          : t.quantity * t.price - t.fee,
      date: t.date,
    })),
    ...goalTx.map((t: any) => ({
      id: t.id,
      label: t.note ?? "Setor ke Goal",
      amount: -t.amount,
      date: t.date,
    })),
  ];

  merged.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return merged.slice(0, limit);
}

export async function getPortfolioPnLSummary() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("v_portfolio_value")
    .select("market_value, avg_buy_price, qty_held, unrealized_pnl");

  if (error) throw new Error(error.message);

  const rows = (data ?? []).filter((r) => r.market_value !== null);
  if (rows.length === 0) return null;

  const totalPnl = rows.reduce((s, r) => s + (r.unrealized_pnl ?? 0), 0);
  const totalCost = rows.reduce((s, r) => s + r.avg_buy_price * r.qty_held, 0);
  const pct = totalCost > 0 ? (totalPnl / totalCost) * 100 : 0;

  return { totalPnl, pct };
}