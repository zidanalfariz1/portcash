"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getGoals() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("v_goals_progress")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return data;
}

export async function createGoal(
  name: string,
  targetAmount: number,
  targetDate: string | null
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: account, error: accError } = await supabase
    .from("cash_accounts")
    .insert({
      user_id: user.id,
      name,
      type: "cash",
      opening_balance: 0,
      is_goal: true,
    })
    .select()
    .single();

  if (accError) throw new Error(accError.message);

  const { error: goalError } = await supabase.from("goals").insert({
    user_id: user.id,
    account_id: account.id,
    name,
    target_amount: targetAmount,
    target_date: targetDate,
  });

  if (goalError) throw new Error(goalError.message);

  revalidatePath("/goals");
  revalidatePath("/cash");
  revalidatePath("/dashboard");
}

export async function withdrawAndDeleteGoal(
  goalId: string,
  accountId: string,
  destinationAccountId: string | null
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data: balanceRow } = await supabase
    .from("v_cash_account_balance")
    .select("balance")
    .eq("account_id", accountId)
    .single();

  const currentBalance = balanceRow?.balance ?? 0;

  if (currentBalance > 0) {
    if (!destinationAccountId) {
      throw new Error("Pilih akun tujuan untuk menarik saldo goal ini.");
    }
    const { error: txError } = await supabase.from("cash_transactions").insert({
      user_id: user.id,
      account_id: accountId,
      to_account_id: destinationAccountId,
      type: "transfer",
      category_id: null,
      amount: currentBalance,
      date: new Date().toISOString().slice(0, 10),
      note: "Tarik saldo goal (goal dihapus)",
    });
    if (txError) throw new Error(txError.message);
  }

  const { error: e1 } = await supabase.from("goals").delete().eq("id", goalId);
  if (e1) throw new Error(e1.message);

  const { error: e2 } = await supabase
    .from("cash_accounts")
    .update({ is_archived: true })
    .eq("id", accountId);
  if (e2) throw new Error(e2.message);

  revalidatePath("/goals");
  revalidatePath("/cash");
  revalidatePath("/dashboard");
}