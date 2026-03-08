import { NextRequest, NextResponse } from 'next/server';
import { getMarkets } from '@/lib/coingecko';

export async function GET(req: NextRequest) {
  const ids = req.nextUrl.searchParams.get('ids')?.split(',').filter(Boolean) ?? [];
  if (ids.length === 0) return NextResponse.json([]);

  try {
    const data = await getMarkets(ids);
    return NextResponse.json(data, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30' },
    });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch market data' }, { status: 500 });
  }
}
