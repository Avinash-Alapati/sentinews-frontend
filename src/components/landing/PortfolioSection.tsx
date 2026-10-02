import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, PieChart, Info, ShieldCheck } from 'lucide-react';

export const PortfolioSection: React.FC = () => {
  const capabilities = [
    'Track holdings across Indian equities',
    'View sector & market-cap allocation',
    'Monitor portfolio gain / loss & daily performance',
    'Understand sector concentration & diversification',
    'Connect portfolio holdings with relevant market news & reports',
  ];

  return (
    <section id="portfolio" className="py-20 md:py-24 border-b border-[#E5E5E5] bg-[#FAFAF8] scroll-mt-16">
      <div className="max-w-[1140px] mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
          
          {/* Left Column: Abstract Visual (Alternating!) */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="lg:col-span-6 order-2 lg:order-1"
          >
            <div className="bg-[#FFFFFF] border border-[#E5E5E5] p-6 sm:p-7 rounded-sm space-y-5 shadow-xs relative">
              
              {/* Header */}
              <div className="flex items-center justify-between pb-3.5 border-b border-[#E5E5E5]">
                <div className="flex items-center gap-2">
                  <PieChart className="w-4 h-4 text-[#0A1D37]" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#111111]">
                    PORTFOLIO CONTEXT PREVIEW
                  </span>
                </div>
                <span className="text-[10px] font-medium text-[#5F6368] bg-[#F5F5F3] px-2 py-0.5 rounded-xs border border-[#E5E5E5]/60 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0A1D37]" />
                  ANALYTICS ONLY
                </span>
              </div>

              {/* Portfolio Performance & Allocation Snapshot */}
              <div className="p-4 border border-[#E5E5E5] rounded-xs bg-[#FAFAF8] space-y-3.5">
                
                {/* Micro Metric Header */}
                <div className="grid grid-cols-3 gap-2 pb-3 border-b border-[#E5E5E5]/70">
                  <div className="p-2.5 bg-[#FFFFFF] border border-[#E5E5E5] rounded-xs text-center">
                    <span className="block text-[9px] uppercase tracking-wider text-[#5F6368] font-medium">
                      ALLOCATION
                    </span>
                    <span className="text-xs font-semibold text-[#111111] block mt-0.5">
                      12 Holdings
                    </span>
                  </div>
                  <div className="p-2.5 bg-[#FFFFFF] border border-[#E5E5E5] rounded-xs text-center">
                    <span className="block text-[9px] uppercase tracking-wider text-[#5F6368] font-medium">
                      EXPOSURE
                    </span>
                    <span className="text-xs font-semibold text-[#111111] block mt-0.5">
                      5 Sectors
                    </span>
                  </div>
                  <div className="p-2.5 bg-[#FFFFFF] border border-[#E5E5E5] rounded-xs text-center">
                    <span className="block text-[9px] uppercase tracking-wider text-[#5F6368] font-medium">
                      P&L CONTEXT
                    </span>
                    <span className="text-xs font-bold text-emerald-600 block mt-0.5 tabular-nums">
                      +16.4%
                    </span>
                  </div>
                </div>

                {/* Sector Allocation Progress Bars */}
                <div className="space-y-2 pt-1">
                  <div className="flex justify-between text-[11px] text-[#5F6368]">
                    <span>Banking & Financials</span>
                    <span className="tabular-nums text-[#0A1D37] font-semibold">38%</span>
                  </div>
                  <div className="h-1.5 w-full bg-[#E5E5E5] rounded-full overflow-hidden">
                    <div className="h-full bg-[#0A1D37] w-[38%]" />
                  </div>

                  <div className="flex justify-between text-[11px] text-[#5F6368] pt-1">
                    <span>Technology & Services</span>
                    <span className="tabular-nums text-[#0A1D37] font-semibold">32%</span>
                  </div>
                  <div className="h-1.5 w-full bg-[#E5E5E5] rounded-full overflow-hidden">
                    <div className="h-full bg-[#0A1D37]/75 w-[32%]" />
                  </div>

                  <div className="flex justify-between text-[11px] text-[#5F6368] pt-1">
                    <span>Automobile & Industrials</span>
                    <span className="tabular-nums text-[#0A1D37] font-semibold">18%</span>
                  </div>
                  <div className="h-1.5 w-full bg-[#E5E5E5] rounded-full overflow-hidden">
                    <div className="h-full bg-[#0A1D37]/50 w-[18%]" />
                  </div>
                </div>

                {/* Diversification Health Badge */}
                <div className="pt-2 flex items-center justify-between text-[10px] text-[#5F6368] border-t border-[#E5E5E5]/60">
                  <span className="flex items-center gap-1 font-medium text-[#0A1D37]">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    HEALTHY DIVERSIFICATION
                  </span>
                  <span className="font-medium">Low Top-3 Concentration</span>
                </div>
              </div>

              {/* Crucial SEBI & Non-Execution Disclaimer Note */}
              <div className="flex items-start gap-2.5 p-3.5 bg-[#F5F5F3] border border-[#E5E5E5] rounded-xs text-xs text-[#5F6368]">
                <Info className="w-4 h-4 text-[#0A1D37] shrink-0 mt-0.5" />
                <span>
                  <strong className="text-[#111111]">Sentinews provides pure tracking and intelligence</strong> — it does not execute stock trades, hold client balances, or route broker orders.
                </span>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Text Content */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="lg:col-span-6 space-y-6 order-1 lg:order-2"
          >
            <span className="text-[11px] font-medium tracking-wider text-[#5F6368] inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0A1D37]" />
              Portfolio Context
            </span>

            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#111111]">
              Know where you stand.
            </h2>

            <p className="text-base text-[#5F6368] leading-relaxed">
              Track your holdings, allocation and portfolio performance in one organized view without the clutter of trade execution.
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
                to="/portfolio"
                className="inline-flex items-center text-sm font-semibold text-[#FFFFFF] bg-[#0A1D37] hover:bg-[#071426] px-6 py-3 rounded-sm transition-all duration-150 shadow-xs"
              >
                <span>Explore Portfolio</span>
              </Link>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default PortfolioSection;
