import { apiClient } from './client';
import { apiCache } from './cache';
import {
  Portfolio,
  PortfolioTransaction,
  PortfolioHolding,
  PortfolioOverview,
  PortfolioAllocation,
  PortfolioPerformance,
  PortfolioNewsArticle,
  CreatePortfolioPayload,
  RecordTransactionPayload,
} from '@/types/portfolio.types';

// Sector mapping fallback helper for Indian equities
const STOCK_SECTOR_MAP: Record<string, string> = {
  RELIANCE: 'Energy & Oil',
  TCS: 'IT & Software',
  INFY: 'IT & Software',
  WIPRO: 'IT & Software',
  HCLTECH: 'IT & Software',
  TECHM: 'IT & Software',
  HDFCBANK: 'Banking & Financials',
  ICICIBANK: 'Banking & Financials',
  SBIN: 'Banking & Financials',
  KOTAKBANK: 'Banking & Financials',
  AXISBANK: 'Banking & Financials',
  BHARTIARTL: 'Telecom',
  ITC: 'FMCG',
  TATAMOTORS: 'Automobiles',
  M_M: 'Automobiles',
  MARUTI: 'Automobiles',
  LTIM: 'IT & Software',
  SUNPHARMA: 'Healthcare & Pharma',
  CIPLA: 'Healthcare & Pharma',
  DRREDDY: 'Healthcare & Pharma',
  TATASTEEL: 'Metals & Mining',
  JSWSTEEL: 'Metals & Mining',
  HINDALCO: 'Metals & Mining',
  POWERGRID: 'Utilities & Energy',
  NTPC: 'Utilities & Energy',
  LT: 'Construction & Infrastructure',
  DLF: 'Real Estate',
  ASIANPAINT: 'Consumer Durables',
  TITAN: 'Consumer Durables',
};

