import React, { useState } from 'react';
import { SectorPerformanceItem } from '@/types/reports.types';
import { PieChart, TrendingUp, TrendingDown, ChevronDown, ChevronUp } from 'lucide-react';

interface SectorPerformanceSectionProps {
  sectors?: SectorPerformanceItem[];
  title?: string;
  isLoading?: boolean;
}

// Clean up verbose sector names for badges (e.g., "NIFTY CONSUMER DURABLES" -> "Consumer Durables")
const formatSectorBadgeName = (name: string): string => {
  if (!name) return '';
  return name
    .replace(/^(NIFTY|BSE)\s+/i, '')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

export const SectorPerformanceSection: React.FC<SectorPerformanceSectionProps> = ({
  sectors = [],
  title = 'Sectoral Performance Breakdown',
  isLoading,
}) => {
  const [showAll, setShowAll] = useState<boolean>(false);

  if (isLoading) {
    return (
      <div className="bg-[#FFFFFF] border border-[#E5E5E5] rounded-lg p-5 shadow-sm space-y-4">
        <div className="h-5 w-48 bg-gray-200 rounded animate-pulse" />
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-10 bg-[#F8F9FA] rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (sectors.length === 0) {
    return null;
  }

  // Sort sectors by performance percentage descending
  const sortedSectors = [...sectors].sort((a, b) => (b.change_percent || 0) - (a.change_percent || 0));

  const topPerformer = sortedSectors[0];
  const worstPerformer = sortedSectors[sortedSectors.length - 1];

  // Limit display count to 8 items unless expanded
  const displayedSectors = showAll ? sortedSectors : sortedSectors.slice(0, 8);

  // Find max magnitude for scaling bar lengths
  const maxAbsChange = Math.max(
    ...sortedSectors.map((s) => Math.abs(s.change_percent || 0)),
    1.0
  );

  return (
    <div className="bg-[#FFFFFF] border border-[#E5E5E5] rounded-lg p-5 shadow-sm space-y-5">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-[#F0F0F0]">
        <div className="flex items-center gap-2">
          <PieChart className="w-4 h-4 text-[#0A1D37]" />
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[#0A1D37]">
            {title}
          </h2>
        </div>

        {/* Top & Worst callouts with clean truncation & responsive flex-wrap */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {topPerformer && (topPerformer.change_percent || 0) > 0 && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-medium">
              <TrendingUp className="w-3.5 h-3.5 text-[#00B386] shrink-0" />
              <span className="font-semibold truncate max-w-[140px]" title={topPerformer.sector}>
                {formatSectorBadgeName(topPerformer.sector)}:
              </span>
              <span className="font-bold text-[#00B386] shrink-0">
                +{(topPerformer.change_percent || 0).toFixed(2)}%
              </span>
            </div>
          )}

          {worstPerformer && (worstPerformer.change_percent || 0) < 0 && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-red-50 border border-red-200 text-red-800 text-[11px] font-medium">
              <TrendingDown className="w-3.5 h-3.5 text-[#E53935] shrink-0" />
              <span className="font-semibold truncate max-w-[140px]" title={worstPerformer.sector}>
                {formatSectorBadgeName(worstPerformer.sector)}:
              </span>
              <span className="font-bold text-[#E53935] shrink-0">
                {(worstPerformer.change_percent || 0).toFixed(2)}%
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Sector Bar List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {displayedSectors.map((item) => {
          const changeVal = item.change_percent || 0;
          const isPositive = changeVal >= 0;
          const barPercent = Math.min(
            (Math.abs(changeVal) / maxAbsChange) * 100,
            100
          );

          return (
            <div
              key={item.sector}
              className="bg-[#F8F9FA] border border-[#E2E8F0] rounded-lg p-3 space-y-2 hover:border-[#CBD5E1] transition-colors"
            >
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-[#1E293B] truncate pr-2" title={item.sector}>
                  {item.sector}
                </span>
                <span
                  className={`font-mono font-bold shrink-0 ${
                    isPositive ? 'text-[#00B386]' : 'text-[#E53935]'
                  }`}
                >
                  {isPositive ? '+' : ''}
                  {changeVal.toFixed(2)}%
                </span>
              </div>

              {/* Progress Bar Container */}
              <div className="w-full h-2 bg-[#E2E8F0] rounded-full overflow-hidden flex items-center">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isPositive ? 'bg-[#00B386]' : 'bg-[#E53935]'
                  }`}
                  style={{ width: `${Math.max(barPercent, 4)}%` }}
                />
              </div>

              {/* Advances / Declines breakdown if available */}
              {(item.advances !== undefined && item.advances !== null) ||
              (item.declines !== undefined && item.declines !== null) ? (
                <div className="flex items-center justify-between text-[11px] text-[#64748B] pt-0.5">
                  <span>Adv: {item.advances ?? '-'}</span>
                  <span>Dec: {item.declines ?? '-'}</span>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      {/* Show All / Show Less Toggle Button */}
      {sortedSectors.length > 8 && (
        <div className="pt-2 text-center border-t border-[#F0F0F0]">
          <button
            onClick={() => setShowAll(!showAll)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0A1D37] hover:text-[#2563EB] bg-[#F1F5F9] hover:bg-[#E2E8F0] px-4 py-1.5 rounded-full transition-colors"
          >
            <span>{showAll ? 'Show top 8 sectors' : `View all ${sortedSectors.length} sectors`}</span>
            {showAll ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      )}
    </div>
  );
};
