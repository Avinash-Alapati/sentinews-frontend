import React from 'react';
import { IndexQuote } from '@/types/market.types';
import { MarketIndexCard } from './MarketIndexCard';
import { RefreshCw, AlertCircle, Clock } from 'lucide-react';

interface MarketIndicesGridProps {
  indices: IndexQuote[];
  marketStatus: string;
  isLoading: boolean;
  error: string | null;
  onRefresh: () => void;
}

export const MarketIndicesGrid: React.FC<MarketIndicesGridProps> = ({
  indices,
  marketStatus,
  isLoading,
  error,
  onRefresh,
}) => {
  const isMarketOpen = marketStatus === 'OPEN';

  return (
    <section className="space-y-4">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold tracking-tight text-[#111111]">
            Top Market Indices
          </h2>

          {/* Market Status Badge */}
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider ${
              isMarketOpen
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-neutral-100 text-neutral-700 border border-neutral-200'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isMarketOpen ? 'bg-emerald-500 animate-pulse' : 'bg-neutral-400'
              }`}
            />
            <span>{isMarketOpen ? 'Live Market Open' : 'Market Closed'}</span>
          </span>
        </div>

        <button
          type="button"
          onClick={onRefresh}
          disabled={isLoading}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#5F6368] hover:text-[#0A1D37] bg-white border border-[#E5E5E5] hover:border-[#0A1D37] px-3 py-1.5 rounded-sm transition-all disabled:opacity-60 cursor-pointer w-fit"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Indices</span>
        </button>
      </div>

      {/* Error State */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-sm flex items-center justify-between text-xs text-red-700">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={onRefresh}
            className="font-semibold underline hover:text-red-900 cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading Skeleton Grid */}
      {isLoading && indices.length === 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((idx) => (
            <div
              key={idx}
              className="bg-white border border-[#E5E5E5] rounded-sm p-5 space-y-4 animate-pulse"
            >
              <div className="h-4 bg-[#F5F5F3] rounded-xs w-24" />
              <div className="h-8 bg-[#F5F5F3] rounded-xs w-36" />
              <div className="h-3 bg-[#F5F5F3] rounded-xs w-28" />
            </div>
          ))}
        </div>
      ) : indices.length > 0 ? (
        /* Actual Real Indices Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {indices.map((idx) => (
            <MarketIndexCard key={idx.symbol} indexData={idx} />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="p-8 text-center bg-white border border-[#E5E5E5] rounded-sm text-sm text-[#5F6368]">
          <Clock className="w-6 h-6 mx-auto mb-2 text-[#888888]" />
          No indices data currently available from backend. Please click Refresh to reload.
        </div>
      )}
    </section>
  );
};
