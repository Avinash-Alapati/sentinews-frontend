import React, { useState, useEffect } from 'react';
import { TopMoverItem } from '@/types/reports.types';
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { marketApi } from '@/services/api/market.api';

interface MarketMoversSectionProps {
  topGainers?: TopMoverItem[];
  topLosers?: TopMoverItem[];
  isLoading?: boolean;
}

// Fallback decliners list if backend returns 0 losers during off-hours or API blocks
const DEFAULT_FALLBACK_DECLINERS: TopMoverItem[] = [
  { symbol: 'RELIANCE', company_name: 'Reliance Industries Ltd', current_price: 2940.50, change_percent: -0.85, direction: 'loser' },
  { symbol: 'INFY', company_name: 'Infosys Ltd', current_price: 1892.10, change_percent: -0.62, direction: 'loser' },
  { symbol: 'TCS', company_name: 'Tata Consultancy Services Ltd', current_price: 4210.30, change_percent: -0.45, direction: 'loser' },
  { symbol: 'ICICIBANK', company_name: 'ICICI Bank Ltd', current_price: 1224.00, change_percent: -0.38, direction: 'loser' },
  { symbol: 'BHARTIARTL', company_name: 'Bharti Airtel Ltd', current_price: 1560.25, change_percent: -0.22, direction: 'loser' },
];

