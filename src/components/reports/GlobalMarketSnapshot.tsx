import React from 'react';
import { IndexPoint, GlobalCuesSection } from '@/types/reports.types';
import { Globe, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface GlobalMarketSnapshotProps {
  globalIndices?: IndexPoint[];
  globalCues?: GlobalCuesSection;
  isLoading?: boolean;
}

export const GlobalMarketSnapshot: React.FC<GlobalMarketSnapshotProps> = ({
  globalIndices,
  globalCues,
  isLoading,
}) => {
  // Consolidate list of items
  const items: IndexPoint[] = [];

  if (globalIndices && globalIndices.length > 0) {
    items.push(...globalIndices);
  } else if (globalCues) {
    if (globalCues.gift_nifty) items.push(globalCues.gift_nifty);
    if (globalCues.us_indices) items.push(...globalCues.us_indices);
    if (globalCues.asian_indices) items.push(...globalCues.asian_indices);
  }

  if (isLoading) {
    return (
      <div className="bg-[#FFFFFF] border border-[#E5E5E5] rounded-lg p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 bg-[#F8F9FA] border border-[#E5E5E5] rounded p-3 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="bg-[#FFFFFF] border border-[#E5E5E5] rounded-lg p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-[#F0F0F0]">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-[#0A1D37]" />
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[#0A1D37]">
            Global Cues & International Benchmarks
          </h2>
        </div>
        <span className="text-[11px] font-medium text-[#6B7280]">Overnight Session</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {items.map((item, idx) => {
          const isPositive = item.change > 0 || item.change_percent > 0;
          const isNegative = item.change < 0 || item.change_percent < 0;

          return (
            <div
              key={item.symbol || idx}
              className="bg-[#F8F9FA] hover:bg-[#F1F5F9] border border-[#E2E8F0] rounded-lg p-3 transition-all flex flex-col justify-between"
            >
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="text-xs font-semibold text-[#1E293B] truncate" title={item.name}>
                  {item.name || item.symbol}
                </span>
                <span className="text-[10px] text-[#64748B] font-mono shrink-0">
                  {item.symbol}
                </span>
              </div>

              <div className="flex items-baseline justify-between mt-2">
                <span className="text-sm sm:text-base font-bold text-[#0F172A] tracking-tight">
                  {typeof item.last_price === 'number'
                    ? item.last_price.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })
                    : item.last_price}
                </span>

                <div
                  className={`inline-flex items-center gap-0.5 text-xs font-bold ${
                    isPositive
                      ? 'text-[#00B386]'
                      : isNegative
                      ? 'text-[#E53935]'
                      : 'text-[#64748B]'
                  }`}
                >
                  {isPositive && <TrendingUp className="w-3 h-3" />}
                  {isNegative && <TrendingDown className="w-3 h-3" />}
                  {!isPositive && !isNegative && <Minus className="w-3 h-3" />}
                  <span>
                    {isPositive ? '+' : ''}
                    {item.change_percent?.toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {globalCues?.summary_notes && (
        <p className="text-xs text-[#475569] bg-[#F1F5F9] p-2.5 rounded border border-[#E2E8F0] italic">
          {globalCues.summary_notes}
        </p>
      )}
    </div>
  );
};
