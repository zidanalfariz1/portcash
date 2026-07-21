import yfinance as yf
import requests, os

SUPABASE_URL = os.environ["https://ypfsafkkonasiwocnngh.supabase.co"]
SUPABASE_KEY = os.environ["SUPABASE_SERVICE_KEY"]

def update_stock(symbol):
    t = yf.Ticker(f"{symbol}.JK")
    hist = t.history(period="1d")
    price = float(hist["Close"].iloc[-1])
    upsert("stock", symbol, price)

def update_crypto(symbol, coingecko_id):
    r = requests.get(
        "https://api.coingecko.com/api/v3/simple/price",
        params={"ids": coingecko_id, "vs_currencies": "idr"},
    ).json()
    price = r[coingecko_id]["idr"]
    upsert("crypto", symbol, price)

def upsert(asset_type, symbol, price):
    requests.post(
        f"{SUPABASE_URL}/rest/v1/market_prices",
        headers={
            "apikey": SUPABASE_KEY,
            "Authorization": f"Bearer {SUPABASE_KEY}",
            "Prefer": "resolution=merge-duplicates",
        },
        json={"symbol": symbol, "asset_type": asset_type, "price": price},
    )

for s in ["BBCA", "BREN", "AMMN"]:
    update_stock(s)
for s, cg in [("BTC", "bitcoin"), ("ETH", "ethereum"), ("SOL", "solana")]:
    update_crypto(s, cg)