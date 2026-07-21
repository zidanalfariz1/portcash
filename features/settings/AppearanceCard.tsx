"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

export function AppearanceCard() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="h-24 rounded-2xl border bg-card" />;

  return (
    <div className="rounded-2xl border bg-card p-5 max-w-md">
      <p className="text-sm font-medium mb-3">Tema</p>
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => setTheme("dark")}
          className={cn(
            "flex items-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium transition-colors",
            theme === "dark"
              ? "border-primary bg-primary/10 text-primary"
              : "text-muted-foreground hover:bg-accent/40"
          )}
        >
          <Moon size={15} />
          Gelap
        </button>
        <button
          onClick={() => setTheme("light")}
          className={cn(
            "flex items-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium transition-colors",
            theme === "light"
              ? "border-primary bg-primary/10 text-primary"
              : "text-muted-foreground hover:bg-accent/40"
          )}
        >
          <Sun size={15} />
          Terang
        </button>
      </div>
    </div>
  );
}