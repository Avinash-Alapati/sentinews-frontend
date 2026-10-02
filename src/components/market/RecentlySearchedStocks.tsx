import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { StockQuote, StockSearchResult } from '@/types/market.types';
import { marketApi } from '@/services/api/market.api';
import {
  Search,
  TrendingUp,
  TrendingDown,
  Minus,
  X,
  RefreshCw,
  Loader2,
  Trash2,
  Clock,
} from 'lucide-react';

interface RecentlySearchedStocksProps {
  quotes: StockQuote[];
  recentSymbols: string[];
  isLoading: boolean;
  error: string | null;
  onAddSearch: (symbol: string) => void;
  onRemoveSearch: (symbol: string) => void;
  onClearSearches: () => void;
  onRefresh: () => void;
}

export const RecentlySearchedStocks: React.FC<RecentlySearchedStocksProps> = ({
  quotes,
  recentSymbols,
  isLoading,
  error,
  onAddSearch,
  onRemoveSearch,
  onClearSearches,
  onRefresh,
}) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<StockSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search API call to sentinews_backend
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setDropdownOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setIsSearching(true);
        const results = await marketApi.searchStocks(searchQuery.trim());
        setSearchResults(results);
        setDropdownOpen(true);
      } catch (err) {
        console.error('Error searching stocks via backend:', err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelectStock = (symbol: string) => {
    onAddSearch(symbol);
    setSearchQuery('');
    setDropdownOpen(false);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onAddSearch(searchQuery.trim());
      setSearchQuery('');
      setDropdownOpen(false);
    }
  };

  return (
    <section className="space-y-4">
      {/* Header & Search Input Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E5E5E5]">
        <div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#0A1D37]" />
            <h2 className="text-lg font-semibold tracking-tight text-[#111111]">
              Most Recently Searched Stocks
            </h2>
          </div>
          <p className="text-[11px] text-[#5F6368] mt-0.5">
            Real-time live quotes fetched from Sentinews Backend API
          </p>
        </div>

        {/* Compact Search input with backend autocomplete */}
        <div ref={searchRef} className="relative w-full sm:w-72 z-20">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#888888]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery.trim() && setDropdownOpen(true)}
              placeholder="Search symbol (e.g. RELIANCE)..."
              className="w-full pl-8 pr-7 py-1.5 bg-white border border-[#E5E5E5] rounded-sm text-xs placeholder:text-[#888888] focus:outline-none focus:border-[#0A1D37] shadow-2xs"
            />
            {isSearching ? (
              <Loader2 className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 animate-spin text-[#666666]" />
            ) : (
              searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#888888] hover:text-[#111111]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )
            )}
          </form>

          {/* Autocomplete Dropdown */}
          {dropdownOpen && searchResults.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-[#E5E5E5] rounded-sm shadow-lg max-h-56 overflow-y-auto divide-y divide-[#F1F1EF] z-50">
              {searchResults.map((item) => (
                <button
                  key={`${item.exchange}-${item.symbol}`}
                  type="button"
                  onClick={() => handleSelectStock(item.symbol)}
                  className="w-full text-left px-3 py-2 hover:bg-[#FAFAF8] transition-colors flex items-center justify-between cursor-pointer"
                >
                  <div className="flex flex-col min-w-0">
                    <span className="font-semibold text-xs text-[#0A1D37] truncate max-w-[200px]">
                      {item.name || item.symbol}
                    </span>
                    <span className="text-[10px] text-[#5F6368] block">
                      {item.symbol}
                    </span>
                  </div>
                  <span className="text-[9px] font-medium uppercase px-1.5 py-0.5 rounded bg-[#F5F5F3] border border-[#E5E5E5] text-[#5F6368]">
                    {item.exchange}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Action Controls Bar */}
      <div className="flex items-center justify-between text-xs">
        <span className="text-[#5F6368] text-[11px]">
          Showing <strong className="text-[#111111]">{Math.min(quotes.length, 2)}</strong> recent stock quotes
        </span>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onRefresh}
            disabled={isLoading}
            className="inline-flex items-center gap-1 text-[11px] text-[#5F6368] hover:text-[#0A1D37] bg-white border border-[#E5E5E5] px-2.5 py-1 rounded-sm cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Update Quotes</span>
          </button>

          {recentSymbols.length > 0 && (
            <button
              type="button"
              onClick={onClearSearches}
              className="inline-flex items-center gap-1 text-[11px] text-rose-600 hover:text-rose-800 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-sm cursor-pointer"
            >
              <Trash2 className="w-3 h-3" />
              <span>Clear History</span>
            </button>
          )}
        </div>
      </div>

      {/* Loading Skeleton Table */}
      {isLoading && quotes.length === 0 ? (
        <div className="bg-white border border-[#E5E5E5] rounded-sm p-4 space-y-3 animate-pulse">
          {[1, 2].map((idx) => (
            <div key={idx} className="h-8 bg-[#F5F5F3] rounded-xs w-full" />
          ))}
        </div>
      ) : quotes.length > 0 ? (
        /* CLEAN TABLE VIEW FOR RECENTLY SEARCHED STOCKS (Only 2 stocks!) */
        <div className="bg-white border border-[#E5E5E5] rounded-sm overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F9F9F8] border-b border-[#E5E5E5] text-[11px] font-semibold text-[#5F6368] uppercase tracking-wider">
                  <th className="py-3 px-4">Symbol / Company</th>
                  <th className="py-3 px-4">Exchange</th>
                  <th className="py-3 px-4 text-right">Price</th>
                  <th className="py-3 px-4 text-right">Change (%)</th>
                  <th className="py-3 px-4 text-right hidden sm:table-cell">Day High</th>
                  <th className="py-3 px-4 text-right hidden sm:table-cell">Day Low</th>
                  <th className="py-3 px-4 text-right hidden md:table-cell">Volume</th>
                  <th className="py-3 px-4 text-center w-12">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F1EF] text-xs font-sans">
                {quotes.slice(0, 2).map((quote) => {
                  const isPositive = quote.change > 0;
                  const isNegative = quote.change < 0;

                  const formattedPrice = quote.current_price?.toLocaleString('en-IN', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }) || '0.00';

                  const formattedChange = Math.abs(quote.change || 0).toFixed(2);
                  const formattedPercent = Math.abs(quote.change_percent || 0).toFixed(2);

                  return (
                    <tr
                      key={quote.symbol}
                      onClick={() => {
                        const cleanSym = quote.symbol.trim().toUpperCase().replace('.NS', '').replace('.BO', '');
                        navigate(`/stock/${encodeURIComponent(cleanSym)}`);
                      }}
                      className="hover:bg-[#FAFAF8] transition-colors group cursor-pointer"
                    >
                      <td className="py-3 px-4">
                        <div className="flex flex-col min-w-0">
                          <span className="font-bold text-sm text-[#0A1D37] truncate max-w-[220px]">
                            {quote.company_name || quote.symbol}
                          </span>
                          <span className="text-[11px] text-[#5F6368] block">
                            {quote.symbol}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-[10px] uppercase text-[#5F6368]">
                        <span className="px-1.5 py-0.5 rounded bg-[#F5F5F3] border border-[#E5E5E5]">
                          {quote.exchange || 'NSE'}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right font-bold text-sm text-[#111111]">
                        ₹{formattedPrice}
                      </td>

                      <td className="py-3 px-4 text-right font-semibold">
                        <span
                          className={`inline-flex items-center justify-end gap-1 ${
                            isPositive
                              ? 'text-emerald-700'
                              : isNegative
                              ? 'text-rose-700'
                              : 'text-[#5F6368]'
                          }`}
                        >
                          {isPositive ? (
                            <TrendingUp className="w-3.5 h-3.5 stroke-[2.2]" />
                          ) : isNegative ? (
                            <TrendingDown className="w-3.5 h-3.5 stroke-[2.2]" />
                          ) : (
                            <Minus className="w-3.5 h-3" />
                          )}
                          <span>
                            {isPositive ? '+' : isNegative ? '-' : ''}₹{formattedChange}
                          </span>
                          <span>
                            ({isPositive ? '+' : isNegative ? '-' : ''}
                            {formattedPercent}%)
                          </span>
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right text-[#5F6368] hidden sm:table-cell">
                        {quote.day_high ? `₹${quote.day_high.toLocaleString('en-IN')}` : '—'}
                      </td>

                      <td className="py-3 px-4 text-right text-[#5F6368] hidden sm:table-cell">
                        {quote.day_low ? `₹${quote.day_low.toLocaleString('en-IN')}` : '—'}
                      </td>

                      <td className="py-3 px-4 text-right text-[#5F6368] hidden md:table-cell">
                        {quote.volume ? (quote.volume / 1000).toFixed(0) + 'K' : '—'}
                      </td>

                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemoveSearch(quote.symbol);
                          }}
                          className="text-[#888888] hover:text-rose-600 transition-colors p-1 cursor-pointer"
                          title="Remove stock"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="p-6 text-center bg-white border border-[#E5E5E5] rounded-sm text-xs text-[#5F6368] space-y-2">
          <Search className="w-6 h-6 mx-auto text-[#888888]" />
          <div>
            <h4 className="font-semibold text-[#111111]">No Searched Stocks</h4>
            <p className="text-[11px] text-[#666666] mt-0.5">
              Search any stock ticker above (e.g. RELIANCE, TCS, INFY) to load live quotes into your table.
            </p>
          </div>
        </div>
      )}
    </section>
  );
};
