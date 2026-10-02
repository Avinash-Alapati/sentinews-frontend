import { useState, useEffect, useCallback, useRef } from 'react';
import { newsApi } from '@/services/api/news.api';
import { NewsArticle } from '@/types/news.types';

export const useLatestNews = (
  category?: string,
  symbol?: string,
  autoRefreshIntervalMs: number = 60000
) => {
  const cached = newsApi.getCachedLatestNews();
  const [articles, setArticles] = useState<NewsArticle[]>(() => cached || []);
  const [isLoading, setIsLoading] = useState<boolean>(() => !cached || cached.length === 0);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(() => new Date());
  const articlesRef = useRef(articles);
  articlesRef.current = articles;

  const fetchNews = useCallback(
    async (isBackground: boolean = false) => {
      try {
        if (!isBackground && articlesRef.current.length === 0) {
          setIsLoading(true);
        }
        setError(null);
        const data = await newsApi.getLatestNews({ category, symbol }, isBackground);
        if (data && data.length > 0) {
          setArticles(data);
          setLastUpdated(new Date());
        } else if (!isBackground && articlesRef.current.length === 0) {
          setArticles([]);
        }
      } catch (err) {
        console.error('Error fetching latest news:', err);
        if (articlesRef.current.length === 0) {
          setError('Failed to load news articles');
        }
      } finally {
        setIsLoading(false);
      }
    },
    [category, symbol]
  );

  // Initial load or when filter parameters change
  useEffect(() => {
    fetchNews(articlesRef.current.length > 0);
  }, [fetchNews]);

  // Periodic live background refresh to keep news feed active in real time
  useEffect(() => {
    if (autoRefreshIntervalMs <= 0) return;

    const interval = setInterval(() => {
      fetchNews(true);
    }, autoRefreshIntervalMs);

    return () => clearInterval(interval);
  }, [fetchNews, autoRefreshIntervalMs]);

  return { articles, isLoading, error, lastUpdated, refetch: () => fetchNews(false) };
};
