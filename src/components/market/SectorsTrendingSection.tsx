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
  ChevronRight,
  LucideIcon,
} from 'lucide-react';
import { SECTORS_DATA, SectorInfo } from '@/data/sectorData';
import { marketApi } from '@/services/api/market.api';
import { StockQuote } from '@/types/market.types';

// Map string icon names from sectorData.ts to Lucide icon components
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

export interface SectorSummary {
  sector: SectorInfo;
  gainers: number;
  losers: number;
  total: number;
  avgChangePercent: number;
}

export const SectorsTrendingSection: React.FC = () => {
  const navigate = useNavigate();
  const [quotesMap, setQuotesMap] = useState<Record<string, StockQuote>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Collect all constituent stock symbols across trending sectors for full real-time coverage
  const summarySymbols = useMemo(() => {
    const symbolSet = new Set<string>();
    SECTORS_DATA.forEach((sec) => sec.symbols.forEach((sym) => symbolSet.add(sym)));
    return Array.from(symbolSet);
  }, []);

  // Fetch real-time quotes for sector constituent stocks
  useEffect(() => {
    let isMounted = true;
    const fetchSectorQuotes = async () => {
      try {
        setIsLoading(true);
        const quotes = await marketApi.getQuotes(summarySymbols);
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

    fetchSectorQuotes();
    return () => {
      isMounted = false;
    };
  }, [summarySymbols]);

  // Compute stats for each sector
  const sectorSummaries: SectorSummary[] = useMemo(() => {
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

      const total = count > 0 ? count : sec.symbols.length;
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

  // Show top 6 trending sectors on home/market overview page
  const trendingSectors = sectorSummaries.slice(0, 6);

  return (
    <section className="space-y-4 w-full">
      {/* Section Header */}
      <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#111111]">
        Sectors trending today
      </h2>

      {/* Main Sector Card */}
      <div className="bg-white border border-[#E5E5E5] rounded-2xl p-5 sm:p-6 shadow-2xs">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 pb-3 border-b border-[#F1F1EF] text-[11px] font-semibold text-[#888888] uppercase tracking-wider">
          <div className="col-span-5 sm:col-span-4">Sector</div>
          <div className="col-span-4 sm:col-span-5 text-center">Gainers/Losers</div>
          <div className="col-span-3 sm:col-span-3 text-right">1D price change</div>
        </div>

        {/* Loading Skeleton */}
        {isLoading ? (
          <div className="divide-y divide-[#F1F1EF] animate-pulse">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="py-4 grid grid-cols-12 gap-4 items-center">
                <div className="col-span-4 h-6 bg-[#F5F5F3] rounded w-3/4" />
                <div className="col-span-5 h-4 bg-[#F5F5F3] rounded w-full" />
                <div className="col-span-3 h-5 bg-[#F5F5F3] rounded ml-auto w-16" />
              </div>
            ))}
          </div>
        ) : (
          /* Sectors Table Body */
          <div className="divide-y divide-[#F1F1EF]">
            {trendingSectors.map((summary) => {
              const { sector, gainers, losers, total, avgChangePercent } = summary;
              const IconComp = ICON_MAP[sector.iconName] || Laptop;
              const isPositive = avgChangePercent >= 0;
              const gainerPct = total > 0 ? (gainers / total) * 100 : 50;
              const loserPct = total > 0 ? (losers / total) * 100 : 50;

              return (
                <div
                  key={sector.id}
                  onClick={() => navigate(`/sector/${sector.id}`)}
                  className="py-4 grid grid-cols-12 gap-4 items-center hover:bg-[#FAFAF8] transition-colors cursor-pointer group px-1 sm:px-2 rounded-lg"
                >
                  {/* Sector Name & Icon */}
                  <div className="col-span-5 sm:col-span-4 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#F5F5F3] group-hover:bg-[#0A1D37] group-hover:text-white text-[#5F6368] flex items-center justify-center shrink-0 transition-colors">
                      <IconComp className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-semibold text-xs sm:text-sm text-[#111111] group-hover:text-[#0A1D37] transition-colors line-clamp-1 block">
                        {sector.name}
                      </span>
                      <span className="text-[11px] text-[#888888] block">
                        {sector.symbols.length} stocks
                      </span>
                    </div>
                  </div>

                  {/* Gainers / Losers Ratio Bar */}
                  <div className="col-span-4 sm:col-span-5 flex flex-col justify-center px-1 sm:px-4">
                    {/* Numbers above bar */}
                    <div className="flex items-center justify-between text-[11px] font-bold mb-1">
                      <span className="text-[#00B386]">{gainers} Gainers</span>
                      <span className="text-[#E53935]">{losers} Losers</span>
                    </div>

                    {/* Horizontal Bar */}
                    <div className="w-full h-1.5 bg-[#E5E5E5] rounded-full overflow-hidden flex items-center">
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

                  {/* 1D Price Change */}
                  <div className="col-span-3 sm:col-span-3 text-right">
                    <span
                      className={`text-xs sm:text-sm font-bold ${
                        isPositive ? 'text-[#00B386]' : 'text-[#E53935]'
                      }`}
                    >
                      {isPositive ? '+' : ''}
                      {avgChangePercent.toFixed(2)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer Link: "See all sectors >" in strictly Navy Blue (#0A1D37) */}
        <div className="pt-4 mt-2 border-t border-[#F1F1EF]">
          <button
            type="button"
            onClick={() => navigate('/sectors')}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#0A1D37] hover:text-[#0A1D37]/80 transition-colors cursor-pointer"
          >
            <span>See all sectors</span>
            <ChevronRight className="w-4 h-4 text-[#0A1D37]" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default SectorsTrendingSection;
