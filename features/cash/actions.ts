"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";


export type AccountType = "bank" | "ewallet" | "cash" | "rdn" | "cex";

export async function getAccounts() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cash_accounts")
    .select("*")
    .eq("is_archived", false)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return data;
}

export async function getAccountBalances() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("v_cash_account_balance")
    .select("*");

  if (error) throw new Error(error.message);
  return data;
}

export async function createAccount(formData: {
  name: string;
  type: AccountType;
  opening_balance: number;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase.from("cash_accounts").insert({
    user_id: user.id,
    name: formData.name,
    type: formData.type,
    opening_balance: formData.opening_balance,
  });

  if (error) throw new Error(error.message);
  revalidatePath("/cash");
}

export async function archiveAccount(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("cash_accounts")
    .update({ is_archived: true })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/cash");
}

export async function getCategories() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);
  return data;
}

export async function getTransactions(limit = 20) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cash_transactions")
    .select("*, cash_accounts!cash_transactions_account_id_fkey(name), categories(name)")
    .order("date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return data;
}

export async function createTransaction(formData: {
  account_id: string;
  to_account_id?: string | null;
  type: "income" | "expense" | "transfer";
  category_id: string | null;
  amount: number;
  date: string;
  note: string | null;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  // Validasi saldo untuk expense & transfer (income tidak perlu dicek)
  if (formData.type === "expense" || formData.type === "transfer") {
    const { data: balanceRow } = await supabase
      .from("v_cash_account_balance")
      .select("balance, name")
      .eq("account_id", formData.account_id)
      .single();

    const currentBalance = balanceRow?.balance ?? 0;
    if (formData.amount > currentBalance) {
      throw new Error(
        `Saldo tidak mencukupi. Saldo ${balanceRow?.name ?? "akun"} saat ini: ${new Intl.NumberFormat(
          "id-ID",
          { style: "currency", currency: "IDR", maximumFractionDigits: 0 }
        ).format(currentBalance)}`
      );
    }
  }

  const { error } = await supabase.from("cash_transactions").insert({
    user_id: user.id,
    account_id: formData.account_id,
    to_account_id: formData.to_account_id ?? null,
    type: formData.type,
    category_id: formData.category_id,
    amount: formData.amount,
    date: formData.date,
    note: formData.note,
  });

  if (error) throw new Error(error.message);
  revalidatePath("/cash");
}

export async function deleteTransaction(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("cash_transactions")
    .delete()
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/cash");
}

export async function getAccountBalanceById(accountId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("v_cash_account_balance")
    .select("balance")
    .eq("account_id", accountId)
    .single();

  if (error) return 0;
  return data?.balance ?? 0;
}

export async function getVisibleAccounts() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cash_accounts")
    .select("*")
    .eq("is_archived", false)
    .eq("is_goal", false)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return data;
}

export async function getBankEwalletAccounts() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cash_accounts")
    .select("*")
    .eq("is_archived", false)
    .eq("is_goal", false)
    .in("type", ["bank", "ewallet"])
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return data;
}