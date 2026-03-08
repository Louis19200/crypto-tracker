'use client';

import { useState, useEffect } from 'react';
import { usePortfolio } from '@/hooks/usePortfolio';
import type { CoinMarketData, HoldingWithMarket } from '@/types';
import PortfolioSummary from '@/components/PortfolioSummary';
import HoldingsList from '@/components/HoldingsList';
import AllocationChart from '@/components/AllocationChart';
import AddHoldingModal from '@/components/AddHoldingModal';

export default function HomePage() {
  const { holdings, addHolding, removeHolding, loaded } = usePortfolio();
  const [marketData, setMarketData] = useState<CoinMarketData[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const fetchMarkets = async () => {
    if (holdings.length === 0) return setMarketData([]);
    const ids = holdings.map(h => h.id).join(',');
    setLoading(true);
    try {
      const res = await fetch(`/api/markets?ids=${ids}`);
      const data = await res.json();
      if (Array.isArray(data)) setMarketData(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (loaded) fetchMarkets();
  }, [holdings, loaded]);

  // Refresh automatique toutes les 60s
  useEffect(() => {
    if (!loaded || holdings.length === 0) return;
    const interval = setInterval(fetchMarkets, 60_000);
    return () => clearInterval(interval);
  }, [holdings, loaded]);

  const holdingsWithMarket: HoldingWithMarket[] = holdings.map(h => {
    const market = marketData.find(m => m.id === h.id);
    const currentPrice = market?.current_price ?? 0;
    const currentValue = currentPrice * h.quantity;
    const costBasis = h.buyPrice * h.quantity;
    const pnl = currentValue - costBasis;
    const pnlPercentage = costBasis > 0 ? (pnl / costBasis) * 100 : 0;

    return {
      ...h,
      image: market?.image ?? h.image,
      currentPrice,
      currentValue,
      costBasis,
      pnl,
      pnlPercentage,
      priceChange24h: market?.price_change_percentage_24h ?? 0,
    };
  });

  return (
    <main className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">Crypto Portfolio</h1>
            <p className="text-gray-400 text-sm mt-0.5">Live • EUR</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-indigo-600 hover:bg-indigo-500 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            + Ajouter
          </button>
        </div>

        {!loaded || holdings.length === 0 ? (
          <div className="text-center py-24 text-gray-500">
            <p className="text-lg">Portfolio vide.</p>
            <p className="text-sm mt-2">Clique sur "Ajouter" pour commencer.</p>
          </div>
        ) : (
          <>
            <PortfolioSummary holdings={holdingsWithMarket} loading={loading} />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
              <div className="lg:col-span-2">
                <HoldingsList holdings={holdingsWithMarket} onRemove={removeHolding} loading={loading} />
              </div>
              <AllocationChart holdings={holdingsWithMarket} />
            </div>
          </>
        )}
      </div>

      {showModal && <AddHoldingModal onAdd={addHolding} onClose={() => setShowModal(false)} />}
    </main>
  );
}
