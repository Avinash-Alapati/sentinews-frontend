import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import {
  Portfolio,
  PortfolioOverview,
  PortfolioHolding,
  PortfolioTransaction,
  PortfolioAllocation,
  PortfolioPerformance,
  PortfolioNewsArticle,
  CreatePortfolioPayload,
  RecordTransactionPayload,
} from '@/types/portfolio.types';
import { portfolioApi } from '@/services/api/portfolio.api';

const CACHE_KEY = 'sentinews_portfolio_state_cache';

const getInitialCache = () => {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed to read portfolio cache:', e);
  }
  return null;
};

export function usePortfolio() {
  const { user } = useAuthStore();
  const initialCache = getInitialCache();

  const [portfolio, setPortfolio] = useState<Portfolio | null>(initialCache?.portfolio || null);
  const [overview, setOverview] = useState<PortfolioOverview | null>(initialCache?.overview || null);
  const [holdings, setHoldings] = useState<PortfolioHolding[]>(initialCache?.holdings || []);
  const [transactions, setTransactions] = useState<PortfolioTransaction[]>(initialCache?.transactions || []);
  const [allocation, setAllocation] = useState<PortfolioAllocation | null>(initialCache?.allocation || null);
  const [performance, setPerformance] = useState<PortfolioPerformance | null>(initialCache?.performance || null);
  const [newsFeed, setNewsFeed] = useState<PortfolioNewsArticle[]>(initialCache?.newsFeed || []);

  // 0ms Latency: If local cache exists, do not show full-screen loader!
  const [isLoading, setIsLoading] = useState<boolean>(!initialCache);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Derive numeric user ID safely from auth store
  const currentUserId = user?.id
    ? typeof user.id === 'number'
      ? user.id
      : parseInt(String(user.id).replace(/\D/g, ''), 10) || 1
    : 1;

  // Helper: Persist updated state to localStorage cache for 0ms load times
  const saveToCache = (state: {
    portfolio?: Portfolio | null;
    overview?: PortfolioOverview | null;
    holdings?: PortfolioHolding[];
    transactions?: PortfolioTransaction[];
    allocation?: PortfolioAllocation | null;
    performance?: PortfolioPerformance | null;
    newsFeed?: PortfolioNewsArticle[];
  }) => {
    try {
      const existing = getInitialCache() || {};
      const updated = { ...existing, ...state };
      localStorage.setItem(CACHE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to update portfolio cache:', e);
    }
  };

  // Load all portfolio endpoints in parallel from real backend
  const fetchAllPortfolioData = useCallback(
    async (isInitial = false) => {
      if (isInitial && !initialCache) {
        setIsLoading(true);
      } else {
        setIsRefreshing(true);
      }
      setError(null);

      try {
        // 1. Get or Auto-create User's Primary Portfolio
        const userPortfolio = await portfolioApi.getUserPrimaryPortfolio(currentUserId);
        setPortfolio(userPortfolio);

        const pId = userPortfolio.id;

        // 2. Fast parallel fetch for all detail endpoints
        const [
          overviewData,
          holdingsData,
          transactionsData,
          allocationData,
          performanceData,
          newsFeedData,
        ] = await Promise.allSettled([
          portfolioApi.getOverview(pId),
          portfolioApi.getHoldings(pId),
          portfolioApi.getTransactions(pId),
          portfolioApi.getAllocation(pId),
          portfolioApi.getPerformance(pId),
          portfolioApi.getNewsFeed(pId),
        ]);

        const nextOverview = overviewData.status === 'fulfilled' ? overviewData.value : null;
        const nextHoldings = holdingsData.status === 'fulfilled' ? holdingsData.value : [];
        const nextTxs = transactionsData.status === 'fulfilled' ? transactionsData.value : [];
        const nextAlloc = allocationData.status === 'fulfilled' ? allocationData.value : null;
        const nextPerf = performanceData.status === 'fulfilled' ? performanceData.value : null;
        const nextNews = newsFeedData.status === 'fulfilled' ? newsFeedData.value : [];

        if (nextOverview) setOverview(nextOverview);
        if (nextHoldings.length > 0 || holdingsData.status === 'fulfilled') setHoldings(nextHoldings);
        if (nextTxs.length > 0 || transactionsData.status === 'fulfilled') setTransactions(nextTxs);
        if (nextAlloc) setAllocation(nextAlloc);
        if (nextPerf) setPerformance(nextPerf);
        if (nextNews.length > 0 || newsFeedData.status === 'fulfilled') setNewsFeed(nextNews);

        saveToCache({
          portfolio: userPortfolio,
          overview: nextOverview || overview,
          holdings: nextHoldings,
          transactions: nextTxs,
          allocation: nextAlloc || allocation,
          performance: nextPerf || performance,
          newsFeed: nextNews,
        });
      } catch (err: any) {
        console.error('Error fetching user portfolio from backend:', err);
        setError(err.response?.data?.detail || err.message || 'Failed to load user portfolio data');
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [currentUserId]
  );

  useEffect(() => {
    fetchAllPortfolioData(true);
  }, [fetchAllPortfolioData]);

  // Periodic background refresh for live price updates every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchAllPortfolioData(false);
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchAllPortfolioData]);

  // High Performance CRUD Handler: Record Buy/Sell Transaction with Optimistic Instant UI Update (0ms Latency)
  const recordTransaction = async (payload: RecordTransactionPayload): Promise<PortfolioTransaction> => {
    const pId = portfolio?.id || 1;
    const cleanSym = payload.symbol.trim().toUpperCase();
    const qty = Number(payload.quantity);
    const px = Number(payload.price);
    const cost = qty * px;

    // 1. Instantly create optimistic transaction record
    const optimisticTx: PortfolioTransaction = {
      id: Date.now(),
      portfolio_id: pId,
      symbol: cleanSym,
      transaction_type: payload.transaction_type,
      quantity: qty,
      price: px,
      total_amount: cost,
      transaction_date: payload.transaction_date || new Date().toISOString(),
      notes: payload.notes,
    };

    // 2. Update local state INSTANTLY (0ms latency!)
    setTransactions((prev) => [optimisticTx, ...prev]);

    setHoldings((prev) => {
      const existingIdx = prev.findIndex((h) => h.symbol.toUpperCase() === cleanSym);
      if (payload.transaction_type === 'BUY' || payload.transaction_type === 'SIP') {
        if (existingIdx >= 0) {
          const existing = prev[existingIdx];
          const newQty = existing.quantity + qty;
          const newCost = existing.total_investment + cost;
          const newAvg = newCost / newQty;
          const newVal = newQty * existing.current_price;
          const newPnl = newVal - newCost;

          const updated = [...prev];
          updated[existingIdx] = {
            ...existing,
            quantity: newQty,
            average_buy_price: newAvg,
            total_investment: newCost,
            current_value: newVal,
            unrealized_pnl: newPnl,
            unrealized_pnl_percent: newCost > 0 ? (newPnl / newCost) * 100 : 0,
          };
          return updated;
        } else {
          const newHolding: PortfolioHolding = {
            id: Date.now(),
            portfolio_id: pId,
            symbol: cleanSym,
            company_name: `${cleanSym} Ltd.`,
            quantity: qty,
            average_buy_price: px,
            current_price: px,
            total_investment: cost,
            current_value: cost,
            unrealized_pnl: 0,
            unrealized_pnl_percent: 0,
            day_change: 0,
            day_change_percent: 0,
            sector: 'General',
            exchange: 'NSE',
            asset_type: 'Stock',
            market_cap: 'Large Cap',
          };
          return [newHolding, ...prev];
        }
      }
      return prev;
    });

    setOverview((prev) => {
      const oldInv = prev?.total_investment ?? 0;
      const oldVal = prev?.current_value ?? 0;
      const newInv = oldInv + cost;
      const newVal = oldVal + cost;
      return {
        id: pId,
        name: prev?.name || 'My Investment Portfolio',
        total_investment: newInv,
        current_value: newVal,
        total_pnl: prev?.total_pnl ?? 0,
        total_pnl_percent: prev?.total_pnl_percent ?? 0,
        unrealized_pnl: prev?.unrealized_pnl ?? 0,
        unrealized_pnl_percent: prev?.unrealized_pnl_percent ?? 0,
        realized_pnl: prev?.realized_pnl ?? 0,
        day_pnl: prev?.day_pnl ?? 0,
        day_pnl_percent: prev?.day_pnl_percent ?? 0,
        total_holdings_count: (prev?.total_holdings_count ?? 0) + 1,
      };
    });

    // 3. Fire API call in background without blocking modal close or user action
    try {
      const realTx = await portfolioApi.recordTransaction(pId, payload);
      // Background sync to ensure exact server reconciliation
      fetchAllPortfolioData(false);
      return realTx;
    } catch (err: any) {
      console.warn('Backend recordTransaction delayed, keeping optimistic update:', err);
      return optimisticTx;
    }
  };

  // CRUD Handler: Create Portfolio
  const createPortfolio = async (payload: CreatePortfolioPayload): Promise<Portfolio> => {
    setError(null);
    try {
      const created = await portfolioApi.createPortfolio(payload);
      setPortfolio(created);
      await fetchAllPortfolioData(true);
      return created;
    } catch (err: any) {
      const msg = err.response?.data?.detail || err.message || 'Failed to create portfolio';
      setError(msg);
      throw new Error(msg);
    }
  };

  // CRUD Handler: Delete Portfolio
  const deletePortfolio = async (): Promise<void> => {
    if (!portfolio) return;
    setError(null);
    try {
      await portfolioApi.deletePortfolio(portfolio.id);
      localStorage.removeItem(CACHE_KEY);
      setPortfolio(null);
      setOverview(null);
      setHoldings([]);
      setTransactions([]);
      setAllocation(null);
      setPerformance(null);
      setNewsFeed([]);
    } catch (err: any) {
      const msg = err.response?.data?.detail || err.message || 'Failed to delete portfolio';
      setError(msg);
      throw new Error(msg);
    }
  };

  return {
    portfolio,
    overview,
    holdings,
    transactions,
    allocation,
    performance,
    newsFeed,
    isLoading,
    isRefreshing,
    error,
    setError,
    refreshPortfolio: () => fetchAllPortfolioData(false),
    recordTransaction,
    createPortfolio,
    deletePortfolio,
  };
}
