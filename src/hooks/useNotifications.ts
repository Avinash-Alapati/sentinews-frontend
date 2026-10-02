import { useState, useEffect, useCallback, useMemo } from 'react';
import { NotificationItem } from '@/types/notification.types';
import { watchlistApi } from '@/services/api/watchlist.api';
import { marketApi } from '@/services/api/market.api';
import { newsApi } from '@/services/api/news.api';
import { Watchlist } from '@/types/watchlist.types';

const READ_NOTIFICATIONS_STORAGE_KEY = 'sentinews_read_notifications_v1';
const RECENT_SEARCHES_STORAGE_KEY = 'sentinews_recent_searches';
const WATCHLIST_STORAGE_KEY = 'sentinews_watchlists_cache';

// Helper for relative time string
function getRelativeTimeString(minutesAgo: number): string {
  if (minutesAgo < 2) return 'Just now';
  if (minutesAgo < 60) return `${Math.floor(minutesAgo)}m ago`;
  const hours = Math.floor(minutesAgo / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [readIds, setReadIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem(READ_NOTIFICATIONS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return new Set(parsed);
      }
    } catch (e) {
      console.warn('Failed to read notification read IDs from local storage:', e);
    }
    return new Set<string>();
  });

  // Calculate unread count
  const unreadCount = useMemo(() => {
    return notifications.filter((n) => n.unread).length;
  }, [notifications]);

  // Fetch dynamic user notifications based on Watchlists and Interests
  const generateNotifications = useCallback(async () => {
    try {
      setIsLoading(true);

      // 1. Resolve User Watchlist Symbols
      let watchlistSymbols: string[] = [];
      try {
        const cachedRaw = localStorage.getItem(WATCHLIST_STORAGE_KEY);
        if (cachedRaw) {
          const parsed = JSON.parse(cachedRaw) as Watchlist[];
          if (Array.isArray(parsed)) {
            parsed.forEach((w) => {
              if (w.stocks) {
                w.stocks.forEach((s) => watchlistSymbols.push(s.symbol.toUpperCase()));
              }
            });
          }
        }
      } catch (e) {
        // Local storage read fallback
      }

      // If local storage is empty, fetch via API
      if (watchlistSymbols.length === 0) {
        try {
          const userWatchlists = await watchlistApi.getWatchlists();
          userWatchlists.forEach((w) => {
            if (w.stocks) {
              w.stocks.forEach((s) => watchlistSymbols.push(s.symbol.toUpperCase()));
            }
          });
        } catch (e) {
          console.warn('Watchlists API fetch warning for notifications:', e);
        }
      }

      // Fallback default symbols if user has no watchlists
      if (watchlistSymbols.length === 0) {
        watchlistSymbols = ['RELIANCE', 'TCS', 'HDFCBANK'];
      }
      watchlistSymbols = Array.from(new Set(watchlistSymbols));

      // 2. Resolve User Interests (Recently Searched Symbols)
      let interestSymbols: string[] = [];
      try {
        const savedSearches = localStorage.getItem(RECENT_SEARCHES_STORAGE_KEY);
        if (savedSearches) {
          const parsed = JSON.parse(savedSearches);
          if (Array.isArray(parsed)) {
            interestSymbols = parsed.map((s) => String(s).toUpperCase());
          }
        }
      } catch (e) {
        // Fallback
      }
      if (interestSymbols.length === 0) {
        interestSymbols = ['INFY', 'TATAMOTORS'];
      }
      interestSymbols = Array.from(new Set(interestSymbols));

      // Combine symbols to fetch live quotes
      const allSymbolsToFetch = Array.from(new Set([...watchlistSymbols, ...interestSymbols]));

      // 3. Fetch real-time market data & news concurrently
      const [quotes, latestNews, indices] = await Promise.all([
        marketApi.getQuotes(allSymbolsToFetch),
        newsApi.getLatestNews({ limit: 10 }),
        marketApi.getIndices(),
      ]);

      const quotesMap = new Map<string, any>();
      quotes.forEach((q) => {
        if (q && q.symbol) {
          quotesMap.set(q.symbol.toUpperCase(), q);
        }
      });

      const items: NotificationItem[] = [];
      let baseTimeOffsetMinutes = 5;

      // ----------------------------------------------------
      // A. Watchlist Notifications (Price Movements & Alerts)
      // ----------------------------------------------------
      watchlistSymbols.forEach((sym) => {
        const quote = quotesMap.get(sym);
        if (!quote) return;

        const isPositive = (quote.change_percent ?? 0) >= 0;
        const changeStr = Math.abs(quote.change_percent || 0).toFixed(2);
        const priceStr = quote.current_price
          ? quote.current_price.toLocaleString('en-IN', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })
          : '0.00';

        const id = `watchlist-${sym}`;
        const isSignificant = Math.abs(quote.change_percent || 0) >= 1.0;

        items.push({
          id,
          title: `Watchlist Alert: ${sym}`,
          message: `${quote.company_name || sym} is ${
            isPositive ? 'up +' : 'down -'
          }${changeStr}% today, trading at ₹${priceStr}.`,
          time: getRelativeTimeString(baseTimeOffsetMinutes),
          timestamp: Date.now() - baseTimeOffsetMinutes * 60 * 1000,
          unread: !readIds.has(id),
          type: isSignificant ? 'alert' : 'watchlist',
          category: 'Watchlist Alert',
          symbol: sym,
          targetUrl: `/stock/${encodeURIComponent(sym)}`,
        });

        baseTimeOffsetMinutes += 12;
      });

      // ----------------------------------------------------
      // B. User Interest & News Notifications
      // ----------------------------------------------------
      if (latestNews && latestNews.length > 0) {
        // Find news matching user watchlist or interest symbols
        const matchingNews = latestNews.filter((art) => {
          if (!art.relatedSymbols || art.relatedSymbols.length === 0) return true;
          return art.relatedSymbols.some(
            (s) =>
              watchlistSymbols.includes(s.toUpperCase()) ||
              interestSymbols.includes(s.toUpperCase())
          );
        });

        const selectedNews = (matchingNews.length > 0 ? matchingNews : latestNews).slice(0, 3);

        selectedNews.forEach((article, idx) => {
          const id = `news-${article.id}`;
          const matchingSym = article.relatedSymbols?.[0]?.toUpperCase();
          const targetUrl = matchingSym
            ? `/stock/${encodeURIComponent(matchingSym)}`
            : `/news`;

          items.push({
            id,
            title: article.title,
            message: article.summary || article.content || 'Market news breakdown and analysis.',
            time: getRelativeTimeString(baseTimeOffsetMinutes + idx * 25),
            timestamp: Date.now() - (baseTimeOffsetMinutes + idx * 25) * 60 * 1000,
            unread: !readIds.has(id),
            type: 'interest',
            category: matchingSym ? `Interest: ${matchingSym}` : 'Breaking News',
            symbol: matchingSym,
            targetUrl,
          });
        });
      }

      // ----------------------------------------------------
      // C. Market Indices Notification (NIFTY 50 / SENSEX)
      // ----------------------------------------------------
      const niftyIndex = indices.find((idx) =>
        idx.symbol?.toUpperCase().includes('NSEI') || idx.name?.toUpperCase().includes('NIFTY')
      );

      if (niftyIndex) {
        const id = 'market-index-nifty';
        const isPos = (niftyIndex.change_percent ?? 0) >= 0;
        const valStr = niftyIndex.current_value
          ? niftyIndex.current_value.toLocaleString('en-IN', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })
          : '0.00';
        const pctStr = Math.abs(niftyIndex.change_percent || 0).toFixed(2);

        items.push({
          id,
          title: `NIFTY 50 Benchmark Level`,
          message: `NIFTY 50 index is currently at ${valStr} (${
            isPos ? '+' : '-'
          }${pctStr}%).`,
          time: getRelativeTimeString(3),
          timestamp: Date.now() - 3 * 60 * 1000,
          unread: !readIds.has(id),
          type: 'market',
          category: 'Market Intelligence',
          targetUrl: '/market',
        });
      }

      // ----------------------------------------------------
      // D. Post-Market Intelligence Report Notification
      // ----------------------------------------------------
      const reportId = 'market-report-daily';
      items.push({
        id: reportId,
        title: 'Daily Post-Market Intelligence Report',
        message: 'Comprehensive post-market sector analysis & AI financial intelligence report ready.',
        time: getRelativeTimeString(45),
        timestamp: Date.now() - 45 * 60 * 1000,
        unread: !readIds.has(reportId),
        type: 'report',
        category: 'Intelligence Report',
        targetUrl: '/reports',
      });

      // Sort notifications by timestamp descending (newest first)
      items.sort((a, b) => b.timestamp - a.timestamp);

      setNotifications(items);
    } catch (err) {
      console.error('Failed to generate notifications:', err);
    } finally {
      setIsLoading(false);
    }
  }, [readIds]);

  useEffect(() => {
    generateNotifications();
  }, [generateNotifications]);

  // Mark a single notification as read
  const markAsRead = useCallback((id: string) => {
    setReadIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      try {
        localStorage.setItem(READ_NOTIFICATIONS_STORAGE_KEY, JSON.stringify(Array.from(next)));
      } catch (e) {
        console.warn('Failed to save read notification IDs to local storage:', e);
      }
      return next;
    });

    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: false } : n))
    );
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => {
      const allIds = prev.map((n) => n.id);
      const next = new Set(allIds);
      setReadIds(next);
      try {
        localStorage.setItem(READ_NOTIFICATIONS_STORAGE_KEY, JSON.stringify(Array.from(next)));
      } catch (e) {
        console.warn('Failed to save read notification IDs to local storage:', e);
      }
      return prev.map((n) => ({ ...n, unread: false }));
    });
  }, []);

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    refetchNotifications: generateNotifications,
  };
}
