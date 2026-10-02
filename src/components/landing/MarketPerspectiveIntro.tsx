import React from 'react';
import { motion } from 'framer-motion';
import { useMarketIndices } from '@/hooks/market/useMarketIndices';
import { BarChart2, Newspaper, FileText, PieChart } from 'lucide-react';

export const MarketPerspectiveIntro: React.FC = () => {
  const { indices, isLoading } = useMarketIndices(60000);

  // Extract major benchmark indices from real API if available
  const nifty = indices.find((i) => i.name.toUpperCase().includes('NIFTY 50') || i.symbol === '^NSEI');
  const sensex = indices.find((i) => i.name.toUpperCase().includes('SENSEX') || i.symbol === '^BSESN');
  const bankNifty = indices.find((i) => i.name.toUpperCase().includes('BANK') || i.symbol === '^NSEBANK');

  return (
    <section className="py-20 md:py-24 border-b border-[#E5E5E5] bg-[#FAFAF8]">
      <div className="max-w-[1140px] mx-auto px-4 sm:px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="max-w-3xl mx-auto space-y-4"
        >
          <span className="text-[11px] font-medium tracking-wider text-[#5F6368] inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0A1D37]" />
            How SentiNews sees the market
          </span>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-[#111111] leading-[1.15]">
            See the market as a bigger picture.
          </h2>

          <p className="text-base sm:text-lg text-[#5F6368] leading-relaxed max-w-2xl mx-auto">
            SentiNews brings market information, relevant news, structured reports and portfolio context together to help you understand what is happening across Indian markets.
          </p>

          <div className="pt-4 flex justify-center">
            <div className="w-12 h-[1.5px] bg-[#0A1D37]" />
          </div>
        </motion.div>

        {/* 4 Perspectives Product Preview Cards in exact Navbar order: Market -> News -> Reports -> Portfolio */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 pt-12 text-left">
          
          {/* Card 1: MARKET */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="p-5 bg-[#FFFFFF] border border-[#E5E5E5] rounded-sm space-y-3.5 shadow-xs hover:border-[#0A1D37] transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-[#F1F1EF]">
                <div className="flex items-center gap-1.5">
                  <BarChart2 className="w-3.5 h-3.5 text-[#0A1D37]" />
                  <span className="text-xs font-semibold text-[#111111] uppercase tracking-wider group-hover:text-[#0A1D37] transition-colors">
                    MARKET
                  </span>
                </div>
              </div>
              <p className="text-xs text-[#5F6368] pt-2 pb-3">
                Understand what is happening across key benchmarks and market breadth.
              </p>

              {/* Miniature Real Product Preview: NIFTY, SENSEX, BANK NIFTY */}
              <div className="space-y-2 bg-[#FAFAF8] p-3 rounded-sm border border-[#E5E5E5]/70 text-xs">
                {isLoading && !nifty ? (
                  <div className="space-y-1.5 animate-pulse py-1">
                    <div className="h-3 bg-neutral-200 rounded-sm w-3/4" />
                    <div className="h-3 bg-neutral-200 rounded-sm w-2/3" />
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-[#5F6368] font-medium">NIFTY 50</span>
                      <span className="text-[#111111] font-semibold tabular-nums">
                        {nifty ? nifty.current_value.toLocaleString('en-IN', { maximumFractionDigits: 1 }) : '24,200+'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#5F6368] font-medium">SENSEX</span>
                      <span className="text-[#111111] font-semibold tabular-nums">
                        {sensex ? sensex.current_value.toLocaleString('en-IN', { maximumFractionDigits: 1 }) : '79,500+'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[#5F6368] font-medium">BANK NIFTY</span>
                      <span className="text-[#111111] font-semibold tabular-nums">
                        {bankNifty ? bankNifty.current_value.toLocaleString('en-IN', { maximumFractionDigits: 1 }) : '52,100+'}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="pt-2 border-t border-[#F1F1EF] flex items-center justify-between text-xs text-[#5F6368]">
              <span className="font-medium">Market Breadth</span>
              <span className="text-[#0A1D37] font-semibold">Advances / Declines</span>
            </div>
          </motion.div>

          {/* Card 2: NEWS */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="p-5 bg-[#FFFFFF] border border-[#E5E5E5] rounded-sm space-y-3.5 shadow-xs hover:border-[#0A1D37] transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-[#F1F1EF]">
                <div className="flex items-center gap-1.5">
                  <Newspaper className="w-3.5 h-3.5 text-[#0A1D37]" />
                  <span className="text-xs font-semibold text-[#111111] uppercase tracking-wider group-hover:text-[#0A1D37] transition-colors">
                    NEWS
                  </span>
                </div>
              </div>
              <p className="text-xs text-[#5F6368] pt-2 pb-3">
                Understand what moves the market through noise-free verified catalysts.
              </p>

              {/* Miniature Product Preview: Category Tags */}
              <div className="bg-[#FAFAF8] p-3 rounded-sm border border-[#E5E5E5]/70 flex flex-wrap gap-1.5">
                {['Macro', 'Corporate', 'RBI / SEBI', 'Earnings', 'IPOs'].map((tag) => (
                  <span
                    key={tag}
                    className="text-xs font-medium bg-[#FFFFFF] border border-[#E5E5E5] px-2 py-0.5 rounded-sm text-[#111111]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-[#F1F1EF] flex items-center justify-between text-xs text-[#5F6368]">
              <span className="font-medium">Filtering</span>
              <span className="text-[#0A1D37] font-semibold">Zero Noise</span>
            </div>
          </motion.div>

          {/* Card 3: REPORTS */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="p-5 bg-[#FFFFFF] border border-[#E5E5E5] rounded-sm space-y-3.5 shadow-xs hover:border-[#0A1D37] transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-[#F1F1EF]">
                <div className="flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-[#0A1D37]" />
                  <span className="text-xs font-semibold text-[#111111] uppercase tracking-wider group-hover:text-[#0A1D37] transition-colors">
                    REPORTS
                  </span>
                </div>
              </div>
              <p className="text-xs text-[#5F6368] pt-2 pb-3">
                Understand before and after the bell with structured daily intelligence.
              </p>

              {/* Miniature Product Preview: Pre & Post Report Chips */}
              <div className="space-y-2 bg-[#FAFAF8] p-3 rounded-sm border border-[#E5E5E5]/70 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[#0A1D37] flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0A1D37]" />
                    Pre-Market
                  </span>
                  <span className="text-[#5F6368] text-[11px]">8:30 AM</span>
                </div>
                <span className="block text-[11px] text-[#5F6368] truncate">
                  Global cues, GIFT Nifty, FII flows
                </span>
                <div className="flex items-center justify-between pt-1 border-t border-[#E5E5E5]/50">
                  <span className="font-semibold text-[#0A1D37] flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0A1D37]" />
                    Post-Market
                  </span>
                  <span className="text-[#5F6368] text-[11px]">4:15 PM</span>
                </div>
                <span className="block text-[11px] text-[#5F6368] truncate">
                  Closing wrap, sector heatmaps
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-[#F1F1EF] flex items-center justify-between text-xs text-[#5F6368]">
              <span className="font-medium">Cadence</span>
              <span className="text-[#0A1D37] font-semibold">Morning & Evening</span>
            </div>
          </motion.div>

          {/* Card 4: PORTFOLIO */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="p-5 bg-[#FFFFFF] border border-[#E5E5E5] rounded-sm space-y-3.5 shadow-xs hover:border-[#0A1D37] transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-[#F1F1EF]">
                <div className="flex items-center gap-1.5">
                  <PieChart className="w-3.5 h-3.5 text-[#0A1D37]" />
                  <span className="text-xs font-semibold text-[#111111] uppercase tracking-wider group-hover:text-[#0A1D37] transition-colors">
                    PORTFOLIO
                  </span>
                </div>
              </div>
              <p className="text-xs text-[#5F6368] pt-2 pb-3">
                Know where you stand with asset allocation, exposure, and P&L context.
              </p>

              {/* Miniature Product Preview: Allocation Bars */}
              <div className="space-y-2.5 bg-[#FAFAF8] p-3 rounded-sm border border-[#E5E5E5]/70 text-xs">
                <div className="flex justify-between text-[#5F6368]">
                  <span>BFSI / Financials</span>
                  <span className="font-semibold text-[#111111] tabular-nums">38%</span>
                </div>
                <div className="w-full bg-[#E5E5E5] h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#0A1D37] h-full w-[38%]" />
                </div>
                <div className="flex justify-between text-[#5F6368]">
                  <span>IT & Tech</span>
                  <span className="font-semibold text-[#111111] tabular-nums">32%</span>
                </div>
                <div className="w-full bg-[#E5E5E5] h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#0A1D37]/75 h-full w-[32%]" />
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-[#F1F1EF] flex items-center justify-between text-xs text-[#5F6368]">
              <span className="font-medium">Portfolio View</span>
              <span className="text-[#0A1D37] font-semibold">P&L & Exposure</span>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default MarketPerspectiveIntro;
