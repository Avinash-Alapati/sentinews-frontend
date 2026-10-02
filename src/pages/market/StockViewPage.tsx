import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { StockCandleChart } from '@/components/market/StockCandleChart';
import { StockQuote } from '@/types/market.types';
import { marketApi } from '@/services/api/market.api';
import { useRecentSearches } from '@/hooks/market/useRecentSearches';
import { getMarketStatusDetails, formatISTTimestamp } from '@/utils/marketHours';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowLeft,
  RefreshCw,
  Loader2,
  AlertCircle,
  Clock,
  ShieldCheck,
} from 'lucide-react';

export const StockViewPage: React.FC = () => {
  const navigate = useNavigate();
  const { symbol = 'RELIANCE' } = useParams<{ symbol: string }>();
  const cleanSymbol = symbol.trim().toUpperCase().replace('.NS', '').replace('.BO', '');

  const cached = marketApi.getCachedQuote(cleanSymbol);
  const [quote, setQuote] = useState<StockQuote | null>(() => cached || null);
  const [isLoading, setIsLoading] = useState<boolean>(() => !cached);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { addRecentSearch } = useRecentSearches();

  // Get real-time Indian market timing status (Asia/Kolkata)
  const marketStatus = getMarketStatusDetails();

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/market');
    }
  };

  const fetchStockQuote = useCallback(async (showLoader = true) => {
    try {
      if (showLoader) setIsLoading(true);
      else setIsRefreshing(true);
      setError(null);

      const data = await marketApi.getQuote(cleanSymbol);
      if (data) {
        setQuote(data);
        addRecentSearch(cleanSymbol);
      } else {
        setError(`Unable to retrieve quote data for symbol '${cleanSymbol}'.`);
      }
    } catch (err: any) {
      console.error('Error fetching stock quote from backend:', err);
      const msg =
        err.response?.data?.detail ||
        err.message ||
        `Unable to retrieve real-time quote for symbol '${cleanSymbol}'.`;
      setError(msg);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [cleanSymbol, addRecentSearch]);

  // Initial load
  useEffect(() => {
    fetchStockQuote(true);
  }, [cleanSymbol, fetchStockQuote]);

  // Controlled live polling during market hours (09:15 - 15:30 IST)
  useEffect(() => {
    if (!marketStatus.isLive) return;

    // Poll every 10 seconds during market hours
    const timer = setInterval(() => {
      fetchStockQuote(false);
    }, 10000);

    return () => clearInterval(timer);
  }, [marketStatus.isLive, fetchStockQuote]);

  // Price & Performance Comparison
  const isPositive = (quote?.change || 0) > 0;
  const isNegative = (quote?.change || 0) < 0;

  // Day Range Calculation
  let dayRangePercent = 50;
  if (
    quote?.day_high &&
    quote?.day_low &&
    quote.day_high > quote.day_low &&
    quote.current_price
  ) {
    dayRangePercent = Math.min(
      100,
      Math.max(
        0,
        ((quote.current_price - quote.day_low) /
          (quote.day_high - quote.day_low)) *
          100
      )
    );
  }

  // 52-Week Range Calculation
  let week52RangePercent = 50;
  if (
    quote?.fifty_two_week_high &&
    quote?.fifty_two_week_low &&
    quote.fifty_two_week_high > quote.fifty_two_week_low &&
    quote.current_price
  ) {
    week52RangePercent = Math.min(
      100,
      Math.max(
        0,
        ((quote.current_price - quote.fifty_two_week_low) /
          (quote.fifty_two_week_high - quote.fifty_two_week_low)) *
          100
      )
    );
  }

  // Logo box styling based on ticker symbol
  const getLogoStyle = (sym: string) => {
    const colors = [
      'bg-[#0A1D37] text-white',
      'bg-[#1E3A8A] text-white',
      'bg-[#0D9488] text-white',
      'bg-[#4F46E5] text-white',
      'bg-[#0284C7] text-white',
    ];
    let hash = 0;
    for (let i = 0; i < sym.length; i++) {
      hash = sym.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#111111] flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-[1140px] mx-auto px-4 sm:px-6 py-8 w-full space-y-6">
        {/* Back Link & Breadcrumbs */}
        <div className="flex items-center justify-between text-xs text-[#5F6368]">
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-1.5 hover:text-[#0A1D37] font-semibold transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <div className="text-[11px] uppercase tracking-wider">
            <span>Market Intelligence</span> / <span>Equities</span> /{' '}
            <strong className="text-[#0A1D37]">{cleanSymbol}</strong>
          </div>
        </div>

        {/* Skeleton Loading State */}
        {isLoading ? (
          <div className="space-y-6 animate-pulse">
            <div className="bg-white border border-[#E5E5E5] rounded-xl p-6 h-36" />
            <div className="bg-white border border-[#E5E5E5] rounded-xl p-6 h-96" />
          </div>
        ) : error ? (
          <div className="p-8 text-center bg-white border border-red-200 rounded-xl space-y-4 shadow-2xs">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
            <div>
              <h2 className="text-lg font-bold text-[#111111]">Quote Fetch Error</h2>
              <p className="text-xs text-[#5F6368] max-w-md mx-auto mt-1">{error}</p>
            </div>
            <button
              onClick={() => fetchStockQuote(true)}
              className="px-4 py-2 bg-[#0A1D37] text-white text-xs font-semibold rounded-lg hover:bg-[#071426] transition-colors cursor-pointer shadow-2xs"
            >
              Retry Connection
            </button>
          </div>
        ) : quote ? (
          <>
            {/* Header Quote Card (Original SentiNews Stock Header) */}
            <div className="bg-white border border-[#E5E5E5] rounded-xl p-6 shadow-2xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#F1F1EF]">
                {/* Logo & Company Name */}
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-base shrink-0 shadow-2xs ${getLogoStyle(
                      quote.symbol
                    )}`}
                  >
                    {quote.symbol.substring(0, 2)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h1 className="text-xl sm:text-2xl font-bold text-[#0A1D37] tracking-tight">
                        {quote.company_name}
                      </h1>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-[#5F6368]">
                      <span className="font-bold text-[#111111]">{quote.symbol}</span>
                      <span>•</span>
                      <span className="uppercase font-semibold px-2 py-0.5 rounded bg-[#FAFAF8] border border-[#E5E5E5] text-[#0A1D37]">
                        {quote.exchange || 'NSE'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Market Status Pill & Refresh Action */}
                <div className="flex items-center gap-3">
                  {/* Live Market Status Indicator */}
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full border bg-[#FAFAF8] text-xs font-semibold">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        marketStatus.isLive
                          ? 'bg-emerald-500 animate-pulse'
                          : 'bg-gray-400'
                      }`}
                    />
                    <span className="text-[#0A1D37]">{marketStatus.label}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => fetchStockQuote(false)}
                    disabled={isRefreshing}
                    className="p-2 text-[#5F6368] hover:text-[#0A1D37] bg-white border border-[#E5E5E5] hover:border-[#0A1D37] rounded-lg transition-all cursor-pointer shadow-2xs disabled:opacity-50"
                    title="Refresh quote"
                  >
                    <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Main Price & Day Change Row */}
              <div className="flex flex-wrap items-baseline justify-between gap-4">
                <div className="flex flex-wrap items-baseline gap-4">
                  <div className="text-3xl sm:text-4xl font-bold text-[#111111] tracking-tight">
                    ₹
                    {quote.current_price?.toLocaleString('en-IN', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </div>

                  <div
                    className={`inline-flex items-center gap-1.5 text-base font-bold ${
                      isPositive
                        ? 'text-[#00B386]'
                        : isNegative
                        ? 'text-[#E53935]'
                        : 'text-[#5F6368]'
                    }`}
                  >
                    {isPositive ? (
                      <TrendingUp className="w-5 h-5 stroke-[2.5]" />
                    ) : isNegative ? (
                      <TrendingDown className="w-5 h-5 stroke-[2.5]" />
                    ) : (
                      <Minus className="w-5 h-5 stroke-[2.5]" />
                    )}
                    <span>
                      {isPositive ? '+' : isNegative ? '-' : ''}₹
                      {Math.abs(quote.change || 0).toFixed(2)}
                    </span>
                    <span>
                      ({isPositive ? '+' : isNegative ? '-' : ''}
                      {Math.abs(quote.change_percent || 0).toFixed(2)}%)
                    </span>
                    <span className="text-xs font-normal text-[#5F6368] ml-1">1D</span>
                  </div>
                </div>

                {/* Last Updated Timestamp */}
                <div className="text-xs text-[#5F6368] flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#888888]" />
                  <span>
                    {marketStatus.isLive
                      ? 'Live IST Market Feed'
                      : `Last updated: ${formatISTTimestamp(quote.timestamp || new Date())}`}
                  </span>
                </div>
              </div>
            </div>

            {/* SECTION 1: Interactive Stock Chart Diagram */}
            <StockCandleChart
              symbol={cleanSymbol}
              currentPrice={quote.current_price}
              previousClose={quote.previous_close}
              quote={quote}
            />

            {/* SECTION 2: Key Fundamentals & Ranges */}
            <div className="bg-white border border-[#E5E5E5] rounded-xl p-6 shadow-2xs space-y-6">
              <h2 className="text-sm font-bold text-[#111111] uppercase tracking-wider border-b border-[#F1F1EF] pb-3">
                Key Market Statistics & Ranges
              </h2>

              {/* Day High/Low & 52W High/Low Range Sliders */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-4 border-b border-[#F1F1EF]">
                {/* Day Range */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold text-[#111111]">
                    <span>Day Low: ₹{quote.day_low?.toLocaleString('en-IN') || '—'}</span>
                    <span>Day High: ₹{quote.day_high?.toLocaleString('en-IN') || '—'}</span>
                  </div>
                  <div className="h-2 w-full bg-[#F5F5F3] rounded-full overflow-hidden relative border border-[#E5E5E5]">
                    <div
                      className="h-full bg-[#0A1D37] rounded-full"
                      style={{ width: `${dayRangePercent}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-[#888888] block text-right">
                    Current Price: {dayRangePercent.toFixed(0)}% of Day Range
                  </span>
                </div>

                {/* 52-Week Range */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold text-[#111111]">
                    <span>52W Low: ₹{quote.fifty_two_week_low?.toLocaleString('en-IN') || '—'}</span>
                    <span>52W High: ₹{quote.fifty_two_week_high?.toLocaleString('en-IN') || '—'}</span>
                  </div>
                  <div className="h-2 w-full bg-[#F5F5F3] rounded-full overflow-hidden relative border border-[#E5E5E5]">
                    <div
                      className="h-full bg-[#0A1D37] rounded-full"
                      style={{ width: `${week52RangePercent}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-[#888888] block text-right">
                    Current Price: {week52RangePercent.toFixed(0)}% of 52-Week Range
                  </span>
                </div>
              </div>

              {/* Key Statistics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-3.5 bg-[#FAFAF8] border border-[#E5E5E5] rounded-lg space-y-1">
                  <span className="text-[10px] font-bold uppercase text-[#5F6368] block">
                    OPEN PRICE
                  </span>
                  <span className="text-sm font-bold text-[#111111]">
                    ₹{quote.open_price?.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '—'}
                  </span>
                </div>

                <div className="p-3.5 bg-[#FAFAF8] border border-[#E5E5E5] rounded-lg space-y-1">
                  <span className="text-[10px] font-bold uppercase text-[#5F6368] block">
                    PREVIOUS CLOSE
                  </span>
                  <span className="text-sm font-bold text-[#111111]">
                    ₹{quote.previous_close?.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '—'}
                  </span>
                </div>

                <div className="p-3.5 bg-[#FAFAF8] border border-[#E5E5E5] rounded-lg space-y-1">
                  <span className="text-[10px] font-bold uppercase text-[#5F6368] block">
                    TRADING VOLUME
                  </span>
                  <span className="text-sm font-bold text-[#111111]">
                    {quote.volume ? quote.volume.toLocaleString('en-IN') : '—'}
                  </span>
                </div>

                <div className="p-3.5 bg-[#FAFAF8] border border-[#E5E5E5] rounded-lg space-y-1">
                  <span className="text-[10px] font-bold uppercase text-[#5F6368] block">
                    CURRENCY / EXCH
                  </span>
                  <span className="text-sm font-bold text-[#111111]">
                    {quote.currency || 'INR'} ({quote.exchange || 'NSE'})
                  </span>
                </div>
              </div>
            </div>
          </>
        ) : null}
      </main>

      <Footer />
    </div>
  );
};

export default StockViewPage;
