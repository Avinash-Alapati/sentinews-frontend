export interface HeadlineItem {
  headline: string;
  source: string;
  url: string;
  published_at: string;
}

export interface IndexPoint {
  symbol: string;
  name: string;
  last_price: number;
  change: number;
  change_percent: number;
}

export interface GlobalCuesSection {
  us_indices?: IndexPoint[];
  asian_indices?: IndexPoint[];
  gift_nifty?: IndexPoint | null;
  summary_notes?: string;
}

export interface EconomicEventItem {
  event: string;
  country: string;
  date_time: string;
  impact?: 'low' | 'medium' | 'high' | string;
  actual?: string | null;
  estimate?: string | null;
  previous?: string | null;
}

export interface IndexPerformanceItem {
  symbol: string;
  name: string;
  current_price: number;
  change: number;
  change_percent: number;
}

export interface TopMoverItem {
  symbol: string;
  company_name: string;
  current_price: number;
  change_percent: number;
  direction?: 'gainer' | 'loser' | string;
}

export interface SectorPerformanceItem {
  sector: string;
  change_percent: number;
  advances?: number | null;
  declines?: number | null;
}

export interface CommodityItem {
  symbol: string;
  name: string;
  last_price: number;
  change: number;
  change_percent: number;
  unit?: string;
  source?: string;
}

export interface CurrencyPairItem {
  pair: string;
  last_price: number;
  change: number;
  change_percent: number;
  source?: string;
}

export interface ADRItem {
  symbol: string;
  company_name: string;
  last_price: number;
  change: number;
  change_percent: number;
  exchange?: string;
}

export interface FIIDIIData {
  date: string;
  fii_buy: number;
  fii_sell: number;
  fii_net: number;
  dii_buy: number;
  dii_sell: number;
  dii_net: number;
  unit?: string;
  source_note?: string;
}

export interface StockInNewsItem {
  symbol: string;
  company_name: string;
  description: string;
  source_headline?: string;
  source_url?: string;
}

export interface CorporateEventItem {
  symbol: string;
  company_name: string;
  event_type: string;
  details: string;
  announcement_date: string;
  source?: string;
}

export interface PreMarketSections {
  major_global_indices?: IndexPoint[];
  indian_indices_prev_close?: IndexPerformanceItem[];
  indian_sector_performance_prev?: SectorPerformanceItem[];
  commodities?: CommodityItem[];
  inr_currency_pairs?: CurrencyPairItem[];
  indian_adrs?: ADRItem[];
  fii_dii_prev_day?: FIIDIIData | null;
  stocks_in_news?: StockInNewsItem[];
  corporate_events_carried_forward?: CorporateEventItem[];
  market_news_carried_forward?: HeadlineItem[];
  economic_calendar_today?: EconomicEventItem[];
  market_status?: string;
  global_cues?: GlobalCuesSection;
  key_news_headlines?: HeadlineItem[];
}

export interface PostMarketSections {
  indian_indices_close?: IndexPerformanceItem[];
  top_gainers?: TopMoverItem[];
  top_losers?: TopMoverItem[];
  sector_performance?: SectorPerformanceItem[];
  fii_dii_data?: FIIDIIData | null;
  commodities_close?: CommodityItem[];
  corporate_events?: CorporateEventItem[];
  stocks_in_news?: StockInNewsItem[];
  market_news_impact?: HeadlineItem[];
  watch_tomorrow?: EconomicEventItem[];
  index_performance?: IndexPerformanceItem[];
  top_movers?: TopMoverItem[];
  key_news_recap?: HeadlineItem[];
  volume_summary?: Record<string, any>;
}

export interface MarketReportResponse {
  id: number;
  report_type: 'PRE_MARKET' | 'POST_MARKET' | 'GLOBAL_PRE_MARKET' | 'GLOBAL_POST_MARKET' | string;
  report_date: string;
  status: string;
  generated_at: string;
  sections: PreMarketSections & PostMarketSections & Record<string, any>;
  disclaimer: string;
  source_providers: string[];
  is_partial: boolean;
}

export interface MarketReportSummaryResponse {
  id: number;
  report_type: string;
  report_date: string;
  status: string;
  generated_at: string;
  is_partial: boolean;
  disclaimer?: string;
  source_providers?: string[];
}

export interface PaginatedMarketReportsResponse {
  items: MarketReportSummaryResponse[];
  page: number;
  limit: number;
  total: number;
  disclaimer: string;
  source_providers: string[];
}

// Backwards compatibility interfaces (if needed by existing code)
export interface FiiDiiData {
  category: 'FII/FPI' | 'DII';
  buyValue: number;
  sellValue: number;
  netValue: number;
  date: string;
}

export interface SectorPerformanceData {
  sector: string;
  changePercent: number;
  advances: number;
  declines: number;
}

export interface StockInFocus {
  symbol: string;
  name: string;
  reason: string;
  sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  impactPercent?: number;
}

export interface CorporateAction {
  symbol: string;
  companyName: string;
  type: 'DIVIDEND' | 'SPLIT' | 'BONUS' | 'RIGHTS' | 'AGM';
  details: string;
  recordDate: string;
}

export interface IPOInfo {
  companyName: string;
  issueSize: string;
  priceBand: string;
  openDate: string;
  closeDate: string;
  listingDate?: string;
  gmp?: number;
  status: 'UPCOMING' | 'ONGOING' | 'CLOSED';
}

export interface PrePostMarketReport {
  id: string;
  title: string;
  reportDate: string;
  reportType: 'PRE_MARKET' | 'POST_MARKET';
  summary: string;
  indicesSnapshot: Record<string, number>;
  marketBreadth: {
    advances: number;
    declines: number;
    unchanged: number;
  };
  sectorPerformance: SectorPerformanceData[];
  stocksInFocus: StockInFocus[];
  fiiDiiActivity: FiiDiiData[];
  marketDrivers: string[];
  keyEvents: string[];
  corporateActions: CorporateAction[];
  ipoWatch: IPOInfo[];
}
