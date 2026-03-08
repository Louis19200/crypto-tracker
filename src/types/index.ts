export interface Holding {
  id: string;
  symbol: string;
  name: string;
  image: string;
  quantity: number;
  buyPrice: number; // prix moyen d'achat en EUR
}

export interface CoinMarketData {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
}

export interface HoldingWithMarket extends Holding {
  currentPrice: number;
  currentValue: number;
  costBasis: number;
  pnl: number;
  pnlPercentage: number;
  priceChange24h: number;
}

export interface CoinSearchResult {
  id: string;
  name: string;
  symbol: string;
  thumb: string;
}
