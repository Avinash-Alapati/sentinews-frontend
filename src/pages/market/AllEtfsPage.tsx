import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ETFQuote } from '@/types/market.types';
import { marketApi } from '@/services/api/market.api';
import {
  Layers,
  TrendingUp,
  TrendingDown,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Coins,
  Building2,
  Cpu,
  Globe,
  Search,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';

const ITEMS_PER_PAGE = 25;

const CATEGORIES_MAP: Record<string, string> = {
  All: 'All',
  broad_market: 'Broad Market',
  sectoral: 'Sectoral & Banking',
  gold: 'Gold',
  silver: 'Silver',
  debt: 'Liquid & Debt',
  global: 'Global Indices',
  smart_beta: 'Factor & Smart Beta',
};

export const AllEtfsPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);

  const [etfs, setEtfs] = useState<ETFQuote[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch real-time ETFs from backend API /market/etfs
  const fetchETFs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const categoryParam = selectedCategory === 'All' ? undefined : selectedCategory;
      const res = await marketApi.getETFs({
        category: categoryParam,
        search: debouncedSearch || undefined,
        limit: ITEMS_PER_PAGE,
        offset: (currentPage - 1) * ITEMS_PER_PAGE,
      });

      setEtfs(res.items || []);
      setTotalCount(res.total_count || res.items?.length || 0);

      if (res.available_categories && res.available_categories.length > 0) {
        setAvailableCategories(res.available_categories);
      }
    } catch (err: any) {
      console.error('Failed fetching ETFs from backend:', err);
      setError('Unable to load ETFs from backend market API.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategory, debouncedSearch, currentPage]);

  useEffect(() => {
    fetchETFs();
  }, [fetchETFs]);

  const totalPages = Math.max(1, Math.ceil(totalCount / ITEMS_PER_PAGE));

  const handleRowClick = (symbol: string) => {
    const cleanSym = symbol.trim().toUpperCase().replace('.NS', '').replace('.BO', '');
    navigate(`/stock/${encodeURIComponent(cleanSym)}`);
  };

  const getEtfIcon = (symbol: string, category: string) => {
    const sym = symbol.toUpperCase();
    const cat = category.toLowerCase();
    if (sym.includes('GOLD') || cat.includes('gold')) {
      return <Coins className="w-4 h-4 text-amber-600" />;
    }
    if (sym.includes('SILVER') || cat.includes('silver')) {
      return <Coins className="w-4 h-4 text-slate-500" />;
    }
    if (sym.includes('BANK') || sym.includes('BNK') || cat.includes('bank')) {
      return <Building2 className="w-4 h-4 text-blue-600" />;
    }
    if (sym.includes('IT') || sym.includes('TECH') || cat.includes('tech')) {
      return <Cpu className="w-4 h-4 text-indigo-600" />;
    }
    if (sym.includes('MON') || sym.includes('GLOBAL') || cat.includes('global')) {
      return <Globe className="w-4 h-4 text-emerald-600" />;
    }
    return <Layers className="w-4 h-4 text-[#0A1D37]" />;
  };

  const categoryFilterList = [
    'All',
    ...Array.from(new Set(availableCategories.length > 0 ? availableCategories : ['broad_market', 'sectoral', 'gold', 'silver', 'debt', 'global', 'smart_beta'])),
  ];

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#111111] flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-[1140px] mx-auto px-4 sm:px-6 py-6 w-full space-y-6">
        {/* Back Link & Header */}
        <div>
          <button
            type="button"
            onClick={() => navigate('/market')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5F6368] hover:text-[#0A1D37] mb-3 cursor-pointer transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Market Overview</span>
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E5E5]">
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#111111]">
                Explore Exchange Traded Funds (ETFs)
              </h1>
              <p className="text-xs sm:text-sm text-[#5F6368] max-w-2xl">
                Real-time ETF quotes, underlying benchmark assets, NAV, and market performance fetched live from Sentinews Backend API.
              </p>
            </div>

            <button
              onClick={fetchETFs}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white border border-[#D1D5DB] hover:bg-[#F3F4F6] text-xs font-medium text-[#374151] transition-colors shrink-0 self-start sm:self-auto"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Filter Controls: Categories & Search Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            {categoryFilterList.map((catKey) => {
              const isSelected = selectedCategory === catKey;
              const label = CATEGORIES_MAP[catKey] || catKey.replace('_', ' ').toUpperCase();

              return (
                <button
                  key={catKey}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(catKey);
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                    isSelected
                      ? 'bg-[#0A1D37] text-white shadow-2xs font-bold'
                      : 'bg-white border border-[#E5E5E5] text-[#5F6368] hover:text-[#111111] hover:border-[#0A1D37]'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-64 shrink-0">
            <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search ETF symbol or index..."
              className="w-full bg-white border border-[#E5E5E5] rounded-lg pl-9 pr-3 py-1.5 text-xs text-[#111111] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#0A1D37]"
            />
          </div>
        </div>

        {/* Error Callout */}
        {error && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3.5 text-xs text-amber-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={fetchETFs}
              className="text-xs font-semibold text-amber-900 underline hover:no-underline"
            >
              Retry
            </button>
          </div>
        )}

        {/* Real-Time ETF Table */}
        {isLoading ? (
          <div className="bg-white border border-[#E5E5E5] rounded-xl p-6 space-y-4 animate-pulse">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-9 bg-[#F5F5F3] rounded w-full" />
            ))}
          </div>
        ) : etfs.length === 0 ? (
          <div className="bg-white border border-[#E5E5E5] rounded-xl p-12 text-center text-xs text-[#64748B]">
            No ETFs found matching your selected filters.
          </div>
        ) : (
          <div className="bg-white border border-[#E5E5E5] rounded-xl overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F9F9F8] border-b border-[#E5E5E5] text-[11px] font-semibold text-[#5F6368] uppercase tracking-wider font-mono">
                    <th className="py-3.5 px-5">ETF Ticker & Underlying Asset</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4 text-right">Price (₹)</th>
                    <th className="py-3.5 px-4 text-right">Change (%)</th>
                    <th className="py-3.5 px-4 text-right hidden sm:table-cell">NAV (₹)</th>
                    <th className="py-3.5 px-4 text-right hidden sm:table-cell">Day High / Low</th>
                    <th className="py-3.5 px-4 text-right hidden md:table-cell">Volume</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F1EF] text-xs">
                  {etfs.map((etf) => {
                    const changeVal = etf.change || 0;
                    const changePct = etf.change_percent || 0;
                    const isPositive = changeVal >= 0;

                    const formattedPrice = (etf.last_price || 0).toLocaleString('en-IN', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    });

                    const formattedNav = etf.nav
                      ? etf.nav.toLocaleString('en-IN', { minimumFractionDigits: 2 })
                      : '—';

                    const formattedVolume = etf.volume
                      ? (etf.volume / 1000).toFixed(0) + 'K'
                      : '—';

                    const catLabel = CATEGORIES_MAP[etf.category] || etf.category.replace('_', ' ').toUpperCase();

                    return (
                      <tr
                        key={etf.symbol}
                        onClick={() => handleRowClick(etf.symbol)}
                        className="hover:bg-[#FAFAF8] transition-colors cursor-pointer group"
                      >
                        <td className="py-3.5 px-5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-[#F5F5F3] border border-[#E5E5E5] flex items-center justify-center shrink-0">
                              {getEtfIcon(etf.symbol, etf.category)}
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="font-bold text-sm text-[#0A1D37] group-hover:text-[#2563EB] group-hover:underline truncate max-w-[280px]">
                                {etf.symbol}
                              </span>
                              <span className="text-[11px] text-[#5F6368] block truncate max-w-[280px]">
                                {etf.underlying_asset || etf.symbol}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-[10px] uppercase text-[#5F6368]">
                          <span className="px-2 py-0.5 rounded bg-[#F5F5F3] border border-[#E5E5E5] font-semibold">
                            {catLabel}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right font-bold text-sm text-[#111111]">
                          ₹{formattedPrice}
                        </td>

                        <td className="py-3.5 px-4 text-right font-semibold">
                          <span
                            className={`inline-flex items-center justify-end gap-1 ${
                              isPositive ? 'text-[#00B386]' : 'text-[#E53935]'
                            }`}
                          >
                            {isPositive ? (
                              <TrendingUp className="w-3.5 h-3.5 stroke-[2.2]" />
                            ) : (
                              <TrendingDown className="w-3.5 h-3.5 stroke-[2.2]" />
                            )}
                            <span>
                              {isPositive ? '+' : ''}₹{Math.abs(changeVal).toFixed(2)} ({isPositive ? '+' : ''}{changePct.toFixed(2)}%)
                            </span>
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right text-[#5F6368] hidden sm:table-cell font-mono">
                          {formattedNav !== '—' ? `₹${formattedNav}` : '—'}
                        </td>

                        <td className="py-3.5 px-4 text-right text-[#5F6368] hidden sm:table-cell font-mono text-[11px]">
                          {etf.high && etf.low
                            ? `₹${etf.high.toFixed(1)} / ₹${etf.low.toFixed(1)}`
                            : '—'}
                        </td>

                        <td className="py-3.5 px-4 text-right text-[#5F6368] hidden md:table-cell font-mono">
                          {formattedVolume}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t border-[#E5E5E5]">
            <button
              type="button"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0A1D37] hover:text-[#0A1D37]/80 bg-white border border-[#E5E5E5] px-3.5 py-2 rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-2xs"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <div className="flex items-center gap-1.5 text-xs font-medium text-[#5F6368]">
              <span>
                Page <strong className="text-[#111111]">{currentPage}</strong> of{' '}
                <strong className="text-[#111111]">{totalPages}</strong>
              </span>
              <span className="text-[11px] text-[#94A3B8]">({totalCount} ETFs total)</span>
            </div>

            <button
              type="button"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0A1D37] hover:text-[#0A1D37]/80 bg-white border border-[#E5E5E5] px-3.5 py-2 rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-2xs"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default AllEtfsPage;
