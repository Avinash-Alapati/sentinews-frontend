import React from 'react';
import { Calendar, RefreshCw, AlertTriangle, ShieldCheck } from 'lucide-react';

interface ReportHeaderProps {
  activeTab: 'PRE_MARKET' | 'POST_MARKET';
  onTabChange: (tab: 'PRE_MARKET' | 'POST_MARKET') => void;
  reportDate?: string;
  generatedAt?: string;
  isPartial?: boolean;
  sourceProviders?: string[];
  isLoading?: boolean;
  onRefresh?: () => void;
}

export const ReportHeader: React.FC<ReportHeaderProps> = ({
  activeTab,
  onTabChange,
  reportDate,
  generatedAt,
  isPartial,
  sourceProviders = [],
  isLoading,
  onRefresh,
}) => {
  const formattedDate = reportDate
    ? new Date(reportDate).toLocaleDateString('en-IN', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : new Date().toLocaleDateString('en-IN', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });

  const formattedTime = generatedAt
    ? new Date(generatedAt).toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      })
    : null;

  return (
    <div className="bg-[#FFFFFF] border border-[#E5E5E5] rounded-lg p-4 sm:p-5 shadow-sm space-y-4">
      {/* Top row: Title + Meta tags */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-[#F0F0F0]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-[#0A1D37]/10 text-[#0A1D37]">
              SentiNews Intelligence
            </span>
            {isPartial && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                <AlertTriangle className="w-3 h-3 text-amber-600" />
                Partial Vendor Data
              </span>
            )}
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              SEBI Compliant
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#0A1D37]">
            Daily Market Intelligence
          </h1>
          <p className="text-xs text-[#5F6368] mt-0.5 max-w-2xl leading-relaxed">
            Factual daily briefings on Indian equities, global macro cues, sectoral trends, and FII/DII disclosures.
          </p>
        </div>

        {/* Date & Refresh */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#F8F9FA] border border-[#E5E5E5] text-xs font-medium text-[#374151]">
            <Calendar className="w-3.5 h-3.5 text-[#5F6368]" />
            <span>{formattedDate}</span>
            {formattedTime && <span className="text-[#9CA3AF]">| {formattedTime} IST</span>}
          </div>

          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#FFFFFF] border border-[#D1D5DB] hover:bg-[#F3F4F6] text-xs font-medium text-[#374151] transition-colors disabled:opacity-50"
              title="Refresh report data"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#4B5563] ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          )}
        </div>
      </div>

      {/* Tab Switcher: Clean Pre-Market vs Post-Market (No Sun/Moon icons or extra emojis) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="inline-flex p-1 rounded-md bg-[#F1F5F9] border border-[#E2E8F0] w-full sm:w-auto">
          <button
            onClick={() => onTabChange('PRE_MARKET')}
            className={`flex-1 sm:flex-none px-4 py-1.5 rounded text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'PRE_MARKET'
                ? 'bg-[#0A1D37] text-white shadow-sm'
                : 'text-[#64748B] hover:text-[#0A1D37] hover:bg-white/50'
            }`}
          >
            Pre-Market
          </button>

          <button
            onClick={() => onTabChange('POST_MARKET')}
            className={`flex-1 sm:flex-none px-4 py-1.5 rounded text-xs sm:text-sm font-semibold transition-all ${
              activeTab === 'POST_MARKET'
                ? 'bg-[#0A1D37] text-white shadow-sm'
                : 'text-[#64748B] hover:text-[#0A1D37] hover:bg-white/50'
            }`}
          >
            Post-Market
          </button>
        </div>

        {/* Source Attributions */}
        {sourceProviders.length > 0 && (
          <div className="text-[11px] text-[#6B7280] flex items-center gap-1.5">
            <span className="font-medium text-[#374151]">Data Sources:</span>
            <span className="capitalize">{sourceProviders.join(', ')}</span>
          </div>
        )}
      </div>
    </div>
  );
};
