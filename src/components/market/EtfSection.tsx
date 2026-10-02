import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ETFQuote } from '@/types/market.types';
import { marketApi } from '@/services/api/market.api';
import {
  Layers,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Coins,
  Building2,
  Cpu,
  Globe,
} from 'lucide-react';

// Diverse set of top popular ETFs across major fund houses and asset classes
const DIVERSE_POPULAR_ETFS = [
  { symbol: 'NIFTYBEES', name: 'Nippon India Nifty 50 BeES ETF', category: 'Index' },
  { symbol: 'MON100', name: 'Motilal Oswal Nasdaq 100 ETF', category: 'Global' },
  { symbol: 'HDFCNIFTY', name: 'HDFC Nifty 50 ETF', category: 'Index' },
  { symbol: 'GOLDBEES', name: 'Nippon India Gold BeES ETF', category: 'Commodity' },
  { symbol: 'ICICINIFTY', name: 'ICICI Prudential Nifty 50 ETF', category: 'Index' },
  { symbol: 'BANKBEES', name: 'Nippon India Nifty Bank BeES ETF', category: 'Banking' },
  { symbol: 'CPSEETF', name: 'CPSE ETF', category: 'Index' },
  { symbol: 'MASPTOP50', name: 'Mirae Asset Nifty Top 50 ETF', category: 'Smart Beta' },
];

