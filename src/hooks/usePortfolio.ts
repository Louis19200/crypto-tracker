'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Holding } from '@/types';

const KEY = 'crypto_portfolio';

export function usePortfolio() {
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setHoldings(JSON.parse(raw));
    } catch {}
    setLoaded(true);
  }, []);

  const persist = (next: Holding[]) => localStorage.setItem(KEY, JSON.stringify(next));

  const addHolding = useCallback((holding: Holding) => {
    setHoldings(prev => {
      const existing = prev.find(h => h.id === holding.id);
      let next: Holding[];

      if (existing) {
        // Calcul du prix moyen pondéré
        const totalQty = existing.quantity + holding.quantity;
        const avgPrice =
          (existing.buyPrice * existing.quantity + holding.buyPrice * holding.quantity) / totalQty;
        next = prev.map(h =>
          h.id === holding.id ? { ...h, quantity: totalQty, buyPrice: avgPrice } : h
        );
      } else {
        next = [...prev, holding];
      }

      persist(next);
      return next;
    });
  }, []);

  const removeHolding = useCallback((id: string) => {
    setHoldings(prev => {
      const next = prev.filter(h => h.id !== id);
      persist(next);
      return next;
    });
  }, []);

  return { holdings, addHolding, removeHolding, loaded };
}
