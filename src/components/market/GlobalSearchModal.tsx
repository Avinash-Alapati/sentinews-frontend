import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { StockSearchResult } from '@/types/market.types';
import { marketApi } from '@/services/api/market.api';
import { useRecentSearches } from '@/hooks/market/useRecentSearches';
import {
  Search,
  X,
  TrendingUp,
  Loader2,
  Building2,
  Globe as GlobeIcon,
  Layers,
} from 'lucide-react';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TRENDING_SEARCHES = [
  { symbol: 'NIFTY 50', name: 'NSE Benchmark Index', type: 'INDEX' },
  { symbol: 'SENSEX', name: 'BSE Benchmark Index', type: 'INDEX' },
  { symbol: 'RELIANCE', name: 'Reliance Industries Ltd', type: 'STOCK' },
  { symbol: 'TCS', name: 'Tata Consultancy Services Ltd', type: 'STOCK' },
  { symbol: 'INFY', name: 'Infosys Ltd', type: 'STOCK' },
  { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd', type: 'STOCK' },
  { symbol: 'ICICIBANK', name: 'ICICI Bank Ltd', type: 'STOCK' },
  { symbol: 'TATAMOTORS', name: 'Tata Motors Ltd', type: 'STOCK' },
  { symbol: 'ZOMATO', name: 'Zomato Ltd', type: 'STOCK' },
];

const CATEGORIES = ['All', 'Stocks', 'Indices', 'ETF'];

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
}) => {
  const navigate = useNavigate();
  const { addRecentSearch } = useRecentSearches();

  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [results, setResults] = useState<StockSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input automatically when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults([]);
      setSelectedCategory('All');
    }
  }, [isOpen]);

  // Debounced search query to sentinews_backend
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setIsLoading(true);
        const data = await marketApi.searchStocks(query.trim());
        setResults(data);
      } catch (err) {
        console.error('Failed to search stocks via backend:', err);
      } finally {
        setIsLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  // Filter search results by category pill
  const filteredResults = results.filter((item) => {
    if (selectedCategory === 'All') return true;
    if (selectedCategory === 'Stocks') return item.instrument_type !== 'INDEX' && item.instrument_type !== 'ETF';
    if (selectedCategory === 'Indices') return item.instrument_type === 'INDEX' || item.symbol.startsWith('NIFTY') || item.symbol.startsWith('SENSEX');
    if (selectedCategory === 'ETF') return item.instrument_type === 'ETF' || item.name.toUpperCase().includes('ETF');
    return true;
  });

  const handleSelectItem = (symbol: string, isIndex = false) => {
    const cleanSym = symbol.trim().toUpperCase().replace('.NS', '').replace('.BO', '');
    addRecentSearch(cleanSym);
    onClose();

    if (isIndex || cleanSym.startsWith('^') || cleanSym === 'NIFTY 50' || cleanSym === 'SENSEX') {
      navigate('/indices');
    } else {
      navigate(`/stock/${encodeURIComponent(cleanSym)}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-start sm:items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div
        className="bg-white text-[#111111] max-w-xl w-full rounded-lg shadow-2xl overflow-hidden border border-[#E5E5E5] flex flex-col my-auto max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header Input */}
        <div className="p-4 sm:p-5 border-b border-[#E5E5E5] relative flex items-center gap-3">
          <Search className="w-5 h-5 text-[#888888] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search SentiNews (stocks, indices, ETF)..."
            className="w-full text-base font-medium text-[#111111] placeholder:text-[#888888] focus:outline-none bg-transparent"
          />
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-[#0A1D37] shrink-0" />
          ) : (
            <button
              type="button"
              onClick={() => {
                if (query) {
                  setQuery('');
                  inputRef.current?.focus();
                } else {
                  onClose();
                }
              }}
              className="p-1.5 bg-[#F5F5F3] hover:bg-[#EAEAE8] text-[#5F6368] hover:text-[#111111] rounded-full transition-colors shrink-0 cursor-pointer"
              title={query ? 'Clear search' : 'Close modal'}
              aria-label={query ? 'Clear search' : 'Close modal'}
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category Filter Pills (All, Stocks, Indices, ETF) */}
        <div className="px-4 py-3 bg-[#FAFAF8] border-b border-[#E5E5E5] flex items-center gap-2 overflow-x-auto no-scrollbar">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-[#0A1D37] text-white shadow-2xs'
                    : 'bg-white border border-[#E5E5E5] text-[#5F6368] hover:text-[#111111] hover:border-[#0A1D37]'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Search Results / Trending Searches Area */}
        <div className="p-4 sm:p-5 overflow-y-auto max-h-[55vh] space-y-4">
          {query.trim() ? (
            /* Live Search Results from sentinews_backend */
            <div className="space-y-2">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-[#888888] px-1">
                Search Results ({filteredResults.length})
              </div>

              {filteredResults.length === 0 ? (
                <div className="py-8 text-center text-xs text-[#5F6368] space-y-1">
                  <Building2 className="w-6 h-6 mx-auto text-[#888888]" />
                  <p>No securities found matching "{query}".</p>
                  <p className="text-[11px] text-[#888888]">
                    Try searching with popular tickers like RELIANCE, TCS, INFY, or HDFCBANK.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-[#F1F1EF] border border-[#E5E5E5] rounded-md overflow-hidden bg-white">
                  {filteredResults.map((item) => {
                    const isIdx = item.instrument_type === 'INDEX' || item.symbol.startsWith('NIFTY') || item.symbol.startsWith('SENSEX');
                    return (
                      <button
                        key={`${item.exchange}-${item.symbol}`}
                        type="button"
                        onClick={() => handleSelectItem(item.symbol, isIdx)}
                        className="w-full px-4 py-3 text-left hover:bg-[#FAFAF8] transition-colors flex items-center justify-between group cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#F5F5F3] border border-[#E5E5E5] flex items-center justify-center text-[#0A1D37] shrink-0">
                            {isIdx ? (
                              <GlobeIcon className="w-4 h-4" />
                            ) : (
                              <TrendingUp className="w-4 h-4 text-emerald-600" />
                            )}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="font-bold text-sm text-[#0A1D37] group-hover:underline truncate max-w-[300px] sm:max-w-[380px]">
                              {item.name || item.symbol}
                            </span>
                            <span className="text-xs text-[#5F6368] font-mono block">
                              {item.symbol}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[10px] font-mono font-medium uppercase px-2 py-0.5 rounded bg-[#F5F5F3] border border-[#E5E5E5] text-[#5F6368]">
                            {item.exchange || 'NSE'}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            /* Default View: Trending Searches (matching reference image!) */
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#5F6368] uppercase tracking-wider px-1">
                <TrendingUp className="w-4 h-4 text-[#0A1D37]" />
                <span>Trending Searches</span>
              </div>

              <div className="divide-y divide-[#F1F1EF] border border-[#E5E5E5] rounded-md overflow-hidden bg-white">
                {TRENDING_SEARCHES.map((item) => {
                  const isIdx = item.type === 'INDEX';
                  return (
                    <button
                      key={item.symbol}
                      type="button"
                      onClick={() => handleSelectItem(item.symbol, isIdx)}
                      className="w-full px-4 py-3 text-left hover:bg-[#FAFAF8] transition-colors flex items-center justify-between group cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-6 h-6 rounded-full bg-[#F5F5F3] flex items-center justify-center text-[#5F6368] group-hover:text-[#0A1D37] shrink-0">
                          <TrendingUp className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-semibold text-sm text-[#111111] group-hover:underline truncate max-w-[300px] sm:max-w-[380px]">
                            {item.name}
                          </span>
                          <span className="text-xs text-[#5F6368] font-mono block">
                            {item.symbol}
                          </span>
                        </div>
                      </div>

                      <span className="text-[10px] font-mono text-[#888888] uppercase px-1.5 py-0.5 bg-[#FAFAF8] rounded border border-[#E5E5E5]">
                        {item.type}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
