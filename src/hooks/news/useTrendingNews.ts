import { useState, useEffect, useCallback } from 'react';
import { newsApi } from '@/services/api/news.api';
import { NewsArticle } from '@/types/news.types';

export const useTrendingNews = () => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTrending = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await newsApi.getTrendingNews();
      setArticles(data);
    } catch (err) {
      console.error('Error fetching trending news:', err);
      setError('Failed to load trending news');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTrending();
  }, [fetchTrending]);

  return { articles, isLoading, error, refetch: fetchTrending };
};
