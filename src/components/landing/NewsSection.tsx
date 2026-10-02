import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, Newspaper, Clock } from 'lucide-react';

export const NewsSection: React.FC = () => {
  const timelineEvents = [
    {
      time: '09:10 IST',
      category: 'MACRO',
      title: 'Global Market Cues & GIFT Nifty',
      desc: 'Overnight Asian market trends, US index futures, and GIFT Nifty opening bias.',
    },
    {
      time: '11:30 IST',
      category: 'CORPORATE',
      title: 'Contract Wins & Corporate Actions',
      desc: 'Material corporate order disclosures, strategic investments, and board approvals.',
    },
    {
      time: '13:15 IST',
      category: 'REGULATORY',
      title: 'RBI & SEBI Policy Developments',
      desc: 'Central bank liquidity decisions, banking circulars, and market regulations.',
    },
    {
      time: '14:30 IST',
      category: 'EARNINGS',
      title: 'Quarterly Results & Margins',
      desc: 'Mid-session corporate earnings, EBITDA margin commentary, and guidance updates.',
    },
    {
      time: '15:40 IST',
      category: 'PRIMARY MARKET',
      title: 'IPO Filings & Subscription Status',
      desc: 'Daily institutional subscription numbers, retail demand, and DRHP filings.',
    },
  ];

  return (
    <section id="news" className="py-20 md:py-24 border-b border-[#E5E5E5] bg-[#FAFAF8] scroll-mt-16">
      <div className="max-w-[1140px] mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
          
          {/* Left Column: Market Event Timeline Visual (Alternating!) */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="lg:col-span-6 order-2 lg:order-1"
          >
            <div className="bg-[#FFFFFF] border border-[#E5E5E5] p-6 sm:p-7 rounded-sm space-y-5 shadow-xs">
              <div className="flex items-center justify-between pb-3.5 border-b border-[#E5E5E5]">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#0A1D37]" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#111111]">
                    MARKET-EVENT TIMELINE
                  </span>
                </div>
                <span className="text-[10px] font-medium text-[#5F6368] bg-[#F5F5F3] px-2 py-0.5 rounded-xs border border-[#E5E5E5]/60 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0A1D37]" />
                  CHRONOLOGICAL
                </span>
              </div>

              {/* Chronological Event Timeline Cards */}
              <div className="space-y-2.5">
                {timelineEvents.map((item) => (
                  <div
                    key={item.category}
                    className="p-3 bg-[#FAFAF8] border border-[#E5E5E5] rounded-xs hover:border-[#0A1D37] transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="tabular-nums text-[10px] font-semibold text-[#0A1D37] bg-[#EFEFEA] px-1.5 py-0.5 rounded-xs">
                          {item.time}
                        </span>
                        <span className="text-xs font-semibold text-[#111111]">
                          {item.title}
                        </span>
                      </div>
                      <span className="text-[9px] font-semibold uppercase tracking-wider bg-[#0A1D37] text-[#FFFFFF] px-1.5 py-0.5 rounded-xs">
                        {item.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#5F6368] pl-1">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>

              <div className="pt-2 text-center border-t border-[#E5E5E5]">
                <span className="text-[10px] font-medium text-[#5F6368] flex items-center justify-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0A1D37]" />
                  VERIFIED FACTUAL NEWS • ZERO SPECULATION
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
              Market Events
            </span>

            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#111111]">
              Understand what moves the market.
            </h2>

            <p className="text-base text-[#5F6368] leading-relaxed">
              Follow relevant Indian market and company developments alongside raw data — synthesized into clear chronological context.
            </p>

            <ul className="space-y-3 pt-2">
              {[
                'Relevant Indian market news & macroeconomic updates',
                'Corporate announcements & quarterly earnings reports',
                'Regulatory updates from RBI and SEBI',
                'Primary market IPO news & DRHP developments',
                'Market-moving geopolitical & policy events',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-[#111111]">
                  <CheckCircle2 className="w-4 h-4 text-[#0A1D37] shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div className="pt-4">
              <Link
                to="/news"
                className="inline-flex items-center text-sm font-semibold text-[#FFFFFF] bg-[#0A1D37] hover:bg-[#071426] px-6 py-3 rounded-sm transition-all duration-150 shadow-xs"
              >
                <span>Explore News</span>
              </Link>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default NewsSection;
