import React from 'react';
import { X, ExternalLink, Sparkles, TrendingUp, ShieldCheck, Globe, Calendar, Clock } from 'lucide-react';
import { NewsArticle } from '@/types/news.types';
import { useNavigate } from 'react-router-dom';
import { formatExactTime, getRelativeTime } from '@/utils/date';

export interface FullCoverageModalProps {
  article: NewsArticle | null;
  isOpen: boolean;
  onClose: () => void;
}

export const FullCoverageModal: React.FC<FullCoverageModalProps> = ({
  article,
  isOpen,
  onClose,
}) => {
  const navigate = useNavigate();

  if (!isOpen || !article) return null;

  const handleSymbolClick = (symbol: string) => {
    onClose();
    const cleanSym = symbol.trim().toUpperCase().replace('.NS', '').replace('.BO', '');
    navigate(`/stock/${encodeURIComponent(cleanSym)}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border border-[#E5E5E5] rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto font-sans">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 text-[#888888] hover:text-[#111111] bg-[#F5F5F3] hover:bg-[#E5E5E5] p-2 rounded-full transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Badge Header */}
        <div className="flex items-center gap-2 text-xs font-bold text-[#0A1D37]">
          <span className="bg-[#0A1D37] text-white px-3 py-1 rounded-full flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Comprehensive Market Briefing
          </span>
          <span className="text-[#888888]">• SEBI Informational Disclaimer</span>
        </div>

        {/* Main Headline in Navy Blue (#0A1D37) */}
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#0A1D37] leading-snug">
            {article.title}
          </h2>
          <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-[#5F6368]">
            <span className="font-semibold text-[#111111] flex items-center gap-1">
              <Globe className="w-3.5 h-3.5 text-[#0A1D37]" />
              {article.source}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {formatExactTime(article.publishedAt, true)}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 text-[#0A1D37] font-semibold">
              <Clock className="w-3.5 h-3.5" />
              {getRelativeTime(article.publishedAt)}
            </span>
            <span>•</span>
            <span className="px-2 py-0.5 rounded bg-gray-100 text-[11px] font-semibold">
              {article.category}
            </span>
          </div>
        </div>

        {/* Executive Summary in Normal Black Text (#111111) */}
        <div className="bg-[#FAFAF8] border border-[#E5E5E5] p-5 rounded-xl space-y-3">
          <h3 className="text-sm font-bold text-[#0A1D37] flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#0A1D37]" />
            Executive Summary
          </h3>
          <p className="text-xs sm:text-sm text-[#111111] leading-relaxed font-sans font-normal">
            {article.summary}
          </p>
        </div>

        {/* Key Market Impact Insights */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-[#0A1D37]">
            Key Takeaways & Market Context
          </h3>
          <ul className="space-y-2 text-xs sm:text-sm text-[#111111] list-disc list-inside leading-relaxed">
            <li>Direct impact on sector sentiment and trading volumes.</li>
            <li>
              Sentiment score evaluated as{' '}
              <strong
                className={
                  article.sentiment === 'POSITIVE'
                    ? 'text-emerald-600 font-bold'
                    : article.sentiment === 'NEGATIVE'
                    ? 'text-rose-600 font-bold'
                    : 'text-gray-700 font-bold'
                }
              >
                {article.sentiment}
              </strong>.
            </li>
            <li>Monitored for sector liquidity and short-term volatility signals.</li>
          </ul>
        </div>

        {/* Related Ticker Symbols */}
        {article.relatedSymbols && article.relatedSymbols.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-[#F1F1EF]">
            <span className="text-sm font-bold text-[#0A1D37] block">
              Impacted Stocks & Indices
            </span>
            <div className="flex flex-wrap gap-2">
              {article.relatedSymbols.map((sym) => (
                <button
                  key={sym}
                  type="button"
                  onClick={() => handleSymbolClick(sym)}
                  className="px-3 py-1 bg-white hover:bg-[#0A1D37] text-[#0A1D37] hover:text-white border border-[#0A1D37] rounded-lg text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>{sym}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Footer Actions with Navy Blue (#0A1D37) Primary Button */}
        <div className="pt-4 border-t border-[#F1F1EF] flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-[#5F6368] hover:text-[#111111] cursor-pointer"
          >
            Close
          </button>
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 rounded-xl bg-[#0A1D37] hover:bg-[#0A1D37]/90 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <span>Open Full Original Article</span>
            <ExternalLink className="w-4 h-4 text-white" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default FullCoverageModal;
