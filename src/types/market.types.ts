export interface IndexQuote {
  symbol: string;
  name: string;
  current_value: number;
  change: number;
  change_percent: number;
  open: number | null;
  high: number | null;
  low: number | null;
  previous_close: number | null;
  is_market_open?: boolean;
  timestamp?: string;
}

export interface StockQuote {
  symbol: string;
  company_name: string;
  exchange: string;
  currency: string;
  current_price: number;
  change: number;
  change_percent: number;
  open_price: number | null;
  day_high: number | null;
  day_low: number | null;
  previous_close: number | null;
  volume: number | null;
  fifty_two_week_high: number | null;
  fifty_two_week_low: number | null;
  provider?: string;
  timestamp?: string;
}

export interface MarketMover {
  symbol: string;
  company_name: string;
  exchange: string;
  current_price: number;
  change: number;
  change_percent: number;
  volume: number | null;
}

export interface MarketMoversResponse {
  filter: string;
  total_gainers: number;
  total_losers: number;
  total_most_active: number;
  top_gainers: MarketMover[];
  top_losers: MarketMover[];
  most_active: MarketMover[];
}

export interface MarketOverview {
  market_status: string;
  status_message: string;
  major_indices: IndexQuote[];
  top_gainers: MarketMover[];
  top_losers: MarketMover[];
  most_active: MarketMover[];
}

export interface StockSearchResult {
  symbol: string;
  name: string;
  exchange: string;
  instrument_type: string;
}

export interface CandleData {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface StockHistoryResponse {
  symbol: string;
  interval: string;
  range: string;
  candles: CandleData[];
}

export interface ETFQuote {
  symbol: string;
  underlying_asset: string;
  category: string;
  last_price: number;
  change: number;
  change_percent: number;
  open?: number | null;
  high?: number | null;
  low?: number | null;
  previous_close?: number | null;
  volume?: number | null;
  traded_value?: number | null;
  nav?: number | null;
  fifty_two_week_high?: number | null;
  fifty_two_week_low?: number | null;
}

export interface ETFListResponse {
  total_count: number;
  available_categories: string[];
  items: ETFQuote[];
}
