"use client";

import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { fmtIDR } from "@/lib/format";
import { cn } from "@/lib/utils";

type Holding = {
  symbol: string;
  asset_type: "stock" | "crypto";
  qty_held: number;
  avg_buy_price: number;
  last_price: number | null;
  market_value: number | null;
  unrealized_pnl: number | null;
  unrealized_pnl_pct: number | null;
};

export function PortfolioList({ holdings }: { holdings: Holding[] }) {
  if (holdings.length === 0) {
    return (
      <div className="rounded-2xl border bg-card p-8 text-center text-sm text-muted-foreground">
        Belum ada holding. Catat transaksi Buy pertama kamu.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border bg-card p-4 overflow-x-auto">
      <div className="min-w-[720px]">
        <div className="grid grid-cols-[1.3fr_0.8fr_1fr_1fr_1fr_0.8fr] gap-2 text-[11px] uppercase tracking-wide text-muted-foreground pb-2 border-b">
          <span>Aset</span>
          <span className="text-right">Qty</span>
          <span className="text-right">Harga Beli</span>
          <span className="text-right">Harga Sekarang</span>
          <span className="text-right">Nilai</span>
          <span className="text-right">P/L</span>
        </div>

        {holdings.map((h) => {
          const isStock = h.asset_type === "stock";
          const displayQty = isStock ? h.qty_held / 100 : h.qty_held;
          const pnlPositive = (h.unrealized_pnl ?? 0) >= 0;

          return (
            <div
              key={h.symbol}
              className="grid grid-cols-[1.3fr_0.8fr_1fr_1fr_1fr_0.8fr] gap-2 items-center py-3 border-b last:border-0 -mx-2 px-2 rounded-lg hover:bg-accent/40 transition-colors"
            >
              <div>
                <p className="text-sm font-medium">{h.symbol}</p>
                <p className="text-[11px] text-muted-foreground">
                  {isStock ? "Saham" : "Crypto"}
                </p>
              </div>

              <span className="font-mono text-xs text-right text-muted-foreground tabular-nums">
                {displayQty}
                {isStock ? " lot" : ""}
              </span>

              <span className="font-mono text-xs text-right text-muted-foreground tabular-nums">
                {fmtIDR(h.avg_buy_price)}
              </span>

              <span className="font-mono text-xs text-right font-medium tabular-nums">
                {fmtIDR(h.last_price ?? 0)}
              </span>

              <span className="font-mono text-xs text-right font-medium tabular-nums">
                {fmtIDR(h.market_value ?? 0)}
              </span>

              <span className="text-right">
                {h.last_price === null ? (
                  <span className="text-xs text-muted-foreground">-</span>
                ) : (
                  <span
                    className={cn(
                      "inline-flex items-center gap-0.5 font-mono text-xs font-medium tabular-nums",
                      pnlPositive ? "text-primary" : "text-destructive"
                    )}
                  >
                    {pnlPositive ? (
                      <ArrowUpRight size={12} />
                    ) : (
                      <ArrowDownRight size={12} />
                    )}
                    {Math.abs(h.unrealized_pnl_pct ?? 0).toFixed(2)}%
                  </span>
                )}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}