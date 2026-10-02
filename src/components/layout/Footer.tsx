import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from './Logo';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#FAFAF8] border-t border-[#E5E5E5] pt-16 pb-12 mt-20">
      <div className="max-w-[1140px] mx-auto px-4 sm:px-6">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-[#E5E5E5]">
          {/* Brand Column */}
          <div className="md:col-span-5 space-y-4 pr-0 md:pr-8">
            <Logo />
            <p className="text-sm text-[#666666] leading-relaxed max-w-sm">
              Indian market intelligence, simplified. Synthesizing market data into clear pre-market and post-market reports and insights.
            </p>
          </div>

          {/* Link Columns */}
          <div className="md:col-span-7 grid grid-cols-3 gap-6 sm:gap-8">
            {/* Platform Group */}
            <div>
              <h4 className="text-xs font-semibold text-[#111111] uppercase tracking-[0.15em] mb-4">
                Platform
              </h4>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <Link to="/market" className="text-[#666666] hover:text-[#111111] transition-colors">
                    Market
                  </Link>
                </li>
                <li>
                  <Link to="/portfolio" className="text-[#666666] hover:text-[#111111] transition-colors">
                    Portfolio
                  </Link>
                </li>
                <li>
                  <Link to="/reports" className="text-[#666666] hover:text-[#111111] transition-colors">
                    Reports
                  </Link>
                </li>
                <li>
                  <Link to="/news" className="text-[#666666] hover:text-[#111111] transition-colors">
                    News
                  </Link>
                </li>
              </ul>
            </div>

            {/* Company Group */}
            <div>
              <h4 className="text-xs font-semibold text-[#111111] uppercase tracking-[0.15em] mb-4">
                Company
              </h4>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <Link to="/about" className="text-[#666666] hover:text-[#111111] transition-colors">
                    About
                  </Link>
                </li>
                <li>
                  <a href="#contact" className="text-[#666666] hover:text-[#111111] transition-colors">
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal Group */}
            <div>
              <h4 className="text-xs font-semibold text-[#111111] uppercase tracking-[0.15em] mb-4">
                Legal
              </h4>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <a href="#privacy" className="text-[#666666] hover:text-[#111111] transition-colors">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#terms" className="text-[#666666] hover:text-[#111111] transition-colors">
                    Terms
                  </a>
                </li>
                <li>
                  <a href="#disclaimer" className="text-[#666666] hover:text-[#111111] transition-colors">
                    Disclaimer
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Disclaimer & Copyright */}
        <div className="pt-8 space-y-4">
          <p className="text-xs text-[#888888] leading-relaxed max-w-4xl">
            <strong className="text-[#666666] font-medium">SEBI & Financial Information Disclaimer:</strong> Sentinews is an Indian market information and intelligence platform. Sentinews is not a SEBI-registered investment advisor or stock broker and does not provide trade execution services or personalized investment advice. All information provided is for analytical and educational purposes only.
          </p>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs text-[#888888]">
            <p>© 2026 Sentinews. All rights reserved.</p>
            <p className="mt-2 sm:mt-0">Focused exclusively on Indian Capital Markets</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
