import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q");
  if (!q) return NextResponse.json([]);

  try {
    const res = await fetch(
      `https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(q)}`
    );
    const data = await res.json();

    const results = (data.coins ?? [])
      .sort((a: any, b: any) => {
        const rankA = a.market_cap_rank ?? Infinity;
        const rankB = b.market_cap_rank ?? Infinity;
        return rankA - rankB;
      })
      .slice(0, 8)
      .map((c: any) => ({
        symbol: c.symbol.toUpperCase(),
        name: c.name,
      }));

    return NextResponse.json(results);
  } catch {
    return NextResponse.json([]);
  }
}