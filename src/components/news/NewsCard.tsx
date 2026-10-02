import React, { useState, useEffect } from 'react';
import { Globe, Clock } from 'lucide-react';
import { NewsArticle } from '@/types/news.types';
import { useNavigate } from 'react-router-dom';
import { getRelativeTime, formatExactTime } from '@/utils/date';

export interface NewsCardProps {
  article: NewsArticle;
}

export const NewsCard: React.FC<NewsCardProps> = ({ article }) => {
  const navigate = useNavigate();
  // Live ticker updates every 30 seconds so relative time (e.g. 5m ago) stays current
  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  const handleCardClick = () => {
    navigate(`/news/${article.id}`);
  };

  const handleSymbolClick = (e: React.MouseEvent, symbol: string) => {
    e.stopPropagation();
    const cleanSym = symbol.trim().toUpperCase().replace('.NS', '').replace('.BO', '');
    navigate(`/stock/${encodeURIComponent(cleanSym)}`);
  };

  const relativeTime = getRelativeTime(article.publishedAt, now);
  const exactTime = formatExactTime(article.publishedAt, false);
  const fullDateTime = formatExactTime(article.publishedAt, true);

  return (
    <article
      onClick={handleCardClick}
      className="bg-white border border-[#E5E5E5] hover:border-[#0A1D37]/40 rounded-xl p-4 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-2.5 cursor-pointer group"
    >
      {/* Top Source & Time Row */}
      <div className="flex items-center justify-between text-[11px] text-[#5F6368]">
        <span className="inline-flex items-center gap-1 font-bold text-[#5F6368] bg-[#F5F5F3] px-2 py-0.5 rounded text-[10px]">
          <Globe className="w-3 h-3 text-[#0A1D37]" />
          {article.source}
        </span>

        <span
          className="inline-flex items-center gap-1.5 text-[10px] text-[#71767B] font-medium"
          title={fullDateTime ? `Published: ${fullDateTime}` : undefined}
        >
          <Clock className="w-3 h-3 text-[#0A1D37]/70 shrink-0" />
          <span>{relativeTime}</span>
          {exactTime && (
            <span className="text-[#9AA0A6] text-[9.5px]">({exactTime})</span>
          )}
        </span>
      </div>

      {/* Main Headline styled in NAVY BLUE (#0A1D37) with NO redirect arrows */}
      <div>
        <h2 className="text-sm sm:text-base font-bold text-[#0A1D37] leading-snug tracking-tight group-hover:text-[#0A1D37]/90 transition-colors line-clamp-2">
          {article.title}
        </h2>
      </div>

      {/* Short Summary rendered as NORMAL BLACK TEXT (#111111) */}
      <div className="text-xs text-[#111111] leading-relaxed font-sans font-normal">
        <p className="line-clamp-2">{article.summary}</p>
      </div>

      {/* Related Ticker Symbol Tags (NO arrow buttons) */}
      {article.relatedSymbols && article.relatedSymbols.length > 0 && (
        <div className="flex flex-wrap items-center gap-1 pt-1">
          {article.relatedSymbols.slice(0, 3).map((sym) => (
            <button
              key={sym}
              type="button"
              onClick={(e) => handleSymbolClick(e, sym)}
              className="px-1.5 py-0.5 rounded bg-[#F5F5F3] hover:bg-[#0A1D37] hover:text-white border border-[#E5E5E5] text-[10px] font-bold text-[#0A1D37] transition-all cursor-pointer"
            >
              {sym}
            </button>
          ))}
        </div>
      )}
    </article>
  );
};

export default NewsCard;
