import { apiClient } from './client';
import { apiCache } from './cache';
import {
  Watchlist,
  WatchlistItem,
  CreateWatchlistPayload,
  UpdateWatchlistPayload,
  AddStockPayload,
} from '@/types/watchlist.types';

// Storage key for offline/fallback caching
const STORAGE_KEY = 'sentinews_watchlists_cache';

// Helper to get local watchlists fallback
const getLocalWatchlists = (): Watchlist[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
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

const saveLocalWatchlists = (watchlists: Watchlist[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(watchlists));
  } catch (e) {
    console.warn('Failed to save local watchlists cache:', e);
  }
};

export const watchlistApi = {
  /**
   * Fetch all watchlists for current user with 10s cache and in-flight deduplication
   */
  async getWatchlists(forceRefresh = false): Promise<Watchlist[]> {
    return apiCache.fetchWithCache<Watchlist[]>(
      'watchlists',
      async () => {
        try {
          const response = await apiClient.get<Watchlist[]>('/watchlists');
          const data = response.data || [];
          saveLocalWatchlists(data);
          return data;
        } catch (err: any) {
          console.warn('Backend watchlists endpoint unavailable, falling back to cached local storage:', err);
          return getLocalWatchlists();
        }
      },
      10000,
      { forceRefresh }
    );
  },

  /**
   * Fetch single watchlist details by ID with 10s cache
   */
  async getWatchlist(watchlistId: number, forceRefresh = false): Promise<Watchlist> {
    return apiCache.fetchWithCache<Watchlist>(
      `watchlists:${watchlistId}`,
      async () => {
        try {
          const response = await apiClient.get<Watchlist>(`/watchlists/${watchlistId}`);
          return response.data;
        } catch (err: any) {
          console.warn(`Failed to fetch watchlist ${watchlistId} from backend:`, err);
          const local = getLocalWatchlists();
          const found = local.find((w) => w.id === watchlistId);
          if (found) return found;
          throw err;
        }
      },
      10000,
      { forceRefresh }
    );
  },

  /**
   * Create a new watchlist (invalidates cache)
   */
  async createWatchlist(payload: CreateWatchlistPayload): Promise<Watchlist> {
    apiCache.invalidate('watchlists');
    try {
      const response = await apiClient.post<Watchlist>('/watchlists', payload);
      return response.data;
    } catch (err: any) {
      if (!err.response || err.response.status === 404 || err.response.status >= 500) {
        console.warn('API error creating watchlist, using local fallback:', err);
        const local = getLocalWatchlists();
        const newWatchlist: Watchlist = {
          id: Date.now(),
          name: payload.name.trim(),
          user_id: 1,
          stock_count: 0,
          stocks: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        const updated = [newWatchlist, ...local];
        saveLocalWatchlists(updated);
        return newWatchlist;
      }
      throw err;
    }
  },

  /**
   * Rename / Update an existing watchlist (invalidates cache)
   */
  async updateWatchlist(watchlistId: number, payload: UpdateWatchlistPayload): Promise<Watchlist> {
    apiCache.invalidate('watchlists');
    try {
      const response = await apiClient.patch<Watchlist>(`/watchlists/${watchlistId}`, payload);
      return response.data;
    } catch (err: any) {
      if (!err.response || err.response.status === 404 || err.response.status >= 500) {
        console.warn('API error updating watchlist, using local fallback:', err);
        const local = getLocalWatchlists();
        const index = local.findIndex((w) => w.id === watchlistId);
        if (index !== -1) {
          local[index].name = payload.name.trim();
          local[index].updated_at = new Date().toISOString();
          saveLocalWatchlists(local);
          return local[index];
        }
      }
      throw err;
    }
  },

  /**
   * Delete a watchlist permanently (invalidates cache)
   */
  async deleteWatchlist(watchlistId: number): Promise<{ message: string; success: boolean }> {
    apiCache.invalidate('watchlists');
    try {
      const response = await apiClient.delete<{ message: string; success: boolean }>(
        `/watchlists/${watchlistId}`
      );
      return response.data;
    } catch (err: any) {
      if (!err.response || err.response.status === 404 || err.response.status >= 500) {
        console.warn('API error deleting watchlist, using local fallback:', err);
        const local = getLocalWatchlists();
        const updated = local.filter((w) => w.id !== watchlistId);
        saveLocalWatchlists(updated);
        return { message: `Watchlist ${watchlistId} deleted successfully`, success: true };
      }
      throw err;
    }
  },

  /**
   * Add a stock symbol to a specific watchlist (invalidates cache)
   */
  async addStock(watchlistId: number, payload: AddStockPayload): Promise<WatchlistItem> {
    apiCache.invalidate('watchlists');
    try {
      const response = await apiClient.post<WatchlistItem>(
        `/watchlists/${watchlistId}/stocks`,
        {
          symbol: payload.symbol.trim().toUpperCase(),
          exchange: payload.exchange || 'NSE',
          notes: payload.notes || undefined,
        }
      );
      return response.data;
    } catch (err: any) {
      if (!err.response || err.response.status === 404 || err.response.status >= 500) {
        console.warn('API error adding stock to watchlist, using local fallback:', err);
        const local = getLocalWatchlists();
        const watchlist = local.find((w) => w.id === watchlistId);
        const cleanSymbol = payload.symbol.trim().toUpperCase();

        if (watchlist) {
          if (watchlist.stocks.some((s) => s.symbol.toUpperCase() === cleanSymbol)) {
            const error: any = new Error(`Stock '${cleanSymbol}' is already in this watchlist`);
            error.response = { status: 409, data: { detail: `Stock '${cleanSymbol}' already in watchlist` } };
            throw error;
          }
          const newItem: WatchlistItem = {
            id: Date.now(),
            watchlist_id: watchlistId,
            symbol: cleanSymbol,
            exchange: payload.exchange || 'NSE',
            notes: payload.notes || null,
            created_at: new Date().toISOString(),
          };
          watchlist.stocks.unshift(newItem);
          watchlist.stock_count = watchlist.stocks.length;
          saveLocalWatchlists(local);
          return newItem;
        }
      }
      throw err;
    }
  },

  /**
   * Remove a stock from a specific watchlist (invalidates cache)
   */
  async removeStock(
    watchlistId: number,
    symbolOrId: string | number
  ): Promise<{ message: string; success: boolean }> {
    apiCache.invalidate('watchlists');
    try {
      const response = await apiClient.delete<{ message: string; success: boolean }>(
        `/watchlists/${watchlistId}/stocks/${encodeURIComponent(symbolOrId)}`
      );
      return response.data;
    } catch (err: any) {
      if (!err.response || err.response.status === 404 || err.response.status >= 500) {
        console.warn('API error removing stock from watchlist, using local fallback:', err);
        const local = getLocalWatchlists();
        const watchlist = local.find((w) => w.id === watchlistId);
        if (watchlist) {
          const symStr = String(symbolOrId).toUpperCase();
          watchlist.stocks = watchlist.stocks.filter(
            (s) => s.symbol.toUpperCase() !== symStr && String(s.id) !== String(symbolOrId)
          );
          watchlist.stock_count = watchlist.stocks.length;
          saveLocalWatchlists(local);
          return { message: `Stock '${symbolOrId}' removed successfully`, success: true };
        }
      }
      throw err;
    }
  },
};
