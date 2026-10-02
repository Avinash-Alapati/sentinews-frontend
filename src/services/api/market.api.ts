import { apiClient } from './client';
import { apiCache } from './cache';
import {
  IndexQuote,
  StockQuote,
  MarketOverview,
  MarketMoversResponse,
  StockSearchResult,
  StockHistoryResponse,
  ETFListResponse,
} from '@/types/market.types';

// Full list of major NSE & BSE benchmark and sectoral index symbols to fetch
const ALL_INDEX_SYMBOLS = [
  '^NSEI',
  '^BSESN',
  '^NSEBANK',
  '^CNXIT',
  '^CNXAUTO',
  '^CNXPHARMA',
  '^CNXFMCG',
  '^CNXMETAL',
  '^CNXENERGY',
  '^CNXREALTY',
  'NIFTY_MIDCAP_100',
  'BSE-100',
  'BSE-200',
  'BSE-500',
  'BSE-MIDCAP',
  'BSE-SMLCAP',
];

// Memory cache and in-flight deduplication for stock quotes
const quoteCache = new Map<string, StockQuote>();
const quoteCacheTimestamps = new Map<string, number>();
const inFlightQuoteRequests = new Map<string, Promise<StockQuote[]>>();
const QUOTE_CACHE_TTL_MS = 10000; // 10 seconds cache to align with live market updates

