"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateProfileName } from "./actions";

export function ProfileCard({ name, email }: { name: string; email: string }) {
  const router = useRouter();
  const [value, setValue] = useState(name);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setLoading(true);
    setSaved(false);
    try {
      await updateProfileName(value);
      setSaved(true);
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal menyimpan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border bg-card p-5 flex flex-col gap-4 max-w-md">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">Nama</Label>
        <Input
          id="name"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setSaved(false);
          }}
          placeholder="Nama kamu"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label>Email</Label>
        <Input value={email} disabled className="text-muted-foreground" />
      </div>
      <div className="flex items-center gap-3">
        <Button size="sm" onClick={handleSave} disabled={loading || value === name}>
          {loading ? "Menyimpan..." : "Simpan"}
        </Button>
        {saved && <span className="text-xs text-primary">Tersimpan</span>}
      </div>
    </div>
  );
}