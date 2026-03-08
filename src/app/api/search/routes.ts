import { NextRequest, NextResponse } from 'next/server';
import { searchCoins } from '@/lib/coingecko';

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get('q') ?? '';
  if (!query.trim()) return NextResponse.json([]);

  try {
    const results = await searchCoins(query);
    return NextResponse.json(results);
  } catch {
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
