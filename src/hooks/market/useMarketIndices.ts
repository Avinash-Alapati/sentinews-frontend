import { useState, useEffect, useCallback, useRef } from 'react';
import { IndexQuote } from '@/types/market.types';
import { marketApi } from '@/services/api/market.api';

interface UseMarketIndicesReturn {
  indices: IndexQuote[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useMarketIndices = (refreshIntervalMs = 30000): UseMarketIndicesReturn => {
  const cached = marketApi.getCachedIndices();
  const [indices, setIndices] = useState<IndexQuote[]>(() => cached || []);
  const [isLoading, setIsLoading] = useState<boolean>(() => !cached || cached.length === 0);
  const [error, setError] = useState<string | null>(null);
  const indicesRef = useRef(indices);
  indicesRef.current = indices;

  const fetchIndices = useCallback(async (isBackground = false) => {
    try {
      if (!isBackground && indicesRef.current.length === 0) {
        setIsLoading(true);
      }
      setError(null);
      // Fast cached call with in-flight deduplication
      const data = await marketApi.getIndices(false, isBackground);
      if (Array.isArray(data) && data.length > 0) {
        setIndices(data);
      }
    } catch (err: any) {
      console.error('Failed to fetch real-time indices:', err);
      if (indicesRef.current.length === 0) {
        const msg = err.response?.data?.detail || err.message || 'Unable to load real-time market indices';
        setError(msg);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // If we have cached data, fetch quietly in background to refresh; otherwise show loader
    const hasData = indicesRef.current.length > 0;
    fetchIndices(hasData);

    if (refreshIntervalMs > 0) {
      const interval = setInterval(() => {
        fetchIndices(true);
      }, refreshIntervalMs);
      return () => clearInterval(interval);
    }
  }, [fetchIndices, refreshIntervalMs]);

  return {
    indices,
    isLoading,
    error,
    refetch: () => fetchIndices(false),
  };
};
