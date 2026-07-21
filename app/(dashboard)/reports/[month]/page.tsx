import Link from "next/link";
import { ArrowLeft, ArrowUpRight, ArrowDownRight, ArrowLeftRight, ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import { getMonthDetail } from "@/features/reports/actions";
import { fmtIDR } from "@/lib/format";
import { cn } from "@/lib/utils";

const fmtDateLong = (d: string) =>
  new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });

const fmtMonthTitle = (monthParam: string) => {
  const [year, month] = monthParam.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, 1)).toLocaleDateString("id-ID", {
    month: "long",
    year: "numeric",
  });
};

export default async function MonthDetailPage({
  params,
}: {
  params: Promise<{ month: string }>;
}) {
  const { month } = await params;
  const { cashTx, invTx } = await getMonthDetail(month);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/reports"
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={13} />
          Kembali ke Laporan
        </Link>
        <h2 className="mt-2 text-lg font-semibold capitalize">{fmtMonthTitle(month)}</h2>
        <p className="text-sm text-muted-foreground">
          Semua transaksi cash flow dan investasi di bulan ini.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <p className="text-sm font-semibold">Cash Flow</p>
        {cashTx.length === 0 ? (
          <div className="rounded-2xl border bg-card p-8 text-center text-sm text-muted-foreground">
            Tidak ada transaksi cash flow di bulan ini.
          </div>
        ) : (
          <div className="rounded-2xl border bg-card p-4">
            <div className="flex flex-col divide-y divide-border">
              {cashTx.map((t: any) => {
                const isIncome = t.type === "income";
                const isTransfer = t.type === "transfer";
                return (
                  <div key={t.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
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
                        {t.cash_accounts?.name} · {fmtDateLong(t.date)}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "font-mono text-sm font-medium shrink-0 tabular-nums",
                        isTransfer ? "text-foreground" : isIncome ? "text-primary" : "text-destructive"
                      )}
                    >
                      {isIncome ? "+" : isTransfer ? "" : "-"}
                      {fmtIDR(t.amount)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4">
        <p className="text-sm font-semibold">Investasi</p>
        {invTx.length === 0 ? (
          <div className="rounded-2xl border bg-card p-8 text-center text-sm text-muted-foreground">
            Tidak ada transaksi investasi di bulan ini.
          </div>
        ) : (
          <div className="rounded-2xl border bg-card p-4">
            <div className="flex flex-col divide-y divide-border">
              {invTx.map((t: any) => {
                const isBuy = t.side === "buy";
                const isStock = t.asset_type === "stock";
                const displayQty = isStock ? t.quantity / 100 : t.quantity;
                const total = t.quantity * t.price + (isBuy ? t.fee : -t.fee);
                return (
                  <div key={t.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
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
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}