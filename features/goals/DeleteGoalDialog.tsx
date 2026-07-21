"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Trash2 } from "lucide-react";
import { withdrawAndDeleteGoal } from "./actions";
import { fmtIDR } from "@/lib/format";

type Account = { id: string; name: string };

export function DeleteGoalDialog({
  goalId,
  accountId,
  goalName,
  currentAmount,
  destinationAccounts,
}: {
  goalId: string;
  accountId: string;
  goalName: string;
  currentAmount: number;
  destinationAccounts: Account[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [destination, setDestination] = useState("");

  async function handleDelete() {
    setLoading(true);
    try {
      await withdrawAndDeleteGoal(goalId, accountId, destination || null);
      setOpen(false);
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal menghapus goal");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={
        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0">
          <Trash2 size={14} />
        </Button>
      } />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Hapus Goal "{goalName}"?</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 pt-2">
          {currentAmount > 0 ? (
            <>
              <p className="text-sm text-muted-foreground">
                Ada saldo <span className="font-medium text-foreground">{fmtIDR(currentAmount)}</span> di
                goal ini. Pilih ke mana dana ini dikembalikan sebelum goal dihapus.
              </p>
              <Select value={destination} onValueChange={(v) => setDestination(v ?? "")}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih akun tujuan">
                    {destinationAccounts.find((a) => a.id === destination)?.name}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {destinationAccounts.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              Goal ini belum ada saldo, aman untuk dihapus langsung.
            </p>
          )}

          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={loading || (currentAmount > 0 && !destination)}
          >
            {loading ? "Menghapus..." : "Hapus Goal"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}