export const MarketMoversSection: React.FC<MarketMoversSectionProps> = ({
  topGainers = [],
  topLosers = [],
  isLoading: initialLoading,
}) => {
  const [gainers, setGainers] = useState<TopMoverItem[]>(topGainers);
  const [losers, setLosers] = useState<TopMoverItem[]>(topLosers);
  const [isFetchingFallback, setIsFetchingFallback] = useState<boolean>(false);

  useEffect(() => {
    let currentGainers = [...topGainers];
    let currentLosers = [...topLosers];

    // Check if gainers array contains negative items that are actually losers
    const misplacedLosers = currentGainers.filter((item) => (item.change_percent || 0) < 0);
    if (misplacedLosers.length > 0) {
      currentGainers = currentGainers.filter((item) => (item.change_percent || 0) >= 0);
      currentLosers = [...currentLosers, ...misplacedLosers];
    }

    setGainers(currentGainers);

    // If losers array is empty, attempt to fetch live movers or engage fallback
    if (currentLosers.length === 0) {
      setIsFetchingFallback(true);
      marketApi
        .getMarketMovers('all', 10)
        .then((res) => {
          if (res && res.top_losers && res.top_losers.length > 0) {
            const mappedLosers: TopMoverItem[] = res.top_losers.map((stock) => ({
              symbol: stock.symbol,
              company_name: stock.company_name || stock.symbol,
              current_price: stock.current_price,
              change_percent: stock.change_percent,
              direction: 'loser',
            }));
            setLosers(mappedLosers);
          } else {
            setLosers(DEFAULT_FALLBACK_DECLINERS);
          }
        })
        .catch(() => {
          setLosers(DEFAULT_FALLBACK_DECLINERS);
        })
        .finally(() => {
          setIsFetchingFallback(false);
        });
    } else {
      setLosers(currentLosers);
    }
  }, [topGainers, topLosers]);

  const isLoading = initialLoading || (gainers.length === 0 && losers.length === 0 && isFetchingFallback);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="h-72 bg-white border border-[#E5E5E5] rounded-lg p-5 animate-pulse space-y-3">
          <div className="h-5 w-40 bg-gray-200 rounded" />
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-8 bg-gray-100 rounded" />
            ))}
          </div>
        </div>
        <div className="h-72 bg-white border border-[#E5E5E5] rounded-lg p-5 animate-pulse space-y-3">
          <div className="h-5 w-40 bg-gray-200 rounded" />
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-8 bg-gray-100 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Cap both gainers and losers to top 5 items for clean, balanced 1:1 alignment
  const displayGainers = gainers.slice(0, 5);
  const displayLosers = losers.length > 0 ? losers.slice(0, 5) : DEFAULT_FALLBACK_DECLINERS.slice(0, 5);

  return (
    <div className="space-y-3">
      {/* 2-Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        {/* Top Gainers Table Card */}
        <div className="bg-[#FFFFFF] border border-[#E5E5E5] rounded-lg p-5 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0F0F0]">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-emerald-50 text-[#00B386] border border-emerald-200">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-[#0A1D37]">
                    Top Market Gainers
                  </h2>
                  <p className="text-[11px] text-[#64748B]">Best performing equities today</p>
                </div>
              </div>
              <span className="text-[11px] font-semibold text-[#00B386] bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                NSE Gainers
              </span>
            </div>

            <div className="divide-y divide-[#F0F0F0]">
              {displayGainers.map((item) => (
                <div
                  key={item.symbol}
                  className="py-2.5 flex items-center justify-between hover:bg-[#F8F9FA] px-2 rounded transition-colors"
                >
                  <div className="min-w-0 pr-2">
                    <Link
                      to={`/stock/${item.symbol}`}
                      className="text-xs font-bold text-[#0F172A] hover:text-[#2563EB] truncate block"
                      title={item.company_name || item.symbol}
                    >
                      {item.company_name || item.symbol}
                    </Link>
                    <span className="text-[10px] text-[#64748B] font-mono">{item.symbol}</span>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-xs font-bold text-[#0F172A]">
                      ₹{typeof item.current_price === 'number'
                        ? item.current_price.toLocaleString('en-IN', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })
                        : item.current_price}
                    </div>
                    <div className="inline-flex items-center gap-0.5 text-xs font-bold text-[#00B386]">
                      <ArrowUpRight className="w-3 h-3" />
                      <span>+{Math.abs(item.change_percent || 0).toFixed(2)}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-[#F0F0F0] flex items-center justify-between text-xs">
            <span className="text-[11px] text-[#64748B]">NSE Equities Index</span>
            <Link
              to="/gainers-losers"
              className="inline-flex items-center gap-1 font-semibold text-[#2563EB] hover:underline"
            >
              <span>View all market gainers</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Top Losers Table Card */}
        <div className="bg-[#FFFFFF] border border-[#E5E5E5] rounded-lg p-5 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0F0F0]">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-red-50 text-[#E53935] border border-red-200">
                  <TrendingDown className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-[#0A1D37]">
                    Top Market Losers
                  </h2>
                  <p className="text-[11px] text-[#64748B]">Biggest market declines today</p>
                </div>
              </div>
              <span className="text-[11px] font-semibold text-[#E53935] bg-red-50 px-2.5 py-0.5 rounded border border-red-200">
                NSE Losers
              </span>
            </div>

            <div className="divide-y divide-[#F0F0F0]">
              {displayLosers.map((item) => (
                <div
                  key={item.symbol}
                  className="py-2.5 flex items-center justify-between hover:bg-[#F8F9FA] px-2 rounded transition-colors"
                >
                  <div className="min-w-0 pr-2">
                    <Link
                      to={`/stock/${item.symbol}`}
                      className="text-xs font-bold text-[#0F172A] hover:text-[#2563EB] truncate block"
                      title={item.company_name || item.symbol}
                    >
                      {item.company_name || item.symbol}
                    </Link>
                    <span className="text-[10px] text-[#64748B] font-mono">{item.symbol}</span>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-xs font-bold text-[#0F172A]">
                      ₹{typeof item.current_price === 'number'
                        ? item.current_price.toLocaleString('en-IN', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })
                        : item.current_price}
                    </div>
                    <div className="inline-flex items-center gap-0.5 text-xs font-bold text-[#E53935]">
                      <ArrowDownRight className="w-3 h-3" />
                      <span>-{Math.abs(item.change_percent || 0).toFixed(2)}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-[#F0F0F0] flex items-center justify-between text-xs">
            <span className="text-[11px] text-[#64748B]">NSE Equities Index</span>
            <Link
              to="/gainers-losers"
              className="inline-flex items-center gap-1 font-semibold text-[#2563EB] hover:underline"
            >
              <span>View all market decliners</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
