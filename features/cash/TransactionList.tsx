"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, ArrowDownRight, ArrowLeftRight, Trash2 } from "lucide-react";
import { deleteTransaction } from "./actions";
import { fmtIDR, fmtDate } from "@/lib/format";
import { cn } from "@/lib/utils";

type Tx = {
  id: string;
  type: "income" | "expense" | "transfer";
  amount: number;
  date: string;
  note: string | null;
  cash_accounts: { name: string } | null;
  categories: { name: string } | null;
};

export function TransactionList({ transactions }: { transactions: Tx[] }) {
  const router = useRouter();

  async function handleDelete(id: string) {
    if (!confirm("Hapus transaksi ini?")) return;
    await deleteTransaction(id);
    router.refresh();
  }

  if (transactions.length === 0) {
    return (
      <div className="rounded-2xl border bg-card p-8 text-center text-sm text-muted-foreground">
        Belum ada transaksi. Tambahkan pemasukan atau pengeluaran pertama kamu.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border bg-card p-4">
      <div className="flex flex-col divide-y divide-border">
        {transactions.map((t) => {
          const isIncome = t.type === "income";
          const isTransfer = t.type === "transfer";

          return (
            <div
              key={t.id}
              className="group flex items-center gap-3 py-3 first:pt-0 last:pb-0 -mx-2 px-2 rounded-lg hover:bg-accent/40 transition-colors"
            >
              <div
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-xl shrink-0",
                  isTransfer
                    ? "bg-accent text-foreground"
                    : isIncome
                    ? "bg-primary/10 text-primary"
                    : "bg-destructive/10 text-destructive"
                )}
              >
                {isTransfer ? (
                  <ArrowLeftRight size={16} />
                ) : isIncome ? (
                  <ArrowUpRight size={16} />
                ) : (
                  <ArrowDownRight size={16} />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {t.categories?.name ?? (isTransfer ? "Transfer" : "Tanpa kategori")}
                  {t.note ? ` · ${t.note}` : ""}
                </p>
                <p className="text-xs text-muted-foreground">
                  {t.cash_accounts?.name} · {fmtDate(t.date)}
                </p>
              </div>

              <span
                className={cn(
                  "font-mono text-sm font-medium shrink-0 tabular-nums",
                  isTransfer
                    ? "text-foreground"
                    : isIncome
                    ? "text-primary"
                    : "text-destructive"
                )}
              >
                {isIncome ? "+" : isTransfer ? "" : "-"}
                {fmtIDR(t.amount)}
              </span>

              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100 shrink-0"
                onClick={() => handleDelete(t.id)}
              >
                <Trash2 size={14} />
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}