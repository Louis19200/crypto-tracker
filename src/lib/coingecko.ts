import type { CoinMarketData, CoinSearchResult } from '@/types';

const BASE = 'https://api.coingecko.com/api/v3';

const cgHeaders = () => ({
  'x-cg-demo-api-key': process.env.COINGECKO_API_KEY ?? '',
  Accept: 'application/json',
});

export async function getMarkets(ids: string[], currency = 'eur'): Promise<CoinMarketData[]> {
  if (ids.length === 0) return [];

  const params = new URLSearchParams({
    vs_currency: currency,
    ids: ids.join(','),
    order: 'market_cap_desc',
    per_page: '250',
    sparkline: 'false',
  });

  const res = await fetch(`${BASE}/coins/markets?${params}`, {
    headers: cgHeaders(),
    next: { revalidate: 60 },
  });

  if (!res.ok) throw new Error(`CoinGecko error: ${res.status}`);
  return res.json();
}

export async function searchCoins(query: string): Promise<CoinSearchResult[]> {
  const res = await fetch(`${BASE}/search?query=${encodeURIComponent(query)}`, {
    headers: cgHeaders(),
  });
  if (!res.ok) throw new Error(`Search error: ${res.status}`);
  const data = await res.json();
  return (data.coins ?? []).slice(0, 8);
}
