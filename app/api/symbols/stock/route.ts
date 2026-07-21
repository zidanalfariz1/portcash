import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q");
  if (!q) return NextResponse.json([]);

  try {
    const res = await fetch(
      `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(q)}&quotesCount=8&newsCount=0`,
      { headers: { "User-Agent": "Mozilla/5.0" } }
    );
    const data = await res.json();
    const results = (data.quotes ?? [])
      .filter((item: any) => item.symbol?.endsWith(".JK"))
      .map((item: any) => ({
        symbol: item.symbol.replace(".JK", ""),
        name: item.shortname ?? item.longname ?? item.symbol,
      }));
    return NextResponse.json(results);
  } catch {
    return NextResponse.json([]);
  }
}