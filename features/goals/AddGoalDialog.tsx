"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { createGoal } from "./actions";

export function AddGoalDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [date, setDate] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await createGoal(name, Number(target), date || null);
      setName("");
      setTarget("");
      setDate("");
      setOpen(false);
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal membuat goal");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={
        <Button size="sm" className="gap-1.5">
          <Plus size={15} />
          Goal Baru
        </Button>
      } />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Buat Goal Baru</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Nama Goal</Label>
            <Input
              id="name"
              placeholder="Beli HP, Dana Darurat, DP Rumah..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="target">Target Nominal (Rp)</Label>
            <Input
              id="target"
              type="number"
              placeholder="0"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              required
              min={1}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="date">Target Tanggal (opsional)</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <Button type="submit" disabled={loading || !name || !target} className="mt-1">
            {loading ? "Menyimpan..." : "Buat Goal"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}