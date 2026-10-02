import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  ChevronLeft,
  ChevronRight,
  Search,
  BarChart2,
  Bookmark,
  LucideIcon,
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { SECTORS_DATA, SectorInfo } from '@/data/sectorData';
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

const ITEMS_PER_PAGE = 25;

export const SectorViewPage: React.FC = () => {
  const { sectorId } = useParams<{ sectorId: string }>();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [quotes, setQuotes] = useState<StockQuote[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Find sector matching sectorId
  const currentSector: SectorInfo | undefined = useMemo(() => {
    return SECTORS_DATA.find((sec) => sec.id.toLowerCase() === sectorId?.toLowerCase());
  }, [sectorId]);

  // Fetch real-time quotes for constituent stocks of this sector
  useEffect(() => {
    if (!currentSector) return;

    let isMounted = true;
    const fetchSectorStocks = async () => {
      try {
        setIsLoading(true);
        const data = await marketApi.getQuotes(currentSector.symbols);
        if (!isMounted) return;
        setQuotes(data);
        setCurrentPage(1);
      } catch (err) {
        console.error('Failed to fetch sector stock quotes:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchSectorStocks();
    return () => {
      isMounted = false;
    };
  }, [currentSector]);

  // Filter stocks by search query
  const filteredQuotes = useMemo(() => {
    if (!searchTerm.trim()) return quotes;
    const query = searchTerm.toLowerCase().trim();
    return quotes.filter(
      (q) =>
        q.symbol.toLowerCase().includes(query) ||
        (q.company_name && q.company_name.toLowerCase().includes(query))
    );
  }, [quotes, searchTerm]);

  // Compute sector statistics
  const stats = useMemo(() => {
    let gainers = 0;
    let losers = 0;
    let totalChangePercent = 0;

    quotes.forEach((q) => {
      totalChangePercent += q.change_percent || 0;
      if ((q.change_percent || 0) >= 0) {
        gainers++;
      } else {
        losers++;
      }
    });

    const avgChangePercent = quotes.length > 0 ? totalChangePercent / quotes.length : 0;
    return { gainers, losers, total: quotes.length, avgChangePercent };
  }, [quotes]);

  // Pagination calculation (25 stocks per page)
  const totalPages = Math.max(1, Math.ceil(filteredQuotes.length / ITEMS_PER_PAGE));
  const paginatedQuotes = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredQuotes.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredQuotes, currentPage]);

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

  if (!currentSector) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] text-[#111111] flex flex-col font-sans">
        <Navbar />
        <main className="flex-1 max-w-[1140px] mx-auto px-4 sm:px-6 py-16 text-center space-y-4">
          <h1 className="text-2xl font-bold">Sector Not Found</h1>
          <p className="text-sm text-[#5F6368]">The requested sector does not exist.</p>
          <button
            type="button"
            onClick={() => navigate('/sectors')}
            className="px-4 py-2 bg-[#0A1D37] text-white text-xs font-bold rounded-lg cursor-pointer"
          >
            View All Sectors
          </button>
        </main>
        <Footer />
      </div>
    );
  }

  const SectorIcon = ICON_MAP[currentSector.iconName] || Laptop;
  const isSectorPositive = stats.avgChangePercent >= 0;

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#111111] flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-[1140px] mx-auto px-4 sm:px-6 py-8 w-full space-y-6">
        {/* Navigation Back */}
        <div>
          <button
            type="button"
            onClick={() => navigate('/sectors')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5F6368] hover:text-[#0A1D37] mb-3 cursor-pointer transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to All Sectors</span>
          </button>

          {/* Sector Overview Banner Card */}
          <div className="bg-white border border-[#E5E5E5] rounded-2xl p-6 shadow-2xs space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#0A1D37] text-white flex items-center justify-center shrink-0 shadow-2xs">
                  <SectorIcon className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#111111]">
                    {currentSector.name}
                  </h1>
                </div>
              </div>

              {/* Stats Summary Badge */}
              <div className="flex items-center gap-4 bg-[#FAFAF8] border border-[#E5E5E5] px-4 py-2.5 rounded-xl font-mono shrink-0">
                <div>
                  <span className="text-[10px] text-[#888888] block uppercase">1D Sector Avg</span>
                  <span
                    className={`text-sm font-bold ${
                      isSectorPositive ? 'text-[#00B386]' : 'text-[#E53935]'
                    }`}
                  >
                    {isSectorPositive ? '+' : ''}
                    {stats.avgChangePercent.toFixed(2)}%
                  </span>
                </div>
                <div className="h-8 w-px bg-[#E5E5E5]" />
                <div>
                  <span className="text-[10px] text-[#888888] block uppercase">Gainers / Losers</span>
                  <span className="text-xs font-bold">
                    <strong className="text-[#00B386]">{stats.gainers}</strong> /{' '}
                    <strong className="text-[#E53935]">{stats.losers}</strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Gainers / Losers ratio bar inside sector page */}
            <div className="pt-3 border-t border-[#F1F1EF] space-y-1">
              <div className="w-full h-2 bg-[#E5E5E5] rounded-full overflow-hidden flex items-center">
                <div
                  className="h-full bg-[#00B386] transition-all duration-300"
                  style={{
                    width: `${stats.total > 0 ? (stats.gainers / stats.total) * 100 : 50}%`,
                  }}
                />
                <div
                  className="h-full bg-[#E53935] transition-all duration-300"
                  style={{
                    width: `${stats.total > 0 ? (stats.losers / stats.total) * 100 : 50}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Filter Controls Row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#888888]" />
            <input
              type="text"
              placeholder={`Search ${currentSector.name} stocks...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-[#E5E5E5] rounded-xl text-xs focus:outline-none focus:border-[#0A1D37] focus:ring-1 focus:ring-[#0A1D37] transition-all font-sans"
            />
          </div>

          <div className="text-xs text-[#5F6368] self-end sm:self-auto">
            Showing{' '}
            <strong className="text-[#111111]">
              {filteredQuotes.length > 0
                ? `${(currentPage - 1) * ITEMS_PER_PAGE + 1} - ${Math.min(
                    currentPage * ITEMS_PER_PAGE,
                    filteredQuotes.length
                  )}`
                : '0'}
            </strong>{' '}
            of <strong className="text-[#111111]">{filteredQuotes.length}</strong> constituent stocks
          </div>
        </div>

        {/* Real-Time Stocks Table */}
        {isLoading ? (
          <div className="bg-white border border-[#E5E5E5] rounded-xl p-6 space-y-4 animate-pulse">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-10 bg-[#F5F5F3] rounded w-full" />
            ))}
          </div>
        ) : filteredQuotes.length === 0 ? (
          <div className="p-12 text-center bg-white border border-[#E5E5E5] rounded-xl text-xs text-[#5F6368]">
            No stocks found matching &quot;{searchTerm}&quot; in {currentSector.name}.
          </div>
        ) : (
          <div className="bg-white border border-[#E5E5E5] rounded-xl overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#F1F1EF] text-[11px] font-medium text-[#888888]">
                    <th className="py-3 px-5 w-1/3">Company</th>
                    <th className="py-3 px-4 text-center hidden sm:table-cell">1D Trend</th>
                    <th className="py-3 px-5 text-right">Market price</th>
                    <th className="py-3 px-5 text-right">1D Change</th>
                    <th className="py-3 px-5 text-right">Volume</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F1EF] text-xs">
                  {paginatedQuotes.map((quote) => {
                    const isPositive = (quote.change_percent || 0) >= 0;
                    const formattedPrice =
                      quote.current_price?.toLocaleString('en-IN', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }) || '0.00';
                    const formattedChange = Math.abs(quote.change || 0).toFixed(2);
                    const formattedPercent = Math.abs(quote.change_percent || 0).toFixed(2);
                    const formattedVolume = quote.volume
                      ? quote.volume.toLocaleString('en-IN')
                      : '—';

                    const sparklineColor = isPositive ? '#00B386' : '#E53935';
                    const sparklineD = isPositive
                      ? 'M 0 14 Q 15 12, 25 16 T 50 8 T 75 10 T 100 3'
                      : 'M 0 3 Q 15 8, 25 5 T 50 14 T 75 11 T 100 16';

                    return (
                      <tr
                        key={quote.symbol}
                        onClick={() => handleRowClick(quote.symbol)}
                        className="hover:bg-[#FAFAF8] transition-colors cursor-pointer group"
                      >
                        {/* Symbol & Logo */}
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
                              <span className="text-[11px] text-[#888888] block">
                                {quote.symbol}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Mini Sparkline Chart */}
                        <td className="py-3.5 px-4 text-center hidden sm:table-cell">
                          <div className="w-24 h-6 mx-auto">
                            <svg className="w-full h-full overflow-visible" viewBox="0 0 100 20">
                              <path
                                d={sparklineD}
                                fill="none"
                                stroke={sparklineColor}
                                strokeWidth="1.8"
                                strokeLinecap="round"
                              />
                            </svg>
                          </div>
                        </td>

                        {/* Price */}
                        <td className="py-3.5 px-5 text-right font-bold text-sm text-[#111111]">
                          ₹{formattedPrice}
                        </td>

                        {/* 1D Change */}
                        <td className="py-3.5 px-5 text-right">
                          <span
                            className={`text-xs font-bold ${
                              isPositive ? 'text-[#00B386]' : 'text-[#E53935]'
                            }`}
                          >
                            {isPositive ? '+' : '-'}{formattedChange} ({isPositive ? '+' : '-'}{formattedPercent}%)
                          </span>
                        </td>

                        {/* Volume & Quick Actions */}
                        <td className="py-3.5 px-5 text-right text-xs text-[#5F6368]">
                          <div className="flex items-center justify-end gap-3">
                            <span>{formattedVolume}</span>
                            <div className="hidden group-hover:flex items-center gap-1.5 text-[#888888] transition-all">
                              <span title="View Chart">
                                <BarChart2 className="w-4 h-4 hover:text-[#00B386]" />
                              </span>
                              <span title="Add to Watchlist">
                                <Bookmark className="w-4 h-4 hover:text-[#0A1D37]" />
                              </span>
                            </div>
                          </div>
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

      <Footer />
    </div>
  );
};

export default SectorViewPage;
