import { getInvestmentSummary, getMonthlyCashFlowHistory } from "@/features/reports/actions";
import { InvestmentSummary } from "@/features/reports/InvestmentSummary";
import { MonthlyHistory } from "@/features/reports/MonthlyHistory";

export default async function ReportsPage() {
  const [summary, monthly] = await Promise.all([
    getInvestmentSummary(),
    getMonthlyCashFlowHistory(),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-base font-semibold">Ringkasan Investasi</h2>
          <p className="text-sm text-muted-foreground">
            Modal, nilai sekarang, dan untung-rugi dari seluruh aktivitas investasi.
          </p>
        </div>
        <InvestmentSummary {...summary} />
      </div>

      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-base font-semibold">Riwayat Cash Flow Bulanan</h2>
          <p className="text-sm text-muted-foreground">
            Saldo akhir tiap bulan otomatis jadi saldo awal bulan berikutnya.
          </p>
        </div>
        <MonthlyHistory rows={monthly} />
      </div>
    </div>
  );
}