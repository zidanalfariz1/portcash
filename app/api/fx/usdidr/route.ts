import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("https://api.frankfurter.app/latest?from=USD&to=IDR");
    const data = await res.json();
    return NextResponse.json({ rate: data.rates?.IDR ?? null });
  } catch {
    return NextResponse.json({ rate: null });
  }
}