'use client';

import type { HoldingWithMarket } from '@/types';

const eur = (v: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(v);

export default function PortfolioSummary({
  holdings,
  loading,
}: {
  holdings: HoldingWithMarket[];
  loading: boolean;
}) {
  const totalValue = holdings.reduce((s, h) => s + h.currentValue, 0);
  const totalCost = holdings.reduce((s, h) => s + h.costBasis, 0);
  const pnl = totalValue - totalCost;
  const pnlPct = totalCost > 0 ? (pnl / totalCost) * 100 : 0;
  const day = holdings.reduce((s, h) => s + h.currentValue * (h.priceChange24h / 100), 0);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatCard label="Valeur totale" value={eur(totalValue)} large loading={loading} />
      <StatCard
        label="P&L total"
        value={`${eur(pnl)} (${pnlPct >= 0 ? '+' : ''}${pnlPct.toFixed(2)}%)`}
        color={pnl >= 0 ? 'text-green-400' : 'text-red-400'}
        loading={loading}
      />
      <StatCard label="Investi" value={eur(totalCost)} loading={loading} />
      <StatCard
        label="Variation 24h"
        value={`${day >= 0 ? '+' : ''}${eur(day)}`}
        color={day >= 0 ? 'text-green-400' : 'text-red-400'}
        loading={loading}
      />
    </div>
  );
}

function StatCard({
  label, value, color, large, loading,
}: {
  label: string; value: string; color?: string; large?: boolean; loading: boolean;
}) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
      <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">{label}</p>
      {loading ? (
        <div className="h-6 w-24 bg-gray-800 rounded animate-pulse" />
      ) : (
        <p className={`font-semibold ${large ? 'text-2xl' : 'text-lg'} ${color ?? 'text-white'}`}>
          {value}
        </p>
      )}
    </div>
  );
}
