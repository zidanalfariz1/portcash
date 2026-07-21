import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Mapping simbol crypto umum ke CoinGecko ID (ditambah kalau perlu)
const COINGECKO_IDS: Record<string, string> = {
  BTC: "bitcoin",
  ETH: "ethereum",
  SOL: "solana",
  BNB: "binancecoin",
  XRP: "ripple",
  ADA: "cardano",
  DOGE: "dogecoin",
  USDT: "tether",
  USDC: "usd-coin",
  AVAX: "avalanche-2",
  MATIC: "matic-network",
  DOT: "polkadot",
};

async function resolveCoingeckoId(symbol: string): Promise<string | null> {
  if (COINGECKO_IDS[symbol]) return COINGECKO_IDS[symbol];
  try {
    const res = await fetch(
      `https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(symbol)}`
    );
    const data = await res.json();

    const matches = (data.coins ?? []).filter(
      (c: any) => c.symbol.toUpperCase() === symbol.toUpperCase()
    );

    if (matches.length === 0) return null;

    matches.sort((a: any, b: any) => {
      const rankA = a.market_cap_rank ?? Infinity;
      const rankB = b.market_cap_rank ?? Infinity;
      return rankA - rankB;
    });

    return matches[0].id;
  } catch {
    return null;
  }
}

async function fetchStockPrice(symbol: string) {
  try {
    const res = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}.JK?interval=1d&range=1d`,
      { headers: { "User-Agent": "Mozilla/5.0" } }
    );
    const data = await res.json();
    const result = data.chart?.result?.[0];
    const price = result?.meta?.regularMarketPrice;
    const prevClose = result?.meta?.previousClose ?? result?.meta?.chartPreviousClose;
    if (!price) return null;
    const changePct = prevClose ? ((price - prevClose) / prevClose) * 100 : null;
    return { price, changePct };
  } catch {
    return null;
  }
}

async function fetchCryptoPrice(symbol: string) {
  const id = await resolveCoingeckoId(symbol);
  if (!id) return null;
  try {
    const res = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=idr&include_24hr_change=true`
    );
    const data = await res.json();
    const entry = data[id];
    if (!entry) return null;
    return { price: entry.idr, changePct: entry.idr_24h_change ?? null };
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();

  const { data: holdings, error } = await supabase
    .from("v_portfolio_position")
    .select("symbol, asset_type");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const results: { symbol: string; status: string }[] = [];

  for (const h of holdings ?? []) {
    const fetched =
      h.asset_type === "stock"
        ? await fetchStockPrice(h.symbol)
        : await fetchCryptoPrice(h.symbol);

    if (!fetched) {
      results.push({ symbol: h.symbol, status: "failed" });
      continue;
    }

    const { error: upsertError } = await supabase.from("market_prices").upsert({
      symbol: h.symbol,
      asset_type: h.asset_type,
      price: fetched.price,
      change_pct_1d: fetched.changePct,
      updated_at: new Date().toISOString(),
    });

    results.push({ symbol: h.symbol, status: upsertError ? "error" : "ok" });
  }

  return NextResponse.json({ updated: results.length, results });
}