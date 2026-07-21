"use server";

import { createClient } from "@/lib/supabase/server";

export async function getInvestmentSummary() {
  const supabase = await createClient();

  const { data: holdings, error: holdingsError } = await supabase
    .from("v_portfolio_value")
    .select("market_value, avg_buy_price, qty_held");

  if (holdingsError) throw new Error(holdingsError.message);

  const { data: realized, error: realizedError } = await supabase
    .from("v_realized_pnl")
    .select("realized_pnl");

  if (realizedError) throw new Error(realizedError.message);

  const modal = (holdings ?? []).reduce(
    (s, h) => s + h.avg_buy_price * h.qty_held,
    0
  );
  const nilaiSekarang = (holdings ?? []).reduce(
    (s, h) => s + (h.market_value ?? 0),
    0
  );
  const unrealizedPnl = nilaiSekarang - modal;
  const realizedPnl = (realized ?? []).reduce(
    (s, r) => s + (r.realized_pnl ?? 0),
    0
  );

  return { modal, nilaiSekarang, unrealizedPnl, realizedPnl };
}

export async function getMonthlyCashFlowHistory() {
  const supabase = await createClient();

  const { data: accounts, error: accError } = await supabase
    .from("cash_accounts")
    .select("opening_balance");
  if (accError) throw new Error(accError.message);

  const openingTotal = (accounts ?? []).reduce(
    (s, a) => s + Number(a.opening_balance),
    0
  );

  const { data: monthly, error: monthlyError } = await supabase
    .from("v_monthly_cash_flow")
    .select("*")
    .order("month", { ascending: true });
  if (monthlyError) throw new Error(monthlyError.message);

  let running = openingTotal;
  const rows = (monthly ?? []).map((m) => {
    running = running + Number(m.income) - Number(m.expense);
    return {
      month: m.month as string,
      income: Number(m.income),
      expense: Number(m.expense),
      net: Number(m.income) - Number(m.expense),
      endingBalance: running,
    };
  });

  return rows.reverse(); // terbaru duluan
}

export async function getMonthDetail(monthParam: string) {
  const supabase = await createClient();

  // monthParam format: "2026-07"
  const [year, month] = monthParam.split("-").map(Number);
  const startDate = new Date(Date.UTC(year, month - 1, 1)).toISOString().slice(0, 10);
  const endDate = new Date(Date.UTC(year, month, 1)).toISOString().slice(0, 10);

  const [{ data: cashTx, error: cashError }, { data: invTx, error: invError }] =
    await Promise.all([
      supabase
        .from("cash_transactions")
        .select("id, type, amount, date, note, cash_accounts!cash_transactions_account_id_fkey(name), categories(name)")
        .gte("date", startDate)
        .lt("date", endDate)
        .order("date", { ascending: false }),
      supabase
        .from("investment_transactions")
        .select("id, side, symbol, asset_type, quantity, price, fee, date, cash_accounts(name)")
        .gte("date", startDate)
        .lt("date", endDate)
        .order("date", { ascending: false }),
    ]);

  if (cashError) throw new Error(cashError.message);
  if (invError) throw new Error(invError.message);

  return { cashTx: cashTx ?? [], invTx: invTx ?? [] };
}