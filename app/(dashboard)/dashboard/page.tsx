import Link from "next/link";
import { ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown } from "lucide-react";
import { getVisibleAccounts, getAccountBalances } from "@/features/cash/actions";
import {
  getNetWorth,
  getAllocationBreakdown,
  getCurrentMonthCashFlow,
  getTopHoldings,
  getRecentActivity,
  getPortfolioPnLSummary,
} from "@/features/dashboard/actions";
import { AllocationDonut } from "@/features/dashboard/AllocationDonut";
import { fmtIDR, fmtDate } from "@/lib/format";
import { cn } from "@/lib/utils";

export default async function DashboardPage() {
  const [netWorth, allocation, cashFlow, holdings, activity, accounts, balances, pnl] =
    await Promise.all([
      getNetWorth(),
      getAllocationBreakdown(),
      getCurrentMonthCashFlow(),
      getTopHoldings(5),
      getRecentActivity(6),
      getVisibleAccounts(),
      getAccountBalances(),
      getPortfolioPnLSummary(),
    ]);

  const saving = (cashFlow.income ?? 0) - (cashFlow.expense ?? 0);
  const pnlPositive = (pnl?.totalPnl ?? 0) >= 0;

  return (
    <div className="flex flex-col gap-6">
      {/* Net worth hero */}
      <div className="rounded-2xl border bg-card p-8">
        <div className="flex items-center gap-2">
          <span className="relative flex h-1.5 w-1.5">
            <span className="motion-safe:animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
          </span>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Net Worth · Auto-update
          </p>
        </div>

        <div className="mt-3 flex flex-wrap items-end gap-3">
          <h2 className="font-mono text-5xl sm:text-6xl font-bold tracking-tight tabular-nums">
            {fmtIDR(netWorth.net_worth)}
          </h2>

          {pnl && (
            <span
              className={cn(
                "mb-1.5 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium",
                pnlPositive
                  ? "bg-primary/10 text-primary"
                  : "bg-destructive/10 text-destructive"
              )}
            >
              {pnlPositive ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
              {pnlPositive ? "+" : ""}
              {fmtIDR(pnl.totalPnl)} ({pnlPositive ? "+" : ""}
              {pnl.pct.toFixed(2)}%) unrealized
            </span>
          )}
        </div>

        <div className="mt-8 flex divide-x">
          <div className="pr-6">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Cash</p>
            <p className="font-mono text-xl font-semibold tabular-nums">
              {fmtIDR(netWorth.total_cash)}
            </p>
          </div>
          <div className="pl-6">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Investasi</p>
            <p className="font-mono text-xl font-semibold tabular-nums">
              {fmtIDR(netWorth.total_investment)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="rounded-2xl border bg-card p-5">
          <p className="text-sm font-semibold mb-4">Asset Allocation</p>
          <AllocationDonut
            freeCash={allocation.freeCash}
            savings={allocation.savings}
            stock={allocation.stock}
            crypto={allocation.crypto}
          />
        </div>

        <div className="rounded-2xl border bg-card p-5">
          <p className="text-sm font-semibold mb-4">Cash Flow Bulan Ini</p>
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Pendapatan</span>
              <span className="font-mono text-xs font-medium text-primary tabular-nums">
                {fmtIDR(cashFlow.income ?? 0)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Pengeluaran</span>
              <span className="font-mono text-xs font-medium text-destructive tabular-nums">
                {fmtIDR(cashFlow.expense ?? 0)}
              </span>
            </div>
            <div className="h-px bg-border" />
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium">Saving</span>
              <span className="font-mono text-xs font-semibold tabular-nums">
                {fmtIDR(saving)}
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-5">
          <p className="text-sm font-semibold mb-4">Cash Accounts</p>
          <div className="flex flex-col gap-3">
            {accounts.length === 0 && (
              <p className="text-xs text-muted-foreground">Belum ada akun.</p>
            )}
            {accounts.map((a) => {
              const bal = balances.find((b) => b.account_id === a.id);
              return (
                <div key={a.id} className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{a.name}</span>
                  <span className="font-mono text-xs font-medium tabular-nums">
                    {fmtIDR(bal?.balance ?? 0)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl border bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold">Top Holdings</p>
            <Link href="/investment" className="text-xs text-primary hover:underline">
              Lihat semua
            </Link>
          </div>
          {holdings.length === 0 ? (
            <p className="text-sm text-muted-foreground">Belum ada holding investasi.</p>
          ) : (
            <div className="flex flex-col">
              <div className="grid grid-cols-[1fr_1fr_1fr_1fr] text-[11px] uppercase tracking-wide text-muted-foreground pb-2 border-b">
                <span>Aset</span>
                <span className="text-right">Qty</span>
                <span className="text-right">Nilai</span>
                <span className="text-right">P/L</span>
              </div>
              {holdings.map((h: any) => {
                const isStock = h.asset_type === "stock";
                const displayQty = isStock ? h.qty_held / 100 : h.qty_held;
                const holdingPositive = (h.unrealized_pnl ?? 0) >= 0;
                return (
                  <div
                    key={h.symbol}
                    className="grid grid-cols-[1fr_1fr_1fr_1fr] items-center py-3 border-b last:border-0 -mx-2 px-2 rounded-lg hover:bg-accent/50 transition-colors"
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
                    <span className="font-mono text-xs text-right font-medium tabular-nums">
                      {fmtIDR(h.market_value ?? 0)}
                    </span>
                    <span className="text-right">
                      {h.last_price === null ? (
                        <span className="text-xs text-muted-foreground">-</span>
                      ) : (
                        <span
                          className={cn(
                            "font-mono text-xs font-medium tabular-nums",
                            holdingPositive ? "text-primary" : "text-destructive"
                          )}
                        >
                          {holdingPositive ? "+" : ""}
                          {(h.unrealized_pnl_pct ?? 0).toFixed(2)}%
                        </span>
                      )}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="rounded-2xl border bg-card p-5">
          <p className="text-sm font-semibold mb-4">Aktivitas Terbaru</p>
          {activity.length === 0 ? (
            <p className="text-sm text-muted-foreground">Belum ada transaksi.</p>
          ) : (
            <div className="flex flex-col gap-1">
              {activity.map((a) => {
                const positive = a.amount >= 0;
                return (
                  <div
                    key={a.id}
                    className="flex items-center gap-3 -mx-2 px-2 py-2 rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-lg shrink-0",
                        positive
                          ? "bg-primary/10 text-primary"
                          : "bg-destructive/10 text-destructive"
                      )}
                    >
                      {positive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{a.label}</p>
                      <p className="text-[11px] text-muted-foreground">{fmtDate(a.date)}</p>
                    </div>
                    <span
                      className={cn(
                        "font-mono text-xs font-medium shrink-0 tabular-nums",
                        positive ? "text-primary" : "text-destructive"
                      )}
                    >
                      {positive ? "+" : ""}
                      {fmtIDR(a.amount)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}