"use client";

import { useState, useEffect, useRef } from "react";
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
import { createInvestmentTransaction, type AssetType, type TradeSide } from "./actions";

type Account = { id: string; name: string; type: string };
type Holding = { symbol: string; asset_type: "stock" | "crypto"; qty_held: number };
type Suggestion = { symbol: string; name: string };

export function BuySellDialog({
  accounts,
  holdings,
}: {
  accounts: Account[];
  holdings: Holding[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [assetType, setAssetType] = useState<AssetType>("stock");
  const [side, setSide] = useState<TradeSide>("buy");
  const [accountId, setAccountId] = useState("");
  const [symbol, setSymbol] = useState("");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState(""); // USD kalau crypto, IDR kalau saham
  const [fee, setFee] = useState("0");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState("");

  // --- Autocomplete (mode buy) ---
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (side !== "buy" || symbol.length < 1) {
      setSuggestions([]);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const endpoint = assetType === "stock" ? "/api/symbols/stock" : "/api/symbols/crypto";
      try {
        const res = await fetch(`${endpoint}?q=${encodeURIComponent(symbol)}`);
        const data = await res.json();
        setSuggestions(data);
      } catch {
        setSuggestions([]);
      }
    }, 350);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [symbol, assetType, side]);

  // --- FX rate USD/IDR (mode crypto) ---
  const [fxRate, setFxRate] = useState<number | null>(null);
  const [fxStatus, setFxStatus] = useState<"idle" | "loading" | "error">("idle");

  function fetchFxRate() {
    setFxStatus("loading");
    fetch("/api/fx/usdidr")
      .then((r) => r.json())
      .then((d) => {
        if (d.rate) {
          setFxRate(d.rate);
          setFxStatus("idle");
        } else {
          setFxStatus("error");
        }
      })
      .catch(() => setFxStatus("error"));
  }

  useEffect(() => {
    if (assetType !== "crypto") return;
    fetchFxRate();
  }, [assetType]);

  const priceIDR =
    assetType === "crypto"
      ? fxRate && price
        ? Number(price) * fxRate
        : 0
      : Number(price) || 0;

  // --- Holdings for sell mode ---
  const relevantHoldings = holdings.filter((h) => h.asset_type === assetType);
  const relevantAccounts = accounts.filter((a) =>
    assetType === "stock" ? a.type === "rdn" : a.type === "cex"
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await createInvestmentTransaction({
        account_id: accountId,
        asset_type: assetType,
        symbol,
        side,
        quantity: assetType === "stock" ? Number(quantity) * 100 : Number(quantity),
        price: priceIDR,
        fee: Number(fee) || 0,
        date,
        note: note || null,
      });
      setSymbol("");
      setQuantity("");
      setPrice("");
      setFee("0");
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
          Buy / Sell
        </Button>
      } />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Transaksi Investasi</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-2">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                setAssetType("stock");
                setSymbol("");
                setAccountId("");
              }}
              className={cn(
                "rounded-lg border py-2 text-sm font-medium transition-colors",
                assetType === "stock"
                  ? "border-primary bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent/40"
              )}
            >
              Saham
            </button>
            <button
              type="button"
              onClick={() => {
                setAssetType("crypto");
                setSymbol("");
                setAccountId("");
              }}
              className={cn(
                "rounded-lg border py-2 text-sm font-medium transition-colors",
                assetType === "crypto"
                  ? "border-primary bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent/40"
              )}
            >
              Crypto
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                setSide("buy");
                setSymbol("");
              }}
              className={cn(
                "rounded-lg border py-2 text-sm font-medium transition-colors",
                side === "buy"
                  ? "border-primary bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent/40"
              )}
            >
              Buy
            </button>
            <button
              type="button"
              onClick={() => {
                setSide("sell");
                setSymbol("");
              }}
              className={cn(
                "rounded-lg border py-2 text-sm font-medium transition-colors",
                side === "sell"
                  ? "border-destructive bg-destructive/10 text-destructive"
                  : "text-muted-foreground hover:bg-accent/40"
              )}
            >
              Sell
            </button>
          </div>

          {/* Symbol: autocomplete (buy) atau dropdown holding (sell) */}
          {side === "buy" ? (
            <div className="relative flex flex-col gap-1.5">
              <Label htmlFor="symbol">
                {assetType === "stock" ? "Kode Saham" : "Kode Crypto"}
              </Label>
              <Input
                id="symbol"
                placeholder={assetType === "stock" ? "Ketik: BBCA, Bank Central..." : "Ketik: BTC, Bitcoin..."}
                value={symbol}
                onChange={(e) => {
                  setSymbol(e.target.value.toUpperCase());
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                autoComplete="off"
                required
              />
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full mt-1 w-full rounded-lg border bg-popover shadow-md z-50 max-h-48 overflow-y-auto">
                  {suggestions.map((s) => (
                    <button
                      key={s.symbol}
                      type="button"
                      onClick={() => {
                        setSymbol(s.symbol);
                        setShowSuggestions(false);
                      }}
                      className="flex w-full flex-col items-start px-3 py-2 text-left text-sm hover:bg-accent"
                    >
                      <span className="font-medium">{s.symbol}</span>
                      <span className="text-xs text-muted-foreground">{s.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-1.5">
              <Label>Pilih dari Portfolio</Label>
              <Select value={symbol} onValueChange={(v) => setSymbol(v ?? "")}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih aset">{symbol}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {relevantHoldings.map((h) => (
                    <SelectItem key={h.symbol} value={h.symbol}>
                      {h.symbol} — {assetType === "stock" ? h.qty_held / 100 : h.qty_held} {assetType === "stock" ? "lot" : "unit"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {relevantHoldings.length === 0 && (
                <p className="text-xs text-amber-500">
                  Belum ada holding {assetType === "stock" ? "saham" : "crypto"} untuk dijual.
                </p>
              )}
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <Label>Akun ({assetType === "stock" ? "RDN" : "CEX"})</Label>
            <Select value={accountId} onValueChange={(v) => setAccountId(v ?? "")}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih akun">
                  {relevantAccounts.find((a) => a.id === accountId)?.name}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {relevantAccounts.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {relevantAccounts.length === 0 && (
              <p className="text-xs text-amber-500">
                Belum ada akun {assetType === "stock" ? "RDN" : "CEX"}. Buat dulu di Cash Accounts.
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="quantity">
                {assetType === "stock" ? "Jumlah Lot" : "Jumlah Unit"}
              </Label>
              <Input
                id="quantity"
                type="number"
                step="any"
                placeholder="0"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
                min={0.00000001}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="price">
                Harga per Unit ({assetType === "crypto" ? "USD" : "Rp"})
              </Label>
              <Input
                id="price"
                type="number"
                step="any"
                placeholder="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                min={0.00000001}
              />
              {assetType === "crypto" && (
                <p className="text-[11px] text-muted-foreground">
                  {fxRate ? (
                    `≈ ${new Intl.NumberFormat("id-ID", {
                      style: "currency",
                      currency: "IDR",
                      maximumFractionDigits: 0,
                    }).format(priceIDR)} (kurs Rp${fxRate.toLocaleString("id-ID")}/USD)`
                  ) : fxStatus === "error" ? (
                    <span className="text-destructive">
                      Gagal ambil kurs.{" "}
                      <button type="button" onClick={fetchFxRate} className="underline">
                        Coba lagi
                      </button>
                    </span>
                  ) : (
                    "Mengambil kurs..."
                  )}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="fee">Fee (Rp)</Label>
              <Input
                id="fee"
                type="number"
                placeholder="0"
                value={fee}
                onChange={(e) => setFee(e.target.value)}
                min={0}
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
              !symbol ||
              (assetType === "crypto" && fxRate === null)
            }
            className="mt-1"
          >
            {loading
              ? "Menyimpan..."
              : assetType === "crypto" && fxRate === null
              ? "Menunggu kurs..."
              : `Simpan ${side === "buy" ? "Buy" : "Sell"}`}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}