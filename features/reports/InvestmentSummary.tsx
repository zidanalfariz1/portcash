import { fmtIDR } from "@/lib/format";
import { cn } from "@/lib/utils";

export function InvestmentSummary({
  modal,
  nilaiSekarang,
  unrealizedPnl,
  realizedPnl,
}: {
  modal: number;
  nilaiSekarang: number;
  unrealizedPnl: number;
  realizedPnl: number;
}) {
  const cards = [
    { label: "Modal (Holding Aktif)", value: modal, tone: "neutral" as const },
    { label: "Nilai Sekarang", value: nilaiSekarang, tone: "neutral" as const },
    { label: "Unrealized P/L", value: unrealizedPnl, tone: "pnl" as const },
    { label: "Realized P/L (All-time)", value: realizedPnl, tone: "pnl" as const },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c) => {
        const positive = c.value >= 0;
        return (
          <div key={c.label} className="rounded-2xl border bg-card p-5">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
              {c.label}
            </p>
            <p
              className={cn(
                "mt-2 font-mono text-lg font-semibold tabular-nums",
                c.tone === "pnl" && (positive ? "text-primary" : "text-destructive")
              )}
            >
              {c.tone === "pnl" && positive ? "+" : ""}
              {fmtIDR(c.value)}
            </p>
          </div>
        );
      })}
    </div>
  );
}