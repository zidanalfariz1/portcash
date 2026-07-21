import { getProfile, getCategoriesWithUsage } from "@/features/settings/actions";
import { ProfileCard } from "@/features/settings/ProfileCard";
import { CategoryManager } from "@/features/settings/CategoryManager";
import { AppearanceCard } from "@/features/settings/AppearanceCard";
import { LogoutButton } from "@/features/settings/LogoutButton";
import { PasswordCard } from "@/features/settings/PasswordCard";

export default async function SettingsPage() {
  const [profile, categories] = await Promise.all([
    getProfile(),
    getCategoriesWithUsage(),
  ]);

  return (
    <div className="flex flex-col gap-8 max-w-2xl">
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-base font-semibold">Profil</h2>
          <p className="text-sm text-muted-foreground">Informasi akun kamu.</p>
        </div>
        <ProfileCard name={profile.name} email={profile.email} />
      </div>

      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-base font-semibold">Kelola Kategori</h2>
          <p className="text-sm text-muted-foreground">
            Kategori pemasukan dan pengeluaran untuk transaksi cash flow.
          </p>
        </div>
        <CategoryManager categories={categories} />
      </div>

      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-base font-semibold">Tampilan</h2>
          <p className="text-sm text-muted-foreground">Pilih tema gelap atau terang.</p>
        </div>
        <AppearanceCard />
      </div>

        <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-base font-semibold">Ganti Password</h2>
          <p className="text-sm text-muted-foreground">Perbarui password akun kamu.</p>
        </div>
        <PasswordCard />
      </div>

      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-base font-semibold">Akun</h2>
          <p className="text-sm text-muted-foreground">Keluar dari sesi PortCash kamu.</p>
        </div>
        <LogoutButton />
      </div>
    </div>
  );
}