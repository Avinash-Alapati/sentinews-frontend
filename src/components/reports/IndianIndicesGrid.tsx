import React, { useState } from 'react';
import { IndexPerformanceItem } from '@/types/reports.types';
import { TrendingUp, TrendingDown, Minus, Activity, ChevronDown, ChevronUp } from 'lucide-react';

interface IndianIndicesGridProps {
  indices?: IndexPerformanceItem[];
  title?: string;
  subtitle?: string;
  isLoading?: boolean;
}

export const IndianIndicesGrid: React.FC<IndianIndicesGridProps> = ({
  indices = [],
  title = 'Indian Benchmark & Key Indices',
  subtitle = 'NSE/BSE Indian equities session close',
  isLoading,
}) => {
  const [showAll, setShowAll] = useState<boolean>(false);

  if (isLoading) {
    return (
      <div className="bg-[#FFFFFF] border border-[#E5E5E5] rounded-lg p-5 shadow-sm space-y-4">
        <div className="h-5 w-48 bg-gray-200 rounded animate-pulse" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-20 bg-[#F8F9FA] border border-[#E5E5E5] rounded p-3 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (indices.length === 0) {
    return null;
  }

  const displayedIndices = showAll ? indices : indices.slice(0, 10);

  return (
    <div className="bg-[#FFFFFF] border border-[#E5E5E5] rounded-lg p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-[#F0F0F0]">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#0A1D37]" />
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[#0A1D37]">
            {title}
          </h2>
        </div>
        <span className="text-[11px] font-medium text-[#6B7280]">{subtitle}</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {displayedIndices.map((idxItem) => {
          const isPositive = idxItem.change > 0 || idxItem.change_percent > 0;
          const isNegative = idxItem.change < 0 || idxItem.change_percent < 0;

          return (
            <div
              key={idxItem.symbol || idxItem.name}
              className="bg-[#F8F9FA] hover:bg-[#F1F5F9] border border-[#E2E8F0] rounded-lg p-3 transition-all flex flex-col justify-between"
            >
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="text-xs font-bold text-[#0F172A] truncate" title={idxItem.name}>
                  {idxItem.name}
                </span>
              </div>

              <div className="mt-2 space-y-1">
                <div className="text-base font-bold text-[#0F172A] tracking-tight">
                  ₹{typeof idxItem.current_price === 'number'
                    ? idxItem.current_price.toLocaleString('en-IN', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })
                    : idxItem.current_price}
                </div>

                <div className="flex items-center justify-between text-xs font-semibold">
                  <span
                    className={`inline-flex items-center gap-0.5 ${
                      isPositive
                        ? 'text-[#00B386]'
                        : isNegative
                        ? 'text-[#E53935]'
                        : 'text-[#64748B]'
                    }`}
                  >
                    {isPositive ? '+' : ''}
                    {idxItem.change?.toFixed(2)}
                  </span>

                  <span
                    className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[11px] ${
                      isPositive
                        ? 'bg-emerald-50 text-[#00B386] border border-emerald-200'
                        : isNegative
                        ? 'bg-red-50 text-[#E53935] border border-red-200'
                        : 'bg-gray-100 text-[#64748B]'
                    }`}
                  >
                    {isPositive && <TrendingUp className="w-3 h-3" />}
                    {isNegative && <TrendingDown className="w-3 h-3" />}
                    {!isPositive && !isNegative && <Minus className="w-3 h-3" />}
                    {isPositive ? '+' : ''}
                    {idxItem.change_percent?.toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {indices.length > 10 && (
        <div className="pt-2 text-center border-t border-[#F0F0F0]">
          <button
            onClick={() => setShowAll(!showAll)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0A1D37] hover:text-[#2563EB] bg-[#F1F5F9] hover:bg-[#E2E8F0] px-4 py-1 rounded-full transition-colors"
          >
            <span>{showAll ? 'Show top 10 indices' : `View all ${indices.length} indices`}</span>
            {showAll ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      )}
    </div>
  );
};
