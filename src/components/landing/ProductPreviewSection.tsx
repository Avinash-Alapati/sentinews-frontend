import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useMarketIndices } from '@/hooks/market/useMarketIndices';
import { useMarketOverview } from '@/hooks/market/useMarketOverview';
import {
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Shield,
  Layers,
  Activity,
  FileText,
  Clock,
  Sparkles,
} from 'lucide-react';

export const ProductPreviewSection: React.FC = () => {
  const { indices } = useMarketIndices(30000);
  const { marketStatus } = useMarketOverview(30000);

  const nifty = indices.find((i) => i.name.toUpperCase().includes('NIFTY 50') || i.symbol === '^NSEI');
  const sensex = indices.find((i) => i.name.toUpperCase().includes('SENSEX') || i.symbol === '^BSESN');
  const bankNifty = indices.find((i) => i.name.toUpperCase().includes('BANK') || i.symbol === '^NSEBANK');

  const isMarketOpen = marketStatus === 'OPEN';

  const formatPrice = (val?: number) =>
    val ? val.toLocaleString('en-IN', { minimumFractionDigits: 1, maximumFractionDigits: 2 }) : '—';

  const formatPercent = (val?: number) =>
    val !== undefined ? `${val > 0 ? '+' : ''}${val.toFixed(2)}%` : '0.00%';

  return (
    <section className="py-20 md:py-24 border-b border-[#E5E5E5] bg-[#FAFAF8]">
      <div className="max-w-[1140px] mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-4 mb-14">
          <span className="text-[11px] uppercase tracking-[0.2em] font-semibold text-[#5F6368] inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0A1D37]" />
            PLATFORM EXPERIENCE
          </span>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-[#111111]">
            One Market. One View.
          </h2>

          <p className="text-sm sm:text-base text-[#5F6368] leading-relaxed">
            Experience a unified workspace designed specifically for Indian capital markets — synthesizing benchmark indices, sector heatmaps, market breadth, and structured intelligence.
          </p>
        </div>

        {/* Realistic SentiNews Application Window Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="bg-[#FFFFFF] border border-[#E5E5E5] rounded-sm shadow-md overflow-hidden"
        >
          {/* Mock Browser/App Chrome Header */}
          <div className="bg-[#0A1D37] text-white px-4 py-3 flex items-center justify-between border-b border-[#071426]">
            {/* Window control dots */}
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-white/20" />
              <span className="w-2.5 h-2.5 rounded-full bg-white/20" />
              <span className="w-2.5 h-2.5 rounded-full bg-white/20" />
              <span className="text-xs font-semibold tracking-wider font-sans ml-2 text-white/90">
                SENTINEWS WORKSPACE
              </span>
            </div>

            {/* Mock URL / Route Bar */}
            <div className="hidden sm:flex items-center gap-2 bg-white/10 px-4 py-1 rounded-xs text-[11px] text-white/80 border border-white/10">
              <Shield className="w-3 h-3 text-emerald-400" />
              <span>sentinews.in/market/overview</span>
            </div>

            {/* Live Indicator */}
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${isMarketOpen ? 'bg-emerald-400 animate-pulse' : 'bg-neutral-400'}`} />
              <span className="text-[10px] font-medium uppercase tracking-wider text-white/80">
                {isMarketOpen ? 'LIVE MARKET' : 'SESSION CLOSED'}
              </span>
            </div>
          </div>

          {/* Subheader: Real Live Indices Bar */}
          <div className="bg-[#FAFAF8] border-b border-[#E5E5E5] p-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* NIFTY 50 Card */}
            <div className="p-3 bg-[#FFFFFF] border border-[#E5E5E5] rounded-xs space-y-1">
              <div className="flex justify-between items-center text-[10px] text-[#5F6368] font-medium uppercase">
                <span>NIFTY 50</span>
                <span>NSE BENCHMARK</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-lg font-bold tabular-nums text-[#111111]">
                  {nifty ? formatPrice(nifty.current_value) : '24,350.00'}
                </span>
                <span
                  className={`inline-flex items-center gap-0.5 text-xs tabular-nums font-semibold ${
                    (nifty?.change ?? 0) >= 0 ? 'text-emerald-600' : 'text-rose-600'
                  }`}
                >
                  {(nifty?.change ?? 0) >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {formatPercent(nifty?.change_percent)}
                </span>
              </div>
            </div>

            {/* SENSEX Card */}
            <div className="p-3 bg-[#FFFFFF] border border-[#E5E5E5] rounded-xs space-y-1">
              <div className="flex justify-between items-center text-[10px] text-[#5F6368] font-medium uppercase">
                <span>SENSEX</span>
                <span>BSE BENCHMARK</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-lg font-bold tabular-nums text-[#111111]">
                  {sensex ? formatPrice(sensex.current_value) : '79,800.00'}
                </span>
                <span
                  className={`inline-flex items-center gap-0.5 text-xs tabular-nums font-semibold ${
                    (sensex?.change ?? 0) >= 0 ? 'text-emerald-600' : 'text-rose-600'
                  }`}
                >
                  {(sensex?.change ?? 0) >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {formatPercent(sensex?.change_percent)}
                </span>
              </div>
            </div>

            {/* BANK NIFTY Card */}
            <div className="p-3 bg-[#FFFFFF] border border-[#E5E5E5] rounded-xs space-y-1">
              <div className="flex justify-between items-center text-[10px] text-[#5F6368] font-medium uppercase">
                <span>BANK NIFTY</span>
                <span>FINANCIAL SERVICES</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-lg font-bold tabular-nums text-[#111111]">
                  {bankNifty ? formatPrice(bankNifty.current_value) : '52,240.00'}
                </span>
                <span
                  className={`inline-flex items-center gap-0.5 text-xs tabular-nums font-semibold ${
                    (bankNifty?.change ?? 0) >= 0 ? 'text-emerald-600' : 'text-rose-600'
                  }`}
                >
                  {(bankNifty?.change ?? 0) >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {formatPercent(bankNifty?.change_percent)}
                </span>
              </div>
            </div>
          </div>

          {/* Workspace Body: Two-Column Modular Layout */}
          <div className="p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 bg-[#FFFFFF]">
            
            {/* Left Workspace Pane (5 Cols): Breadth & Sector Heatmap */}
            <div className="lg:col-span-5 space-y-4">
              
              {/* Breadth Card */}
              <div className="p-4 bg-[#FAFAF8] border border-[#E5E5E5] rounded-xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#E5E5E5]">
                  <span className="text-xs font-semibold text-[#111111] uppercase tracking-wider flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-[#0A1D37]" />
                    MARKET BREADTH
                  </span>
                  <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-xs">
                    NET ADVANCING
                  </span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs tabular-nums">
                    <span className="text-emerald-700 font-medium">1,480 Advances</span>
                    <span className="text-rose-700 font-medium">820 Declines</span>
                  </div>
                  <div className="h-2 w-full bg-[#E5E5E5] rounded-full overflow-hidden flex">
                    <div className="h-full bg-emerald-600 w-[64%]" />
                    <div className="h-full bg-rose-500 w-[36%]" />
                  </div>
                  <div className="flex justify-between text-[10px] text-[#5F6368] pt-1">
                    <span>Advance-Decline Ratio: 1.80</span>
                    <span>Broad Market Strong</span>
                  </div>
                </div>
              </div>

              {/* Sectoral Momentum Preview */}
              <div className="p-4 bg-[#FAFAF8] border border-[#E5E5E5] rounded-xs space-y-2.5">
                <div className="flex items-center justify-between pb-2 border-b border-[#E5E5E5]">
                  <span className="text-xs font-semibold text-[#111111] uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-[#0A1D37]" />
                    TOP SECTORAL MOVERS
                  </span>
                  <span className="text-[10px] font-medium text-[#5F6368]">
                    HEATMAP
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 bg-[#FFFFFF] border border-[#E5E5E5] rounded-xs flex justify-between items-center">
                    <span className="font-semibold text-[#111111]">Nifty IT</span>
                    <span className="tabular-nums text-emerald-600 font-semibold">+1.34%</span>
                  </div>
                  <div className="p-2 bg-[#FFFFFF] border border-[#E5E5E5] rounded-xs flex justify-between items-center">
                    <span className="font-semibold text-[#111111]">Nifty Bank</span>
                    <span className="tabular-nums text-emerald-600 font-semibold">+0.62%</span>
                  </div>
                  <div className="p-2 bg-[#FFFFFF] border border-[#E5E5E5] rounded-xs flex justify-between items-center">
                    <span className="font-semibold text-[#111111]">Nifty Auto</span>
                    <span className="tabular-nums text-rose-600 font-semibold">-0.48%</span>
                  </div>
                  <div className="p-2 bg-[#FFFFFF] border border-[#E5E5E5] rounded-xs flex justify-between items-center">
                    <span className="font-semibold text-[#111111]">Nifty Metal</span>
                    <span className="tabular-nums text-emerald-600 font-semibold">+0.85%</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Workspace Pane (7 Cols): Active Equities & Intelligence Reports */}
            <div className="lg:col-span-7 space-y-4">
              
              {/* Daily Intelligence Synthesis Banner */}
              <div className="p-4 bg-[#0A1D37] text-white rounded-xs border border-[#071426] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-widest text-white/70 flex items-center gap-1 font-medium">
                    <FileText className="w-3 h-3 text-white/80" />
                    TODAY'S EXECUTIVE INTELLIGENCE
                  </span>
                  <span className="text-[9px] font-medium bg-white/15 px-1.5 py-0.5 rounded-xs text-white">
                    SYNTHESIZED
                  </span>
                </div>
                <h4 className="text-sm font-semibold text-white">
                  IT Earnings Resilience Offsets Selective Auto Profit Booking
                </h4>
                <p className="text-xs text-white/75 leading-relaxed">
                  Broad market breadth remains positive across NSE midcaps. FII net buying turned positive at +₹920 Cr with GIFT Nifty holding premium.
                </p>
              </div>

              {/* Stock Movement Preview Grid */}
              <div className="p-4 bg-[#FAFAF8] border border-[#E5E5E5] rounded-xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#E5E5E5]">
                  <span className="text-xs font-semibold text-[#111111] uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#0A1D37]" />
                    KEY EQUITIES IN FOCUS
                  </span>
                  <span className="text-[10px] font-medium text-[#5F6368]">
                    LIVE RADAR
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="p-2.5 bg-[#FFFFFF] border border-[#E5E5E5] rounded-xs flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-[#111111] block">TCS</span>
                      <span className="text-[10px] text-[#5F6368]">Tata Consultancy Services • Tech</span>
                    </div>
                    <div className="text-right">
                      <span className="font-semibold text-[#111111] block tabular-nums">₹4,120.40</span>
                      <span className="text-emerald-600 text-[11px] font-semibold tabular-nums">+1.82%</span>
                    </div>
                  </div>

                  <div className="p-2.5 bg-[#FFFFFF] border border-[#E5E5E5] rounded-xs flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-[#111111] block">HDFCBANK</span>
                      <span className="text-[10px] text-[#5F6368]">HDFC Bank Ltd • BFSI</span>
                    </div>
                    <div className="text-right">
                      <span className="font-semibold text-[#111111] block tabular-nums">₹1,745.00</span>
                      <span className="text-emerald-600 text-[11px] font-semibold tabular-nums">+0.75%</span>
                    </div>
                  </div>

                  <div className="p-2.5 bg-[#FFFFFF] border border-[#E5E5E5] rounded-xs flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-[#111111] block">RELIANCE</span>
                      <span className="text-[10px] text-[#5F6368]">Reliance Industries • Energy</span>
                    </div>
                    <div className="text-right">
                      <span className="font-semibold text-[#111111] block tabular-nums">₹2,985.10</span>
                      <span className="text-rose-600 text-[11px] font-semibold tabular-nums">-0.32%</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>

          </div>

          {/* Bottom Action Footer */}
          <div className="p-4 bg-[#FAFAF8] border-t border-[#E5E5E5] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#5F6368]">
            <span className="text-[11px] font-medium">
              Complete live coverage across NSE & BSE stocks, ETFs, indices and sectors.
            </span>
            <Link
              to="/market"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#FFFFFF] bg-[#0A1D37] hover:bg-[#071426] px-5 py-2.5 rounded-sm transition-all shadow-xs"
            >
              <span>Explore Live Market</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </motion.div>

      </div>
    </section>
  );
};

export default ProductPreviewSection;
