"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
    } else {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      // Kalau session null, berarti Supabase minta konfirmasi email dulu
      if (!data.session) {
        setAwaitingConfirmation(true);
        setLoading(false);
        return;
      }
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <Card className="w-full max-w-sm p-6">
        <div className="mb-6 flex items-center gap-2">
          <img src="/logo.png" alt="Portcash" className="h-8 w-8 object-contain" />
          <span className="text-[15px] font-semibold tracking-tight">
            Portcash
          </span>
        </div>

        {awaitingConfirmation ? (
          <>
            <h1 className="mb-1 text-lg font-semibold">Cek email kamu</h1>
            <p className="text-sm text-muted-foreground">
              Kami sudah kirim link konfirmasi ke <strong>{email}</strong>. Klik link itu
              dulu buat mengaktifkan akun, baru bisa masuk.
            </p>
            <button
              type="button"
              onClick={() => {
                setAwaitingConfirmation(false);
                setMode("login");
              }}
              className="mt-4 text-xs text-muted-foreground hover:text-foreground"
            >
              Sudah konfirmasi? Masuk sekarang
            </button>
          </>
        ) : (
          <>
            <h1 className="mb-1 text-lg font-semibold">
              {mode === "login" ? "Masuk ke akun kamu" : "Buat akun baru"}
            </h1>
            <p className="mb-6 text-sm text-muted-foreground">
              {mode === "login"
                ? "Track your wealth, not just your money."
                : "Mulai pantau net worth kamu dalam satu dashboard."}
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <Input
                type="email"
                placeholder="you@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />

              {mode === "login" && (
                <Link
                  href="/forgot-password"
                  className="text-xs text-muted-foreground hover:text-foreground self-end -mt-1"
                >
                  Lupa password?
                </Link>
              )}

              {error && <p className="text-xs text-destructive">{error}</p>}

              <Button type="submit" disabled={loading} className="mt-1">
                {loading
                  ? "Memproses..."
                  : mode === "login"
                    ? "Masuk"
                    : "Daftar"}
              </Button>
            </form>

            <button
              type="button"
              onClick={() => setMode(mode === "login" ? "signup" : "login")}
              className="mt-4 text-xs text-muted-foreground hover:text-foreground"
            >
              {mode === "login"
                ? "Belum punya akun? Daftar"
                : "Sudah punya akun? Masuk"}
            </button>
          </>
        )}
      </Card>
    </div>
  );
}