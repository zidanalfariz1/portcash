"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Landmark, Smartphone, Banknote, TrendingUp, Bitcoin, Trash2 } from "lucide-react";
import { archiveAccount } from "./actions";
import { fmtIDR } from "@/lib/format";

const icons = {
  bank: Landmark,
  ewallet: Smartphone,
  cash: Banknote,
  rdn: TrendingUp,
  cex: Bitcoin,
};

type Balance = {
  account_id: string;
  name: string;
  balance: number;
};

type Account = {
  id: string;
  name: string;
  type: "bank" | "ewallet" | "cash" | "rdn" | "cex";
};

export function AccountList({
  accounts,
  balances,
}: {
  accounts: Account[];
  balances: Balance[];
}) {
  const router = useRouter();

  async function handleDelete(id: string) {
    if (!confirm("Arsipkan akun ini?")) return;
    await archiveAccount(id);
    router.refresh();
  }

  if (accounts.length === 0) {
    return (
      <div className="rounded-2xl border bg-card p-8 text-center text-sm text-muted-foreground">
        Belum ada cash account. Tambahkan rekening atau dompet digital kamu
        untuk mulai mencatat transaksi.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {accounts.map((acc) => {
        const Icon = icons[acc.type];
        const bal = balances.find((b) => b.account_id === acc.id);
        return (
          <div
            key={acc.id}
            className="group relative rounded-2xl border bg-card p-5 transition-colors hover:bg-accent/40"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon size={18} />
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
                onClick={() => handleDelete(acc.id)}
              >
                <Trash2 size={14} />
              </Button>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">{acc.name}</p>
            <p className="font-mono text-xl font-semibold tabular-nums">
              {fmtIDR(bal?.balance ?? 0)}
            </p>
          </div>
        );
      })}
    </div>
  );
}