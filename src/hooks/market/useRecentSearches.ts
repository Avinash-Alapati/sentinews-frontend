import { useState, useEffect, useCallback } from 'react';
import { StockQuote } from '@/types/market.types';
import { marketApi } from '@/services/api/market.api';

const STORAGE_KEY = 'sentinews_recent_searches';
const DEFAULT_SYMBOLS = ['RELIANCE', 'TCS'];

export const useRecentSearches = () => {
  const [recentSymbols, setRecentSymbols] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.slice(0, 2);
        }
      }
    } catch (e) {
      // Fallback on parse failure
    }
    return DEFAULT_SYMBOLS;
  });

  const [quotes, setQuotes] = useState<StockQuote[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch real backend quotes for current recent symbols
  const fetchQuotes = useCallback(async () => {
    if (!recentSymbols || recentSymbols.length === 0) {
      setQuotes([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const data = await marketApi.getQuotes(recentSymbols.slice(0, 2));
      setQuotes(data.slice(0, 2));
    } catch (err: any) {
      console.error('Error fetching recent search quotes from backend:', err);
      setError('Failed to fetch real-time quotes for recently searched stocks.');
    } finally {
      setIsLoading(false);
    }
  }, [recentSymbols]);

  useEffect(() => {
    fetchQuotes();
  }, [fetchQuotes]);

  // Add a symbol to recent searches and persist in localStorage
  const addRecentSearch = useCallback((symbol: string) => {
    const cleanSym = symbol.trim().toUpperCase().replace('.NS', '').replace('.BO', '');
    if (!cleanSym) return;

    setRecentSymbols((prev) => {
      const filtered = prev.filter((s) => s.toUpperCase() !== cleanSym);
      const updated = [cleanSym, ...filtered].slice(0, 2);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        // LocalStorage fallback
      }
      return updated;
    });
  }, []);

  // Remove a symbol from recent searches
  const removeRecentSearch = useCallback((symbol: string) => {
    const cleanSym = symbol.trim().toUpperCase();
    setRecentSymbols((prev) => {
      const updated = prev.filter((s) => s.toUpperCase() !== cleanSym);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        // LocalStorage fallback
      }
      return updated;
    });
  }, []);

  // Clear all recent searches
  const clearRecentSearches = useCallback(() => {
    setRecentSymbols([]);
    setQuotes([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      // LocalStorage fallback
    }
  }, []);

  return {
    recentSymbols,
    quotes,
    isLoading,
    error,
    addRecentSearch,
    removeRecentSearch,
    clearRecentSearches,
    refetch: fetchQuotes,
  };
};
