import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useMarketIndices } from '@/hooks/market/useMarketIndices';
import { TrendingUp, TrendingDown, Minus, Globe } from 'lucide-react';
import { IndexQuote } from '@/types/market.types';

// Fallback Indian indices to ensure ticker displays immediately
const FALLBACK_TICKER_INDICES: IndexQuote[] = [
  { symbol: '^NSEI', name: 'NIFTY 50', current_value: 22716.20, change: -64.05, change_percent: -0.28, open: 22780.25, high: 22810.50, low: 22690.30, previous_close: 22780.25 },
  { symbol: '^BSESN', name: 'SENSEX', current_value: 74683.70, change: -188.50, change_percent: -0.25, open: 74872.20, high: 74920.10, low: 74580.40, previous_close: 74872.20 },
  { symbol: '^NSEBANK', name: 'NIFTY BANK', current_value: 48924.50, change: 142.30, change_percent: 0.29, open: 48782.20, high: 49100.00, low: 48750.20, previous_close: 48782.20 },
  { symbol: '^CNXIT', name: 'NIFTY IT', current_value: 34850.15, change: -210.40, change_percent: -0.60, open: 35060.55, high: 35120.00, low: 34780.00, previous_close: 35060.55 },
  { symbol: 'NIFTY_MIDCAP_100', name: 'NIFTY MIDCAP 100', current_value: 50460.20, change: -120.10, change_percent: -0.24, open: 50580.30, high: 50680.00, low: 50350.00, previous_close: 50580.30 },
  { symbol: '^CNXAUTO', name: 'NIFTY AUTO', current_value: 22180.90, change: 185.60, change_percent: 0.84, open: 21995.30, high: 22250.00, low: 22010.00, previous_close: 21995.30 },
  { symbol: '^CNXPHARMA', name: 'NIFTY PHARMA', current_value: 19120.40, change: 95.30, change_percent: 0.50, open: 19025.10, high: 19190.00, low: 19010.00, previous_close: 19025.10 },
  { symbol: '^CNXFMCG', name: 'NIFTY FMCG', current_value: 54620.80, change: -82.40, change_percent: -0.15, open: 54703.20, high: 54800.00, low: 54510.00, previous_close: 54703.20 },
  { symbol: '^CNXMETAL', name: 'NIFTY METAL', current_value: 8950.60, change: 112.20, change_percent: 1.27, open: 8838.40, high: 8990.00, low: 8820.00, previous_close: 8838.40 },
  { symbol: '^CNXENERGY', name: 'NIFTY ENERGY', current_value: 39840.10, change: -150.30, change_percent: -0.38, open: 39990.40, high: 40100.00, low: 39750.00, previous_close: 39990.40 },
  { symbol: 'BSE-100', name: 'BSE 100', current_value: 23410.85, change: -45.20, change_percent: -0.19, open: 23456.05, high: 23520.00, low: 23380.00, previous_close: 23456.05 },
  { symbol: 'BSE-MIDCAP', name: 'BSE MIDCAP', current_value: 42150.30, change: -95.60, change_percent: -0.23, open: 42245.90, high: 42320.00, low: 42080.00, previous_close: 42245.90 },
];

