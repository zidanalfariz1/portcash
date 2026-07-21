"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type AssetType = "stock" | "crypto";
export type TradeSide = "buy" | "sell";

export async function getPortfolio() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("v_portfolio_value")
    .select("*")
    .order("market_value", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}

export async function getInvestmentTransactions(limit = 20) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("investment_transactions")
    .select("*, cash_accounts(name)")
    .order("date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return data;
}

export async function createInvestmentTransaction(formData: {
  account_id: string;
  asset_type: AssetType;
  symbol: string;
  side: TradeSide;
  quantity: number;
  price: number;
  fee: number;
  date: string;
  note: string | null;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase.from("investment_transactions").insert({
    user_id: user.id,
    account_id: formData.account_id,
    asset_type: formData.asset_type,
    symbol: formData.symbol.toUpperCase(),
    side: formData.side,
    quantity: formData.quantity,
    price: formData.price,
    fee: formData.fee,
    date: formData.date,
    note: formData.note,
  });

  if (error) throw new Error(error.message);
  revalidatePath("/investment");
  revalidatePath("/cash");
}

export async function deleteInvestmentTransaction(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("investment_transactions")
    .delete()
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/investment");
  revalidatePath("/cash");
}

// Manual price update — sementara, sebelum scheduler otomatis dibuat
export async function upsertMarketPrice(symbol: string, assetType: AssetType, price: number) {
  const supabase = await createClient();
  const { error } = await supabase.from("market_prices").upsert({
    symbol: symbol.toUpperCase(),
    asset_type: assetType,
    price,
    updated_at: new Date().toISOString(),
  });

  if (error) throw new Error(error.message);
  revalidatePath("/investment");
}