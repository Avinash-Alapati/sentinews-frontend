import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sun, Moon, Clock, CheckCircle2 } from 'lucide-react';

export const ReportsSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'pre' | 'post'>('pre');

  const preMarketItems = [
    'Previous Session Recap & Global Cues',
    'Index Setup (NIFTY / SENSEX / GIFT NIFTY)',
    'Sectoral Setup & Momentum',
    'Stocks in Focus (Earnings & Triggers)',
    'FII / DII Net Institutional Activity',
    'Corporate Actions & Announcements',
    'IPO Watch & Subscriptions',
    'Today’s Economic & Policy Events',
  ];

  const postMarketItems = [
    'Closing Snapshot & Market Overview',
    'Index Trajectory & Volatility',
    'Market Breadth (Advances vs Declines)',
    'Sector Performance & Heatmap',
    'Top Gainers & Top Losers',
    'FII / DII Institutional Flows',
    'Key Market Drivers & Catalysts',
    'Executive Daily Market Summary',
  ];

  return (
    <section id="reports" className="py-20 md:py-24 border-b border-[#E5E5E5] bg-[#FFFFFF] scroll-mt-16">
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
              Market Reports
            </span>

            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#111111]">
              Know what matters before and after the market.
            </h2>

            <p className="text-base text-[#5F6368] leading-relaxed">
              Sentinews organizes Indian market information into structured daily intelligence designed around the trading day cycle.
            </p>

            {/* Editorial Switcher: BEFORE THE BELL vs AFTER THE BELL */}
            <div className="flex items-center gap-2 p-1 bg-[#F5F5F3] border border-[#E5E5E5] rounded-xs max-w-md">
              <button
                type="button"
                onClick={() => setActiveTab('pre')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-xs transition-all cursor-pointer ${
                  activeTab === 'pre'
                    ? 'bg-[#FFFFFF] text-[#0A1D37] shadow-xs border border-[#0A1D37]/30'
                    : 'text-[#5F6368] hover:text-[#0A1D37]'
                }`}
              >
                <Sun className="w-3.5 h-3.5 text-[#0A1D37]" />
                <span>BEFORE THE BELL (PRE)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('post')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-xs transition-all cursor-pointer ${
                  activeTab === 'post'
                    ? 'bg-[#FFFFFF] text-[#0A1D37] shadow-xs border border-[#0A1D37]/30'
                    : 'text-[#5F6368] hover:text-[#0A1D37]'
                }`}
              >
                <Moon className="w-3.5 h-3.5 text-[#0A1D37]" />
                <span>AFTER THE BELL (POST)</span>
              </button>
            </div>

            {/* Selected Tab Description */}
            <div className="space-y-4 pt-1">
              <div>
                <h3 className="text-base font-semibold text-[#111111]">
                  {activeTab === 'pre'
                    ? 'Before 9:15 AM — Morning Preparation'
                    : 'After 3:30 PM — Evening Wrap & Recap'}
                </h3>
                <p className="text-xs text-[#5F6368] mt-0.5">
                  {activeTab === 'pre'
                    ? 'Understand the global setup and key catalysts before India’s opening bell.'
                    : 'Understand what drove the session and where institutional flows ended up.'}
                </p>
              </div>

              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#111111]">
                {(activeTab === 'pre' ? preMarketItems : postMarketItems).map((item) => (
                  <li key={item} className="flex items-start gap-2 bg-[#FAFAF8] p-2.5 border border-[#E5E5E5] rounded-xs hover:border-[#0A1D37]/40 transition-colors">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#0A1D37] shrink-0 mt-0.5" />
                    <span className="leading-snug">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-4">
              <Link
                to="/reports"
                className="inline-flex items-center text-sm font-semibold text-[#FFFFFF] bg-[#0A1D37] hover:bg-[#071426] px-6 py-3 rounded-sm transition-all duration-150 shadow-xs"
              >
                <span>Explore Reports</span>
              </Link>
            </div>
          </motion.div>

          {/* Right Column: Timeline Visual Metaphor */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="lg:col-span-6"
          >
            <div className="bg-[#FAFAF8] border border-[#E5E5E5] p-6 sm:p-7 rounded-sm space-y-6 shadow-xs">
              <div className="flex items-center justify-between pb-3.5 border-b border-[#E5E5E5]">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#0A1D37]" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#111111]">
                    INDIAN TRADING DAY TIMELINE
                  </span>
                </div>
                <span className="text-[10px] font-medium text-[#5F6368] bg-[#F5F5F3] px-2 py-0.5 rounded-xs border border-[#E5E5E5]/60 flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-[#0A1D37]" />
                  IST TIMEZONE
                </span>
              </div>

              {/* Connected Timeline Nodes */}
              <div className="relative pl-6 space-y-7 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[1px] before:bg-[#E5E5E5]">
                
                {/* Stage 1: Pre-Market */}
                <div className="relative group">
                  <div
                    className={`absolute -left-[23px] top-0 w-4 h-4 rounded-full bg-[#FFFFFF] border-2 flex items-center justify-center transition-colors ${
                      activeTab === 'pre' ? 'border-[#0A1D37]' : 'border-[#888888]'
                    }`}
                  >
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${
                        activeTab === 'pre' ? 'bg-[#0A1D37]' : 'bg-[#888888]'
                      }`}
                    />
                  </div>
                  <div
                    className={`p-4 rounded-xs space-y-1 transition-all ${
                      activeTab === 'pre'
                        ? 'bg-[#FFFFFF] border-2 border-[#0A1D37] shadow-xs'
                        : 'bg-[#FFFFFF] border border-[#E5E5E5]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-[#0A1D37] uppercase tracking-wider">
                        PRE-MARKET INTELLIGENCE
                      </span>
                      <span className="text-[11px] font-medium text-[#5F6368]">BEFORE 9:15 AM</span>
                    </div>
                    <p className="text-xs text-[#5F6368]">
                      Global cues, GIFT Nifty positioning, sector momentum, and stocks in focus.
                    </p>
                  </div>
                </div>

                {/* Stage 2: Market Session */}
                <div className="relative group">
                  <div className="absolute -left-[23px] top-0 w-4 h-4 rounded-full bg-[#FFFFFF] border-2 border-[#888888] flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#888888]" />
                  </div>
                  <div className="p-4 bg-[#F5F5F3] border border-[#E5E5E5]/70 rounded-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-[#5F6368] uppercase tracking-wider">
                        INDIAN MARKET SESSION
                      </span>
                      <span className="text-[11px] font-medium text-[#888888]">9:15 AM — 3:30 PM</span>
                    </div>
                    <p className="text-xs text-[#888888]">
                      Live continuous equity trading across NSE and BSE equity exchanges.
                    </p>
                  </div>
                </div>

                {/* Stage 3: Post-Market */}
                <div className="relative group">
                  <div
                    className={`absolute -left-[23px] top-0 w-4 h-4 rounded-full bg-[#FFFFFF] border-2 flex items-center justify-center transition-colors ${
                      activeTab === 'post' ? 'border-[#0A1D37]' : 'border-[#888888]'
                    }`}
                  >
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${
                        activeTab === 'post' ? 'bg-[#0A1D37]' : 'bg-[#888888]'
                      }`}
                    />
                  </div>
                  <div
                    className={`p-4 rounded-xs space-y-1 transition-all ${
                      activeTab === 'post'
                        ? 'bg-[#FFFFFF] border-2 border-[#0A1D37] shadow-xs'
                        : 'bg-[#FFFFFF] border border-[#E5E5E5]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-[#0A1D37] uppercase tracking-wider">
                        POST-MARKET INTELLIGENCE
                      </span>
                      <span className="text-[11px] font-medium text-[#5F6368]">AFTER 4:00 PM</span>
                    </div>
                    <p className="text-xs text-[#5F6368]">
                      Closing recap, market breadth, FII/DII institutional flows, and daily drivers summary.
                    </p>
                  </div>
                </div>

              </div>

            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default ReportsSection;
