export const DEFAULT_INDICES = [
  { symbol: '^NSEI', name: 'NIFTY 50' },
  { symbol: '^BSESN', name: 'SENSEX' },
  { symbol: '^NSEBANK', name: 'NIFTY BANK' },
  { symbol: '^CNXIT', name: 'NIFTY IT' },
];

export const REFRESH_INTERVALS = {
  REALTIME_TICKER: 5000,
  MARKET_MOVERS: 30000,
  NEWS_FEED: 60000,
};

export interface MoverFilterOption {
  id: string;
  name: string;
}

export const MOVER_FILTERS: MoverFilterOption[] = [
  { id: 'all', name: 'All Stocks' },
  { id: 'nifty50', name: 'NIFTY 50' },
  { id: 'nifty500', name: 'NIFTY 500' },
  { id: 'midcap100', name: 'NIFTY Midcap 100' },
  { id: 'smallcap100', name: 'NIFTY Smallcap 100' },
  { id: 'total_market', name: 'Total Market' },
];

export const resolveMoverFilter = (param: string | null | undefined): string => {
  if (!param) return 'all';
  const clean = param.trim().toLowerCase();
  const directMatch = MOVER_FILTERS.find(
    (f) => f.id === clean || f.name.toLowerCase() === clean
  );
  if (directMatch) return directMatch.id;

  if (clean.includes('50') && !clean.includes('500')) return 'nifty50';
  if (clean.includes('500') || clean.includes('100') || clean.includes('200')) return 'nifty500';
  if (clean.includes('midcap')) return 'midcap100';
  if (clean.includes('smallcap')) return 'smallcap100';
  if (clean.includes('total')) return 'total_market';

  return 'all';
};

export const getFilterDisplayName = (filterId: string): string => {
  const match = MOVER_FILTERS.find((f) => f.id === filterId);
  return match ? match.name : 'All Stocks';
};

export const SEBI_DISCLAIMER_TEXT =
  'Investment in securities market are subject to market risks. Read all the related documents carefully before investing. SEBI Registration / Financial Information Disclaimer: Content provided is for informational & educational purposes only.';
