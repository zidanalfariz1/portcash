"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Plus, Lock } from "lucide-react";
import { createCategory, deleteCategory } from "./actions";
import { cn } from "@/lib/utils";

type Category = {
  id: string;
  name: string;
  kind: "income" | "expense";
  user_id: string | null;
};

export function CategoryManager({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [kind, setKind] = useState<"income" | "expense">("expense");
  const [loading, setLoading] = useState(false);

  const income = categories.filter((c) => c.kind === "income");
  const expense = categories.filter((c) => c.kind === "expense");

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      await createCategory(name.trim(), kind);
      setName("");
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal menambah kategori");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Hapus kategori ini?")) return;
    await deleteCategory(id);
    router.refresh();
  }

  function CategoryGroup({ title, items }: { title: string; items: Category[] }) {
    return (
      <div className="flex flex-col gap-2">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {title}
        </p>
        <div className="flex flex-wrap gap-2">
          {items.map((c) => (
            <span
              key={c.id}
              className="group inline-flex items-center gap-1.5 rounded-full border bg-accent/30 px-3 py-1.5 text-sm"
            >
              {c.name}
              {c.user_id === null ? (
                <Lock size={11} className="text-muted-foreground" />
              ) : (
                <button
                  type="button"
                  onClick={() => handleDelete(c.id)}
                  className="text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
                >
                  <Trash2 size={12} />
                </button>
              )}
            </span>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border bg-card p-5 flex flex-col gap-6">
      <CategoryGroup title="Pemasukan" items={income} />
      <CategoryGroup title="Pengeluaran" items={expense} />

      <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-2 pt-2 border-t">
        <Input
          placeholder="Nama kategori baru"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="flex-1"
        />
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setKind("income")}
            className={cn(
              "rounded-lg border px-3 py-2 text-xs font-medium transition-colors",
              kind === "income"
                ? "border-primary bg-primary/10 text-primary"
                : "text-muted-foreground"
            )}
          >
            Pemasukan
          </button>
          <button
            type="button"
            onClick={() => setKind("expense")}
            className={cn(
              "rounded-lg border px-3 py-2 text-xs font-medium transition-colors",
              kind === "expense"
                ? "border-destructive bg-destructive/10 text-destructive"
                : "text-muted-foreground"
            )}
          >
            Pengeluaran
          </button>
          <Button type="submit" size="sm" disabled={loading || !name.trim()}>
            <Plus size={14} />
          </Button>
        </div>
      </form>
    </div>
  );
}