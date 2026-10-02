import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { RecentlySearchedStocks } from '@/components/market/RecentlySearchedStocks';
import { TopMoversSection } from '@/components/market/TopMoversSection';
import { ProductsAndToolsCard } from '@/components/market/ProductsAndToolsCard';
import { AdBannerPlaceholder } from '@/components/market/AdBannerPlaceholder';
import { EtfSection } from '@/components/market/EtfSection';
import { MarketNewsCarousel } from '@/components/market/MarketNewsCarousel';
import { SectorsTrendingSection } from '@/components/market/SectorsTrendingSection';
import { useRecentSearches } from '@/hooks/market/useRecentSearches';

export const MarketOverviewPage: React.FC = () => {
  // Manage recently searched stock symbols & fetch real backend quotes
  const {
    quotes: recentQuotes,
    recentSymbols,
    isLoading: isRecentLoading,
    error: recentError,
    addRecentSearch,
    removeRecentSearch,
    clearRecentSearches,
    refetch: refetchRecentQuotes,
  } = useRecentSearches();

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#111111] flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-[1140px] mx-auto px-4 sm:px-6 py-8 w-full space-y-8">
        {/* Page Header */}
        <div className="pb-5 border-b border-[#E5E5E5] space-y-1">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#111111]">
            Market Overview & Stock Intelligence
          </h1>
          <p className="text-xs sm:text-sm text-[#5F6368] max-w-2xl">
            Track live Indian equities and search stocks powered by Sentinews Backend API.
          </p>
        </div>

        {/* Most Recently Searched Stocks */}
        <RecentlySearchedStocks
          quotes={recentQuotes}
          recentSymbols={recentSymbols}
          isLoading={isRecentLoading}
          error={recentError}
          onAddSearch={addRecentSearch}
          onRemoveSearch={removeRecentSearch}
          onClearSearches={clearRecentSearches}
          onRefresh={refetchRecentQuotes}
        />

        {/* 60% / 40% Side-by-Side Section 1: Top Movers Today (60%) & Products & Tools (40%) */}
        <div className="flex flex-col lg:flex-row items-start gap-6 w-full">
          {/* Top Movers Today (60% Width on Desktop) */}
          <div className="w-full lg:w-[60%] shrink-0">
            <TopMoversSection />
          </div>

          {/* Products & Tools Card (40% Width on Desktop) */}
          <div className="w-full lg:w-[40%] shrink-0">
            <ProductsAndToolsCard />
          </div>
        </div>

        {/* 60% / 40% Side-by-Side Section 2: Popular ETFs (60%) & Ad Space (40%) */}
        <div className="flex flex-col lg:flex-row items-stretch gap-6 w-full pt-2">
          {/* Popular ETFs (60% Width on Desktop) */}
          <div className="w-full lg:w-[60%] shrink-0">
            <EtfSection />
          </div>

          {/* Ad Space Card (40% Width on Desktop) */}
          <div className="w-full lg:w-[40%] shrink-0">
            <AdBannerPlaceholder />
          </div>
        </div>

        {/* Section 3: Sectors Trending Today */}
        <div className="w-full pt-2">
          <SectorsTrendingSection />
        </div>

        {/* Section 4: Highlighted Stock Market News Carousel (Below Sectors) */}
        <MarketNewsCarousel />
      </main>

      <Footer />
    </div>
  );
};

export default MarketOverviewPage;