export const portfolioApi = {
  /**
   * 1. GET /api/v1/portfolio/user/{user_id} - Get or Create Primary Portfolio for User
   */
  async getUserPrimaryPortfolio(userId: number, forceRefresh = false): Promise<Portfolio> {
    return apiCache.fetchWithCache<Portfolio>(
      `portfolio:user:${userId}`,
      async () => {
        const response = await apiClient.get<any>(`/portfolio/user/${userId}`);
        const data = response.data;
        return {
          id: data.id,
          name: data.name || 'My Investment Portfolio',
          description: data.description || 'Primary Indian Equity Portfolio',
          user_id: data.user_id || userId,
          cash_balance: data.cash_balance ?? 0,
          created_at: data.created_at || new Date().toISOString(),
          updated_at: data.updated_at || new Date().toISOString(),
        };
      },
      30000,
      { forceRefresh }
    );
  },

  /**
   * 2. GET /api/v1/portfolio/{id} - Get Portfolio Details by ID
   */
  async getPortfolio(id: number, forceRefresh = false): Promise<Portfolio> {
    return apiCache.fetchWithCache<Portfolio>(
      `portfolio:item:${id}`,
      async () => {
        const response = await apiClient.get<any>(`/portfolio/${id}`);
        const data = response.data;
        return {
          id: data.id,
          name: data.name || 'My Investment Portfolio',
          description: data.description || 'Primary Indian Equity Portfolio',
          user_id: data.user_id,
          cash_balance: data.cash_balance ?? 0,
          created_at: data.created_at || new Date().toISOString(),
          updated_at: data.updated_at || new Date().toISOString(),
        };
      },
      30000,
      { forceRefresh }
    );
  },

  /**
   * 3. POST /api/v1/portfolio - Create Portfolio
   */
  async createPortfolio(payload: CreatePortfolioPayload): Promise<Portfolio> {
    apiCache.invalidate('portfolio');
    const response = await apiClient.post<any>('/portfolio', {
      name: payload.name.trim(),
    });
    const data = response.data;
    return {
      id: data.id,
      name: data.name,
      description: payload.description || 'Custom Portfolio',
      user_id: data.user_id,
      cash_balance: data.cash_balance ?? 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  },

  /**
   * 4. DELETE /api/v1/portfolio/{id} - Delete Portfolio
   */
  async deletePortfolio(id: number): Promise<{ message: string; success: boolean }> {
    apiCache.invalidate('portfolio');
    const response = await apiClient.delete<{ message: string; id: number }>(`/portfolio/${id}`);
    return {
      message: response.data?.message || `Portfolio ${id} deleted successfully`,
      success: true,
    };
  },

  /**
   * 5. POST /api/v1/portfolio/{id}/transactions - Record Buy/Sell Transaction
   */
  async recordTransaction(portfolioId: number, payload: RecordTransactionPayload): Promise<PortfolioTransaction> {
    apiCache.invalidate('portfolio');
    const cleanSym = payload.symbol.trim().toUpperCase();
    const response = await apiClient.post<any>(`/portfolio/${portfolioId}/transactions`, {
      symbol: cleanSym,
      transaction_type: payload.transaction_type,
      quantity: Number(payload.quantity),
      price: Number(payload.price),
      timestamp: payload.transaction_date ? new Date(payload.transaction_date).toISOString() : new Date().toISOString(),
      name: cleanSym,
      sector: STOCK_SECTOR_MAP[cleanSym] || 'General',
    });
    const data = response.data;
    return {
      id: data.id || Date.now(),
      portfolio_id: data.portfolio_id || portfolioId,
      symbol: data.symbol || cleanSym,
      transaction_type: data.transaction_type || payload.transaction_type,
      quantity: Number(data.quantity),
      price: Number(data.price),
      total_amount: Number(data.quantity) * Number(data.price),
      transaction_date: data.timestamp || payload.transaction_date || new Date().toISOString(),
      notes: payload.notes,
    };
  },

  /**
   * 6. GET /api/v1/portfolio/{id}/transactions - Get Transaction History
   */
  async getTransactions(portfolioId: number, forceRefresh = false): Promise<PortfolioTransaction[]> {
    return apiCache.fetchWithCache<PortfolioTransaction[]>(
      `portfolio:transactions:${portfolioId}`,
      async () => {
        const response = await apiClient.get<any>(`/portfolio/${portfolioId}/transactions`);
        const data = response.data;
        const rawList = Array.isArray(data)
          ? data
          : Array.isArray(data?.transactions)
          ? data.transactions
          : Array.isArray(data?.items)
          ? data.items
          : [];

        return rawList.map((tx: any, idx: number) => {
          const rawType = String(tx.transaction_type || tx.type || 'BUY').toUpperCase();
          const type = (['BUY', 'SELL', 'SIP', 'OTHER'].includes(rawType) ? rawType : 'BUY') as any;
          const qty = Number(tx.quantity ?? 0);
          const price = Number(tx.price ?? tx.avg_price ?? 0);
          return {
            id: tx.id || idx + 1,
            portfolio_id: tx.portfolio_id || portfolioId,
            symbol: String(tx.symbol || '').toUpperCase(),
            transaction_type: type,
            quantity: qty,
            price: price,
            total_amount: Number(tx.total_amount ?? (qty * price)),
            transaction_date: tx.timestamp || tx.transaction_date || tx.created_at || new Date().toISOString(),
            notes: tx.notes || undefined,
          };
        });
      },
      15000,
      { forceRefresh }
    );
  },

  /**
   * 7. GET /api/v1/portfolio/{id}/holdings - Get Active Holdings with Live Quotes
   */
  async getHoldings(portfolioId: number, forceRefresh = false): Promise<PortfolioHolding[]> {
    return apiCache.fetchWithCache<PortfolioHolding[]>(
      `portfolio:holdings:${portfolioId}`,
      async () => {
        const response = await apiClient.get<any>(`/portfolio/${portfolioId}/holdings`);
        const rawList = Array.isArray(response.data)
          ? response.data
          : Array.isArray((response.data as any)?.holdings)
          ? (response.data as any).holdings
          : [];

        return rawList.map((item: any, idx: number) => {
          const sym = String(item.symbol || '').toUpperCase();
          const qty = Number(item.quantity ?? 0);
          const avgPrice = Number(item.avg_buy_price ?? item.average_buy_price ?? 0);
          const curPrice = Number(item.current_price ?? item.price ?? avgPrice);
          const totalCost = Number(item.total_cost ?? item.total_investment ?? (qty * avgPrice));
          const curVal = Number(item.current_value ?? (qty * curPrice));
          const pnl = Number(item.unrealized_pnl ?? (curVal - totalCost));
          const pnlPct = Number(item.unrealized_pnl_pct ?? item.unrealized_pnl_percent ?? (totalCost > 0 ? (pnl / totalCost) * 100 : 0));

          let assetType: 'Stock' | 'ETF' | 'Mutual Fund' | 'Bond' | 'Gold' = 'Stock';
          if (sym.includes('ETF') || sym.includes('BEES')) assetType = 'ETF';
          else if (sym.includes('MF') || sym.includes('FUND')) assetType = 'Mutual Fund';
          else if (sym.includes('BOND') || sym.includes('GS') || sym.includes('SGB')) assetType = 'Bond';
          else if (sym.includes('GOLD')) assetType = 'Gold';

          let mCap: 'Large Cap' | 'Mid Cap' | 'Small Cap' = 'Large Cap';
          const midCaps = ['DIXON', 'VBL', 'POLYCAB', 'VOLTAS', 'DEEPAKNTR', 'SRF', 'COFORGE', 'PERSISTENT', 'SUZLON'];
          const smallCaps = ['IDEA', 'IREDA', 'RVNL', 'MAZDOCK', 'YESBANK', 'HUDCO'];
          if (midCaps.includes(sym)) mCap = 'Mid Cap';
          else if (smallCaps.includes(sym)) mCap = 'Small Cap';

          return {
            id: item.id || idx + 1,
            portfolio_id: item.portfolio_id || portfolioId,
            symbol: sym,
            company_name: item.name || item.company_name || `${sym} Ltd.`,
            quantity: qty,
            average_buy_price: avgPrice,
            current_price: curPrice,
            total_investment: totalCost,
            current_value: curVal,
            unrealized_pnl: pnl,
            unrealized_pnl_percent: pnlPct,
            day_change: Number(item.day_change ?? 0),
            day_change_percent: Number(item.day_change_percent ?? 0),
            sector: item.sector || STOCK_SECTOR_MAP[sym] || 'General',
            exchange: item.exchange || 'NSE',
            asset_type: assetType,
            market_cap: mCap,
          };
        });
      },
      15000,
      { forceRefresh }
    );
  },

  /**
   * 8. GET /api/v1/portfolio/{id}/overview - Get Portfolio Overview
   */
  async getOverview(portfolioId: number, forceRefresh = false): Promise<PortfolioOverview> {
    return apiCache.fetchWithCache<PortfolioOverview>(
      `portfolio:overview:${portfolioId}`,
      async () => {
        const response = await apiClient.get<any>(`/portfolio/${portfolioId}/overview`);
        const data = response.data || {};
        const holdingsList = Array.isArray(data.holdings) ? data.holdings : [];

        return {
          id: data.portfolio_id || data.id || portfolioId,
          name: data.name || 'Primary Equity Portfolio',
          total_investment: Number(data.total_invested_value ?? data.total_investment ?? 0),
          current_value: Number(data.total_current_value ?? data.current_value ?? 0),
          total_pnl: Number(data.total_pnl ?? ((data.total_unrealized_pnl ?? 0) + (data.total_realized_pnl ?? 0))),
          total_pnl_percent: Number(data.total_pnl_pct ?? data.total_pnl_percent ?? 0),
          unrealized_pnl: Number(data.total_unrealized_pnl ?? data.unrealized_pnl ?? 0),
          unrealized_pnl_percent: Number(data.total_unrealized_pnl_pct ?? data.unrealized_pnl_percent ?? 0),
          realized_pnl: Number(data.total_realized_pnl ?? data.realized_pnl ?? 0),
          day_pnl: Number(data.day_pnl ?? 0),
          day_pnl_percent: Number(data.day_pnl_percent ?? 0),
          total_holdings_count: Number(data.total_holdings_count ?? holdingsList.length),
        };
      },
      15000,
      { forceRefresh }
    );
  },

  /**
   * 9. GET /api/v1/portfolio/{id}/allocation - Get Portfolio Allocation
   */
  async getAllocation(portfolioId: number, forceRefresh = false): Promise<PortfolioAllocation> {
    return apiCache.fetchWithCache<PortfolioAllocation>(
      `portfolio:allocation:${portfolioId}`,
      async () => {
        const response = await apiClient.get<any>(`/portfolio/${portfolioId}/allocation`);
        const data = response.data || {};
        const rawSectors = Array.isArray(data.sectors) ? data.sectors : [];
        const rawHoldings = Array.isArray(data.holdings) ? data.holdings : [];

        return {
          sectors: rawSectors.map((s: any) => ({
            sector: String(s.sector || s.name || 'Other'),
            current_value: Number(s.total_value ?? s.current_value ?? 0),
            weight_percent: Number(s.weight_pct ?? s.weight_percent ?? 0),
            holding_count: Number(s.holding_count ?? 1),
          })),
          holdings: rawHoldings.map((h: any) => ({
            symbol: String(h.symbol || '').toUpperCase(),
            company_name: h.name || h.company_name || `${h.symbol} Ltd.`,
            current_value: Number(h.current_value ?? 0),
            weight_percent: Number(h.weight_pct ?? h.weight_percent ?? 0),
          })),
        };
      },
      30000,
      { forceRefresh }
    );
  },

  /**
   * 10. GET /api/v1/portfolio/{id}/performance - Get Performance and Returns
   */
  async getPerformance(portfolioId: number, forceRefresh = false): Promise<PortfolioPerformance> {
    return apiCache.fetchWithCache<PortfolioPerformance>(
      `portfolio:performance:${portfolioId}`,
      async () => {
        const response = await apiClient.get<any>(`/portfolio/${portfolioId}/performance`);
        const data = response.data || {};

        const mapHolding = (h: any): PortfolioHolding | null => {
          if (!h) return null;
          const sym = String(h.symbol || '').toUpperCase();
          const qty = Number(h.quantity ?? 0);
          const avgPrice = Number(h.avg_buy_price ?? 0);
          const curPrice = Number(h.current_price ?? 0);
          const totalCost = Number(h.total_cost ?? (qty * avgPrice));
          const curVal = Number(h.current_value ?? (qty * curPrice));
          const pnl = Number(h.unrealized_pnl ?? (curVal - totalCost));
          const pnlPct = Number(h.unrealized_pnl_pct ?? (totalCost > 0 ? (pnl / totalCost) * 100 : 0));

          return {
            id: Date.now(),
            portfolio_id: portfolioId,
            symbol: sym,
            company_name: h.name || `${sym} Ltd.`,
            quantity: qty,
            average_buy_price: avgPrice,
            current_price: curPrice,
            total_investment: totalCost,
            current_value: curVal,
            unrealized_pnl: pnl,
            unrealized_pnl_percent: pnlPct,
            sector: h.sector || 'General',
            exchange: 'NSE',
          };
        };

        const topGainer = mapHolding(data.top_gainer);
        const topLoser = mapHolding(data.top_loser);

        return {
          xirr: Number(data.xirr_pct ?? data.xirr ?? 0),
          total_return_percent: Number(data.total_unrealized_pnl_pct ?? data.total_return_percent ?? 0),
          top_gainers: topGainer ? [topGainer] : [],
          top_losers: topLoser ? [topLoser] : [],
          best_performing_symbol: topGainer?.symbol,
          worst_performing_symbol: topLoser?.symbol,
        };
      },
      30000,
      { forceRefresh }
    );
  },

  /**
   * 11. GET /api/v1/portfolio/{id}/news-feed - Get Personalised Portfolio News Feed
   */
  async getNewsFeed(portfolioId: number, forceRefresh = false): Promise<PortfolioNewsArticle[]> {
    return apiCache.fetchWithCache<PortfolioNewsArticle[]>(
      `portfolio:news:${portfolioId}`,
      async () => {
        const response = await apiClient.get<any>(`/portfolio/${portfolioId}/news-feed`);
        const data = response.data;
        const items = Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : [];

        return items.map((item: any, idx: number) => {
          const art = item.article || item;
          const matched = Array.isArray(item.matched_holdings) && item.matched_holdings.length > 0
            ? item.matched_holdings[0]
            : (Array.isArray(art.symbols) && art.symbols.length > 0 ? art.symbols[0] : 'MARKET');

          let sentimentScore = Number(art.sentiment_score ?? 0);
          let sentiment: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL' = 'NEUTRAL';
          if (sentimentScore >= 0.1 || art.article_tone === 'bullish') sentiment = 'POSITIVE';
          else if (sentimentScore <= -0.1 || art.article_tone === 'bearish') sentiment = 'NEGATIVE';

          return {
            id: String(art.id || `news_p_${idx}`),
            title: String(art.title || 'Portfolio Holding News Update'),
            summary: String(art.summary || 'Latest market intelligence update for your portfolio holdings.'),
            source: String(art.source || 'Sentinews Intelligence'),
            published_at: art.published_at || new Date().toISOString(),
            sentiment,
            symbol: String(matched).toUpperCase(),
            url: art.url || undefined,
          };
        });
      },
      45000,
      { forceRefresh }
    );
  },
};
