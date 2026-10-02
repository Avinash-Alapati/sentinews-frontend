import React from 'react';
import {
  PortfolioOverview,
  PortfolioHolding,
  PortfolioAllocation,
  PortfolioPerformance,
  PortfolioNewsArticle,
} from '@/types/portfolio.types';
import {
  TrendingUp,
  TrendingDown,
  ExternalLink,
  Award,
  AlertCircle,
  Plus,
  Flame,
  ShieldCheck,
  ChevronRight,
  PieChart,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface OverviewTabProps {
  overview: PortfolioOverview | null;
  holdings: PortfolioHolding[];
  allocation: PortfolioAllocation | null;
  performance: PortfolioPerformance | null;
  newsFeed: PortfolioNewsArticle[];
  onAddTransaction: () => void;
  onNavigateTab: (tab: 'HOLDINGS' | 'ALLOCATION' | 'PERFORMANCE' | 'RISK') => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  overview,
  holdings,
  allocation,
  performance,
  newsFeed,
  onAddTransaction,
  onNavigateTab,
}) => {
  const navigate = useNavigate();

  const totalValue = overview?.current_value ?? 0;
  const totalInvestment = overview?.total_investment ?? 0;
  const totalPnl = overview?.total_pnl ?? 0;
  const totalPnlPercent = overview?.total_pnl_percent ?? 0;

  const topGainer = performance?.top_gainers?.[0] || holdings.slice().sort((a, b) => b.unrealized_pnl_percent - a.unrealized_pnl_percent)[0];
  const topLoser = performance?.top_losers?.[0] || holdings.slice().sort((a, b) => a.unrealized_pnl_percent - b.unrealized_pnl_percent)[0];

  const safeSectors = allocation?.sectors || [];

  const handleStockClick = (symbol: string) => {
    const cleanSym = symbol.trim().toUpperCase().replace('.NS', '').replace('.BO', '');
    navigate(`/stock/${encodeURIComponent(cleanSym)}`);
  };

  // If user has zero holdings, render empty onboarding state
  if (holdings.length === 0) {
    return (
      <div className="bg-white border border-[#E5E5E5] rounded-2xl p-10 text-center space-y-5 shadow-2xs font-sans">
        <div className="w-16 h-16 rounded-2xl bg-[#0A1D37]/10 text-[#0A1D37] flex items-center justify-center mx-auto">
          <PieChart className="w-8 h-8 stroke-[2]" />
        </div>
        <div className="max-w-md mx-auto space-y-2">
          <h3 className="text-xl font-bold text-[#111111]">Start Building Your Portfolio</h3>
          <p className="text-xs text-[#5F6368] leading-relaxed">
            Record your stock purchases to unlock real-time P&amp;L tracking, sector allocation breakdown, XIRR returns, and hyper-personalized news intelligence.
          </p>
        </div>
        <button
          type="button"
          onClick={onAddTransaction}
          className="px-5 py-3 bg-[#0A1D37] hover:bg-[#071426] text-white text-xs font-bold rounded-xl transition-all shadow-2xs inline-flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Record First Transaction</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Top Section: Quick Insights Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Top Gainer */}
        <div className="bg-white border border-[#E5E5E5] rounded-2xl p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#5F6368] flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-[#00B386]" />
              Top Performing Asset
            </span>
            <span className="text-xs font-bold text-[#00B386] bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
              +{topGainer?.unrealized_pnl_percent?.toFixed(2) || '0.00'}%
            </span>
          </div>

          {topGainer ? (
            <div
              onClick={() => handleStockClick(topGainer.symbol)}
              className="flex items-center justify-between cursor-pointer hover:opacity-80 transition-opacity"
            >
              <div>
                <span className="text-base font-bold text-[#0A1D37] block">
                  {topGainer.company_name || topGainer.symbol}
                </span>
                <span className="text-xs text-[#5F6368] font-mono">
                  {topGainer.symbol} • {topGainer.sector || 'Equities'}
                </span>
              </div>
              <div className="text-right">
                <span className="text-sm font-bold text-[#111111] block">
                  ₹{topGainer.current_value?.toLocaleString('en-IN')}
                </span>
                <span className="text-xs font-semibold text-[#00B386]">
                  +₹{topGainer.unrealized_pnl?.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          ) : (
            <span className="text-xs text-[#888888]">No gainer metrics available</span>
          )}
        </div>

        {/* Card 2: Top Sector Allocation */}
        <div className="bg-white border border-[#E5E5E5] rounded-2xl p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#5F6368]">
              Dominant Sector Exposure
            </span>
            <button
              type="button"
              onClick={() => onNavigateTab('ALLOCATION')}
              className="text-xs font-bold text-[#0A1D37] hover:underline flex items-center gap-0.5 cursor-pointer"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {safeSectors.length > 0 ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-[#111111]">
                <span>{safeSectors[0].sector}</span>
                <span>{safeSectors[0].weight_percent?.toFixed(1)}% Weight</span>
              </div>
              <div className="h-2 w-full bg-[#F5F5F3] rounded-full overflow-hidden border border-[#E5E5E5]">
                <div
                  className="h-full bg-[#0A1D37] rounded-full"
                  style={{ width: `${Math.min(100, safeSectors[0].weight_percent || 0)}%` }}
                />
              </div>
              <span className="text-[11px] text-[#888888] block">
                ₹{safeSectors[0].current_value?.toLocaleString('en-IN')} total allocation
              </span>
            </div>
          ) : (
            <span className="text-xs text-[#888888]">No sector data computed yet</span>
          )}
        </div>

        {/* Card 3: Portfolio Health Quick Badge */}
        <div className="bg-white border border-[#E5E5E5] rounded-2xl p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#5F6368]">
              Portfolio Health &amp; Diversification
            </span>
            <span className="text-xs font-bold text-[#0A1D37] bg-[#FAFAF8] border border-[#E5E5E5] px-2 py-0.5 rounded-full">
              Optimal
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center font-bold text-sm shrink-0">
              <ShieldCheck className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <span className="text-sm font-bold text-[#111111] block">Balanced Portfolio</span>
              <span className="text-xs text-[#5F6368]">
                {holdings.length} holding{holdings.length === 1 ? '' : 's'} across {safeSectors.length} sector{safeSectors.length === 1 ? '' : 's'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Middle Grid: Holdings Quick Table + Sector Allocation Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Top Holdings Table */}
        <div className="lg:col-span-2 bg-white border border-[#E5E5E5] rounded-2xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#F1F1EF]">
            <div>
              <h3 className="text-base font-bold text-[#111111]">Top Holdings Overview</h3>
              <p className="text-xs text-[#5F6368]">Your highest weight asset allocations</p>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab('HOLDINGS')}
              className="px-3 py-1.5 bg-[#FAFAF8] hover:bg-[#F5F5F3] border border-[#E5E5E5] text-[#0A1D37] rounded-lg text-xs font-bold transition-colors cursor-pointer"
            >
              View All Holdings ({holdings.length})
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#F1F1EF] text-[11px] font-semibold text-[#888888] uppercase tracking-wider">
                  <th className="py-2.5 px-3">Symbol / Name</th>
                  <th className="py-2.5 px-3 text-right">Qty</th>
                  <th className="py-2.5 px-3 text-right">Avg Price</th>
                  <th className="py-2.5 px-3 text-right">Current Value</th>
                  <th className="py-2.5 px-3 text-right">Unrealized P&amp;L</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F1EF] text-xs">
                {holdings.slice(0, 5).map((h) => {
                  const isPos = h.unrealized_pnl >= 0;
                  return (
                    <tr
                      key={h.symbol}
                      onClick={() => handleStockClick(h.symbol)}
                      className="hover:bg-[#FAFAF8] transition-colors cursor-pointer"
                    >
                      <td className="py-3 px-3">
                        <span className="font-bold text-sm text-[#0A1D37] block">
                          {h.symbol}
                        </span>
                        <span className="text-[11px] text-[#888888] block truncate max-w-[140px]">
                          {h.company_name}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-semibold text-[#111111]">
                        {h.quantity}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-[#5F6368]">
                        ₹{h.average_buy_price?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-[#111111]">
                        ₹{h.current_value?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-3 text-right font-bold">
                        <span className={isPos ? 'text-[#00B386]' : 'text-[#E53935]'}>
                          {isPos ? '+' : ''}₹{h.unrealized_pnl?.toFixed(2)} ({isPos ? '+' : ''}
                          {h.unrealized_pnl_percent?.toFixed(2)}%)
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right 1 Column: Personalized News Feed */}
        <div className="bg-white border border-[#E5E5E5] rounded-2xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#F1F1EF]">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-[#0A1D37]" />
              <h3 className="text-base font-bold text-[#111111]">Holding Intelligence</h3>
            </div>
            <span className="text-[10px] font-mono uppercase bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
              Live Feed
            </span>
          </div>

          <p className="text-[11px] text-[#5F6368] leading-relaxed">
            Real-time chronological news articles directly mentioning companies in your active portfolio.
          </p>

          <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
            {newsFeed.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#888888]">
                No recent news updates for active holdings.
              </div>
            ) : (
              newsFeed.map((news) => (
                <div
                  key={news.id}
                  className="p-3.5 rounded-xl border border-[#E5E5E5] hover:border-[#0A1D37]/30 hover:bg-[#FAFAF8] transition-all space-y-2"
                >
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-bold text-white bg-[#0A1D37] px-2 py-0.5 rounded uppercase font-mono">
                      {news.symbol}
                    </span>
                    <span className="text-[#888888]">{news.source}</span>
                  </div>

                  <h4
                    onClick={() => news.url && window.open(news.url, '_blank')}
                    className="text-xs font-bold text-[#111111] hover:text-[#0A1D37] transition-colors line-clamp-2 cursor-pointer"
                  >
                    {news.title}
                  </h4>

                  <p className="text-[11px] text-[#5F6368] line-clamp-2 leading-normal">
                    {news.summary}
                  </p>
                </div>
              ))
            )}
          </div>

          <div className="pt-2 border-t border-[#F1F1EF] text-[10px] text-[#888888] flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#0A1D37] shrink-0" />
            <span>SEBI Regulatory Disclaimer: Informational intelligence only. Not investment advice.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
