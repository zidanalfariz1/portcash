"use client";

import { fmtIDR } from "@/lib/format";
import { cn } from "@/lib/utils";
import { ContributeDialog } from "./ContributeDialog";
import { DeleteGoalDialog } from "./DeleteGoalDialog";

type Account = { id: string; name: string };

type Goal = {
  id: string;
  account_id: string;
  name: string;
  target_amount: number;
  target_date: string | null;
  current_amount: number;
};

export function GoalCard({ goal, sourceAccounts }: { goal: Goal; sourceAccounts: Account[] }) {
  const rawPct = (goal.current_amount / goal.target_amount) * 100;
  const pct = Math.min(rawPct, 100);
  const achieved = goal.current_amount >= goal.target_amount;
  const remaining = Math.max(goal.target_amount - goal.current_amount, 0);

  let daysLeft: number | null = null;
  if (goal.target_date) {
    const diff = new Date(goal.target_date).getTime() - Date.now();
    daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  return (
    <div className="rounded-2xl border bg-card p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold">{goal.name}</p>
          {goal.target_date && (
            <p className="text-xs text-muted-foreground">
              {daysLeft !== null && daysLeft >= 0
                ? `${daysLeft} hari lagi`
                : daysLeft !== null && daysLeft < 0
                ? "Lewat target"
                : ""}
              {" · "}
              {new Date(goal.target_date).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          )}
        </div>
        <DeleteGoalDialog
          goalId={goal.id}
          accountId={goal.account_id}
          goalName={goal.name}
          currentAmount={goal.current_amount}
          destinationAccounts={sourceAccounts}
        />
      </div>

      <div className="flex items-center gap-3">
        <div className="relative h-16 w-16 shrink-0">
          <svg viewBox="0 0 36 36" className="h-16 w-16 -rotate-90">
            <circle cx="18" cy="18" r="15.5" fill="none" stroke="currentColor" strokeWidth="3" className="text-muted" />
            <circle
              cx="18"
              cy="18"
              r="15.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={`${(pct / 100) * 97.4} 97.4`}
              className="text-primary transition-all duration-500"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-mono text-xs font-bold tabular-nums">{pct.toFixed(0)}%</span>
          </div>
        </div>

        <div className="flex-1 min-w-0 flex flex-col gap-1">
          <span className="font-mono text-sm font-semibold tabular-nums">
            {fmtIDR(goal.current_amount)}
          </span>
          <span className="font-mono text-xs text-muted-foreground tabular-nums">
            dari {fmtIDR(goal.target_amount)}
          </span>
          {!achieved && (
            <span className="text-[11px] text-muted-foreground">
              Butuh {fmtIDR(remaining)} lagi
            </span>
          )}
        </div>
      </div>

      {achieved ? (
        <div className="rounded-lg bg-primary/10 px-3 py-2 text-center text-xs font-medium text-primary">
          Target tercapai 🎉
        </div>
      ) : (
        <ContributeDialog goalAccountId={goal.account_id} goalName={goal.name} sourceAccounts={sourceAccounts} />
      )}
    </div>
  );
}