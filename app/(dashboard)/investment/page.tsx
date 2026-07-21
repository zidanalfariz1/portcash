import { getAccounts } from "@/features/cash/actions";
import { getPortfolio, getInvestmentTransactions } from "@/features/investment/actions";
import { PortfolioList } from "@/features/investment/PortofolioList";
import { BuySellDialog } from "@/features/investment/BuySellDialog";
import { TransactionList } from "@/features/investment/TransactionList";

export default async function InvestmentPage() {
  const [accounts, holdings, transactions] = await Promise.all([
    getAccounts(),
    getPortfolio(),
    getInvestmentTransactions(),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold">Portfolio</h2>
            <p className="text-sm text-muted-foreground">
              Saham dan crypto yang kamu miliki saat ini.
            </p>
          </div>
          <BuySellDialog accounts={accounts} holdings={holdings} />
        </div>

        <PortfolioList holdings={holdings} />
      </div>

      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-base font-semibold">Riwayat Transaksi</h2>
          <p className="text-sm text-muted-foreground">
            Semua transaksi buy/sell yang pernah kamu catat.
          </p>
        </div>

        <TransactionList transactions={transactions} />
      </div>
    </div>
  );
}