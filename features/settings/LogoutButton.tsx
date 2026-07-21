"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { signOut } from "./actions";

export function LogoutButton() {
  const [loading, setLoading] = useState(false);

  return (
    <Button
      variant="outline"
      size="sm"
      className="gap-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive"
      disabled={loading}
      onClick={() => {
        setLoading(true);
        signOut();
      }}
    >
      <LogOut size={14} />
      {loading ? "Keluar..." : "Keluar dari Akun"}
    </Button>
  );
}