export const MarketTickerBar: React.FC = () => {
  const location = useLocation();
  const isLandingPage = location.pathname === '/';
  const { indices } = useMarketIndices(30000);

  // Use real fetched indices if available, otherwise high-fidelity Indian benchmarks
  const activeIndices = indices && indices.length > 0 ? indices : FALLBACK_TICKER_INDICES;

  const renderIndexItem = (idx: IndexQuote, key: string | number) => {
    const isPositive = idx.change > 0;
    const isNegative = idx.change < 0;

    const valStr = idx.current_value
      ? idx.current_value.toLocaleString('en-IN', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      : '0.00';

    const percentStr = Math.abs(idx.change_percent || 0).toFixed(2);

    return (
      <Link
        key={key}
        to={`/stock/${encodeURIComponent(idx.symbol)}`}
        className="flex items-center gap-2 shrink-0 text-[11px] group/item transition-opacity hover:opacity-95"
      >
        <span className="font-sans font-semibold text-white/90 group-hover/item:text-white transition-colors">
          {idx.name}
        </span>
        <span className="tabular-nums font-medium text-white/95">
          {valStr}
        </span>
        <span
          className={`inline-flex items-center gap-0.5 tabular-nums text-[10px] font-semibold px-1 py-0.5 rounded-xs transition-colors ${
            isPositive
              ? 'text-emerald-300 bg-emerald-950/40'
              : isNegative
              ? 'text-rose-300 bg-rose-950/40'
              : 'text-white/70 bg-white/5'
          }`}
        >
          {isPositive ? (
            <TrendingUp className="w-2.5 h-2.5 stroke-[2.5]" />
          ) : isNegative ? (
            <TrendingDown className="w-2.5 h-2.5 stroke-[2.5]" />
          ) : (
            <Minus className="w-2.5 h-2.5" />
          )}
          <span>
            {isPositive ? '+' : isNegative ? '-' : ''}
            {percentStr}%
          </span>
        </span>
      </Link>
    );
  };

  if (isLandingPage) {
    // Duplicate list to achieve a seamless, continuous infinite scroll loop on landing page
    const tickerItems = [...activeIndices, ...activeIndices];

    return (
      <div className="bg-[#0A1D37] text-white border-b border-[#071426] text-xs py-2 px-4 sm:px-6 relative z-40 select-none overflow-hidden group">
        <style>{`
          @keyframes tickerScroll {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .animate-ticker-continuous {
            display: flex;
            width: max-content;
            animation: tickerScroll 42s linear infinite;
          }
          .group:hover .animate-ticker-continuous {
            animation-play-state: paused;
          }
        `}</style>

        {/* Edge gradient masks for smooth fade in/out aligned with page margins */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-r from-[#0A1D37] to-transparent z-10" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-l from-[#0A1D37] to-transparent z-10" />

        {/* Main scrolling strip contained within max-w-[1140px] matching navbar */}
        <div className="max-w-[1140px] mx-auto overflow-hidden">
          <div className="animate-ticker-continuous items-center gap-7 sm:gap-9 py-0.5">
            {tickerItems.map((idx, itemIdx) => renderIndexItem(idx, `${idx.symbol}-${itemIdx}`))}
          </div>
        </div>
      </div>
    );
  }

  // Non-landing pages: Static (no scroll) with INDIA LIVE indicator + Globe icon to view all indices
  return (
    <div className="bg-[#0A1D37] text-white border-b border-[#071426] text-xs py-2 px-4 sm:px-6 relative z-40 select-none">
      <div className="max-w-[1140px] mx-auto flex items-center justify-between gap-3 sm:gap-4">
        {/* Left: Live status + Static index items */}
        <div className="flex items-center gap-3 sm:gap-6 overflow-x-auto no-scrollbar py-0.5 min-w-0">
          <div className="flex items-center gap-2 shrink-0 pr-3 border-r border-white/15">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-bold tracking-wider text-white/90 uppercase whitespace-nowrap">
              India Live
            </span>
          </div>

          <div className="flex items-center gap-5 sm:gap-7 shrink-0">
            {activeIndices.slice(0, 6).map((idx) => renderIndexItem(idx, idx.symbol))}
          </div>
        </div>

        {/* Right: Globe icon button linking to /indices */}
        <Link
          to="/indices"
          className="p-1.5 hover:bg-white/10 text-white/90 hover:text-white rounded-xs transition-colors shrink-0 flex items-center justify-center cursor-pointer ml-auto pl-2 border-l border-white/15"
          title="See all indices"
          aria-label="See all indices"
        >
          <Globe className="w-4 h-4 text-[#FAFAF8]" />
        </Link>
      </div>
    </div>
  );
};

export default MarketTickerBar;
