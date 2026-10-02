import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMarketMovers, MoverTab } from '@/hooks/market/useMarketMovers';
import { MOVER_FILTERS, getFilterDisplayName } from '@/config/market.config';
import { MiniSparklineChart } from '@/components/market/MiniSparklineChart';
import { AddStockToWatchlistModal } from '@/components/market/AddStockToWatchlistModal';
import {
  ChevronDown,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  BarChart2,
  Bookmark,
  Loader2,
  Plus,
} from 'lucide-react';

export const TopMoversSection: React.FC = () => {
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [activeTab, setActiveTab] = useState<MoverTab>('gainers');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Watchlist modal state
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [selectedStockForWatchlist, setSelectedStockForWatchlist] = useState<{
    symbol: string;
    name?: string;
    exchange?: string;
  } | null>(null);

  // Hook fetches real-time movers directly from backend /api/v1/market/movers
  const { displayedQuotes: displayedStocks, isLoading } = useMarketMovers(
    selectedFilter,
    activeTab,
    6
  );

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

  const handleRowClick = (symbol: string) => {
    const cleanSym = symbol.trim().toUpperCase().replace('.NS', '').replace('.BO', '');
    navigate(`/stock/${encodeURIComponent(cleanSym)}`);
  };

  const handleSeeMore = () => {
    navigate(`/gainers-losers?tab=${activeTab}&index=${encodeURIComponent(selectedFilter)}`);
  };

  // Generate color palette for company logo box based on symbol string
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
    <section className="space-y-4">
      {/* Title */}
      <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#111111]">
        Top movers today
      </h2>

      {/* Filter Row: Pills (Gainers, Losers, Volume shockers) + Market Dropdown (NIFTY 100 ∨) */}
      <div className="flex flex-wrap items-center justify-between gap-3 relative z-30">
        <div className="flex flex-wrap items-center gap-2 py-0.5">
          {/* Gainers Pill */}
          <button
            type="button"
            onClick={() => setActiveTab('gainers')}
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
            onClick={() => setActiveTab('losers')}
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
            onClick={() => setActiveTab('volume')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer border ${
              activeTab === 'volume'
                ? 'bg-[#0A1D37] border-[#0A1D37] text-white shadow-2xs font-bold'
                : 'bg-white border-[#E5E5E5] text-[#5F6368] hover:text-[#0A1D37] hover:border-[#0A1D37]'
            }`}
          >
            Volume shockers
          </button>

          {/* Market Dropdown Pill Button (NIFTY 100 ∨) */}
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
                        setSelectedFilter(filter.id);
                        setDropdownOpen(false);
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
      </div>

      {/* Main Table Container (Exact Match to Uploaded Design) */}
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
              {isLoading ? (
                [1, 2, 3, 4, 5, 6].map((i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-[#F5F5F3] rounded-lg shrink-0" />
                        <div className="h-4 bg-[#F5F5F3] rounded w-32" />
                      </div>
                    </td>
                    <td className="py-4 px-4 hidden sm:table-cell">
                      <div className="h-4 bg-[#F5F5F3] rounded w-24 mx-auto" />
                    </td>
                    <td className="py-4 px-5 text-right">
                      <div className="h-4 bg-[#F5F5F3] rounded w-20 ml-auto" />
                    </td>
                    <td className="py-4 px-5 text-right">
                      <div className="h-4 bg-[#F5F5F3] rounded w-16 ml-auto" />
                    </td>
                  </tr>
                ))
              ) : displayedStocks.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-xs text-[#888888]">
                    No market movers available for {selectedFilter} ({activeTab}).
                  </td>
                </tr>
              ) : (
                displayedStocks.map((quote) => {
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

                      {/* Save to Watchlist Action Column */}
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
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Link matching reference image ("See more >") */}
      <div>
        <button
          type="button"
          onClick={handleSeeMore}
          className="inline-flex items-center gap-1 text-sm font-bold text-[#0A1D37] hover:text-[#0A1D37]/80 transition-colors cursor-pointer"
        >
          <span>See more</span>
          <ChevronRight className="w-4 h-4 stroke-[2.5]" />
        </button>
      </div>

      {/* Save to Watchlist Modal */}
      <AddStockToWatchlistModal
        isOpen={saveModalOpen}
        onClose={() => {
          setSaveModalOpen(false);
          setSelectedStockForWatchlist(null);
        }}
        stock={selectedStockForWatchlist}
      />
    </section>
  );
};
