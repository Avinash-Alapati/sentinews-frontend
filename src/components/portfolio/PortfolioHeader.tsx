import React from 'react';
import { PortfolioOverview } from '@/types/portfolio.types';
import { Plus, RefreshCw, Briefcase, TrendingUp, TrendingDown, Clock } from 'lucide-react';

interface PortfolioHeaderProps {
  portfolioName?: string;
  overview: PortfolioOverview | null;
  isRefreshing: boolean;
  onRefresh: () => void;
  onAddTransaction: () => void;
}

export const PortfolioHeader: React.FC<PortfolioHeaderProps> = ({
  portfolioName,
  overview,
  isRefreshing,
  onRefresh,
  onAddTransaction,
}) => {
  const currentValue = overview?.current_value ?? 0;
  const totalInvestment = overview?.total_investment ?? 0;
  const totalPnl = overview?.total_pnl ?? 0;
  const totalPnlPercent = overview?.total_pnl_percent ?? 0;
  const dayPnl = overview?.day_pnl ?? 0;
  const dayPnlPercent = overview?.day_pnl_percent ?? 0;
  const holdingsCount = overview?.total_holdings_count ?? 0;

  const isTotalPnlPositive = totalPnl >= 0;
  const isDayPnlPositive = dayPnl >= 0;

  return (
    <div className="bg-white border border-[#E5E5E5] rounded-2xl p-6 shadow-2xs space-y-6">
      {/* Top Banner Row: Title, Market Status & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#F1F1EF]">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-[#0A1D37] text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-2xs">
            <Briefcase className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-[#0A1D37] tracking-tight">
                {portfolioName || 'My Investment Portfolio'}
              </h1>
            </div>
            <p className="text-xs text-[#5F6368] mt-0.5">
              Live Indian Equity & Asset Valuation • {holdingsCount} Active Holding{holdingsCount === 1 ? '' : 's'}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2.5 text-[#5F6368] hover:text-[#0A1D37] bg-white border border-[#E5E5E5] hover:border-[#0A1D37] rounded-xl transition-all cursor-pointer shadow-2xs disabled:opacity-50"
            title="Refresh portfolio metrics"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>

          <button
            type="button"
            onClick={onAddTransaction}
            className="px-4 py-2.5 bg-[#0A1D37] hover:bg-[#071426] text-white text-xs font-bold rounded-xl transition-all shadow-2xs flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Transaction</span>
          </button>
        </div>
      </div>

      {/* Main KPI Grid: 4 Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Portfolio Value */}
        <div className="p-4 bg-[#FAFAF8] border border-[#E5E5E5] rounded-xl space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#5F6368] block">
            CURRENT VALUE
          </span>
          <div className="text-xl sm:text-2xl font-bold text-[#111111]">
            ₹{currentValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] text-[#888888] block">Live Market Value</span>
        </div>

        {/* Card 2: Total Invested Capital */}
        <div className="p-4 bg-[#FAFAF8] border border-[#E5E5E5] rounded-xl space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#5F6368] block">
            TOTAL INVESTED
          </span>
          <div className="text-xl sm:text-2xl font-bold text-[#111111]">
            ₹{totalInvestment.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] text-[#888888] block">Cost Basis</span>
        </div>

        {/* Card 3: Overall Returns (Total P&L) */}
        <div className="p-4 bg-[#FAFAF8] border border-[#E5E5E5] rounded-xl space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#5F6368] block">
            TOTAL P&amp;L
          </span>
          <div
            className={`text-xl sm:text-2xl font-bold flex items-center gap-1 ${
              isTotalPnlPositive ? 'text-[#00B386]' : 'text-[#E53935]'
            }`}
          >
            {isTotalPnlPositive ? (
              <TrendingUp className="w-5 h-5 stroke-[2.5]" />
            ) : (
              <TrendingDown className="w-5 h-5 stroke-[2.5]" />
            )}
            <span>
              {isTotalPnlPositive ? '+' : ''}₹
              {totalPnl.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <span
            className={`text-xs font-semibold ${
              isTotalPnlPositive ? 'text-[#00B386]' : 'text-[#E53935]'
            }`}
          >
            {isTotalPnlPositive ? '+' : ''}
            {totalPnlPercent.toFixed(2)}% Overall Return
          </span>
        </div>

        {/* Card 4: Today's 1D Change */}
        <div className="p-4 bg-[#FAFAF8] border border-[#E5E5E5] rounded-xl space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#5F6368] block">
            TODAY&apos;S CHANGE (1D)
          </span>
          <div
            className={`text-xl sm:text-2xl font-bold flex items-center gap-1 ${
              isDayPnlPositive ? 'text-[#00B386]' : 'text-[#E53935]'
            }`}
          >
            {isDayPnlPositive ? (
              <TrendingUp className="w-5 h-5 stroke-[2.5]" />
            ) : (
              <TrendingDown className="w-5 h-5 stroke-[2.5]" />
            )}
            <span>
              {isDayPnlPositive ? '+' : ''}₹
              {dayPnl.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <span
            className={`text-xs font-semibold ${
              isDayPnlPositive ? 'text-[#00B386]' : 'text-[#E53935]'
            }`}
          >
            {isDayPnlPositive ? '+' : ''}
            {dayPnlPercent.toFixed(2)}% Today
          </span>
        </div>
      </div>
    </div>
  );
};
