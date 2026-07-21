"use client";

import { useState } from "react";
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
import { AlertTriangle, Trash2 } from "lucide-react";
import { deleteAccount } from "./actions";

const CONFIRM_TEXT = "HAPUS AKUN SAYA";

export function DangerZone() {
    const [open, setOpen] = useState(false);
    const [confirmText, setConfirmText] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleDelete() {
        setLoading(true);
        try {
            await deleteAccount();
            window.location.href = "/login";
        } catch (err) {
            alert(err instanceof Error ? err.message : "Gagal menghapus akun");
            setLoading(false);
        }
    }

    return (
        <div className="rounded-2xl border border-destructive/40 bg-destructive/5 p-5 flex flex-col gap-3">
            <div className="flex items-start gap-3">
                <AlertTriangle size={18} className="text-destructive shrink-0 mt-0.5" />
                <div>
                    <p className="text-sm font-medium">Hapus Akun</p>
                    <p className="text-xs text-muted-foreground mt-1">
                        Menghapus akun akan menghapus permanen seluruh data kamu: cash accounts, transaksi,
                        investasi, goals, dan riwayatnya. Tindakan ini tidak bisa dibatalkan.
                    </p>
                </div>
            </div>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger render={
                    <Button variant="destructive" size="sm" className="gap-1.5 self-start">
                        <Trash2 size={14} />
                        Hapus Akun Saya
                    </Button>
                } />
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Yakin mau hapus akun?</DialogTitle>
                    </DialogHeader>

                    <div className="flex flex-col gap-4 pt-2">
                        <p className="text-sm text-muted-foreground">
                            Semua data PortCash kamu akan hilang permanen. Ketik{" "}
                            <span className="font-mono font-semibold text-foreground">{CONFIRM_TEXT}</span>{" "}
                            untuk konfirmasi.
                        </p>

                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="confirm">Konfirmasi</Label>
                            <Input
                                id="confirm"
                                value={confirmText}
                                onChange={(e) => setConfirmText(e.target.value)}
                                placeholder={CONFIRM_TEXT}
                                autoComplete="off"
                            />
                        </div>

                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={confirmText !== CONFIRM_TEXT || loading}
                        >
                            {loading ? "Menghapus..." : "Hapus Akun Permanen"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}