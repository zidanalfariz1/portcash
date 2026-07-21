import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { fmtIDR } from "@/lib/format";
import { cn } from "@/lib/utils";

type Row = {
  month: string;
  income: number;
  expense: number;
  net: number;
  endingBalance: number;
};

const fmtMonth = (m: string) =>
  new Date(m).toLocaleDateString("id-ID", { month: "long", year: "numeric" });

const toMonthParam = (m: string) => m.slice(0, 7); // "2026-07-01" -> "2026-07"

export function MonthlyHistory({ rows }: { rows: Row[] }) {
  if (rows.length === 0) {
    return (
      <div className="rounded-2xl border bg-card p-8 text-center text-sm text-muted-foreground">
        Belum ada data cash flow bulanan.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border bg-card p-4 overflow-x-auto">
      <div className="min-w-[640px]">
        <div className="grid grid-cols-[1.2fr_1fr_1fr_1fr_1.2fr_20px] gap-2 text-[11px] uppercase tracking-wide text-muted-foreground pb-2 border-b">
          <span>Bulan</span>
          <span className="text-right">Pendapatan</span>
          <span className="text-right">Pengeluaran</span>
          <span className="text-right">Net</span>
          <span className="text-right">Saldo Akhir</span>
          <span />
        </div>
        {rows.map((r) => {
          const netPositive = r.net >= 0;
          return (
            <Link
              key={r.month}
              href={`/reports/${toMonthParam(r.month)}`}
              className="grid grid-cols-[1.2fr_1fr_1fr_1fr_1.2fr_20px] gap-2 items-center py-3 border-b last:border-0 -mx-2 px-2 rounded-lg hover:bg-accent/40 transition-colors"
            >
              <span className="text-sm font-medium capitalize">{fmtMonth(r.month)}</span>
              <span className="font-mono text-xs text-right text-primary tabular-nums">
                {fmtIDR(r.income)}
              </span>
              <span className="font-mono text-xs text-right text-destructive tabular-nums">
                {fmtIDR(r.expense)}
              </span>
              <span
                className={cn(
                  "font-mono text-xs text-right font-medium tabular-nums",
                  netPositive ? "text-primary" : "text-destructive"
                )}
              >
                {netPositive ? "+" : ""}
                {fmtIDR(r.net)}
              </span>
              <span className="font-mono text-xs text-right font-semibold tabular-nums">
                {fmtIDR(r.endingBalance)}
              </span>
              <ChevronRight size={14} className="text-muted-foreground justify-self-end" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}