import React from 'react';
import { motion } from 'framer-motion';

export const AboutSection: React.FC = () => {
  const principles = [
    {
      title: 'Information First',
      desc: 'Present useful market information clearly without sensationalism, speculation, or unnecessary financial jargon.',
    },
    {
      title: 'Indian Market Focused',
      desc: 'Designed ground-up specifically for Indian benchmark indices (NSE & BSE), domestic equities, and sectoral nuances.',
    },
    {
      title: 'Context Over Noise',
      desc: 'Connect raw stock and index movements with underlying macroeconomic, regulatory, and corporate context.',
    },
    {
      title: 'Zero Execution Bias',
      desc: 'Sentinews is dedicated purely to market intelligence and portfolio tracking — zero trade execution or advisory bias.',
    },
  ];

  return (
    <section id="about" className="py-20 md:py-24 border-b border-[#E5E5E5] bg-[#FAFAF8] scroll-mt-16">
      <div className="max-w-[1140px] mx-auto px-4 sm:px-6">
        <div className="max-w-3xl mx-auto space-y-12 text-center">
          
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="space-y-4"
          >
            <span className="text-[11px] font-medium tracking-wider text-[#5F6368] inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0A1D37]" />
              Product Principles
            </span>

            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#111111]">
              Built to make market information easier to understand.
            </h2>

            <p className="text-base text-[#5F6368] leading-relaxed max-w-2xl mx-auto">
              Sentinews is an Indian market intelligence platform that brings market information, portfolio tracking, daily reports and relevant news into one organized experience.
            </p>
          </motion.div>

          {/* 4 Core Principles Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-left">
            {principles.map((p, idx) => (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, delay: idx * 0.1, ease: 'easeOut' }}
                className="p-5.5 bg-[#FFFFFF] border border-[#E5E5E5] rounded-sm space-y-2.5 shadow-xs hover:border-[#0A1D37] transition-colors group"
              >
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0A1D37]" />
                  <h3 className="text-xs font-semibold tracking-wide text-[#111111] group-hover:text-[#0A1D37] transition-colors">
                    {p.title}
                  </h3>
                </div>
                <p className="text-xs text-[#5F6368] leading-relaxed pl-3.5">
                  {p.desc}
                </p>
              </motion.div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
};

export default AboutSection;
