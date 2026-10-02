import React, { useState } from 'react';
import { StockInNewsItem } from '@/types/reports.types';
import { Newspaper, ExternalLink, Tag, ChevronDown, ChevronUp } from 'lucide-react';
import { Link } from 'react-router-dom';

interface StocksInNewsSectionProps {
  stocks?: StockInNewsItem[];
  title?: string;
  isLoading?: boolean;
}

export const StocksInNewsSection: React.FC<StocksInNewsSectionProps> = ({
  stocks = [],
  title = 'Stocks in News & Corporate Highlights',
  isLoading,
}) => {
  const [showAll, setShowAll] = useState<boolean>(false);

  if (isLoading) {
    return (
      <div className="bg-[#FFFFFF] border border-[#E5E5E5] rounded-lg p-5 shadow-sm space-y-4">
        <div className="h-5 w-48 bg-gray-200 rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-[#F8F9FA] rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (stocks.length === 0) {
    return null;
  }

  const displayedStocks = showAll ? stocks : stocks.slice(0, 6);

  return (
    <div className="bg-[#FFFFFF] border border-[#E5E5E5] rounded-lg p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-[#F0F0F0]">
        <div className="flex items-center gap-2">
          <Newspaper className="w-4 h-4 text-[#0A1D37]" />
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[#0A1D37]">
            {title}
          </h2>
        </div>
        <span className="text-[11px] font-medium text-[#6B7280]">Factual Corporate Intelligence</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {displayedStocks.map((item, idx) => (
          <div
            key={item.symbol || idx}
            className="bg-[#F8F9FA] hover:bg-[#F1F5F9] border border-[#E2E8F0] rounded-lg p-4 transition-colors flex flex-col justify-between space-y-3"
          >
            {/* Header: Symbol + Company Name */}
            <div className="flex items-start justify-between gap-2">
              <div>
                <Link
                  to={`/stock/${item.symbol}`}
                  className="group flex items-center gap-1.5"
                >
                  <span className="text-sm font-bold text-[#0A1D37] group-hover:text-[#2563EB] transition-colors">
                    {item.company_name || item.symbol}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded bg-[#E2E8F0] text-[#475569] font-mono font-medium">
                    {item.symbol}
                  </span>
                </Link>
                {item.source_headline && (
                  <p className="text-xs font-semibold text-[#1E293B] mt-1 line-clamp-1">
                    {item.source_headline}
                  </p>
                )}
              </div>

              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-medium shrink-0 border border-blue-200">
                <Tag className="w-3 h-3 text-blue-600" />
                Corporate Update
              </span>
            </div>

            {/* Description */}
            <p className="text-xs text-[#475569] leading-relaxed line-clamp-3">
              {item.description}
            </p>

            {/* Footer link if source url present */}
            {item.source_url && (
              <div className="pt-2 border-t border-[#E5E7EB] flex items-center justify-between text-[11px]">
                <span className="text-[#64748B]">Source Disclosure</span>
                <a
                  href={item.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[#2563EB] hover:underline font-medium"
                >
                  <span>Read filing</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>
        ))}
      </div>

      {stocks.length > 6 && (
        <div className="pt-2 text-center border-t border-[#F0F0F0]">
          <button
            onClick={() => setShowAll(!showAll)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0A1D37] hover:text-[#2563EB] bg-[#F1F5F9] hover:bg-[#E2E8F0] px-4 py-1 rounded-full transition-colors"
          >
            <span>{showAll ? 'Show top 6 stocks' : `View all ${stocks.length} stocks in news`}</span>
            {showAll ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      )}
    </div>
  );
};
