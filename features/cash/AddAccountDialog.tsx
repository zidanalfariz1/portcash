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
import { Plus } from "lucide-react";
import { createAccount, type AccountType } from "./actions";

export function AddAccountDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState<AccountType>("bank");
  const [balance, setBalance] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await createAccount({
        name,
        type,
        opening_balance: Number(balance) || 0,
      });
      setName("");
      setBalance("");
      setOpen(false);
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal menyimpan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={
        <Button size="sm" className="gap-1.5">
          <Plus size={15} />
          Tambah Akun
        </Button>
      } />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tambah Cash Account</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Nama Akun</Label>
            <Input
              id="name"
              placeholder="BCA, Dana, Tunai, dst."
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Tipe</Label>
            <Select value={type} onValueChange={(v) => setType(v as AccountType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bank">Bank</SelectItem>
                <SelectItem value="ewallet">E-Wallet</SelectItem>
                <SelectItem value="cash">Cash / Tunai</SelectItem>
                <SelectItem value="rdn">RDN (Rekening Dana Nasabah)</SelectItem>
                <SelectItem value="cex">CEX (Exchange Crypto)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="balance">Saldo Awal (Rp)</Label>
            <Input
              id="balance"
              type="number"
              placeholder="0"
              value={balance}
              onChange={(e) => setBalance(e.target.value)}
              min={0}
            />
          </div>

          <Button type="submit" disabled={loading} className="mt-1">
            {loading ? "Menyimpan..." : "Simpan Akun"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}