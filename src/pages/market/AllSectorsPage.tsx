import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Laptop,
  Building2,
  Car,
  Pill,
  Hammer,
  ShoppingBag,
  Flame,
  Tv,
  HardHat,
  ArrowLeft,
  ChevronRight,
  Search,
  LucideIcon,
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { SECTORS_DATA } from '@/data/sectorData';
import { marketApi } from '@/services/api/market.api';
import { StockQuote } from '@/types/market.types';

const ICON_MAP: Record<string, LucideIcon> = {
  Laptop,
  Building2,
  Car,
  Pill,
  Hammer,
  ShoppingBag,
  Flame,
  Tv,
  HardHat,
};

export const AllSectorsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [quotesMap, setQuotesMap] = useState<Record<string, StockQuote>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Collect all unique symbols
  const allSymbols = useMemo(() => {
    const symbolSet = new Set<string>();
    SECTORS_DATA.forEach((sec) => sec.symbols.forEach((sym) => symbolSet.add(sym)));
    return Array.from(symbolSet);
  }, []);

  // Fetch real-time quotes for all symbols
  useEffect(() => {
    let isMounted = true;
    const fetchQuotes = async () => {
      try {
        setIsLoading(true);
        const quotes = await marketApi.getQuotes(allSymbols);
        if (!isMounted) return;

        const map: Record<string, StockQuote> = {};
        quotes.forEach((q) => {
          if (q && q.symbol) {
            map[q.symbol.toUpperCase()] = q;
          }
        });
        setQuotesMap(map);
      } catch (err) {
        console.error('Failed to fetch sector quotes:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchQuotes();
    return () => {
      isMounted = false;
    };
  }, [allSymbols]);

  // Compute sector statistics
  const sectorSummaries = useMemo(() => {
    return SECTORS_DATA.map((sec) => {
      let gainers = 0;
      let losers = 0;
      let sumChangePercent = 0;
      let count = 0;

      sec.symbols.forEach((sym) => {
        const q = quotesMap[sym.toUpperCase()];
        if (q) {
          count++;
          sumChangePercent += q.change_percent || 0;
          if ((q.change_percent || 0) >= 0) {
            gainers++;
          } else {
            losers++;
          }
        }
      });

      const total = gainers + losers || sec.symbols.length;
      const avgChangePercent = count > 0 ? sumChangePercent / count : 0;

      return {
        sector: sec,
        gainers,
        losers,
        total,
        avgChangePercent,
      };
    });
  }, [quotesMap]);

  // Filter sectors by search query
  const filteredSectors = useMemo(() => {
    if (!searchTerm.trim()) return sectorSummaries;
    const query = searchTerm.toLowerCase().trim();
    return sectorSummaries.filter(
      (item) =>
        item.sector.name.toLowerCase().includes(query) ||
        item.sector.category.toLowerCase().includes(query)
    );
  }, [sectorSummaries, searchTerm]);

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#111111] flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-[1140px] mx-auto px-4 sm:px-6 py-8 w-full space-y-6">
        {/* Navigation Back & Header */}
        <div>
          <button
            type="button"
            onClick={() => navigate('/market')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5F6368] hover:text-[#0A1D37] mb-3 cursor-pointer transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Market Overview</span>
          </button>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-5 border-b border-[#E5E5E5]">
            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#111111]">
                All Market Sectors
              </h1>
              <p className="text-xs sm:text-sm text-[#5F6368] max-w-xl">
                Explore gainers and losers across all major Indian industry sectors. Real-time dynamic updates powered by Sentinews API.
              </p>
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#888888]" />
              <input
                type="text"
                placeholder="Search sectors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-[#E5E5E5] rounded-xl text-xs focus:outline-none focus:border-[#0A1D37] focus:ring-1 focus:ring-[#0A1D37] transition-all font-sans"
              />
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-white border border-[#E5E5E5] rounded-2xl p-5" />
            ))}
          </div>
        ) : filteredSectors.length === 0 ? (
          <div className="p-12 text-center bg-white border border-[#E5E5E5] rounded-2xl text-xs text-[#5F6368]">
            No sectors match &quot;{searchTerm}&quot;. Try a different search term.
          </div>
        ) : (
          /* Sector Cards Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredSectors.map((summary) => {
              const { sector, gainers, losers, total, avgChangePercent } = summary;
              const IconComp = ICON_MAP[sector.iconName] || Laptop;
              const isPositive = avgChangePercent >= 0;
              const gainerPct = total > 0 ? (gainers / total) * 100 : 50;
              const loserPct = total > 0 ? (losers / total) * 100 : 50;

              return (
                <div
                  key={sector.id}
                  onClick={() => navigate(`/sector/${sector.id}`)}
                  className="bg-white border border-[#E5E5E5] hover:border-[#0A1D37]/30 rounded-2xl p-5 shadow-2xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-[#F5F5F3] group-hover:bg-[#0A1D37] group-hover:text-white text-[#5F6368] flex items-center justify-center shrink-0 transition-colors">
                        <IconComp className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-sm text-[#111111] group-hover:text-[#0A1D37] transition-colors">
                            {sector.name}
                          </h3>
                        </div>
                        <span className="text-[11px] text-[#888888]">
                          {sector.symbols.length} Constituents • {sector.category}
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span
                        className={`text-sm font-bold block ${
                          isPositive ? 'text-[#00B386]' : 'text-[#E53935]'
                        }`}
                      >
                        {isPositive ? '+' : ''}
                        {avgChangePercent.toFixed(2)}%
                      </span>
                      <span className="text-[10px] text-[#888888] uppercase">1D Avg</span>
                    </div>
                  </div>

                  {/* Ratio Progress Bar */}
                  <div className="space-y-1 mt-2">
                    <div className="flex items-center justify-between text-[11px] font-bold">
                      <span className="text-[#00B386]">{gainers} Gainers</span>
                      <span className="text-[#E53935]">{losers} Losers</span>
                    </div>
                    <div className="w-full h-2 bg-[#E5E5E5] rounded-full overflow-hidden flex items-center">
                      <div
                        className="h-full bg-[#00B386] transition-all duration-300"
                        style={{ width: `${gainerPct}%` }}
                      />
                      <div
                        className="h-full bg-[#E53935] transition-all duration-300"
                        style={{ width: `${loserPct}%` }}
                      />
                    </div>
                  </div>

                  {/* View Details Action Link in Navy Blue (#0A1D37) */}
                  <div className="pt-3 mt-4 border-t border-[#F1F1EF] flex items-center justify-between">
                    <span className="text-xs font-bold text-[#0A1D37] group-hover:underline flex items-center gap-1">
                      Explore {sector.name} stocks
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                    <span className="text-[11px] text-[#888888]">
                      View all {sector.symbols.length} stocks
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default AllSectorsPage;
