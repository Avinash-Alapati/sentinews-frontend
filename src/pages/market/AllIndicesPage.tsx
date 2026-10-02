import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { marketApi } from '@/services/api/market.api';
import { IndexQuote } from '@/types/market.types';
import {
  Globe,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Minus,
  Search,
  Building2,
  CheckCircle2,
} from 'lucide-react';

type IndexTab = 'ALL' | 'NSE' | 'BSE' | 'SECTORAL';

export const AllIndicesPage: React.FC = () => {
  const navigate = useNavigate();
  const cached = marketApi.getCachedIndices();
  const [indices, setIndices] = useState<IndexQuote[]>(() => cached || []);
  const [isLoading, setIsLoading] = useState<boolean>(() => !cached || cached.length === 0);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<IndexTab>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const fetchAllIndices = async (isBackground = false) => {
    try {
      if (!isBackground && indices.length === 0) {
        setIsLoading(true);
      }
      setError(null);
      const data = await marketApi.getIndices(false, isBackground);
      if (Array.isArray(data) && data.length > 0) {
        setIndices(data);
      }
    } catch (err) {
      console.error('Failed to fetch indices:', err);
      if (indices.length === 0) {
        setError('Unable to load market indices');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllIndices(indices.length > 0);
    const interval = setInterval(() => fetchAllIndices(true), 30000);
    return () => clearInterval(interval);
  }, []);

  // Filter indices by Tab and Search Query
  const filteredIndices = useMemo(() => {
    return indices.filter((idx) => {
      if (!idx) return false;
      const name = (idx.name || '').toUpperCase();
      const symbol = (idx.symbol || '').toUpperCase();

      // Tab filter
      let matchesTab = true;
      if (selectedTab === 'NSE') {
        matchesTab = name.includes('NIFTY') && !name.includes('BANK') && !name.includes('IT') && !name.includes('AUTO') && !name.includes('PHARMA') && !name.includes('FMCG') && !name.includes('METAL') && !name.includes('ENERGY') && !name.includes('REALTY');
      } else if (selectedTab === 'BSE') {
        matchesTab = name.includes('BSE') || name.includes('SENSEX');
      } else if (selectedTab === 'SECTORAL') {
        matchesTab = name.includes('BANK') || name.includes('IT') || name.includes('AUTO') || name.includes('PHARMA') || name.includes('FMCG') || name.includes('METAL') || name.includes('ENERGY') || name.includes('REALTY');
      }

      // Search query filter
      let matchesSearch = true;
      if (searchQuery.trim()) {
        const q = searchQuery.toUpperCase().trim();
        matchesSearch = name.includes(q) || symbol.includes(q);
      }

      return matchesTab && matchesSearch;
    });
  }, [indices, selectedTab, searchQuery]);

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#111111] flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-[1140px] mx-auto px-4 sm:px-6 py-8 w-full space-y-6">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-[#E5E5E5]">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 font-mono">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                Live Feed Active
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#111111] flex items-center gap-2.5">
              <Globe className="w-6 h-6 sm:w-7 sm:h-7 text-[#0A1D37]" />
              <span>All NSE & BSE Market Indices</span>
            </h1>
            <p className="text-xs sm:text-sm text-[#5F6368] max-w-2xl">
              Complete real-time coverage of all Indian benchmark and sectoral market indices powered by SentiNews backend engine.
            </p>
          </div>

          <button
            type="button"
            onClick={() => fetchAllIndices(false)}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-[#0A1D37] hover:bg-[#0A1D37]/90 px-4 py-2.5 rounded-xl transition-all shadow-2xs disabled:opacity-60 cursor-pointer shrink-0 self-start md:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh Indices</span>
          </button>
        </div>

        {/* Filter Bar: Tabs + Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {[
              { id: 'ALL', label: 'All Indices' },
              { id: 'NSE', label: 'NSE Benchmarks' },
              { id: 'BSE', label: 'BSE Benchmarks' },
              { id: 'SECTORAL', label: 'Sectoral Indices' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedTab(tab.id as IndexTab)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
                  selectedTab === tab.id
                    ? 'bg-[#0A1D37] border-[#0A1D37] text-white shadow-2xs font-bold'
                    : 'bg-white border-[#E5E5E5] text-[#5F6368] hover:text-[#0A1D37] hover:border-[#0A1D37]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#888888]" />
            <input
              type="text"
              placeholder="Search index (e.g. NIFTY, SENSEX)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-[#E5E5E5] rounded-xl text-xs focus:outline-none focus:border-[#0A1D37] focus:ring-1 focus:ring-[#0A1D37] transition-all font-sans"
            />
          </div>
        </div>

        {/* Indices Table View */}
        {isLoading && indices.length === 0 ? (
          <div className="bg-white border border-[#E5E5E5] rounded-2xl p-6 space-y-4 animate-pulse">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-10 bg-[#F5F5F3] rounded w-full" />
            ))}
          </div>
        ) : filteredIndices.length === 0 ? (
          <div className="p-12 text-center bg-white border border-[#E5E5E5] rounded-2xl text-xs text-[#5F6368] space-y-2">
            <Building2 className="w-8 h-8 mx-auto text-[#888888]" />
            <p className="font-bold text-sm text-[#111111]">No Market Indices Found</p>
            <p className="text-[11px] text-[#888888]">
              No index matching &quot;{searchQuery}&quot; in {selectedTab} category.
            </p>
          </div>
        ) : (
          <div className="bg-white border border-[#E5E5E5] rounded-2xl overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#F1F1EF] text-[11px] font-semibold text-[#888888] uppercase tracking-wider font-mono">
                    <th className="py-3.5 px-5">Index Name / Exchange</th>
                    <th className="py-3.5 px-5 text-right">Current Price / Value</th>
                    <th className="py-3.5 px-5 text-right">1D Change</th>
                    <th className="py-3.5 px-5 text-right hidden sm:table-cell">Day High</th>
                    <th className="py-3.5 px-5 text-right hidden sm:table-cell">Day Low</th>
                    <th className="py-3.5 px-5 text-right hidden md:table-cell">Prev Close</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F1EF] text-xs font-sans">
                  {filteredIndices.map((idx) => {
                    const isPositive = (idx.change || 0) >= 0;
                    const valFormatted = idx.current_value
                      ? idx.current_value.toLocaleString('en-IN', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })
                      : '0.00';

                    const changeFormatted = Math.abs(idx.change || 0).toFixed(2);
                    const percentFormatted = Math.abs(idx.change_percent || 0).toFixed(2);
                    const exchange = idx.name.includes('BSE') || idx.name.includes('SENSEX') ? 'BSE' : 'NSE';

                    return (
                      <tr
                        key={idx.symbol}
                        onClick={() => navigate(`/stock/${encodeURIComponent(idx.symbol)}`)}
                        className="hover:bg-[#FAFAF8] transition-colors cursor-pointer group"
                      >
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-[#0A1D37] text-white flex items-center justify-center font-bold text-xs shrink-0">
                              {exchange}
                            </div>
                            <div>
                              <span className="font-bold text-sm text-[#0A1D37] block">
                                {idx.name}
                              </span>
                              <span className="text-[10px] text-[#888888] block uppercase">
                                {idx.symbol}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-5 text-right font-bold text-sm text-[#111111]">
                          {valFormatted}
                        </td>

                        <td className="py-4 px-5 text-right font-bold text-xs">
                          <span
                            className={`inline-flex items-center justify-end gap-1 ${
                              isPositive ? 'text-[#00B386]' : 'text-[#E53935]'
                            }`}
                          >
                            {isPositive ? (
                              <TrendingUp className="w-3.5 h-3.5" />
                            ) : (
                              <TrendingDown className="w-3.5 h-3.5" />
                            )}
                            <span>
                              {isPositive ? '+' : '-'}{changeFormatted} ({isPositive ? '+' : '-'}{percentFormatted}%)
                            </span>
                          </span>
                        </td>

                        <td className="py-4 px-5 text-right text-[#5F6368] hidden sm:table-cell">
                          {idx.high ? idx.high.toLocaleString('en-IN') : '—'}
                        </td>

                        <td className="py-4 px-5 text-right text-[#5F6368] hidden sm:table-cell">
                          {idx.low ? idx.low.toLocaleString('en-IN') : '—'}
                        </td>

                        <td className="py-4 px-5 text-right text-[#5F6368] hidden md:table-cell">
                          {idx.previous_close ? idx.previous_close.toLocaleString('en-IN') : '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default AllIndicesPage;
