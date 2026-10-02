import { useState, useEffect, useCallback, useRef } from 'react';
import { IndexQuote, MarketOverview } from '@/types/market.types';
import { marketApi } from '@/services/api/market.api';

interface UseMarketOverviewReturn {
  indices: IndexQuote[];
  marketStatus: string;
  statusMessage: string;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useMarketOverview = (refreshIntervalMs = 30000): UseMarketOverviewReturn => {
  const cached = marketApi.getCachedOverview();
  const cachedIndices = marketApi.getCachedIndices();

  const [indices, setIndices] = useState<IndexQuote[]>(() => cached?.major_indices || cachedIndices || []);
  const [marketStatus, setMarketStatus] = useState<string>(() => cached?.market_status || 'CLOSED');
  const [statusMessage, setStatusMessage] = useState<string>(() => cached?.status_message || '');
  const [isLoading, setIsLoading] = useState<boolean>(() => !cached?.major_indices?.length && !cachedIndices?.length);
  const [error, setError] = useState<string | null>(null);
  const indicesRef = useRef(indices);
  indicesRef.current = indices;

  const fetchOverview = useCallback(async (isBackground = false) => {
    try {
      if (!isBackground && indicesRef.current.length === 0) {
        setIsLoading(true);
      }
      setError(null);

      // Fast-path: fetch real-time indices first (ultra-fast 20ms) so user never waits
      const indList = await marketApi.getIndices(false, isBackground);
      if (indList && indList.length > 0) {
        setIndices(indList);
        if (!isBackground) setIsLoading(false);
      }

      // Secondary enrichment: overview snapshot
      const overview: MarketOverview = await marketApi.getMarketOverview(isBackground);
      if (overview) {
        if (overview.major_indices && overview.major_indices.length > 0) {
          setIndices(overview.major_indices);
        }
        setMarketStatus(overview.market_status || 'CLOSED');
        setStatusMessage(overview.status_message || '');
      }
    } catch (err: any) {
      console.error('Failed to fetch market overview from backend:', err);
      if (indicesRef.current.length === 0) {
        const msg =
          err.response?.data?.detail ||
          err.message ||
          'Unable to connect to Sentinews backend service.';
        setError(msg);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const hasData = indicesRef.current.length > 0;
    fetchOverview(hasData);

    if (refreshIntervalMs > 0) {
      const interval = setInterval(() => {
        fetchOverview(true);
      }, refreshIntervalMs);
      return () => clearInterval(interval);
    }
  }, [fetchOverview, refreshIntervalMs]);

  return {
    indices,
    marketStatus,
    statusMessage,
    isLoading,
    error,
    refetch: () => fetchOverview(false),
  };
};
