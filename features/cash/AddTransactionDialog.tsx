"use client";

import { useState } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import { createTransaction, getAccountBalanceById } from "./actions";


type Account = { id: string; name: string };
type Category = { id: string; name: string; kind: "income" | "expense" };
type TxType = "income" | "expense" | "transfer";

export function AddTransactionDialog({
    accounts,
    categories,
}: {
    accounts: Account[];
    categories: Category[];
}) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const [type, setType] = useState<TxType>("expense");
    const [accountId, setAccountId] = useState("");
    const [toAccountId, setToAccountId] = useState("");
    const [accountBalance, setAccountBalance] = useState<number | null>(null);
    const [categoryId, setCategoryId] = useState("");
    const [amount, setAmount] = useState("");
    const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
    const [note, setNote] = useState("");
    useEffect(() => {
        if (!accountId) {
            setAccountBalance(null);
            return;
        }
        getAccountBalanceById(accountId).then(setAccountBalance);
    }, [accountId]);

    const filteredCategories = categories.filter(
        (c) => c.kind === type || type === "transfer"
    );
    const destinationOptions = accounts.filter((a) => a.id !== accountId);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        try {
            await createTransaction({
                account_id: accountId,
                to_account_id: type === "transfer" ? toAccountId : null,
                type,
                category_id: type === "transfer" ? null : categoryId || null,
                amount: Number(amount),
                date,
                note: note || null,
            });
            setAmount("");
            setNote("");
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
                    Tambah Transaksi
                </Button>
            } />
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Tambah Transaksi</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-2">
                    {/* Type toggle */}
                    <div className="grid grid-cols-3 gap-2">
                        <button
                            type="button"
                            onClick={() => { setType("income"); setCategoryId(""); }}
                            className={cn(
                                "rounded-lg border py-2 text-xs font-medium transition-colors",
                                type === "income" ? "border-emerald-600 bg-emerald-50 text-emerald-700" : "text-muted-foreground"
                            )}
                        >
                            Pemasukan
                        </button>
                        <button
                            type="button"
                            onClick={() => { setType("expense"); setCategoryId(""); }}
                            className={cn(
                                "rounded-lg border py-2 text-xs font-medium transition-colors",
                                type === "expense" ? "border-red-600 bg-red-50 text-red-700" : "text-muted-foreground"
                            )}
                        >
                            Pengeluaran
                        </button>
                        <button
                            type="button"
                            onClick={() => { setType("transfer"); setCategoryId(""); }}
                            className={cn(
                                "rounded-lg border py-2 text-xs font-medium transition-colors",
                                type === "transfer" ? "border-blue-600 bg-blue-50 text-blue-700" : "text-muted-foreground"
                            )}
                        >
                            Transfer
                        </button>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <Label>{type === "transfer" ? "Dari Akun" : "Akun"}</Label>
                        <Select value={accountId} onValueChange={(v) => setAccountId(v ?? "")}>
                            <SelectTrigger>
                                <SelectValue placeholder="Pilih akun">
                                    {accounts.find((a) => a.id === accountId)?.name}
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                {accounts.map((a) => (
                                    <SelectItem key={a.id} value={a.id}>
                                        {a.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {accountBalance !== null && (type === "expense" || type === "transfer") && (
                            <p
                                className={cn(
                                    "text-[11px]",
                                    Number(amount) > accountBalance ? "text-red-600" : "text-muted-foreground"
                                )}
                            >
                                Saldo tersedia:{" "}
                                {new Intl.NumberFormat("id-ID", {
                                    style: "currency",
                                    currency: "IDR",
                                    maximumFractionDigits: 0,
                                }).format(accountBalance)}
                                {Number(amount) > accountBalance && " — tidak mencukupi!"}
                            </p>
                        )}
                    </div>

                    {type === "transfer" ? (
                        <div className="flex flex-col gap-1.5">
                            <Label>Ke Akun</Label>
                            <Select value={toAccountId} onValueChange={(v) => setToAccountId(v ?? "")}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih akun tujuan">
                                        {destinationOptions.find((a) => a.id === toAccountId)?.name}
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    {destinationOptions.map((a) => (
                                        <SelectItem key={a.id} value={a.id}>
                                            {a.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-1.5">
                            <Label>Kategori</Label>
                            <Select value={categoryId} onValueChange={(v) => setCategoryId(v ?? "")}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih kategori">
                                        {filteredCategories.find((c) => c.id === categoryId)?.name}
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    {filteredCategories.map((c) => (
                                        <SelectItem key={c.id} value={c.id}>
                                            {c.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
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
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="date">Tanggal</Label>
                            <Input
                                id="date"
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="note">Catatan (opsional)</Label>
                        <Textarea
                            id="note"
                            placeholder="Contoh: withdraw RDN ke BCA"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            rows={2}
                        />
                    </div>

                    <Button
                        type="submit"
                        disabled={
                            loading ||
                            !accountId ||
                            (type === "transfer" && !toAccountId)
                        }
                        className="mt-1"
                    >
                        {loading ? "Menyimpan..." : "Simpan Transaksi"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}