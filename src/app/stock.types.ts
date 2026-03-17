export type StockPoint = {
  time: string; // yyyy-mm-dd
  open: number;
  high: number;
  low: number;
  close: number;
};

export interface AIInsights {
  sentiment: 'Bullish' | 'Bearish' | 'Neutral';
  sentimentScore: number;
  confidence: string;
  rsi: number;
  indicators: {
    rsi: number;
    recommendation: 'Strong Buy' | 'Buy' | 'Sell' | 'Hold';
  };
  tradeSignal?: {
    action: 'BUY' | 'SELL' | 'HOLD';
    strength: number;
    reasoning: string;
    targetPrice: number;
  };
}

export type StockHistoryResponse = {
  symbol: string;
  days: number;
  history: StockPoint[];
  insights?: AIInsights;
};

export type PredictResponse =
  | {
      ok: true;
      model: { type: string; window: number };
      symbol: string;
      lastDate: string | null;
      predictedNextClose: number;
      history: StockPoint[];
      insights?: AIInsights;
    }
  | { ok: false; error: string };

export interface LiveQuote {
  ok: boolean;
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  time: string | Date;
  currency: string;
  isDummy?: boolean;
}

export interface StockPick {
  symbol: string;
  price: number;
  changePercent: number;
  recommendation: string;
  risk: string;
  reason: string;
}

export interface TopPicksResponse {
  ok: boolean;
  picks: StockPick[];
}

export interface NewsItem {
  id: number;
  title: string;
  source: string;
  time: string;
  category: string;
  summary: string;
  url?: string;
}

export interface NewsResponse {
  ok: boolean;
  news: NewsItem[];
}

export interface IndianIndex {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  sentiment: 'Bullish' | 'Bearish' | 'Neutral';
}

export interface MarketBreadth {
  advances: number;
  declines: number;
  unchanged: number;
}

export interface FiiDiiActivity {
  fiiNet: number; // in Crores
  diiNet: number; // in Crores
  date: string;
}

export interface IndianLiveStock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  lastUpdated: string;
  isDummy?: boolean;
}

export interface IndianMarketDataResponse {
  ok: boolean;
  indices: IndianIndex[];
  liveStocks?: IndianLiveStock[];
  breadth: MarketBreadth;
  fiiDii: FiiDiiActivity;
  sectors: Array<{ name: string; change: number }>;
  globalIndices: Array<{ name: string; price: string; change: string; status: string }>;
  lastUpdated?: string;
}
export interface GlobalExtendedResponse {
  ok: boolean;
  indices: Array<{
    name: string;
    price: string;
    change: string;
    percent: string;
    status: string;
  }>;
  commodities: Array<{
    name: string;
    price: string;
    change: string;
    percent: string;
    unit: string;
  }>;
  currencies: Array<{
    pair: string;
    rate: string;
    change: string;
    percent: string;
  }>;
  lastUpdated: string;
}
