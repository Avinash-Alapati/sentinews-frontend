export interface Portfolio {
  id: number;
  name: string;
  description?: string;
  user_id?: number;
  cash_balance?: number;
  created_at: string;
  updated_at: string;
}

export interface PortfolioTransaction {
  id: number;
  portfolio_id: number;
  symbol: string;
  transaction_type: 'BUY' | 'SELL' | 'SIP' | 'OTHER';
  quantity: number;
  price: number;
  total_amount: number;
  transaction_date: string;
  notes?: string;
}

export interface PortfolioHolding {
  id: number;
  portfolio_id: number;
  symbol: string;
  company_name?: string;
  quantity: number;
  average_buy_price: number;
  current_price: number;
  total_investment: number;
  current_value: number;
  unrealized_pnl: number;
  unrealized_pnl_percent: number;
  day_change?: number;
  day_change_percent?: number;
  sector?: string;
  exchange?: string;
  asset_type?: 'Stock' | 'ETF' | 'Mutual Fund' | 'Bond' | 'Gold';
  market_cap?: 'Large Cap' | 'Mid Cap' | 'Small Cap';
}

export interface PortfolioOverview {
  id: number;
  name: string;
  total_investment: number;
  current_value: number;
  total_pnl: number;
  total_pnl_percent: number;
  unrealized_pnl: number;
  unrealized_pnl_percent: number;
  realized_pnl: number;
  day_pnl: number;
  day_pnl_percent: number;
  total_holdings_count: number;
  portfolio_score?: number;
  risk_ratio?: string;
  benchmark_return?: number;
}

export interface SectorAllocationItem {
  sector: string;
  current_value: number;
  weight_percent: number;
  holding_count: number;
}

export interface HoldingAllocationItem {
  symbol: string;
  company_name?: string;
  current_value: number;
  weight_percent: number;
}

export interface PortfolioAllocation {
  sectors: SectorAllocationItem[];
  holdings: HoldingAllocationItem[];
}

export interface PortfolioPerformance {
  xirr: number;
  total_return_percent: number;
  top_gainers: PortfolioHolding[];
  top_losers: PortfolioHolding[];
  best_performing_symbol?: string;
  worst_performing_symbol?: string;
}

export interface PortfolioNewsArticle {
  id: string;
  title: string;
  summary: string;
  source: string;
  published_at: string;
  sentiment: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
  symbol: string;
  url?: string;
}

export interface CreatePortfolioPayload {
  name: string;
  description?: string;
}

export interface RecordTransactionPayload {
  symbol: string;
  transaction_type: 'BUY' | 'SELL' | 'SIP' | 'OTHER';
  quantity: number;
  price: number;
  transaction_date?: string;
  notes?: string;
}
