import React from 'react';
import { ShieldAlert } from 'lucide-react';

interface SEBIDisclaimerCardProps {
  disclaimer?: string;
  sourceProviders?: string[];
}

export const SEBIDisclaimerCard: React.FC<SEBIDisclaimerCardProps> = ({
  disclaimer = 'For informational purposes only. Not investment advice. Sentinews is not a SEBI-registered investment adviser or research analyst.',
  sourceProviders = ['NSE', 'Finnhub', 'StockNews', 'yfinance'],
}) => {
  return (
    <div className="bg-[#F8F9FA] border border-[#E5E7EB] rounded-lg p-4 sm:p-5 text-xs text-[#64748B] space-y-2">
      <div className="flex items-center gap-2 text-[#0A1D37] font-semibold text-xs uppercase tracking-wider">
        <ShieldAlert className="w-4 h-4 text-amber-600" />
        <span>SEBI Statutory Compliance & Data Disclosure</span>
      </div>

      <p className="leading-relaxed text-[#475569]">
        {disclaimer}
      </p>

      <div className="pt-2 border-t border-[#E5E7EB] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-[#94A3B8]">
        <div>
          <span>Data Vendors: </span>
          <span className="font-medium text-[#64748B]">
            {sourceProviders.length > 0 ? sourceProviders.join(', ') : 'Exchanges & Third-party Data Vendors'}
          </span>
        </div>
        <div>
          <span>© {new Date().getFullYear()} SentiNews Market Intelligence Platform. All rights reserved.</span>
        </div>
      </div>
    </div>
  );
};
