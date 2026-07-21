"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const PALETTE = {
  dark: { cash: "#8B95A3", savings: "#5CC9F5", stock: "#3ECF6E", crypto: "#D4FF5C" },
  light: { cash: "#6B6D70", savings: "#2A8FB8", stock: "#1E9E52", crypto: "#8FAE1F" },
};

export function AllocationDonut({
  freeCash,
  savings,
  stock,
  crypto,
}: {
  freeCash: number;
  savings: number;
  stock: number;
  crypto: number;
}) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const colors = PALETTE[resolvedTheme === "light" ? "light" : "dark"];
  const total = freeCash + savings + stock + crypto;

  const data = [
    { name: "Cash", value: freeCash, color: colors.cash },
    { name: "Tabungan", value: savings, color: colors.savings },
    { name: "Saham", value: stock, color: colors.stock },
    { name: "Crypto", value: crypto, color: colors.crypto },
  ].filter((d) => d.value > 0);

  if (!mounted) return <div className="h-28" />;

  if (total <= 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Belum ada data untuk ditampilkan.
      </p>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <div className="w-28 h-28 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" innerRadius={36} outerRadius={54} paddingAngle={3}>
              {data.map((d, i) => (
                <Cell key={i} fill={d.color} stroke="none" />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-col gap-2">
        {data.map((d) => (
          <div key={d.name} className="flex items-center gap-2 text-xs">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: d.color }} />
            <span className="text-muted-foreground">{d.name}</span>
            <span className="font-mono font-medium ml-auto tabular-nums">
              {((d.value / total) * 100).toFixed(0)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}