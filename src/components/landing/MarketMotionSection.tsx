import React from 'react';
import { motion } from 'framer-motion';
import { useMarketIndices } from '@/hooks/market/useMarketIndices';
import { useMarketOverview } from '@/hooks/market/useMarketOverview';
import { TrendingUp, TrendingDown, Minus, Activity, ArrowDown } from 'lucide-react';
import { Link } from 'react-router-dom';

export const MarketMotionSection: React.FC = () => {
  const { indices, isLoading } = useMarketIndices(30000);
  const { marketStatus } = useMarketOverview(30000);

  // Extract real benchmark and sectoral indices from API
  const nifty = indices.find((i) => i.name.toUpperCase().includes('NIFTY 50') || i.symbol === '^NSEI');
  const bankNifty = indices.find((i) => i.name.toUpperCase().includes('BANK') || i.symbol === '^NSEBANK');
  const itNifty = indices.find((i) => i.name.toUpperCase().includes('IT') || i.symbol === '^CNXIT');
  const autoNifty = indices.find((i) => i.name.toUpperCase().includes('AUTO') || i.symbol === '^CNXAUTO');

  const isMarketOpen = marketStatus === 'OPEN';

  const formatPrice = (val?: number) =>
    val ? val.toLocaleString('en-IN', { minimumFractionDigits: 1, maximumFractionDigits: 2 }) : '—';

  const formatPercent = (val?: number) =>
    val !== undefined ? `${val > 0 ? '+' : ''}${val.toFixed(2)}%` : '0.00%';

  return (
    <section className="py-20 md:py-24 border-b border-[#E5E5E5] bg-[#FFFFFF]">
      <div className="max-w-[1140px] mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-4 mb-14">
          <span className="text-[11px] uppercase tracking-[0.2em] font-semibold text-[#5F6368] inline-flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-[#0A1D37]" />
            MARKET IN MOTION • STRUCTURAL PULSE
          </span>

          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#111111] leading-tight">
            How capital flows through Indian markets.
          </h2>

          <p className="text-sm sm:text-base text-[#5F6368] leading-relaxed">
            From the headline benchmark index down to key sectoral engines and broad market participation, SentiNews synthesizes how market forces interact.
          </p>
        </div>

        {/* Editorial Market Intelligence Map */}
        <div className="max-w-3xl mx-auto bg-[#FAFAF8] border border-[#E5E5E5] rounded-sm p-6 sm:p-10 shadow-xs relative overflow-hidden">
          
          {/* Subtle grid background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#EFEFEA_1px,transparent_1px),linear-gradient(to_bottom,#EFEFEA_1px,transparent_1px)] bg-[size:32px_32px] opacity-60 pointer-events-none" />

          <div className="relative z-10 space-y-8">
            
            {/* BENCHMARK APEX (NIFTY 50) */}
            <div className="flex flex-col items-center">
              <span className="text-[11px] uppercase tracking-wider text-[#5F6368] mb-2 font-medium">
                Benchmark
              </span>

              <motion.div
                initial={{ opacity: 0, y: -12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md bg-[#FFFFFF] border-2 border-[#0A1D37] rounded-sm p-4 text-center shadow-xs"
              >
                <div className="flex items-center justify-between pb-2 border-b border-[#F1F1EF]">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#0A1D37]" />
                    <span className="text-sm font-semibold text-[#111111] tracking-wide">
                      {nifty?.name || 'NIFTY 50'}
                    </span>
                  </div>
                  <span className="text-[10px] font-medium text-[#5F6368] bg-[#F5F5F3] px-2 py-0.5 rounded-xs">
                    NATIONAL STOCK EXCHANGE
                  </span>
                </div>

                <div className="pt-3 flex items-center justify-between">
                  <div>
                    <span className="block text-[10px] uppercase text-[#5F6368] text-left font-medium">CURRENT VALUE</span>
                    <span className="text-xl font-bold tabular-nums text-[#111111]">
                      {nifty ? formatPrice(nifty.current_value) : '24,350.00'}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="block text-[10px] uppercase text-[#5F6368] font-medium">SESSION DELTA</span>
                    <span
                      className={`inline-flex items-center gap-1 tabular-nums text-xs font-semibold px-2 py-0.5 rounded-xs ${
                        (nifty?.change ?? 0) >= 0
                          ? 'text-emerald-700 bg-emerald-50'
                          : 'text-rose-700 bg-rose-50'
                      }`}
                    >
                      {(nifty?.change ?? 0) >= 0 ? (
                        <TrendingUp className="w-3 h-3 stroke-[2.5]" />
                      ) : (
                        <TrendingDown className="w-3 h-3 stroke-[2.5]" />
                      )}
                      <span>{formatPercent(nifty?.change_percent)}</span>
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Connecting Vertical Trunk Line */}
              <div className="h-8 w-[1.5px] bg-[#0A1D37] my-1 relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#0A1D37]" />
              </div>

              {/* Branching Horizontal T-Bar */}
              <div className="hidden sm:block w-3/4 h-[1.5px] bg-[#0A1D37]/40 relative">
                <div className="absolute left-0 top-0 w-2 h-2 -translate-x-1/2 -translate-y-1/3 rounded-full bg-[#0A1D37]/40" />
                <div className="absolute right-0 top-0 w-2 h-2 translate-x-1/2 -translate-y-1/3 rounded-full bg-[#0A1D37]/40" />
              </div>
            </div>

            {/* SECTOR ENGINES (BANK, IT, AUTO) */}
            <div>
              <div className="text-center mb-3">
                <span className="text-[11px] uppercase tracking-wider text-[#5F6368] font-medium">
                  Sectors
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                
                {/* Sector 1: Banking */}
                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="bg-[#FFFFFF] border border-[#E5E5E5] rounded-sm p-3.5 space-y-2 hover:border-[#0A1D37] transition-colors shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#111111]">NIFTY BANK</span>
                    <span className="text-[9px] font-medium text-[#5F6368] bg-[#F5F5F3] px-1.5 py-0.5 rounded-xs">
                      BFSI
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between pt-1">
                    <span className="text-sm font-bold tabular-nums text-[#111111]">
                      {bankNifty ? formatPrice(bankNifty.current_value) : '52,240.50'}
                    </span>
                    <span
                      className={`text-[11px] tabular-nums font-semibold ${
                        (bankNifty?.change ?? 0) >= 0 ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {formatPercent(bankNifty?.change_percent)}
                    </span>
                  </div>
                  <span className="block text-[10px] text-[#5F6368]">
                    Weight: ~33% of Nifty
                  </span>
                </motion.div>

                {/* Sector 2: IT */}
                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.15 }}
                  className="bg-[#FFFFFF] border border-[#E5E5E5] rounded-sm p-3.5 space-y-2 hover:border-[#0A1D37] transition-colors shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#111111]">NIFTY IT</span>
                    <span className="text-[9px] font-medium text-[#5F6368] bg-[#F5F5F3] px-1.5 py-0.5 rounded-xs">
                      TECH
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between pt-1">
                    <span className="text-sm font-bold tabular-nums text-[#111111]">
                      {itNifty ? formatPrice(itNifty.current_value) : '42,110.20'}
                    </span>
                    <span
                      className={`text-[11px] tabular-nums font-semibold ${
                        (itNifty?.change ?? 0) >= 0 ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {formatPercent(itNifty?.change_percent)}
                    </span>
                  </div>
                  <span className="block text-[10px] text-[#5F6368]">
                    Weight: ~14% of Nifty
                  </span>
                </motion.div>

                {/* Sector 3: Auto */}
                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="bg-[#FFFFFF] border border-[#E5E5E5] rounded-sm p-3.5 space-y-2 hover:border-[#0A1D37] transition-colors shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#111111]">NIFTY AUTO</span>
                    <span className="text-[9px] font-medium text-[#5F6368] bg-[#F5F5F3] px-1.5 py-0.5 rounded-xs">
                      AUTO
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between pt-1">
                    <span className="text-sm font-bold tabular-nums text-[#111111]">
                      {autoNifty ? formatPrice(autoNifty.current_value) : '25,680.00'}
                    </span>
                    <span
                      className={`text-[11px] tabular-nums font-semibold ${
                        (autoNifty?.change ?? 0) >= 0 ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {formatPercent(autoNifty?.change_percent)}
                    </span>
                  </div>
                  <span className="block text-[10px] text-[#5F6368]">
                    Weight: ~8% of Nifty
                  </span>
                </motion.div>

              </div>

              {/* Converging connector lines to Level 3 */}
              <div className="flex justify-center my-2">
                <div className="w-[1.5px] h-6 bg-[#0A1D37]/40" />
              </div>
            </div>

            {/* MARKET BREADTH FOUNDATION */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="bg-[#FFFFFF] border border-[#E5E5E5] rounded-sm p-5 space-y-4 shadow-xs"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#F1F1EF]">
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-[#5F6368] block font-medium">
                    Breadth
                  </span>
                  <h4 className="text-sm font-semibold text-[#111111] mt-0.5">
                    Market Breadth & Participation
                  </h4>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                      isMarketOpen
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-neutral-100 text-neutral-700 border border-neutral-200'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${isMarketOpen ? 'bg-emerald-500 animate-pulse' : 'bg-neutral-400'}`} />
                    {isMarketOpen ? 'Live Session' : 'Market Closed'}
                  </span>
                </div>
              </div>

              {/* Visual Advances vs Declines Distribution Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs tabular-nums">
                  <span className="text-emerald-700 font-semibold flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    ADVANCES (58%)
                  </span>
                  <span className="text-[#5F6368]">UNCHANGED (6%)</span>
                  <span className="text-rose-700 font-semibold flex items-center gap-1">
                    DECLINES (36%)
                    <TrendingDown className="w-3 h-3" />
                  </span>
                </div>

                <div className="h-2 w-full bg-[#E5E5E5] rounded-full overflow-hidden flex">
                  <div className="h-full bg-emerald-600 w-[58%]" />
                  <div className="h-full bg-neutral-300 w-[6%]" />
                  <div className="h-full bg-rose-500 w-[36%]" />
                </div>
              </div>

              <div className="pt-1 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-[#5F6368] gap-2">
                <span>
                  SentiNews calculates breadth momentum to show if rallies are driven by broad participation or narrow heavyweights.
                </span>
                <Link
                  to="/market"
                  className="inline-flex items-center gap-1 text-[#0A1D37] font-semibold hover:underline shrink-0"
                >
                  <span>View live breadth</span>
                  <ArrowDown className="w-3 h-3 -rotate-90" />
                </Link>
              </div>
            </motion.div>

          </div>
        </div>

      </div>
    </section>
  );
};

export default MarketMotionSection;
