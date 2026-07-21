"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

export default function ForgotPasswordPage() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
    setLoading(false);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <Card className="w-full max-w-sm p-6">
        <div className="mb-6 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
            P
          </div>
          <span className="text-[15px] font-semibold tracking-tight">PortCash</span>
        </div>

        {sent ? (
          <>
            <h1 className="mb-1 text-lg font-semibold">Cek email kamu</h1>
            <p className="text-sm text-muted-foreground">
              Kami sudah kirim link reset password ke <strong>{email}</strong>. Klik link itu
              untuk membuat password baru.
            </p>
          </>
        ) : (
          <>
            <h1 className="mb-1 text-lg font-semibold">Lupa password?</h1>
            <p className="mb-6 text-sm text-muted-foreground">
              Masukkan email kamu, kami kirim link buat reset password.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <Input
                type="email"
                placeholder="you@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              {error && <p className="text-xs text-destructive">{error}</p>}
              <Button type="submit" disabled={loading} className="mt-1">
                {loading ? "Mengirim..." : "Kirim Link Reset"}
              </Button>
            </form>
          </>
        )}

        <Link
          href="/login"
          className="mt-4 inline-block text-xs text-muted-foreground hover:text-foreground"
        >
          Kembali ke halaman masuk
        </Link>
      </Card>
    </div>
  );
}