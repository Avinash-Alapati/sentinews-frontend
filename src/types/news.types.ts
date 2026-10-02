export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  content?: string;
  source: string;
  url: string;
  imageUrl?: string;
  publishedAt: string;
  category: string;
  sentiment: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
  sentimentScore?: number;
  relatedSymbols: string[];
}

export interface NewsFilter {
  category?: string;
  sentiment?: string;
  symbol?: string;
  searchQuery?: string;
}
