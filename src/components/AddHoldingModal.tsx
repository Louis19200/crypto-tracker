'use client';

import { useState, useEffect, useRef } from 'react';
import type { CoinSearchResult, Holding } from '@/types';

export default function AddHoldingModal({
  onAdd, onClose,
}: {
  onAdd: (h: Holding) => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<CoinSearchResult[]>([]);
  const [selected, setSelected] = useState<CoinSearchResult | null>(null);
  const [quantity, setQuantity] = useState('');
  const [buyPrice, setBuyPrice] = useState('');
  const [searching, setSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const debounce = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    if (debounce.current) clearTimeout(debounce.current);
    if (!query.trim() || selected) return;
    setShowDropdown(false);

    debounce.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        const coins: CoinSearchResult[] = Array.isArray(data) ? data : [];
        setResults(coins);
        setShowDropdown(coins.length > 0);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 400);
  }, [query, selected]);

  function selectCoin(coin: CoinSearchResult) {
    setSelected(coin);
    setQuery(coin.name);
    setResults([]);
    setShowDropdown(false);
  }

  function handleQueryChange(e: React.ChangeEvent<HTMLInputElement>) {
    setQuery(e.target.value);
    setSelected(null); // reset si l'user retape
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selected || !quantity || !buyPrice) return;
    onAdd({
      id: selected.id,
      symbol: selected.symbol,
      name: selected.name,
      image: selected.thumb,
      quantity: parseFloat(quantity),
      buyPrice: parseFloat(buyPrice),
    });
    onClose();
  }

  const isValid = !!selected && !!quantity && !!buyPrice;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Ajouter une position</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Champ Crypto */}
          <div className="relative">
            <label className="block text-sm text-gray-400 mb-1.5">Crypto</label>
            <div className="relative">
              <input
                value={query}
                onChange={handleQueryChange}
                placeholder="Recherche : Bitcoin, ETH..."
                className={`w-full bg-gray-800 border rounded-lg px-3 py-2.5 text-sm placeholder-gray-500 focus:outline-none transition-colors ${
                  selected
                    ? 'border-green-600 focus:border-green-500'
                    : query && !searching
                    ? 'border-yellow-600 focus:border-yellow-500'
                    : 'border-gray-700 focus:border-indigo-500'
                }`}
              />
              {/* Indicateurs d'état */}
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {searching && <span className="text-gray-400 text-xs">⏳</span>}
                {selected && <span className="text-green-400 text-base">✓</span>}
                {!selected && query && !searching && (
                  <span className="text-yellow-500 text-xs">⬇ sélectionne</span>
                )}
              </div>
            </div>

            {/* Dropdown résultats */}
            {showDropdown && !selected && (
              <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg overflow-hidden shadow-xl">
                {results.map(r => (
                  <button
                    key={r.id} type="button" onClick={() => selectCoin(r)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-700 text-left transition-colors"
                  >
                    <img src={r.thumb} alt={r.name} className="w-6 h-6 rounded-full" />
                    <span className="text-sm">{r.name}</span>
                    <span className="text-gray-400 text-xs uppercase ml-auto">{r.symbol}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quantité */}
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Quantité</label>
            <input
              type="number" value={quantity} onChange={e => setQuantity(e.target.value)}
              placeholder="0.5" min="0" step="any"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Prix d'achat */}
          <div>
            <label className="block text-sm text-gray-400 mb-1.5">Prix d'achat moyen (€)</label>
            <input
              type="number" value={buyPrice} onChange={e => setBuyPrice(e.target.value)}
              placeholder="42000" min="0" step="any"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm placeholder-gray-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Hint si le bouton est désactivé */}
          {!isValid && query && !selected && (
            <p className="text-yellow-500 text-xs">
              ⚠️ Sélectionne un coin dans la liste déroulante avant de continuer.
            </p>
          )}

          <button
            type="submit"
            disabled={!isValid}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed font-medium py-2.5 rounded-lg transition-colors"
          >
            {isValid ? 'Ajouter' : 'Sélectionne un coin d\'abord'}
          </button>
        </form>
      </div>
    </div>
  );
}
