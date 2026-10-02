import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Globe, Clock, ChevronRight as ArrowIcon } from 'lucide-react';
import { useLatestNews } from '@/hooks/news/useLatestNews';
import { NewsArticle } from '@/types/news.types';
import { getRelativeTime, formatExactTime } from '@/utils/date';

export const MarketNewsCarousel: React.FC = () => {
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);
  const { articles, isLoading } = useLatestNews();

  const handleScrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -320, behavior: 'smooth' });
    }
  };

  const handleScrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 320, behavior: 'smooth' });
    }
  };

  // Show top 8 highlighted stock news articles
  const highlightedNews = articles.slice(0, 8);

  return (
    <section className="space-y-4 w-full pt-2">
      {/* Header & Scroller Controls */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#111111]">
            Stock Market News Highlights
          </h2>
          <p className="text-xs text-[#5F6368] hidden sm:block">
            Top market stories impacting Indian stocks today. Click any card to read detailed explanation.
          </p>
        </div>

        {/* Controls & See All Link */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => navigate('/news')}
            className="inline-flex items-center gap-1 text-xs font-bold text-[#0A1D37] hover:text-[#0A1D37]/80 cursor-pointer mr-1"
          >
            <span>See all news</span>
            <ArrowIcon className="w-3.5 h-3.5 text-[#0A1D37]" />
          </button>

          {/* Arrow Scroller Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleScrollLeft}
              aria-label="Scroll left"
              className="w-8 h-8 rounded-full bg-white border border-[#E5E5E5] hover:border-[#0A1D37] text-[#0A1D37] hover:bg-[#0A1D37] hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-2xs"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleScrollRight}
              aria-label="Scroll right"
              className="w-8 h-8 rounded-full bg-white border border-[#E5E5E5] hover:border-[#0A1D37] text-[#0A1D37] hover:bg-[#0A1D37] hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-2xs"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal Scrollable News Cards Container */}
      {isLoading ? (
        <div className="flex gap-4 overflow-hidden animate-pulse">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="w-[280px] sm:w-[320px] shrink-0 h-40 bg-white border border-[#E5E5E5] rounded-xl p-4 space-y-3"
            >
              <div className="h-3 bg-[#F5F5F3] rounded w-1/3" />
              <div className="h-5 bg-[#F5F5F3] rounded w-5/6" />
              <div className="h-10 bg-[#F5F5F3] rounded w-full" />
            </div>
          ))}
        </div>
      ) : highlightedNews.length === 0 ? (
        <div className="p-6 text-center bg-white border border-[#E5E5E5] rounded-xl text-xs text-[#5F6368]">
          No highlighted stock news available right now.
        </div>
      ) : (
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-none scroll-smooth pb-2 pt-0.5 px-0.5"
        >
          {highlightedNews.map((article: NewsArticle) => (
            <article
              key={article.id}
              onClick={() => navigate(`/news/${article.id}`)}
              className="w-[280px] sm:w-[320px] shrink-0 bg-white border border-[#E5E5E5] hover:border-[#0A1D37]/40 rounded-xl p-4 shadow-2xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-2.5 group"
            >
              {/* Publisher & Relative Time */}
              <div className="flex items-center justify-between text-[11px] text-[#5F6368]">
                <span className="inline-flex items-center gap-1 font-bold text-[#5F6368] bg-[#F5F5F3] px-2 py-0.5 rounded text-[10px]">
                  <Globe className="w-3 h-3 text-[#0A1D37]" />
                  {article.source}
                </span>
                <span
                  className="inline-flex items-center gap-1 text-[10px] text-[#888888]"
                  title={`Published: ${formatExactTime(article.publishedAt, true)}`}
                >
                  <Clock className="w-3 h-3 text-[#0A1D37]/70 shrink-0" />
                  <span>{getRelativeTime(article.publishedAt)}</span>
                  {formatExactTime(article.publishedAt, false) && (
                    <span className="text-[#9AA0A6] text-[9px]">
                      ({formatExactTime(article.publishedAt, false)})
                    </span>
                  )}
                </span>
              </div>

              {/* Headline in Navy Blue (#0A1D37) */}
              <div>
                <h3 className="text-sm font-bold text-[#0A1D37] leading-snug tracking-tight group-hover:text-[#0A1D37]/90 transition-colors line-clamp-2">
                  {article.title}
                </h3>
              </div>

              {/* Summary in Normal Black Text (#111111) */}
              <div className="text-xs text-[#111111] leading-relaxed font-sans font-normal">
                <p className="line-clamp-2">{article.summary}</p>
              </div>

              {/* Stock Ticker Tags */}
              {article.relatedSymbols && article.relatedSymbols.length > 0 && (
                <div className="flex flex-wrap items-center gap-1 pt-1">
                  {article.relatedSymbols.slice(0, 3).map((sym) => (
                    <span
                      key={sym}
                      className="px-1.5 py-0.5 rounded bg-[#F5F5F3] border border-[#E5E5E5] text-[10px] font-bold text-[#0A1D37]"
                    >
                      {sym}
                    </span>
                  ))}
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
};

export default MarketNewsCarousel;
