import {
  getAccounts,
  getVisibleAccounts,
  getAccountBalances,
  getCategories,
  getTransactions,
} from "@/features/cash/actions";
import { AccountList } from "@/features/cash/AccountList";
import { AddAccountDialog } from "@/features/cash/AddAccountDialog";
import { AddTransactionDialog } from "@/features/cash/AddTransactionDialog";
import { TransactionList } from "@/features/cash/TransactionList";

export default async function CashPage() {
  const [visibleAccounts, allAccounts, balances, categories, transactions] = await Promise.all([
    getVisibleAccounts(),
    getAccounts(),
    getAccountBalances(),
    getCategories(),
    getTransactions(),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold">Cash Accounts</h2>
            <p className="text-sm text-muted-foreground">
              Kelola rekening bank, e-wallet, dan tunai kamu.
            </p>
          </div>
          <AddAccountDialog />
        </div>
        <AccountList accounts={visibleAccounts} balances={balances} />
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold">Transaksi</h2>
            <p className="text-sm text-muted-foreground">
              Riwayat pemasukan dan pengeluaran kamu.
            </p>
          </div>
          <AddTransactionDialog accounts={allAccounts} categories={categories} />
        </div>
        <TransactionList transactions={transactions} />
      </div>
    </div>
  );
}