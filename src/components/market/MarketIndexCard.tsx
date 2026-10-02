import React from 'react';
import { useNavigate } from 'react-router-dom';
import { IndexQuote } from '@/types/market.types';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MarketIndexCardProps {
  indexData: IndexQuote;
}

export const MarketIndexCard: React.FC<MarketIndexCardProps> = ({ indexData }) => {
  const navigate = useNavigate();
  const {
    name,
    symbol,
    current_value,
    change,
    change_percent,
    high,
    low,
    previous_close,
  } = indexData;

  const isPositive = change > 0;
  const isNegative = change < 0;

  // Format currency value with Indian numbering system
  const formattedValue = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(current_value || 0);

  const formattedChange = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(change || 0));

  const formattedPercent = Math.abs(change_percent || 0).toFixed(2);

  const handleClick = () => {
    navigate(`/stock/${encodeURIComponent(symbol)}`);
  };

  return (
    <div
      onClick={handleClick}
      className="bg-[#FFFFFF] border border-[#E5E5E5] rounded-sm p-5 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between space-y-4 cursor-pointer group"
    >
      {/* Top Row: Index Name & Indicator Icon */}
      <div className="flex items-start justify-between">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-[#5F6368] block">
            {symbol}
          </span>
          <h3 className="text-base font-semibold text-[#111111] group-hover:text-[#0A1D37] tracking-tight mt-0.5 transition-colors">
            {name}
          </h3>
        </div>

        <div
          className={`w-7 h-7 rounded-full flex items-center justify-center ${
            isPositive
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : isNegative
              ? 'bg-rose-50 text-rose-700 border border-rose-200'
              : 'bg-neutral-100 text-neutral-600 border border-neutral-200'
          }`}
        >
          {isPositive ? (
            <TrendingUp className="w-4 h-4 stroke-[2.2]" />
          ) : isNegative ? (
            <TrendingDown className="w-4 h-4 stroke-[2.2]" />
          ) : (
            <Minus className="w-4 h-4 stroke-[2]" />
          )}
        </div>
      </div>

      {/* Middle Row: Main Price & Change % */}
      <div>
        <div className="text-2xl font-bold tracking-tight text-[#111111]">
          {formattedValue}
        </div>

        <div
          className={`inline-flex items-center gap-1.5 text-xs font-semibold mt-1 ${
            isPositive
              ? 'text-[#00B386]'
              : isNegative
              ? 'text-[#E53935]'
              : 'text-[#5F6368]'
          }`}
        >
          <span>
            {isPositive ? '+' : isNegative ? '-' : ''}
            {formattedChange}
          </span>
          <span>
            ({isPositive ? '+' : isNegative ? '-' : ''}
            {formattedPercent}%)
          </span>
        </div>
      </div>

      {/* Bottom Row: Key High / Low Stats */}
      {(high !== null || low !== null || previous_close !== null) && (
        <div className="pt-3 border-t border-[#F1F1EF] grid grid-cols-2 gap-2 text-[11px] text-[#5F6368]">
          {high !== null && (
            <div>
              <span className="block text-[10px] uppercase text-[#888888]">High</span>
              <span className="font-mono font-medium text-[#111111]">
                {high.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
          )}
          {low !== null && (
            <div>
              <span className="block text-[10px] uppercase text-[#888888]">Low</span>
              <span className="font-mono font-medium text-[#111111]">
                {low.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