export const EtfSection: React.FC = () => {
  const navigate = useNavigate();
  const [etfs, setEtfs] = useState<Array<{ symbol: string; name: string; category: string; price: string; changePercent: string; isPositive: boolean }>>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const loadPopularEtfs = async () => {
      try {
        setIsLoading(true);

        // 1. Attempt fetching real-time ETFs from backend /market/etfs API
        const res = await marketApi.getETFs({ limit: 12 });

        if (!isMounted) return;

        if (res && res.items && res.items.length > 0) {
          // Select a diverse mix of non-BeES and BeES popular ETFs
          const mapped = res.items.slice(0, 4).map((item: ETFQuote) => ({
            symbol: item.symbol,
            name: item.underlying_asset || item.symbol,
            category: item.category ? item.category.replace('_', ' ').toUpperCase() : 'ETF',
            price: (item.last_price || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 }),
            changePercent: Math.abs(item.change_percent || 0).toFixed(2),
            isPositive: (item.change_percent || 0) >= 0,
          }));
          setEtfs(mapped);
          return;
        }

        // 2. Fallback: Fetch quotes for diverse popular ETF basket
        const symbols = DIVERSE_POPULAR_ETFS.map((e) => e.symbol);
        const quotes = await marketApi.getQuotes(symbols);

        if (!isMounted) return;

        const fallbackMapped = DIVERSE_POPULAR_ETFS.slice(0, 4).map((etfInfo) => {
          const q = quotes.find((quote) => quote?.symbol?.toUpperCase() === etfInfo.symbol.toUpperCase());
          return {
            symbol: etfInfo.symbol,
            name: q?.company_name || etfInfo.name,
            category: etfInfo.category,
            price: q?.current_price ? q.current_price.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '—',
            changePercent: q?.change_percent ? Math.abs(q.change_percent).toFixed(2) : '0.00',
            isPositive: q ? q.change >= 0 : true,
          };
        });

        setEtfs(fallbackMapped);
      } catch (err) {
        console.error('Failed to fetch ETF quotes from backend:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadPopularEtfs();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleCardClick = (symbol: string) => {
    const cleanSym = symbol.trim().toUpperCase().replace('.NS', '').replace('.BO', '');
    navigate(`/stock/${encodeURIComponent(cleanSym)}`);
  };

  const handleExploreAll = () => {
    navigate('/etfs');
  };

  const getEtfIcon = (symbol: string, category: string) => {
    const sym = symbol.toUpperCase();
    const cat = category.toLowerCase();
    if (sym.includes('GOLD') || sym.includes('SILVER') || cat.includes('gold') || cat.includes('commodity')) {
      return <Coins className="w-5 h-5 text-amber-600" />;
    }
    if (sym.includes('BANK') || sym.includes('BNK') || cat.includes('bank')) {
      return <Building2 className="w-5 h-5 text-blue-600" />;
    }
    if (sym.includes('IT') || sym.includes('TECH') || cat.includes('tech')) {
      return <Cpu className="w-5 h-5 text-indigo-600" />;
    }
    if (sym.includes('MON') || sym.includes('GLOBAL') || sym.includes('NASDAQ') || cat.includes('global')) {
      return <Globe className="w-5 h-5 text-emerald-600" />;
    }
    return <Layers className="w-5 h-5 text-[#0A1D37]" />;
  };

  return (
    <section className="space-y-3.5">
      {/* Header Row */}
      <div className="flex items-center justify-between pb-2.5 border-b border-[#E5E5E5]">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#111111]">
            Popular ETFs
          </h2>
          <p className="text-xs text-[#5F6368] mt-0.5">
            Top Exchange Traded Funds across HDFC, Motilal Oswal, ICICI Prudential, Nippon & SBI
          </p>
        </div>

        <button
          type="button"
          onClick={handleExploreAll}
          className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-[#0A1D37] hover:text-[#0A1D37]/80 bg-white border border-[#E5E5E5] px-3.5 py-1.5 rounded-full shadow-2xs transition-all cursor-pointer"
        >
          <span>Explore All ETFs</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Compact Grid: 4 Diverse Popular ETF Cards */}
      {isLoading ? (
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white border border-[#E5E5E5] rounded-xl p-3 space-y-2.5 animate-pulse">
              <div className="w-8 h-8 bg-[#F5F5F3] rounded-lg" />
              <div className="h-3.5 bg-[#F5F5F3] rounded w-20" />
              <div className="h-3.5 bg-[#F5F5F3] rounded w-14" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {etfs.map((etf, idx) => {
            const isFourthCard = idx === 3;

            return (
              <div
                key={etf.symbol}
                onClick={() => handleCardClick(etf.symbol)}
                className="bg-white border border-[#E5E5E5] hover:border-[#0A1D37] rounded-xl p-3 sm:p-3.5 shadow-2xs transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  {/* Top Icon & Category Badge */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 rounded-lg bg-[#F5F5F3] border border-[#E5E5E5] flex items-center justify-center shrink-0">
                      {getEtfIcon(etf.symbol, etf.category)}
                    </div>
                    <span className="text-[9px] font-semibold uppercase px-2 py-0.5 rounded bg-[#F5F5F3] border border-[#E5E5E5] text-[#5F6368] truncate max-w-[100px]">
                      {etf.category}
                    </span>
                  </div>

                  {/* ETF Ticker & Full Name */}
                  <h3 className="font-bold text-xs sm:text-sm text-[#111111] group-hover:text-[#0A1D37] transition-colors truncate">
                    {etf.symbol}
                  </h3>
                  <p className="text-[10px] text-[#5F6368] line-clamp-1 mt-0.5" title={etf.name}>
                    {etf.name}
                  </p>
                </div>

                {/* Price & Change Badge */}
                <div className="mt-3 pt-2.5 border-t border-[#F1F1EF] space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-[#888888]">Price</div>
                      <div className="text-xs font-bold text-[#111111]">₹{etf.price}</div>
                    </div>

                    <span
                      className={`inline-flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                        etf.isPositive
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {etf.isPositive ? '+' : '-'}{etf.changePercent}%
                    </span>
                  </div>

                  {/* 4th ETF Card: Inline "See More ETFs" Button */}
                  {isFourthCard && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleExploreAll();
                      }}
                      className="w-full mt-1 py-1 px-2 bg-[#0A1D37] hover:bg-[#071426] text-white text-[10px] sm:text-[11px] font-semibold rounded flex items-center justify-center gap-1 transition-all cursor-pointer shadow-xs active:scale-[0.98]"
                    >
                      <span>See More ETFs</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
