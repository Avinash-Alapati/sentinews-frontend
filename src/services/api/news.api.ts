import { apiClient } from './client';
import { apiCache } from './cache';
import { NewsArticle } from '@/types/news.types';

export interface BackendNewsItem {
  id: string | number;
  title: string;
  summary: string;
  content?: string;
  url: string;
  source: string;
  image_url?: string;
  published_at?: string;
  publishedAt?: string;
  symbols?: string[] | string;
  sectors?: string[] | string;
  article_tone?: string;
  sentiment?: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL' | string;
  is_trending?: boolean;
  disclaimer?: string;
}

export interface NewsApiResponse {
  items?: BackendNewsItem[];
  articles?: BackendNewsItem[];
  page?: number;
  limit?: number;
  total?: number;
  disclaimer?: string;
}

export const newsApi = {
  // Fetch latest market news with 45s cache & in-flight deduplication
  getLatestNews: async (
    params?: {
      category?: string;
      sector?: string;
      symbol?: string;
      tone?: string;
      limit?: number;
      page?: number;
    },
    forceRefresh = false
  ): Promise<NewsArticle[]> => {
    // Map category to sector param for backend compatibility
    const queryParams: Record<string, any> = {};
    if (params?.sector || params?.category) {
      queryParams.sector = params?.sector || params?.category;
    }
    if (params?.symbol) queryParams.symbol = params.symbol;
    if (params?.tone) queryParams.tone = params.tone;
    if (params?.limit) queryParams.limit = params.limit;
    if (params?.page) queryParams.page = params.page;

    const cacheKey = apiCache.makeKey('news:latest', queryParams);
    return apiCache.fetchWithCache<NewsArticle[]>(
      cacheKey,
      async () => {
        const response = await apiClient.get<NewsApiResponse | BackendNewsItem[]>(
          '/news/latest',
          { params: queryParams }
        );

        const rawItems: BackendNewsItem[] = Array.isArray(response.data)
          ? response.data
          : response.data.items || response.data.articles || [];

        return rawItems.map((item) => normalizeNewsItem(item));
      },
      45000,
      { forceRefresh }
    );
  },

  // Fetch trending financial news with 60s cache & in-flight deduplication
  getTrendingNews: async (forceRefresh = false): Promise<NewsArticle[]> => {
    return apiCache.fetchWithCache<NewsArticle[]>(
      'news:trending',
      async () => {
        const response = await apiClient.get<NewsApiResponse | BackendNewsItem[]>(
          '/news/trending'
        );

        const rawItems: BackendNewsItem[] = Array.isArray(response.data)
          ? response.data
          : response.data.items || response.data.articles || [];

        return rawItems.map((item) => normalizeNewsItem(item));
      },
      60000,
      { forceRefresh }
    );
  },

  // Record engagement click on news article
  recordClick: async (articleId: string | number): Promise<{ article_id: number; click_count: number; is_trending: boolean }> => {
    const response = await apiClient.post<{ article_id: number; click_count: number; is_trending: boolean }>(
      `/news/${articleId}/click`
    );
    return response.data;
  },

  // Fetch single news article by ID with zero duplicate requests
  getNewsById: async (id: string): Promise<NewsArticle | null> => {
    try {
      // 1. Check synchronous cache first
      const cachedLatest = apiCache.get<NewsArticle[]>('news:latest') || [];
      const cachedTrending = apiCache.get<NewsArticle[]>('news:trending') || [];
      const cachedMatch = [...cachedLatest, ...cachedTrending].find((art) => String(art.id) === String(id));
      if (cachedMatch) return cachedMatch;

      // 2. Fetch via cached methods (reuses in-flight promises if already loading)
      const [latest, trending] = await Promise.all([
        newsApi.getLatestNews(),
        newsApi.getTrendingNews(),
      ]);

      const all = [...latest, ...trending];
      return all.find((art) => String(art.id) === String(id)) || null;
    } catch (err) {
      console.error('Failed to fetch news article by ID:', err);
      return null;
    }
  },

  getCachedLatestNews: (): NewsArticle[] | undefined => {
    return apiCache.get<NewsArticle[]>('news:latest');
  },
};

// Helper function to normalize raw backend item into uniform NewsArticle format
function normalizeNewsItem(item: BackendNewsItem): NewsArticle {
  if (!item) {
    return {
      id: Math.random().toString(),
      title: 'Market News Update',
      summary: '',
      content: '',
      source: 'Market News',
      url: '#',
      publishedAt: new Date().toISOString(),
      category: 'Markets',
      sentiment: 'NEUTRAL',
      relatedSymbols: [],
    };
  }

  const rawTone = String(item.article_tone || item.sentiment || 'NEUTRAL').toLowerCase();
  let sentiment: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL' = 'NEUTRAL';
  if (rawTone.includes('bull') || rawTone.includes('pos')) sentiment = 'POSITIVE';
  else if (rawTone.includes('bear') || rawTone.includes('neg')) sentiment = 'NEGATIVE';

  // Handle sectors safely whether array, string, or undefined
  let category = 'Markets';
  if (Array.isArray(item.sectors) && item.sectors.length > 0) {
    category = String(item.sectors[0]);
  } else if (typeof item.sectors === 'string' && item.sectors.trim().length > 0) {
    category = item.sectors.trim().split(/[\s,]+/)[0] || 'Markets';
  }

  // Handle symbols safely whether array, string, or undefined
  let relatedSymbols: string[] = [];
  if (Array.isArray(item.symbols)) {
    relatedSymbols = item.symbols.map(String).filter(Boolean);
  } else if (typeof item.symbols === 'string' && item.symbols.trim().length > 0) {
    relatedSymbols = item.symbols.split(/[\s,]+/).filter(Boolean);
  }

  return {
    id: String(item.id ?? Math.random().toString()),
    title: item.title || 'Market News Update',
    summary: item.summary || item.content || 'No summary available for this market news article.',
    content: item.content || item.summary || '',
    source: item.source || 'Financial Express',
    url: item.url || '#',
    imageUrl: item.image_url || undefined,
    publishedAt: item.published_at || item.publishedAt || new Date().toISOString(),
    category,
    sentiment,
    relatedSymbols,
  };
}
