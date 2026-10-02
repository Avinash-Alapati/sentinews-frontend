import React, { useState, useMemo } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { NewsFilterBar } from '@/components/news/NewsFilterBar';
import { NewsCard } from '@/components/news/NewsCard';
import { useLatestNews } from '@/hooks/news/useLatestNews';
import { useTrendingNews } from '@/hooks/news/useTrendingNews';
import { Newspaper, RefreshCw } from 'lucide-react';

export const NewsPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isTrendingOnly, setIsTrendingOnly] = useState<boolean>(false);

  // Fetch news using custom hooks
  const categoryFilter = selectedCategory === 'ALL' ? undefined : selectedCategory;
  const {
    articles: latestArticles,
    isLoading: isLatestLoading,
    lastUpdated,
    refetch: refetchLatest,
  } = useLatestNews(categoryFilter);

  const {
    articles: trendingArticles,
    isLoading: isTrendingLoading,
    refetch: refetchTrending,
  } = useTrendingNews();

  const isLoading = isTrendingOnly ? isTrendingLoading : isLatestLoading;
  const rawArticles = isTrendingOnly ? trendingArticles : latestArticles;

  // Filter articles by search query
  const filteredArticles = useMemo(() => {
    if (!searchQuery.trim()) return rawArticles;
    const q = searchQuery.toLowerCase().trim();
    return rawArticles.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.summary.toLowerCase().includes(q) ||
        a.source.toLowerCase().includes(q) ||
        (a.relatedSymbols && a.relatedSymbols.some((s) => s.toLowerCase().includes(q)))
    );
  }, [rawArticles, searchQuery]);

  const handleRefresh = () => {
    if (isTrendingOnly) {
      refetchTrending();
    } else {
      refetchLatest();
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#111111] flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-[1140px] mx-auto px-4 sm:px-6 py-8 w-full space-y-6">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-5 border-b border-[#E5E5E5]">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#111111]">
              Indian Market News & Analysis
            </h1>
            <p className="text-xs sm:text-sm text-[#5F6368] max-w-2xl">
              Live stock market news curated from top Indian financial sources. Click any news story for comprehensive market breakdown & strategic insights.
            </p>
          </div>

          {/* Live Indicator & Refresh Button */}
          <div className="flex items-center gap-2.5 shrink-0 self-start md:self-auto">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#E5E5E5] text-[#5F6368] text-xs shadow-2xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="font-semibold text-[#111111] text-[11px]">Live Feed</span>
              {lastUpdated && (
                <span className="text-[#888888] text-[11px]">
                  • {lastUpdated.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true })}
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={handleRefresh}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0A1D37] hover:bg-[#0A1D37]/90 text-white font-bold text-xs transition-all cursor-pointer shadow-2xs disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh Feed</span>
            </button>
          </div>
        </div>

        {/* News Filter Bar */}
        <NewsFilterBar
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          isTrendingOnly={isTrendingOnly}
          onToggleTrending={() => setIsTrendingOnly(!isTrendingOnly)}
        />

        {/* Count & Status */}
        <div className="flex items-center justify-between text-xs text-[#5F6368] pt-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#111111]">
              Showing {filteredArticles.length} market news stories
            </span>
            {isTrendingOnly && (
              <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                TRENDING ONLY
              </span>
            )}
          </div>
          <span className="text-[11px] text-[#888888] hidden sm:block">
            Click story for detailed explanation
          </span>
        </div>

        {/* Compact News Grid (3 Columns on Desktop) */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-44 bg-white border border-[#E5E5E5] rounded-xl p-4 space-y-3">
                <div className="h-3 bg-[#F5F5F3] rounded w-1/3" />
                <div className="h-5 bg-[#F5F5F3] rounded w-5/6" />
                <div className="h-10 bg-[#F5F5F3] rounded w-full" />
              </div>
            ))}
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="p-12 text-center bg-white border border-[#E5E5E5] rounded-2xl text-xs text-[#5F6368] space-y-3">
            <Newspaper className="w-10 h-10 mx-auto text-[#888888]" />
            <h3 className="font-bold text-sm text-[#111111]">No News Articles Found</h3>
            <p className="max-w-sm mx-auto text-[11px]">
              No market news matching &quot;{searchQuery}&quot; found in category &quot;{selectedCategory}&quot;.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('ALL');
                setIsTrendingOnly(false);
              }}
              className="px-4 py-2 bg-[#0A1D37] text-white font-bold text-xs rounded-xl cursor-pointer shadow-2xs inline-block"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredArticles.map((article) => (
              <NewsCard key={article.id} article={article} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default NewsPage;
