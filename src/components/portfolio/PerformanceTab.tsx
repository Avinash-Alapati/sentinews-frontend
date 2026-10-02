import React from 'react';
import { PortfolioPerformance, PortfolioOverview, PortfolioHolding } from '@/types/portfolio.types';
import { TrendingUp, TrendingDown, Award, Zap, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PerformanceTabProps {
  performance: PortfolioPerformance | null;
  overview: PortfolioOverview | null;
  holdings: PortfolioHolding[];
}

export const PerformanceTab: React.FC<PerformanceTabProps> = ({
  performance,
  overview,
  holdings,
}) => {
  const navigate = useNavigate();

  const xirr = performance?.xirr ?? 0;
  const totalReturnPct = overview?.total_pnl_percent ?? performance?.total_return_percent ?? 0;
  const realizedPnl = overview?.realized_pnl ?? 0;
  const unrealizedPnl = overview?.unrealized_pnl ?? 0;
  const totalPnl = overview?.total_pnl ?? 0;

  const topGainers = performance?.top_gainers?.length
    ? performance.top_gainers
    : holdings.filter((h) => h.unrealized_pnl >= 0).sort((a, b) => b.unrealized_pnl_percent - a.unrealized_pnl_percent).slice(0, 3);

  const topLosers = performance?.top_losers?.length
    ? performance.top_losers
    : holdings.filter((h) => h.unrealized_pnl < 0).sort((a, b) => a.unrealized_pnl_percent - b.unrealized_pnl_percent).slice(0, 3);

  const handleStockClick = (symbol: string) => {
    const cleanSym = symbol.trim().toUpperCase().replace('.NS', '').replace('.BO', '');
    navigate(`/stock/${encodeURIComponent(cleanSym)}`);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Top Returns Banner Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* XIRR Card */}
        <div className="p-5 bg-white border border-[#E5E5E5] rounded-2xl shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#5F6368] flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-[#0A1D37]" />
              XIRR (Annualized Return)
            </span>
          </div>
          <div className="text-2xl font-bold text-[#0A1D37] font-mono">
            {xirr.toFixed(2)}%
          </div>
          <span className="text-[11px] text-[#888888] block">Money-weighted rate of return</span>
        </div>

        {/* Total Return % */}
        <div className="p-5 bg-white border border-[#E5E5E5] rounded-2xl shadow-2xs space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#5F6368] block">
            TOTAL RETURN %
          </span>
          <div
            className={`text-2xl font-bold flex items-center gap-1 ${
              totalReturnPct >= 0 ? 'text-[#00B386]' : 'text-[#E53935]'
            }`}
          >
            {totalReturnPct >= 0 ? '+' : ''}
            {totalReturnPct.toFixed(2)}%
          </div>
          <span className="text-[11px] text-[#888888] block">Since inception</span>
        </div>

        {/* Realized P&L */}
        <div className="p-5 bg-white border border-[#E5E5E5] rounded-2xl shadow-2xs space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#5F6368] block">
            REALIZED P&amp;L
          </span>
          <div
            className={`text-xl sm:text-2xl font-bold ${
              realizedPnl >= 0 ? 'text-[#00B386]' : 'text-[#E53935]'
            }`}
          >
            {realizedPnl >= 0 ? '+' : ''}₹{realizedPnl.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] text-[#888888] block">Booked profit/loss</span>
        </div>

        {/* Unrealized P&L */}
        <div className="p-5 bg-white border border-[#E5E5E5] rounded-2xl shadow-2xs space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#5F6368] block">
            UNREALIZED P&amp;L
          </span>
          <div
            className={`text-xl sm:text-2xl font-bold ${
              unrealizedPnl >= 0 ? 'text-[#00B386]' : 'text-[#E53935]'
            }`}
          >
            {unrealizedPnl >= 0 ? '+' : ''}₹{unrealizedPnl.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] text-[#888888] block">Current open position gain</span>
        </div>
      </div>

      {/* Top Gainers & Top Losers Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Gainers Card */}
        <div className="bg-white border border-[#E5E5E5] rounded-2xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#F1F1EF]">
            <TrendingUp className="w-5 h-5 text-[#00B386]" />
            <div>
              <h3 className="text-base font-bold text-[#111111]">Top Performers (Gainers)</h3>
              <p className="text-xs text-[#5F6368]">Highest unrealized percentage returns</p>
            </div>
          </div>

          {topGainers.length === 0 ? (
            <div className="py-6 text-center text-xs text-[#888888]">No gainers in portfolio currently</div>
          ) : (
            <div className="space-y-3">
              {topGainers.map((g) => (
                <div
                  key={g.symbol}
                  onClick={() => handleStockClick(g.symbol)}
                  className="flex items-center justify-between p-3.5 bg-[#FAFAF8] border border-[#E5E5E5] rounded-xl hover:border-[#00B386] cursor-pointer transition-all"
                >
                  <div>
                    <span className="font-bold text-sm text-[#0A1D37] block">{g.symbol}</span>
                    <span className="text-xs text-[#5F6368]">{g.company_name}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-sm text-[#00B386] block">
                      +{g.unrealized_pnl_percent?.toFixed(2)}%
                    </span>
                    <span className="text-xs text-[#5F6368]">
                      +₹{g.unrealized_pnl?.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Losers Card */}
        <div className="bg-white border border-[#E5E5E5] rounded-2xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#F1F1EF]">
            <TrendingDown className="w-5 h-5 text-[#E53935]" />
            <div>
              <h3 className="text-base font-bold text-[#111111]">Underperforming Assets (Losers)</h3>
              <p className="text-xs text-[#5F6368]">Assets trading below average cost basis</p>
            </div>
          </div>

          {topLosers.length === 0 ? (
            <div className="py-6 text-center text-xs text-[#888888]">No underperforming holdings currently</div>
          ) : (
            <div className="space-y-3">
              {topLosers.map((l) => (
                <div
                  key={l.symbol}
                  onClick={() => handleStockClick(l.symbol)}
                  className="flex items-center justify-between p-3.5 bg-[#FAFAF8] border border-[#E5E5E5] rounded-xl hover:border-[#E53935] cursor-pointer transition-all"
                >
                  <div>
                    <span className="font-bold text-sm text-[#0A1D37] block">{l.symbol}</span>
                    <span className="text-xs text-[#5F6368]">{l.company_name}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-sm text-[#E53935] block">
                      {l.unrealized_pnl_percent?.toFixed(2)}%
                    </span>
                    <span className="text-xs text-[#5F6368]">
                      ₹{l.unrealized_pnl?.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
