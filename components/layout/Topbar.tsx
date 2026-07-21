"use client";

import Link from "next/link";
import { Settings, LogOut } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/theme-toggle";
import { MobileSidebar } from "@/components/layout/MobileSidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut } from "@/features/settings/actions";

export function Topbar() {
  const today = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <header className="flex items-center justify-between border-b bg-sidebar px-4 sm:px-6 py-4">
      <div className="flex items-center gap-3">
        <MobileSidebar />
        <div>
          <h1 className="text-lg font-semibold">Dashboard</h1>
          <p className="text-xs text-muted-foreground hidden sm:block">{today}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <ThemeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger render={
            <button className="rounded-full">
              <Avatar className="h-9 w-9 cursor-pointer">
                <AvatarFallback className="text-xs font-semibold">ZN</AvatarFallback>
              </Avatar>
            </button>
          } />
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem render={
              <Link href="/settings" className="flex items-center gap-2 cursor-pointer">
                <Settings size={14} />
                Setting
              </Link>
            } />
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => signOut()}
            >
              <LogOut size={14} />
              Keluar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}