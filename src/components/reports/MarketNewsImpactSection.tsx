import React from 'react';
import { HeadlineItem } from '@/types/reports.types';
import { Newspaper, ExternalLink, Clock } from 'lucide-react';

interface MarketNewsImpactSectionProps {
  headlines?: HeadlineItem[];
  title?: string;
  isLoading?: boolean;
}

export const MarketNewsImpactSection: React.FC<MarketNewsImpactSectionProps> = ({
  headlines = [],
  title = 'Market Drivers & News Recap',
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="bg-[#FFFFFF] border border-[#E5E5E5] rounded-lg p-5 shadow-sm space-y-4">
        <div className="h-5 w-48 bg-gray-200 rounded animate-pulse" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 bg-[#F8F9FA] rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (headlines.length === 0) {
    return null;
  }

  return (
    <div className="bg-[#FFFFFF] border border-[#E5E5E5] rounded-lg p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-[#F0F0F0]">
        <div className="flex items-center gap-2">
          <Newspaper className="w-4 h-4 text-[#0A1D37]" />
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[#0A1D37]">
            {title}
          </h2>
        </div>
        <span className="text-[11px] font-medium text-[#6B7280]">Factual News Stream</span>
      </div>

      <div className="divide-y divide-[#F0F0F0]">
        {headlines.map((item, idx) => (
          <div key={idx} className="py-3 first:pt-0 last:pb-0 space-y-1">
            <div className="flex items-start justify-between gap-3">
              <a
                href={item.url || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs sm:text-sm font-semibold text-[#1E293B] hover:text-[#2563EB] transition-colors leading-snug"
              >
                {item.headline}
              </a>
              {item.url && (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#94A3B8] hover:text-[#2563EB] shrink-0 pt-0.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>

            <div className="flex items-center gap-3 text-[11px] text-[#64748B]">
              <span className="font-medium text-[#475569]">{item.source || 'Market News'}</span>
              {item.published_at && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[#94A3B8]" />
                  {item.published_at}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
