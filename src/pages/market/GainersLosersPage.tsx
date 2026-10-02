import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { useMarketMovers, MoverTab } from '@/hooks/market/useMarketMovers';
import { MOVER_FILTERS, resolveMoverFilter, getFilterDisplayName } from '@/config/market.config';
import { MiniSparklineChart } from '@/components/market/MiniSparklineChart';
import { AddStockToWatchlistModal } from '@/components/market/AddStockToWatchlistModal';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Building2,
  BarChart2,
  Bookmark,
} from 'lucide-react';

const ITEMS_PER_PAGE = 25;

export const GainersLosersPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Read URL query params & resolve to valid backend filter ID
  const rawIndex = searchParams.get('index');
  const initialIndex = resolveMoverFilter(rawIndex);
  const initialTab = (searchParams.get('tab') as MoverTab) || 'gainers';

  const [selectedFilter, setSelectedFilter] = useState<string>(initialIndex);
  const [activeTab, setActiveTab] = useState<MoverTab>(initialTab);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Watchlist modal state
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [selectedStockForWatchlist, setSelectedStockForWatchlist] = useState<{
    symbol: string;
    name?: string;
    exchange?: string;
  } | null>(null);

  // Fetch real-time market movers from backend API GET /api/v1/market/movers
  const {
    displayedQuotes: quotes,
    isLoading,
    totalGainers,
    totalLosers,
    totalMostActive,
  } = useMarketMovers(selectedFilter, activeTab, 50);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sync state when URL params change
  useEffect(() => {
    const idxParam = searchParams.get('index');
    if (idxParam) {
      const resolved = resolveMoverFilter(idxParam);
      setSelectedFilter(resolved);
    }
    const tParam = searchParams.get('tab');
    if (tParam === 'gainers' || tParam === 'losers' || tParam === 'volume') {
      setActiveTab(tParam as MoverTab);
    }
  }, [searchParams]);

  // Reset pagination on filter or tab change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedFilter, activeTab]);

  // Total items count for active tab
  const totalItemsCount = useMemo(() => {
    if (activeTab === 'gainers') return totalGainers || quotes.length;
    if (activeTab === 'losers') return totalLosers || quotes.length;
    return totalMostActive || quotes.length;
  }, [activeTab, totalGainers, totalLosers, totalMostActive, quotes]);

  // Pagination calculation (25 stocks per page)
  const totalPages = Math.max(1, Math.ceil(quotes.length / ITEMS_PER_PAGE));
  const paginatedQuotes = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return quotes.slice(start, start + ITEMS_PER_PAGE);
  }, [quotes, currentPage]);

  const handleFilterChange = (filterId: string) => {
    setSelectedFilter(filterId);
    setDropdownOpen(false);
    setSearchParams({ index: filterId, tab: activeTab });
    setCurrentPage(1);
  };

  const handleTabChange = (tab: MoverTab) => {
    setActiveTab(tab);
    setSearchParams({ index: selectedFilter, tab });
    setCurrentPage(1);
  };

  const handleRowClick = (symbol: string) => {
    const cleanSym = symbol.trim().toUpperCase().replace('.NS', '').replace('.BO', '');
    navigate(`/stock/${encodeURIComponent(cleanSym)}`);
  };

  const getLogoStyle = (symbol: string) => {
    const colors = [
      'bg-blue-600 text-white',
      'bg-orange-600 text-white',
      'bg-emerald-600 text-white',
      'bg-purple-600 text-white',
      'bg-indigo-600 text-white',
      'bg-rose-600 text-white',
      'bg-teal-600 text-white',
      'bg-cyan-600 text-white',
    ];
    let hash = 0;
    for (let i = 0; i < symbol.length; i++) {
      hash = symbol.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#111111] flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-[1140px] mx-auto px-4 sm:px-6 py-8 w-full space-y-6">
        {/* Back Button & Header */}
        <div>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5F6368] hover:text-[#0A1D37] mb-3 cursor-pointer transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>

          <div className="pb-4 border-b border-[#E5E5E5] space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#111111]">
              Top movers today
            </h1>
            <p className="text-xs sm:text-sm text-[#5F6368] max-w-2xl">
              Live real-time market movers filtered across Indian market indices ({getFilterDisplayName(selectedFilter)}). Showing {quotes.length} stocks ({ITEMS_PER_PAGE} per page).
            </p>
          </div>
        </div>

        {/* Filter Row: Pills (Gainers, Losers, Volume shockers) + Market Dropdown */}
        <div className="flex flex-wrap items-center justify-between gap-3 relative z-30">
          <div className="flex flex-wrap items-center gap-2 py-0.5">
            {/* Gainers Pill */}
            <button
              type="button"
              onClick={() => handleTabChange('gainers')}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer border ${
                activeTab === 'gainers'
                  ? 'bg-[#0A1D37] border-[#0A1D37] text-white shadow-2xs font-bold'
                  : 'bg-white border-[#E5E5E5] text-[#5F6368] hover:text-[#0A1D37] hover:border-[#0A1D37]'
              }`}
            >
              Gainers
            </button>

            {/* Losers Pill */}
            <button
              type="button"
              onClick={() => handleTabChange('losers')}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer border ${
                activeTab === 'losers'
                  ? 'bg-[#0A1D37] border-[#0A1D37] text-white shadow-2xs font-bold'
                  : 'bg-white border-[#E5E5E5] text-[#5F6368] hover:text-[#0A1D37] hover:border-[#0A1D37]'
              }`}
            >
              Losers
            </button>

            {/* Volume Shockers Pill */}
            <button
              type="button"
              onClick={() => handleTabChange('volume')}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer border ${
                activeTab === 'volume'
                  ? 'bg-[#0A1D37] border-[#0A1D37] text-white shadow-2xs font-bold'
                  : 'bg-white border-[#E5E5E5] text-[#5F6368] hover:text-[#0A1D37] hover:border-[#0A1D37]'
              }`}
            >
              Volume shockers
            </button>

            {/* Market Dropdown Pill Button */}
            <div ref={dropdownRef} className="relative inline-block text-left ml-1 z-40">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setDropdownOpen(!dropdownOpen);
                }}
                className="px-4 py-1.5 rounded-full text-xs font-semibold bg-white border border-[#0A1D37]/40 text-[#0A1D37] hover:border-[#0A1D37] transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <span>{getFilterDisplayName(selectedFilter)}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-[#0A1D37] transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu Popup */}
              {dropdownOpen && (
                <div className="absolute left-0 top-full mt-1.5 w-52 bg-white border border-[#E5E5E5] rounded-xl shadow-2xl z-50 py-1.5 divide-y divide-[#F1F1EF] animate-in fade-in duration-100">
                  <div className="px-3.5 py-1.5 text-[10px] font-bold text-[#5F6368] uppercase tracking-wider bg-[#FAFAF8]">
                    Select Market Filter
                  </div>
                  <div className="py-1">
                    {MOVER_FILTERS.map((filter) => (
                      <button
                        key={filter.id}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFilterChange(filter.id);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-xs font-semibold transition-colors flex items-center justify-between cursor-pointer ${
                          selectedFilter === filter.id
                            ? 'bg-[#0A1D37] text-white'
                            : 'text-[#111111] hover:bg-[#FAFAF8] hover:text-[#0A1D37]'
                        }`}
                      >
                        <span>{filter.name}</span>
                        {selectedFilter === filter.id && (
                          <div className="w-1.5 h-1.5 rounded-full bg-white" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Items & Pagination Counter */}
          <div className="text-xs text-[#5F6368]">
            Showing{' '}
            <strong className="text-[#111111]">
              {quotes.length > 0
                ? `${(currentPage - 1) * ITEMS_PER_PAGE + 1} - ${Math.min(
                    currentPage * ITEMS_PER_PAGE,
                    quotes.length
                  )}`
                : '0'}
            </strong>{' '}
            of <strong className="text-[#111111]">{quotes.length}</strong> stocks in {getFilterDisplayName(selectedFilter)}
          </div>
        </div>

        {/* Real-time Data Table */}
        {isLoading ? (
          <div className="bg-white border border-[#E5E5E5] rounded-xl p-6 space-y-4 animate-pulse">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-9 bg-[#F5F5F3] rounded w-full" />
            ))}
          </div>
        ) : quotes.length === 0 ? (
          <div className="p-12 text-center bg-white border border-[#E5E5E5] rounded-xl text-xs text-[#5F6368] space-y-2">
            <Building2 className="w-8 h-8 mx-auto text-[#888888]" />
            <p className="font-semibold text-[#111111]">No stocks found for {getFilterDisplayName(selectedFilter)}</p>
            <p className="text-[11px] text-[#888888]">
              Try selecting a different index filter or sub-tab.
            </p>
          </div>
        ) : (
          <div className="bg-white border border-[#E5E5E5] rounded-xl overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#F1F1EF] text-[11px] font-medium text-[#888888]">
                    <th className="py-3 px-5 w-1/3">Company</th>
                    <th className="py-3 px-4 text-center hidden sm:table-cell">Chart</th>
                    <th className="py-3 px-5 text-right">Market price (1D)</th>
                    <th className="py-3 px-5 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F1EF] text-xs">
                  {paginatedQuotes.map((quote) => {
                    const isPositive = (quote.change ?? 0) >= 0;
                    const formattedPrice = quote.current_price?.toLocaleString('en-IN', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }) || '0.00';
                    const formattedChange = Math.abs(quote.change || 0).toFixed(2);
                    const formattedPercent = Math.abs(quote.change_percent || 0).toFixed(2);

                    return (
                      <tr
                        key={quote.symbol}
                        onClick={() => handleRowClick(quote.symbol)}
                        className="hover:bg-[#FAFAF8] transition-colors cursor-pointer group"
                      >
                        {/* Company Logo + Name */}
                        <td className="py-3.5 px-5">
                          <div className="flex items-center gap-3.5">
                            <div
                              className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 shadow-2xs ${getLogoStyle(
                                quote.symbol
                              )}`}
                            >
                              {quote.symbol.substring(0, 2)}
                            </div>
                            <div>
                              <span className="font-bold text-sm text-[#111111] group-hover:text-[#0A1D37] transition-colors block">
                                {quote.company_name || quote.symbol}
                              </span>
                              <span className="text-[11px] text-[#888888] block sm:hidden">
                                {quote.symbol}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Mini Sparkline Chart Column */}
                        <td className="py-3.5 px-4 text-center hidden sm:table-cell">
                          <MiniSparklineChart symbol={quote.symbol} isPositive={isPositive} />
                        </td>

                        {/* Market Price & Day Change */}
                        <td className="py-3.5 px-5 text-right">
                          <div className="text-sm font-bold text-[#111111]">
                            ₹{formattedPrice}
                          </div>
                          <div
                            className={`text-xs font-semibold ${
                              isPositive ? 'text-[#00B386]' : 'text-[#E53935]'
                            }`}
                          >
                            {isPositive ? '+' : '-'}{formattedChange} ({isPositive ? '+' : '-'}{formattedPercent}%)
                          </div>
                        </td>

                        {/* Save Action Column */}
                        <td className="py-3.5 px-5 text-right text-xs">
                          <button
                            type="button"
                            title="Save to Watchlist"
                            aria-label="Save to Watchlist"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedStockForWatchlist({
                                symbol: quote.symbol,
                                name: quote.company_name,
                                exchange: quote.exchange || 'NSE',
                              });
                              setSaveModalOpen(true);
                            }}
                            className="inline-flex items-center justify-center p-2 bg-[#F5F5F3] hover:bg-[#0A1D37] text-[#0A1D37] hover:text-white rounded-lg transition-all cursor-pointer shadow-2xs ml-auto"
                          >
                            <Bookmark className="w-4 h-4 stroke-[2.5]" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Clean Pagination Controls (25 Stocks per page) */}
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

      {/* Save to Watchlist Modal */}
      <AddStockToWatchlistModal
        isOpen={saveModalOpen}
        onClose={() => {
          setSaveModalOpen(false);
          setSelectedStockForWatchlist(null);
        }}
        stock={selectedStockForWatchlist}
      />

      <Footer />
    </div>
  );
};

export default GainersLosersPage;
