"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { createTransaction } from "@/features/cash/actions";

type Account = { id: string; name: string };

export function ContributeDialog({
  goalAccountId,
  goalName,
  sourceAccounts,
}: {
  goalAccountId: string;
  goalName: string;
  sourceAccounts: Account[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [accountId, setAccountId] = useState("");
  const [amount, setAmount] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await createTransaction({
        account_id: accountId,
        to_account_id: goalAccountId,
        type: "transfer",
        category_id: null,
        amount: Number(amount),
        date: new Date().toISOString().slice(0, 10),
        note: `Setor ke goal: ${goalName}`,
      });
      setAmount("");
      setOpen(false);
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal menyetor");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" className="w-full">Setor Dana</Button>} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Setor ke {goalName}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-2">
          <div className="flex flex-col gap-1.5">
            <Label>Dari Akun</Label>
            <Select value={accountId} onValueChange={(v) => setAccountId(v ?? "")}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih akun">
                  {sourceAccounts.find((a) => a.id === accountId)?.name}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {sourceAccounts.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="amount">Nominal (Rp)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              min={1}
            />
          </div>

          <Button type="submit" disabled={loading || !accountId} className="mt-1">
            {loading ? "Menyetor..." : "Setor"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}