export const marketApi = {
  // Fetch real-time list of Exchange Traded Funds (ETFs) with 60s cache & in-flight deduplication
  getETFs: async (params?: {
    category?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<ETFListResponse> => {
    const cacheKey = apiCache.makeKey('market:etfs', params);
    return apiCache.fetchWithCache<ETFListResponse>(
      cacheKey,
      async () => {
        try {
          const response = await apiClient.get<ETFListResponse>('/market/etfs', { params });
          return response.data || { total_count: 0, available_categories: [], items: [] };
        } catch (err) {
          console.error('Failed to fetch ETFs from backend /market/etfs API:', err);
          return {
            total_count: 0,
            available_categories: [
              'broad_market',
              'sectoral',
              'gold',
              'silver',
              'debt',
              'global',
              'smart_beta',
            ],
            items: [],
          };
        }
      },
      60000
    );
  },

  // Fetch real-time benchmark indices (NIFTY 50, SENSEX, BANK NIFTY, NIFTY IT, etc.)
  // Cached for 15s to eliminate redundant simultaneous requests from Navbar, ticker, and page
  getIndices: async (includeExtended = false, forceRefresh = false): Promise<IndexQuote[]> => {
    const cacheKey = `market:indices:${includeExtended}`;
    return apiCache.fetchWithCache<IndexQuote[]>(
      cacheKey,
      async () => {
        try {
          // 1. Fetch dedicated real-time indices endpoint directly
          const primaryResponse = await apiClient.get<IndexQuote[]>('/market/indices');
          const rawIndices = Array.isArray(primaryResponse.data) ? primaryResponse.data : [];

          // Deduplicate by symbol to prevent duplicate key errors (e.g. ^CNXPSUBANK)
          const seen = new Set<string>();
          const primaryIndices = rawIndices.filter((idx) => {
            if (!idx || !idx.symbol) return false;
            const sym = idx.symbol.toUpperCase();
            if (seen.has(sym)) return false;
            seen.add(sym);
            return true;
          });

          if (!includeExtended) {
            return primaryIndices;
          }

          const indicesMap = new Map<string, IndexQuote>();

          // Add primary indices
          primaryIndices.forEach((idx) => {
            const name = idx.name || idx.symbol || '';
            const key = name.toUpperCase().replace(/\s+/g, '_');
            if (key) {
              indicesMap.set(key, idx);
            }
          });

          // 2. Fetch extended batch quotes for sectoral indices only when explicitly requested
          try {
            const extendedQuotes = await marketApi.getQuotes(ALL_INDEX_SYMBOLS);
            extendedQuotes.filter(Boolean).forEach((q) => {
              if (!q || !q.symbol) return;
              const name = q.company_name || q.symbol;
              const key = name.toUpperCase().replace(/\s+/g, '_');

              if (!indicesMap.has(key)) {
                indicesMap.set(key, {
                  symbol: q.symbol,
                  name: name,
                  current_value: q.current_price,
                  change: q.change,
                  change_percent: q.change_percent,
                  open: q.open_price,
                  high: q.day_high,
                  low: q.day_low,
                  previous_close: q.previous_close,
                  is_market_open: true,
                  timestamp: q.timestamp,
                });
              }
            });
          } catch (extErr) {
            console.warn('Extended sectoral indices quote enrichment warning:', extErr);
          }

          return Array.from(indicesMap.values());
        } catch (err) {
          console.warn('Backend indices endpoint timeout or error, serving cached snapshot:', err);
          const stale = apiCache.getStale<IndexQuote[]>(cacheKey) || apiCache.getStale<IndexQuote[]>('market:indices:false');
          if (stale && stale.length > 0) return stale;
          return [];
        }
      },
      15000,
      { forceRefresh }
    );
  },

  // Fetch complete high-level market overview snapshot with 20s cache
  getMarketOverview: async (forceRefresh = false): Promise<MarketOverview> => {
    return apiCache.fetchWithCache<MarketOverview>(
      'market:overview',
      async () => {
        try {
          const response = await apiClient.get<MarketOverview>('/market/overview');
          const data = response.data || ({} as MarketOverview);
          return {
            market_status: data.market_status || 'CLOSED',
            status_message: data.status_message || 'Real-time data feed active',
            major_indices: Array.isArray(data.major_indices) ? data.major_indices : [],
            top_gainers: Array.isArray(data.top_gainers) ? data.top_gainers : [],
            top_losers: Array.isArray(data.top_losers) ? data.top_losers : [],
            most_active: Array.isArray(data.most_active) ? data.most_active : [],
          };
        } catch (err) {
          console.warn('Market overview timeout or error, serving cached snapshot:', err);
          const stale = apiCache.getStale<MarketOverview>('market:overview');
          if (stale && stale.major_indices && stale.major_indices.length > 0) {
            return stale;
          }
          return {
            market_status: 'CLOSED',
            status_message: 'Real-time data feed active',
            major_indices: [],
            top_gainers: [],
            top_losers: [],
            most_active: [],
          };
        }
      },
      20000,
      { forceRefresh }
    );
  },

  // Fetch real-time market movers (top gainers, top losers, most active) with 20s cache
  getMarketMovers: async (
    filter = 'all',
    limit = 20,
    forceRefresh = false
  ): Promise<MarketMoversResponse> => {
    const cacheKey = `market:movers:${filter}:${limit}`;
    return apiCache.fetchWithCache<MarketMoversResponse>(
      cacheKey,
      async () => {
        try {
          const response = await apiClient.get<MarketMoversResponse>('/market/movers', {
            params: { filter, limit },
          });
          const data = response.data || ({} as MarketMoversResponse);
          return {
            filter: data.filter || filter,
            total_gainers: data.total_gainers || 0,
            total_losers: data.total_losers || 0,
            total_most_active: data.total_most_active || 0,
            top_gainers: Array.isArray(data.top_gainers) ? data.top_gainers : [],
            top_losers: Array.isArray(data.top_losers) ? data.top_losers : [],
            most_active: Array.isArray(data.most_active) ? data.most_active : [],
          };
        } catch (err) {
          console.warn('Backend movers endpoint timeout or error, serving cached snapshot:', err);
          const stale =
            apiCache.getStale<MarketMoversResponse>(cacheKey) ||
            apiCache.getStale<MarketMoversResponse>('market:movers:all:20');
          if (stale && (stale.top_gainers?.length > 0 || stale.top_losers?.length > 0)) {
            return stale;
          }
          return {
            filter,
            total_gainers: 0,
            total_losers: 0,
            total_most_active: 0,
            top_gainers: [],
            top_losers: [],
            most_active: [],
          };
        }
      },
      20000,
      { forceRefresh }
    );
  },

  // Fetch real-time stock quote for single symbol with 10s cache and in-flight deduplication
  getQuote: async (symbol: string, forceRefresh = false): Promise<StockQuote> => {
    const cleanSym = symbol.trim().toUpperCase();
    const cacheKey = `market:quote:${cleanSym}`;

    return apiCache.fetchWithCache<StockQuote>(
      cacheKey,
      async () => {
        try {
          const response = await apiClient.get<StockQuote>(
            `/market/quote/${encodeURIComponent(cleanSym)}`
          );
          if (response.data) {
            quoteCache.set(cleanSym, response.data);
            quoteCacheTimestamps.set(cleanSym, Date.now());
          }
          return response.data;
        } catch (err) {
          console.warn(`Quote fetch error for ${symbol}, checking cache:`, err);
          const cached = quoteCache.get(cleanSym);
          if (cached) return cached;
          throw err;
        }
      },
      10000,
      { forceRefresh }
    );
  },

  // Fetch batch real-time stock quotes with multi-tier cache & in-flight deduplication
  getQuotes: async (symbols: string[]): Promise<StockQuote[]> => {
    if (!symbols || symbols.length === 0) return [];

    // Deduplicate and clean symbols
    const uniqueSymbols = Array.from(
      new Set(symbols.map((s) => s.trim().toUpperCase()))
    ).filter(Boolean);
    if (uniqueSymbols.length === 0) return [];

    const now = Date.now();
    // Fast path: if all requested symbols are fresh in cache (< 10s), return immediately (0ms latency!)
    const missingSymbols: string[] = [];
    const collectedQuotes: StockQuote[] = [];

    uniqueSymbols.forEach((s) => {
      const ts = quoteCacheTimestamps.get(s) || 0;
      if (quoteCache.has(s) && now - ts < QUOTE_CACHE_TTL_MS) {
        collectedQuotes.push(quoteCache.get(s)!);
      } else {
        missingSymbols.push(s);
      }
    });

    if (missingSymbols.length === 0) {
      return collectedQuotes;
    }

    // In-flight request deduplication key for missing symbols
    const inFlightKey = missingSymbols.slice().sort().join(',');
    if (inFlightQuoteRequests.has(inFlightKey)) {
      const pendingMissing = await inFlightQuoteRequests.get(inFlightKey)!;
      return [...collectedQuotes, ...pendingMissing];
    }

    const fetchPromise = (async () => {
      try {
        const CHUNK_SIZE = 25;
        const chunks: string[][] = [];
        for (let i = 0; i < missingSymbols.length; i += CHUNK_SIZE) {
          chunks.push(missingSymbols.slice(i, i + CHUNK_SIZE));
        }

        const results = await Promise.allSettled(
          chunks.map(async (chunk) => {
            const response = await apiClient.get<StockQuote[]>('/market/quotes', {
              params: { symbols: chunk.join(',') },
            });
            const rawList = Array.isArray(response.data)
              ? response.data
              : (response.data as any)?.quotes || [];
            return rawList;
          })
        );

        const newQuotes: StockQuote[] = [];
        const receivedAt = Date.now();

        results.forEach((res, index) => {
          if (res.status === 'fulfilled' && Array.isArray(res.value)) {
            res.value.forEach((q) => {
              if (q && q.symbol) {
                const sym = q.symbol.toUpperCase();
                quoteCache.set(sym, q);
                quoteCacheTimestamps.set(sym, receivedAt);
                newQuotes.push(q);
              }
            });
          } else {
            // Fallback to cache for failed chunk
            const chunkSymbols = chunks[index];
            if (chunkSymbols) {
              chunkSymbols.forEach((sym) => {
                const cached = quoteCache.get(sym);
                if (cached) newQuotes.push(cached);
              } );
            }
          }
        });

        return newQuotes;
      } finally {
        inFlightQuoteRequests.delete(inFlightKey);
      }
    })();

    inFlightQuoteRequests.set(inFlightKey, fetchPromise);
    const resolvedMissing = await fetchPromise;

    // Combine cached + newly fetched quotes
    const resultMap = new Map<string, StockQuote>();
    [...collectedQuotes, ...resolvedMissing].forEach((q) => {
      if (q && q.symbol) resultMap.set(q.symbol.toUpperCase(), q);
    });

    return uniqueSymbols.map((s) => resultMap.get(s) || quoteCache.get(s)!).filter(Boolean);
  },

  // Fetch historical candle chart data with 60s cache per symbol/interval/range
  getHistory: async (
    symbol: string,
    interval = '1d',
    range = '1mo',
    forceRefresh = false
  ): Promise<StockHistoryResponse> => {
    const cleanSym = symbol.trim().toUpperCase();
    const cacheKey = `market:history:${cleanSym}:${interval}:${range}`;

    return apiCache.fetchWithCache<StockHistoryResponse>(
      cacheKey,
      async () => {
        const response = await apiClient.get<StockHistoryResponse>(
          `/market/history/${encodeURIComponent(cleanSym)}`,
          {
            params: { interval, range },
          }
        );
        return response.data;
      },
      60000,
      { forceRefresh }
    );
  },

  // Search Indian stocks with 60s query cache and in-flight deduplication
  searchStocks: async (query: string): Promise<StockSearchResult[]> => {
    const cleanQuery = query?.trim().toLowerCase();
    if (!cleanQuery) return [];

    const cacheKey = `market:search:${cleanQuery}`;
    return apiCache.fetchWithCache<StockSearchResult[]>(
      cacheKey,
      async () => {
        try {
          const response = await apiClient.get<StockSearchResult[]>('/market/search', {
            params: { query: cleanQuery },
          });
          return response.data || [];
        } catch (err) {
          console.error('Failed to search stocks:', err);
          return [];
        }
      },
      60000
    );
  },

  // Synchronous cache lookup for instantaneous rendering
  getCachedQuote: (symbol: string): StockQuote | undefined => {
    if (!symbol) return undefined;
    return quoteCache.get(symbol.trim().toUpperCase());
  },

  // Synchronous cache lookup for indices
  getCachedIndices: (includeExtended = false): IndexQuote[] | undefined => {
    return apiCache.get<IndexQuote[]>(`market:indices:${includeExtended}`);
  },

  // Synchronous cache lookup for overview
  getCachedOverview: (): MarketOverview | undefined => {
    return apiCache.get<MarketOverview>('market:overview');
  },
};
