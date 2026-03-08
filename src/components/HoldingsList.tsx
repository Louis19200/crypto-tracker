'use client';

import type { HoldingWithMarket } from '@/types';

const eur = (v: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(v);

export default function HoldingsList({
  holdings, onRemove, loading,
}: {
  holdings: HoldingWithMarket[];
  onRemove: (id: string) => void;
  loading: boolean;
}) {
  const sorted = [...holdings].sort((a, b) => b.currentValue - a.currentValue);

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
      <div className="p-4 border-b border-gray-800">
        <h2 className="font-semibold">Mes positions</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-400 text-xs uppercase">
              {['Coin', 'Prix', '24h', 'Quantité', 'Valeur', 'P&L', ''].map((h, i) => (
                <th key={i} className={`px-4 py-3 ${i === 0 ? 'text-left' : 'text-right'}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map(h => (
              <Row key={h.id} h={h} onRemove={onRemove} loading={loading} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Row({ h, onRemove, loading }: { h: HoldingWithMarket; onRemove: (id: string) => void; loading: boolean }) {
  const pnlColor = h.pnl >= 0 ? 'text-green-400' : 'text-red-400';
  const chgColor = h.priceChange24h >= 0 ? 'text-green-400' : 'text-red-400';

  return (
    <tr className="border-t border-gray-800 hover:bg-gray-800/40 transition-colors">
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          {h.image && <img src={h.image} alt={h.name} className="w-6 h-6 rounded-full" />}
          <div>
            <p className="font-medium">{h.name}</p>
            <p className="text-gray-400 text-xs uppercase">{h.symbol}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-right">
        {loading ? <Skel /> : eur(h.currentPrice)}
      </td>
      <td className={`px-4 py-3 text-right ${chgColor}`}>
        {loading ? <Skel /> : `${h.priceChange24h >= 0 ? '+' : ''}${h.priceChange24h.toFixed(2)}%`}
      </td>
      <td className="px-4 py-3 text-right text-gray-300">
        {h.quantity % 1 === 0 ? h.quantity : h.quantity.toFixed(6)}
      </td>
      <td className="px-4 py-3 text-right font-medium">
        {loading ? <Skel /> : eur(h.currentValue)}
      </td>
      <td className={`px-4 py-3 text-right ${pnlColor}`}>
        {loading ? <Skel /> : (
          <>
            <p>{eur(h.pnl)}</p>
            <p className="text-xs">{h.pnlPercentage >= 0 ? '+' : ''}{h.pnlPercentage.toFixed(2)}%</p>
          </>
        )}
      </td>
      <td className="px-4 py-3 text-right">
        <button
          onClick={() => onRemove(h.id)}
          className="text-gray-600 hover:text-red-400 transition-colors"
        >
          ✕
        </button>
      </td>
    </tr>
  );
}

const Skel = () => <div className="h-4 w-16 bg-gray-800 rounded animate-pulse ml-auto" />;
