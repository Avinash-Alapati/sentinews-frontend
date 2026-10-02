import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export const LandingCTA: React.FC = () => {
  return (
    <section className="py-20 md:py-24 bg-[#FFFFFF]">
      <div className="max-w-[1140px] mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="bg-[#0A1D37] text-[#FFFFFF] p-8 sm:p-14 md:p-16 rounded-sm text-center relative overflow-hidden shadow-md"
        >
          {/* Subtle radial pattern overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.06] pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto space-y-5">
            <span className="text-xs uppercase tracking-wider font-medium text-white/70 inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-white" />
              Start your market journey
            </span>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-white leading-tight">
              See the Market With More Context.
            </h2>

            <p className="text-sm sm:text-base text-white/80 leading-relaxed max-w-xl mx-auto">
              Explore Indian market intelligence, reports and stock information in one place.
            </p>

            <div className="flex items-center justify-center pt-3">
              <Link
                to="/market"
                className="inline-flex items-center justify-center text-sm font-semibold text-[#0A1D37] bg-[#FFFFFF] hover:bg-[#FAFAF8] px-8 py-3.5 rounded-[6px] transition-all duration-150 active:scale-[0.98] shadow-xs select-none"
              >
                <span>Explore SentiNews</span>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default LandingCTA;
