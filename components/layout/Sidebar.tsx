"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  Wallet,
  TrendingUp,
  Target,
  FileBarChart,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutGrid },
  { href: "/cash", label: "Cash Flow", icon: Wallet },
  { href: "/investment", label: "Investasi", icon: TrendingUp },
  { href: "/goals", label: "Goals", icon: Target },
  { href: "/reports", label: "Laporan", icon: FileBarChart },
  { href: "/settings", label: "Setting", icon: Settings },
];

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <div>
      <div className="px-6 mb-8 flex items-center gap-2">
        <img src="/logo.png" alt="Portcash" className="h-8 w-8 object-contain" />
        <span className="text-[15px] font-semibold tracking-tight">Portcash</span>
      </div>

      <nav className="flex flex-col gap-1 px-3">
        {navItems.map((item) => {
          const active = pathname?.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-accent text-foreground"
                  : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
              )}
            >
              <item.icon size={17} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export function Sidebar() {
  return (
    <aside className="hidden md:flex w-60 shrink-0 flex-col justify-between border-r border-sidebar-border bg-sidebar py-6">
      <SidebarNav />
      <p className="px-6 text-[11px] text-muted-foreground">
        Track your wealth,
        <br />
        not just your money.
      </p>
    </aside>
  );
}