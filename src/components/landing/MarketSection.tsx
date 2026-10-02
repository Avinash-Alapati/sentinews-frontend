import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useMarketIndices } from '@/hooks/market/useMarketIndices';
import { CheckCircle2, TrendingUp, TrendingDown, Layers } from 'lucide-react';

export const MarketSection: React.FC = () => {
  const { indices } = useMarketIndices(30000);

  const nifty = indices.find((i) => i.name.toUpperCase().includes('NIFTY 50') || i.symbol === '^NSEI');
  const sensex = indices.find((i) => i.name.toUpperCase().includes('SENSEX') || i.symbol === '^BSESN');

  const capabilities = [
    'Indian benchmark & sectoral indices (NIFTY, SENSEX, BANK NIFTY)',
    'Individual stock quote insights & overview',
    'Sectoral momentum & heatmaps',
    'Market activity & top gainers / losers',
    'Historical trends & performance comparison',
  ];

  const formatPrice = (val?: number) =>
    val ? val.toLocaleString('en-IN', { minimumFractionDigits: 1, maximumFractionDigits: 2 }) : '—';

  const formatPercent = (val?: number) =>
    val !== undefined ? `${val > 0 ? '+' : ''}${val.toFixed(2)}%` : '0.00%';

  return (
    <section id="market" className="py-20 md:py-24 border-b border-[#E5E5E5] bg-[#FFFFFF] scroll-mt-16">
      <div className="max-w-[1140px] mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
          
          {/* Left Column: Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="lg:col-span-6 space-y-6"
          >
            <span className="text-[11px] font-medium tracking-wider text-[#5F6368] inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0A1D37]" />
              Market Overview
            </span>

            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#111111]">
              Understand what is happening.
            </h2>

            <p className="text-base text-[#5F6368] leading-relaxed">
              Explore Indian stocks and indices through organized market information, price movements, charts and market activity.
            </p>

            <ul className="space-y-3 pt-2">
              {capabilities.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-[#111111]">
                  <CheckCircle2 className="w-4 h-4 text-[#0A1D37] shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div className="pt-4">
              <Link
                to="/market"
                className="inline-flex items-center text-sm font-semibold text-[#FFFFFF] bg-[#0A1D37] hover:bg-[#071426] px-6 py-3 rounded-sm transition-all duration-150 shadow-xs"
              >
                <span>Explore Market</span>
              </Link>
            </div>
          </motion.div>

          {/* Right Column: Upgraded MARKET SNAPSHOT */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="lg:col-span-6"
          >
            <div className="bg-[#FAFAF8] border border-[#E5E5E5] p-6 sm:p-7 rounded-sm space-y-5 relative overflow-hidden shadow-xs">
              
              {/* Snapshot Header */}
              <div className="flex items-center justify-between pb-3.5 border-b border-[#E5E5E5]">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#0A1D37]" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#111111]">
                    MARKET SNAPSHOT
                  </span>
                </div>
                <span className="text-[10px] font-medium text-[#5F6368] bg-[#FFFFFF] px-2 py-0.5 rounded-xs border border-[#E5E5E5] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0A1D37]" />
                  NSE & BSE
                </span>
              </div>

              {/* Benchmark Indices Two-Column Row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-[#FFFFFF] border border-[#E5E5E5] rounded-xs space-y-1">
                  <span className="text-[10px] uppercase font-medium tracking-wider text-[#5F6368] block">NIFTY 50</span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-base font-bold tabular-nums text-[#111111]">
                      {nifty ? formatPrice(nifty.current_value) : '24,350.00'}
                    </span>
                    <span
                      className={`text-[11px] tabular-nums font-semibold ${
                        (nifty?.change ?? 0) >= 0 ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {formatPercent(nifty?.change_percent)}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-[#FFFFFF] border border-[#E5E5E5] rounded-xs space-y-1">
                  <span className="text-[10px] uppercase font-medium tracking-wider text-[#5F6368] block">SENSEX</span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-base font-bold tabular-nums text-[#111111]">
                      {sensex ? formatPrice(sensex.current_value) : '79,800.00'}
                    </span>
                    <span
                      className={`text-[11px] tabular-nums font-semibold ${
                        (sensex?.change ?? 0) >= 0 ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {formatPercent(sensex?.change_percent)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Market Breadth Strip */}
              <div className="p-3 bg-[#FFFFFF] border border-[#E5E5E5] rounded-xs space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-[#111111] uppercase tracking-wide">
                    SESSION BREADTH
                  </span>
                  <span className="text-[10px] font-medium tabular-nums text-[#5F6368]">
                    1,420 ADV / 890 DEC
                  </span>
                </div>
                <div className="h-1.5 w-full bg-[#E5E5E5] rounded-full overflow-hidden flex">
                  <div className="h-full bg-emerald-600 w-[61%]" />
                  <div className="h-full bg-rose-500 w-[39%]" />
                </div>
              </div>

              {/* Key Sectors Performance Snapshot */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-[10px] font-medium uppercase tracking-wider text-[#5F6368] px-1">
                  <span>SECTOR WATCH</span>
                  <span>MOMENTUM</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 bg-[#FFFFFF] border border-[#E5E5E5] rounded-xs flex items-center justify-between">
                    <span className="font-semibold text-[#111111]">Nifty Bank</span>
                    <span className="tabular-nums text-emerald-600 text-[11px] font-semibold">+0.68%</span>
                  </div>
                  <div className="p-2.5 bg-[#FFFFFF] border border-[#E5E5E5] rounded-xs flex items-center justify-between">
                    <span className="font-semibold text-[#111111]">Nifty IT</span>
                    <span className="tabular-nums text-emerald-600 text-[11px] font-semibold">+1.24%</span>
                  </div>
                  <div className="p-2.5 bg-[#FFFFFF] border border-[#E5E5E5] rounded-xs flex items-center justify-between">
                    <span className="font-semibold text-[#111111]">Nifty Auto</span>
                    <span className="tabular-nums text-rose-600 text-[11px] font-semibold">-0.42%</span>
                  </div>
                  <div className="p-2.5 bg-[#FFFFFF] border border-[#E5E5E5] rounded-xs flex items-center justify-between">
                    <span className="font-semibold text-[#111111]">Nifty Pharma</span>
                    <span className="tabular-nums text-emerald-600 text-[11px] font-semibold">+0.35%</span>
                  </div>
                </div>
              </div>

              {/* Abstract Line Graph Visual Metaphor */}
              <div className="pt-3 border-t border-[#E5E5E5]">
                <div className="h-12 flex items-end justify-between gap-1 px-1">
                  {[30, 45, 40, 65, 55, 75, 70, 95, 85, 100].map((h, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ height: 0 }}
                      whileInView={{ height: `${h}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: idx * 0.04 }}
                      className={`w-full rounded-t-xs ${idx % 2 === 0 ? 'bg-[#0A1D37]' : 'bg-[#0A1D37]/75'}`}
                    />
                  ))}
                </div>
                <div className="flex justify-between text-[10px] font-medium text-[#5F6368] pt-2 border-t border-[#E5E5E5]/60 mt-1">
                  <span>DALAL STREET TREND</span>
                  <span className="text-[#0A1D37] font-semibold">SYNTHESIZED VIEW</span>
                </div>
              </div>

            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default MarketSection;
