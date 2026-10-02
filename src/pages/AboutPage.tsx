import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#111111] flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-[1140px] mx-auto px-4 sm:px-6 py-16 w-full">
        <div className="max-w-2xl space-y-6">
          <span className="text-[11px] uppercase tracking-[0.18em] font-semibold text-[#666666] block">
            ABOUT SENTINEWS
          </span>
          <h1 className="text-4xl font-semibold tracking-tight text-[#111111]">
            Indian Market Intelligence, Simplified.
          </h1>
          <p className="text-base text-[#666666] leading-relaxed">
            Sentinews was built to bring structure and clarity to Indian capital markets. Rather than drowning investors in noisy trading signals or complex terminals, Sentinews synthesizes daily market data into clear pre-market and post-market intelligence reports and clean portfolio insights.
          </p>

          <div className="pt-6 border-t border-[#E5E5E5] space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-[#111111]">
              Core Principles
            </h2>
            <ul className="space-y-3 text-sm text-[#666666]">
              <li className="flex items-start gap-2">
                <span className="font-semibold text-[#111111]">• Information over Execution:</span>
                Sentinews is strictly an information & intelligence platform, not a trading platform.
              </li>
              <li className="flex items-start gap-2">
                <span className="font-semibold text-[#111111]">• Editorial Quality:</span>
                Every report is structured to help market participants understand context, breadth, and drivers.
              </li>
              <li className="flex items-start gap-2">
                <span className="font-semibold text-[#111111]">• Indian Market Focus:</span>
                Tailored specifically for Indian retail investors, institutional observers, and market enthusiasts.
              </li>
            </ul>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AboutPage;
