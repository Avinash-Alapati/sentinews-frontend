import { useState, useEffect, useCallback, useRef } from 'react';
import { StockQuote, MarketMover } from '@/types/market.types';
import { marketApi } from '@/services/api/market.api';
import { resolveMoverFilter } from '@/config/market.config';

export type MoverTab = 'gainers' | 'losers' | 'volume';

interface UseMarketMoversReturn {
  gainers: StockQuote[];
  losers: StockQuote[];
  volumeShockers: StockQuote[];
  displayedQuotes: StockQuote[];
  totalGainers: number;
  totalLosers: number;
  totalMostActive: number;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const mapMoverToStockQuote = (m: MarketMover): StockQuote => ({
  symbol: m.symbol,
  company_name: m.company_name || m.symbol,
  exchange: m.exchange || 'NSE',
  currency: 'INR',
  current_price: m.current_price,
  change: m.change,
  change_percent: m.change_percent,
  open_price: null,
  day_high: null,
  day_low: null,
  previous_close: null,
  volume: m.volume ?? null,
  fifty_two_week_high: null,
  fifty_two_week_low: null,
});

export const useMarketMovers = (
  selectedFilter = 'all',
  activeTab: MoverTab = 'gainers',
  limit = 20
): UseMarketMoversReturn => {
  const [gainers, setGainers] = useState<StockQuote[]>([]);
  const [losers, setLosers] = useState<StockQuote[]>([]);
  const [volumeShockers, setVolumeShockers] = useState<StockQuote[]>([]);
  const [totalGainers, setTotalGainers] = useState<number>(0);
  const [totalLosers, setTotalLosers] = useState<number>(0);
  const [totalMostActive, setTotalMostActive] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const hasDataRef = useRef(false);

  const fetchMovers = useCallback(async (isBackground = false) => {
    try {
      if (!isBackground && !hasDataRef.current) {
        setIsLoading(true);
      }
      setError(null);

      const resolvedFilter = resolveMoverFilter(selectedFilter);
      const moversRes = await marketApi.getMarketMovers(resolvedFilter, limit, isBackground);

      const gList = moversRes.top_gainers.map(mapMoverToStockQuote);
      const lList = moversRes.top_losers.map(mapMoverToStockQuote);
      const vList = moversRes.most_active.map(mapMoverToStockQuote);

      if (gList.length > 0 || lList.length > 0 || vList.length > 0) {
        setGainers(gList);
        setLosers(lList);
        setVolumeShockers(vList);
        setTotalGainers(moversRes.total_gainers || gList.length);
        setTotalLosers(moversRes.total_losers || lList.length);
        setTotalMostActive(moversRes.total_most_active || vList.length);
        hasDataRef.current = true;
      }
    } catch (err: any) {
      console.error('Failed to fetch real-time market movers:', err);
      if (!hasDataRef.current) {
        setError('Unable to load real-time market movers data.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [selectedFilter, limit]);

  useEffect(() => {
    fetchMovers(hasDataRef.current);
  }, [fetchMovers]);

  const displayedQuotes =
    activeTab === 'gainers'
      ? gainers
      : activeTab === 'losers'
      ? losers
      : volumeShockers;

  return {
    gainers,
    losers,
    volumeShockers,
    displayedQuotes,
    totalGainers,
    totalLosers,
    totalMostActive,
    isLoading,
    error,
    refetch: () => fetchMovers(false),
  };
};
