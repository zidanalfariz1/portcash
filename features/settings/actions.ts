"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function getProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data } = await supabase
    .from("users")
    .select("name, email")
    .eq("id", user.id)
    .maybeSingle();

  return { name: data?.name ?? "", email: data?.email ?? user.email ?? "" };
}

export async function updateProfileName(name: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase
    .from("users")
    .update({ name })
    .eq("id", user.id);

  if (error) throw new Error(error.message);
  revalidatePath("/settings");
}

export async function getCategoriesWithUsage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("kind", { ascending: true })
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);
  return data;
}

export async function createCategory(name: string, kind: "income" | "expense") {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase.from("categories").insert({
    user_id: user.id,
    name,
    kind,
  });

  if (error) throw new Error(error.message);
  revalidatePath("/settings");
}

export async function deleteCategory(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("categories").delete().eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/settings");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function updatePassword(newPassword: string) {
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw new Error(error.message);
}