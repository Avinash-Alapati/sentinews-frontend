export interface WatchlistItem {
  id: number;
  watchlist_id: number;
  symbol: string;
  exchange: string;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Watchlist {
  id: number;
  name: string;
  user_id: number;
  stock_count: number;
  stocks: WatchlistItem[];
  created_at?: string;
  updated_at?: string;
}

export interface WatchlistSummary {
  id: number;
  name: string;
  stock_count: number;
  created_at?: string;
  updated_at?: string;
}

export interface CreateWatchlistPayload {
  name: string;
}

export interface UpdateWatchlistPayload {
  name: string;
}

export interface AddStockPayload {
  symbol: string;
  exchange?: string;
  notes?: string;
}

export interface EnrichedWatchlistItem extends WatchlistItem {
  name?: string;
  price?: number;
  change?: number;
  changePercent?: number;
  volume?: string;
  day_high?: number;
  day_low?: number;
  open_price?: number;
  previous_close?: number;
}
