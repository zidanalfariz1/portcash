"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowUpCircle, ArrowDownCircle, Trash2 } from "lucide-react";
import { deleteInvestmentTransaction } from "./actions";
import { fmtIDR } from "@/lib/format";
import { cn } from "@/lib/utils";

const fmtDateLong = (d: string) =>
  new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });

type Tx = {
  id: string;
  asset_type: "stock" | "crypto";
  symbol: string;
  side: "buy" | "sell";
  quantity: number;
  price: number;
  fee: number;
  date: string;
  note: string | null;
  cash_accounts: { name: string } | null;
};

export function TransactionList({ transactions }: { transactions: Tx[] }) {
  const router = useRouter();

  async function handleDelete(id: string) {
    if (!confirm("Hapus transaksi ini? Portfolio akan otomatis dihitung ulang.")) return;
    await deleteInvestmentTransaction(id);
    router.refresh();
  }

  if (transactions.length === 0) {
    return (
      <div className="rounded-2xl border bg-card p-8 text-center text-sm text-muted-foreground">
        Belum ada riwayat transaksi investasi.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border bg-card p-4">
      <div className="flex flex-col divide-y divide-border">
        {transactions.map((t) => {
          const isBuy = t.side === "buy";
          const isStock = t.asset_type === "stock";
          const displayQty = isStock ? t.quantity / 100 : t.quantity;
          const total = t.quantity * t.price + (isBuy ? t.fee : -t.fee);

          return (
            <div
              key={t.id}
              className="group flex items-center gap-3 py-3 first:pt-0 last:pb-0 -mx-2 px-2 rounded-lg hover:bg-accent/40 transition-colors"
            >
              <div
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-xl shrink-0",
                  isBuy ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"
                )}
              >
                {isBuy ? <ArrowDownCircle size={16} /> : <ArrowUpCircle size={16} />}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">
                  {isBuy ? "Buy" : "Sell"} {t.symbol}
                  <span className="ml-1 text-xs font-normal text-muted-foreground">
                    ({isStock ? "Saham" : "Crypto"})
                  </span>
                </p>
                <p className="text-xs text-muted-foreground">
                  {displayQty}
                  {isStock ? " lot" : " unit"} @ {fmtIDR(t.price)} · {t.cash_accounts?.name} ·{" "}
                  {fmtDateLong(t.date)}
                </p>
                {t.note && (
                  <p className="text-xs text-muted-foreground italic truncate">{t.note}</p>
                )}
              </div>

              <span
                className={cn(
                  "font-mono text-sm font-medium shrink-0 tabular-nums",
                  isBuy ? "text-destructive" : "text-primary"
                )}
              >
                {isBuy ? "-" : "+"}
                {fmtIDR(total)}
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