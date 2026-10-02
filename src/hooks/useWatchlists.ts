import { useState, useEffect, useCallback, useMemo } from 'react';
import { Watchlist, WatchlistItem, EnrichedWatchlistItem } from '@/types/watchlist.types';
import { watchlistApi } from '@/services/api/watchlist.api';
import { marketApi } from '@/services/api/market.api';
import { StockQuote } from '@/types/market.types';

const STORAGE_KEY = 'sentinews_watchlists_cache';

const getInitialLocalWatchlists = (): Watchlist[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn('Failed to read local watchlists cache:', e);
  }
  return [
    {
      id: 1,
      name: 'Default Watchlist',
      user_id: 1,
      stock_count: 3,
      stocks: [
        { id: 101, watchlist_id: 1, symbol: 'RELIANCE', exchange: 'NSE' },
        { id: 102, watchlist_id: 1, symbol: 'TCS', exchange: 'NSE' },
        { id: 103, watchlist_id: 1, symbol: 'HDFCBANK', exchange: 'NSE' },
      ],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];
};

export function useWatchlists() {
  const initialWatchlists = useMemo(() => getInitialLocalWatchlists(), []);
  const [watchlists, setWatchlists] = useState<Watchlist[]>(initialWatchlists);
  const [activeWatchlistId, setActiveWatchlistId] = useState<number | null>(
    initialWatchlists.length > 0 ? initialWatchlists[0].id : null
  );

  // If local watchlists exist, state is initialized instantly (0ms latency!)
  const [isLoadingWatchlists, setIsLoadingWatchlists] = useState<boolean>(initialWatchlists.length === 0);
  const [isLoadingQuotes, setIsLoadingQuotes] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Active watchlist reference
  const activeWatchlist = watchlists.find((w) => w.id === activeWatchlistId) || watchlists[0] || null;

  // Build enriched stocks immediately from active watchlist & memory quote cache
  const buildEnrichedStocks = useCallback(
    (targetWatchlist: Watchlist | null, freshQuoteMap?: Map<string, StockQuote>): EnrichedWatchlistItem[] => {
      if (!targetWatchlist || !targetWatchlist.stocks || targetWatchlist.stocks.length === 0) {
        return [];
      }

      return targetWatchlist.stocks.map((item) => {
        const quote = freshQuoteMap?.get(item.symbol.toUpperCase()) || marketApi.getCachedQuote(item.symbol);

        let volumeStr = '-';
        if (quote && quote.volume != null) {
          const vol = quote.volume;
          if (vol >= 1_000_000_000) volumeStr = `${(vol / 1_000_000_000).toFixed(2)}B`;
          else if (vol >= 1_000_000) volumeStr = `${(vol / 1_000_000).toFixed(2)}M`;
          else if (vol >= 1_000) volumeStr = `${(vol / 1_000).toFixed(1)}K`;
          else volumeStr = String(vol);
        }

        return {
          ...item,
          name: quote?.company_name || `${item.symbol} Ltd.`,
          price: quote?.current_price ?? 0,
          change: quote?.change ?? 0,
          changePercent: quote?.change_percent ?? 0,
          volume: volumeStr,
          open_price: quote?.open_price ?? undefined,
          day_high: quote?.day_high ?? undefined,
          day_low: quote?.day_low ?? undefined,
          previous_close: quote?.previous_close ?? undefined,
        };
      });
    },
    []
  );

  const [enrichedStocks, setEnrichedStocks] = useState<EnrichedWatchlistItem[]>(() =>
    buildEnrichedStocks(activeWatchlist)
  );

  // Re-synchronize enriched stocks instantly whenever activeWatchlist changes
  useEffect(() => {
    setEnrichedStocks(buildEnrichedStocks(activeWatchlist));
  }, [activeWatchlist, buildEnrichedStocks]);

  // Fetch user watchlists in background with instant cache hydration
  const fetchWatchlists = useCallback(async () => {
    // Only set loading spinner if no cached watchlists exist at all
    if (watchlists.length === 0) {
      setIsLoadingWatchlists(true);
    }
    setError(null);
    try {
      let data = await watchlistApi.getWatchlists();
      if (!data || data.length === 0) {
        try {
          const defaultW = await watchlistApi.createWatchlist({ name: 'My Watchlist' });
          data = [defaultW];
        } catch (createErr) {
          console.error('Failed to create default initial watchlist:', createErr);
        }
      }
      if (data && data.length > 0) {
        setWatchlists(data);
        setActiveWatchlistId((prev) => {
          if (prev && data.some((w) => w.id === prev)) return prev;
          return data[0].id;
        });
      }
    } catch (err: any) {
      console.error('Error loading watchlists:', err);
      setError(err.message || 'Failed to fetch watchlists.');
    } finally {
      setIsLoadingWatchlists(false);
    }
  }, [watchlists.length]);

  useEffect(() => {
    fetchWatchlists();
  }, [fetchWatchlists]);

  // Enrich stock items in active watchlist with real-time market quotes
  const fetchQuotesForActiveWatchlist = useCallback(async (isBackground = false) => {
    if (!activeWatchlist || !activeWatchlist.stocks || activeWatchlist.stocks.length === 0) {
      setEnrichedStocks([]);
      return;
    }

    if (!isBackground) {
      setIsLoadingQuotes(true);
    }
    try {
      const symbols = activeWatchlist.stocks.map((s) => s.symbol);
      const quotes: StockQuote[] = await marketApi.getQuotes(symbols);
      const quoteMap = new Map<string, StockQuote>();
      quotes.forEach((q) => {
        if (q && q.symbol) {
          quoteMap.set(q.symbol.toUpperCase(), q);
        }
      });

      setEnrichedStocks(buildEnrichedStocks(activeWatchlist, quoteMap));
    } catch (err) {
      console.error('Error fetching quotes for active watchlist:', err);
    } finally {
      setIsLoadingQuotes(false);
    }
  }, [activeWatchlist, buildEnrichedStocks]);

  useEffect(() => {
    fetchQuotesForActiveWatchlist(false);
  }, [fetchQuotesForActiveWatchlist]);

  // Periodic quote refresh every 15 seconds without flickering
  useEffect(() => {
    if (!activeWatchlist || activeWatchlist.stocks.length === 0) return;
    const interval = setInterval(() => {
      fetchQuotesForActiveWatchlist(true);
    }, 15000);
    return () => clearInterval(interval);
  }, [activeWatchlist, fetchQuotesForActiveWatchlist]);

  // CRUD Handler 1: Create Watchlist
  const createWatchlist = async (name: string): Promise<Watchlist> => {
    setError(null);
    try {
      const created = await watchlistApi.createWatchlist({ name });
      setWatchlists((prev) => [created, ...prev]);
      setActiveWatchlistId(created.id);
      return created;
    } catch (err: any) {
      const msg = err.response?.data?.detail || err.message || 'Failed to create watchlist';
      setError(msg);
      throw new Error(msg);
    }
  };

  // CRUD Handler 2: Rename/Update Watchlist
  const updateWatchlist = async (id: number, name: string): Promise<Watchlist> => {
    setError(null);
    try {
      const updated = await watchlistApi.updateWatchlist(id, { name });
      setWatchlists((prev) => prev.map((w) => (w.id === id ? { ...w, name: updated.name } : w)));
      return updated;
    } catch (err: any) {
      const msg = err.response?.data?.detail || err.message || 'Failed to update watchlist';
      setError(msg);
      throw new Error(msg);
    }
  };

  // CRUD Handler 3: Delete Watchlist
  const deleteWatchlist = async (id: number): Promise<void> => {
    setError(null);
    try {
      await watchlistApi.deleteWatchlist(id);
      setWatchlists((prev) => {
        const next = prev.filter((w) => w.id !== id);
        if (activeWatchlistId === id) {
          setActiveWatchlistId(next.length > 0 ? next[0].id : null);
        }
        return next;
      });
    } catch (err: any) {
      const msg = err.response?.data?.detail || err.message || 'Failed to delete watchlist';
      setError(msg);
      throw new Error(msg);
    }
  };

  // CRUD Handler 4: Add Stock to Watchlist
  const addStock = async (
    watchlistId: number,
    symbol: string,
    exchange = 'NSE',
    notes?: string
  ): Promise<WatchlistItem> => {
    setError(null);
    try {
      const newItem = await watchlistApi.addStock(watchlistId, { symbol, exchange, notes });
      setWatchlists((prev) =>
        prev.map((w) => {
          if (w.id === watchlistId) {
            const updatedStocks = [newItem, ...w.stocks];
            return {
              ...w,
              stocks: updatedStocks,
              stock_count: updatedStocks.length,
            };
          }
          return w;
        })
      );
      return newItem;
    } catch (err: any) {
      const msg = err.response?.data?.detail || err.message || `Failed to add ${symbol} to watchlist`;
      setError(msg);
      throw new Error(msg);
    }
  };

  // CRUD Handler 5: Remove Stock from Watchlist
  const removeStock = async (watchlistId: number, symbolOrId: string | number): Promise<void> => {
    setError(null);
    try {
      await watchlistApi.removeStock(watchlistId, symbolOrId);
      setWatchlists((prev) =>
        prev.map((w) => {
          if (w.id === watchlistId) {
            const symStr = String(symbolOrId).toUpperCase();
            const updatedStocks = w.stocks.filter(
              (s) => s.symbol.toUpperCase() !== symStr && String(s.id) !== String(symbolOrId)
            );
            return {
              ...w,
              stocks: updatedStocks,
              stock_count: updatedStocks.length,
            };
          }
          return w;
        })
      );
    } catch (err: any) {
      const msg = err.response?.data?.detail || err.message || 'Failed to remove stock';
      setError(msg);
      throw new Error(msg);
    }
  };

  return {
    watchlists,
    activeWatchlist,
    activeWatchlistId,
    setActiveWatchlistId,
    enrichedStocks,
    isLoadingWatchlists,
    isLoadingQuotes,
    error,
    setError,
    fetchWatchlists,
    createWatchlist,
    updateWatchlist,
    deleteWatchlist,
    addStock,
    removeStock,
    refetchQuotes: fetchQuotesForActiveWatchlist,
  };
}
