import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { reportsApi } from '@/services/api/reports.api';
import { MarketReportResponse } from '@/types/reports.types';
import { ReportHeader } from '@/components/reports/ReportHeader';
import { GlobalMarketSnapshot } from '@/components/reports/GlobalMarketSnapshot';
import { IndianIndicesGrid } from '@/components/reports/IndianIndicesGrid';
import { SectorPerformanceSection } from '@/components/reports/SectorPerformanceSection';
import { CommoditiesCurrencyGrid } from '@/components/reports/CommoditiesCurrencyGrid';
import { InstitutionalFlowCard } from '@/components/reports/InstitutionalFlowCard';
import { StocksInNewsSection } from '@/components/reports/StocksInNewsSection';
import { CorporateEventsSection } from '@/components/reports/CorporateEventsSection';
import { MarketMoversSection } from '@/components/reports/MarketMoversSection';
import { EconomicCalendarSection } from '@/components/reports/EconomicCalendarSection';
import { MarketNewsImpactSection } from '@/components/reports/MarketNewsImpactSection';
import { SEBIDisclaimerCard } from '@/components/reports/SEBIDisclaimerCard';
import { AlertCircle, RefreshCw } from 'lucide-react';

export const MarketReportsPage: React.FC = () => {
  // Determine default tab based on current IST time (before 15:30 -> Pre-Market, after -> Post-Market)
  const [activeTab, setActiveTab] = useState<'PRE_MARKET' | 'POST_MARKET'>(() => {
    try {
      const nowUtc = new Date();
      // Add 5 hours and 30 minutes for IST offset
      const istTime = new Date(nowUtc.getTime() + (5.5 * 60 * 60 * 1000));
      const hours = istTime.getUTCHours();
      const minutes = istTime.getUTCMinutes();
      const totalMinutes = hours * 60 + minutes;
      // 15:30 IST is 930 minutes
      return totalMinutes >= 930 ? 'POST_MARKET' : 'PRE_MARKET';
    } catch {
      return 'PRE_MARKET';
    }
  });

  const [preMarketReport, setPreMarketReport] = useState<MarketReportResponse | null>(null);
  const [postMarketReport, setPostMarketReport] = useState<MarketReportResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (activeTab === 'PRE_MARKET') {
        const report = await reportsApi.getLatestPreMarketReport();
        setPreMarketReport(report);
      } else {
        const report = await reportsApi.getLatestPostMarketReport();
        setPostMarketReport(report);
      }
    } catch (err: any) {
      console.warn('Failed to fetch primary market report:', err);
      if (err?.response?.status === 401) {
        setError('Please log in to access full institutional pre-market and post-market reports.');
        setIsLoading(false);
        return;
      }
      // If 404 or backend unavailable, try fallback endpoint or list endpoint
      try {
        const listRes = await reportsApi.listMarketReports({ limit: 5 });
        if (listRes && listRes.items && listRes.items.length > 0) {
          const match = listRes.items.find((r) => r.report_type === activeTab) || listRes.items[0];
          const fullReport = await reportsApi.getMarketReportById(match.id);
          if (activeTab === 'PRE_MARKET') {
            setPreMarketReport(fullReport);
          } else {
            setPostMarketReport(fullReport);
          }
        } else {
          setError('No published market reports available at this moment.');
        }
      } catch (fallbackErr: any) {
        setError(
          err?.response?.data?.detail ||
          'Unable to load market reports. Please ensure backend services are running.'
        );
      }
    } finally {
      setIsLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  // Current active report object
  const currentReport = activeTab === 'PRE_MARKET' ? preMarketReport : postMarketReport;
  const sections = currentReport?.sections || {};

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#111111] flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-[1140px] mx-auto px-4 sm:px-6 py-6 w-full space-y-6">
        {/* Header with Switcher */}
        <ReportHeader
          activeTab={activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab);
          }}
          reportDate={currentReport?.report_date}
          generatedAt={currentReport?.generated_at}
          isPartial={currentReport?.is_partial}
          sourceProviders={currentReport?.source_providers}
          isLoading={isLoading}
          onRefresh={fetchReports}
        />

        {/* Error Callout (if any) */}
        {error && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3.5 text-xs sm:text-sm text-amber-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={fetchReports}
              className="inline-flex items-center gap-1 text-xs font-semibold text-amber-900 underline hover:no-underline shrink-0"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Try Again
            </button>
          </div>
        )}

        {/* Content View: Pre-Market Intelligence */}
        {activeTab === 'PRE_MARKET' && (
          <div className="space-y-6">
            {/* 1. Global Market Snapshot & GIFT Nifty */}
            <GlobalMarketSnapshot
              globalIndices={sections.major_global_indices}
              globalCues={sections.global_cues}
              isLoading={isLoading}
            />

            {/* 2. Indian Indices Previous Close */}
            <IndianIndicesGrid
              indices={sections.indian_indices_prev_close}
              title="Indian Benchmark Indices (Prev. Close)"
              subtitle="NSE / BSE Closing Snapshot"
              isLoading={isLoading}
            />

            {/* 3. Sector Performance Recap */}
            <SectorPerformanceSection
              sectors={sections.indian_sector_performance_prev}
              title="Sectoral Setup & Previous Session Breakdown"
              isLoading={isLoading}
            />

            {/* 4. FII / DII Institutional Activity */}
            <InstitutionalFlowCard
              fiiDiiData={sections.fii_dii_prev_day}
              isLoading={isLoading}
            />

            {/* 5. Commodities, Currency Pairs & Indian ADRs */}
            <CommoditiesCurrencyGrid
              commodities={sections.commodities}
              currencyPairs={sections.inr_currency_pairs}
              adrs={sections.indian_adrs}
              isLoading={isLoading}
            />

            {/* 6. Stocks in News */}
            <StocksInNewsSection
              stocks={sections.stocks_in_news}
              title="Stocks in Focus Today"
              isLoading={isLoading}
            />

            {/* 7. Corporate Events & Announcements */}
            <CorporateEventsSection
              events={sections.corporate_events_carried_forward}
              title="Corporate Announcements & Events"
              isLoading={isLoading}
            />

            {/* 8. Economic Calendar Today */}
            <EconomicCalendarSection
              events={sections.economic_calendar_today}
              title="Macroeconomic Releases & Central Bank Calendar"
              subtitle="Scheduled Economic Announcements Today"
              isLoading={isLoading}
            />

            {/* 9. Market Drivers / Headlines Carried Forward */}
            <MarketNewsImpactSection
              headlines={sections.market_news_carried_forward || sections.key_news_headlines}
              title="Overnight Market Drivers & Global News"
              isLoading={isLoading}
            />
          </div>
        )}

        {/* Content View: Post-Market Intelligence */}
        {activeTab === 'POST_MARKET' && (
          <div className="space-y-6">
            {/* 1. Indian Indices Session Close */}
            <IndianIndicesGrid
              indices={sections.indian_indices_close || sections.index_performance}
              title="Indian Equities Session Close"
              subtitle="NSE / BSE End of Day Performance"
              isLoading={isLoading}
            />

            {/* 2. Top Gainers & Top Losers */}
            <MarketMoversSection
              topGainers={sections.top_gainers}
              topLosers={sections.top_losers}
              isLoading={isLoading}
            />

            {/* 3. Sector Performance Breakdown */}
            <SectorPerformanceSection
              sectors={sections.sector_performance}
              title="End-of-Day Sectoral Performance"
              isLoading={isLoading}
            />

            {/* 4. Today's FII / DII Activity */}
            <InstitutionalFlowCard
              fiiDiiData={sections.fii_dii_data}
              isLoading={isLoading}
            />

            {/* 5. Commodities & FX Close */}
            <CommoditiesCurrencyGrid
              commodities={sections.commodities_close || sections.commodities}
              currencyPairs={sections.inr_currency_pairs}
              adrs={sections.indian_adrs}
              isLoading={isLoading}
            />

            {/* 6. Stocks in News Impact */}
            <StocksInNewsSection
              stocks={sections.stocks_in_news}
              title="Corporate Developments & Stocks in Focus"
              isLoading={isLoading}
            />

            {/* 7. Today's Corporate Events */}
            <CorporateEventsSection
              events={sections.corporate_events}
              title="Corporate Actions & Filings Summary"
              isLoading={isLoading}
            />

            {/* 8. Watch Tomorrow Economic Calendar */}
            <EconomicCalendarSection
              events={sections.watch_tomorrow}
              title="Events to Watch Tomorrow"
              subtitle="Key Upcoming Corporate & Economic Triggers"
              isLoading={isLoading}
            />

            {/* 9. Market Drivers / Headlines Recap */}
            <MarketNewsImpactSection
              headlines={sections.market_news_impact || sections.key_news_recap}
              title="End-of-Day Market Drivers & News Synthesis"
              isLoading={isLoading}
            />
          </div>
        )}

        {/* SEBI Compliance Statutory Disclaimer */}
        <SEBIDisclaimerCard
          disclaimer={currentReport?.disclaimer}
          sourceProviders={currentReport?.source_providers}
        />
      </main>

      <Footer />
    </div>
  );
};

export default MarketReportsPage;
