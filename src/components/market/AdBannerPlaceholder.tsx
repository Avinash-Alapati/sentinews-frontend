import React from 'react';
import { Megaphone, ExternalLink, ShieldCheck } from 'lucide-react';

export const AdBannerPlaceholder: React.FC = () => {
  return (
    <div className="w-full bg-gradient-to-br from-[#FAFAF8] via-white to-[#F5F5F3] border border-dashed border-[#CCCCCC] hover:border-[#0A1D37]/50 rounded-xl p-5 shadow-2xs transition-all flex flex-col justify-between h-full space-y-4">
      {/* Top Header Badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#0A1D37] text-white">
            Sponsored Ad
          </span>
          <span className="text-[11px] text-[#888888] font-medium">• Market Insights</span>
        </div>
        <div className="w-8 h-8 rounded-lg bg-[#0A1D37]/5 border border-[#0A1D37]/10 flex items-center justify-center text-[#0A1D37] shrink-0">
          <Megaphone className="w-4 h-4 text-[#0A1D37]" />
        </div>
      </div>

      {/* Content */}
      <div className="space-y-2 py-1">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
          <ShieldCheck className="w-4 h-4" />
          <span>AI-Powered Stock Signals</span>
        </div>
        <h4 className="text-base font-bold text-[#111111] leading-snug">
          Real-Time Market Analytics & Algorithmic Trading Intelligence
        </h4>
        <p className="text-xs text-[#5F6368] leading-relaxed">
          Supercharge your equity strategy with instant sentiment analysis, pattern detection & live NSE/BSE signals.
        </p>
      </div>

      {/* Action Button */}
      <div className="pt-3 border-t border-[#E5E5E5]/60 flex items-center justify-between">
        <span className="text-[11px] font-mono text-[#888888]">senti-news.com/pro</span>
        <button
          type="button"
          className="px-4 py-2 bg-[#0A1D37] hover:bg-[#071426] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-[0.98]"
        >
          <span>Learn More</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export default AdBannerPlaceholder;
