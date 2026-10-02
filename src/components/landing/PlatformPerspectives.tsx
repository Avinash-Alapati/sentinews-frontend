import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, PieChart, FileText, Newspaper } from 'lucide-react';
import logoSvg from '@/assets/SentiNews_logo_exact.svg';

export const PlatformPerspectives: React.FC = () => {
  const perspectives = [
    {
      title: 'Market',
      icon: BarChart3,
      desc: 'Explore and understand the market.',
      detail: 'Benchmark indices, sector momentum, and market breadth.',
    },
    {
      title: 'News',
      icon: Newspaper,
      desc: 'Follow what moves the market.',
      detail: 'Verified catalysts, corporate filings, and regulatory updates.',
    },
    {
      title: 'Reports',
      icon: FileText,
      desc: 'Structured daily market intelligence.',
      detail: 'Pre-market preparation and post-market session wrap.',
    },
    {
      title: 'Portfolio',
      icon: PieChart,
      desc: 'Track and understand your holdings.',
      detail: 'Asset allocation, diversification, and P&L context.',
    },
  ];

  return (
    <section className="py-20 md:py-24 border-b border-[#E5E5E5] bg-[#FFFFFF]">
      <div className="max-w-[1140px] mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-[11px] font-medium tracking-wider text-[#5F6368] inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0A1D37]" />
            Platform Architecture
          </span>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#111111]">
            One market. Connected perspectives.
          </h2>
          <p className="text-base text-[#5F6368]">
            Connected intelligence. A clearer picture.
          </p>
        </div>

        {/* Central Connected Diagram with Sequential Scroll Animation */}
        <div className="relative max-w-3xl mx-auto py-8 px-4">
          
          {/* Background Connecting Axis Lines (Desktop) */}
          <div className="hidden md:block absolute inset-0 flex items-center justify-center pointer-events-none z-0">
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
              className="w-[85%] h-[1px] bg-[#E5E5E5]"
            />
            <motion.div
              initial={{ scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
              className="h-[85%] w-[1px] bg-[#E5E5E5] absolute"
            />
          </div>

          {/* Central SentiNews Logo Node (Activates First) */}
          <div className="relative z-10 flex justify-center mb-10 md:mb-14">
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="bg-[#FAFAF8] border-2 border-[#0A1D37] px-6 py-4 rounded-sm shadow-sm flex items-center justify-center max-w-[260px] text-center"
            >
              <img src={logoSvg} alt="SentiNews Core" className="h-8 w-auto object-contain" />
            </motion.div>
          </div>

          {/* 4 Perspective Cards (Subtly appear sequentially after central node) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8 relative z-10">
            {perspectives.map((p, idx) => {
              const Icon = p.icon;
              return (
                <motion.div
                  key={p.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.5, delay: 0.35 + idx * 0.1, ease: 'easeOut' }}
                  className="bg-[#FAFAF8] border border-[#E5E5E5] p-5 rounded-sm space-y-2.5 hover:border-[#0A1D37] transition-all group shadow-xs hover:shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xs bg-[#FFFFFF] border border-[#E5E5E5] flex items-center justify-center text-[#0A1D37] group-hover:bg-[#0A1D37] group-hover:text-[#FFFFFF] transition-colors">
                        <Icon className="w-4 h-4" />
                      </div>
                      <h3 className="text-sm font-semibold tracking-wide text-[#111111] group-hover:text-[#0A1D37] transition-colors">
                        {p.title}
                      </h3>
                    </div>
                  </div>

                  <p className="text-xs font-medium text-[#111111] leading-relaxed">
                    "{p.desc}"
                  </p>
                  <p className="text-[11px] text-[#5F6368] leading-normal pt-1 border-t border-[#E5E5E5]/60">
                    {p.detail}
                  </p>
                </motion.div>
              );
            })}
          </div>

        </div>
      </div>
    </section>
  );
};

export default PlatformPerspectives;
