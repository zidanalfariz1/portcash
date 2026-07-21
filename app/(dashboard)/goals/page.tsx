import { getGoals } from "@/features/goals/actions";
import { getBankEwalletAccounts } from "@/features/cash/actions";
import { GoalCard } from "@/features/goals/GoalCard";
import { AddGoalDialog } from "@/features/goals/AddGoalDialog";

export default async function GoalsPage() {
   const [goals, accounts] = await Promise.all([getGoals(), getBankEwalletAccounts()]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold">Goals</h2>
          <p className="text-sm text-muted-foreground">
            Target tabungan kamu, terpisah dari saldo harian.
          </p>
        </div>
        <AddGoalDialog />
      </div>

      {goals.length === 0 ? (
        <div className="rounded-2xl border bg-card p-8 text-center text-sm text-muted-foreground">
          Belum ada goal. Buat target tabungan pertama kamu.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {goals.map((g: any) => (
            <GoalCard key={g.id} goal={g} sourceAccounts={accounts} />
          ))}
        </div>
      )}
    </div>
  );
}