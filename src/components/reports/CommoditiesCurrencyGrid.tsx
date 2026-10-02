import React from 'react';
import { CommodityItem, CurrencyPairItem, ADRItem } from '@/types/reports.types';
import { Coins, DollarSign, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface CommoditiesCurrencyGridProps {
  commodities?: CommodityItem[];
  currencyPairs?: CurrencyPairItem[];
  adrs?: ADRItem[];
  isLoading?: boolean;
}

export const CommoditiesCurrencyGrid: React.FC<CommoditiesCurrencyGridProps> = ({
  commodities = [],
  currencyPairs = [],
  adrs = [],
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="bg-[#FFFFFF] border border-[#E5E5E5] rounded-lg p-4 shadow-sm space-y-3">
        <div className="h-4 w-40 bg-gray-200 rounded animate-pulse" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 bg-[#F8F9FA] rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const hasCommodities = commodities.length > 0;
  const hasCurrenciesOrAdrs = currencyPairs.length > 0 || adrs.length > 0;

  if (!hasCommodities && !hasCurrenciesOrAdrs) {
    return null;
  }

  // Case 1: ONLY Commodities are present -> Full Width 4-column layout (No empty space beside it!)
  if (hasCommodities && !hasCurrenciesOrAdrs) {
    return (
      <div className="bg-[#FFFFFF] border border-[#E5E5E5] rounded-lg p-4 sm:p-5 shadow-sm space-y-3 w-full">
        <div className="flex items-center justify-between pb-2.5 border-b border-[#F0F0F0]">
          <div className="flex items-center gap-2">
            <Coins className="w-4 h-4 text-[#0A1D37]" />
            <h2 className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-[#0A1D37]">
              Commodity Benchmarks
            </h2>
          </div>
          <span className="text-[11px] font-medium text-[#6B7280]">International Quotes</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {commodities.map((item) => {
            const isPositive = (item.change || 0) > 0 || (item.change_percent || 0) > 0;
            const isNegative = (item.change || 0) < 0 || (item.change_percent || 0) < 0;

            return (
              <div
                key={item.symbol || item.name}
                className="bg-[#F8F9FA] border border-[#E2E8F0] rounded-lg p-3 hover:border-[#CBD5E1] transition-colors"
              >
                <div className="flex items-center justify-between text-xs font-semibold text-[#1E293B] mb-0.5">
                  <span className="truncate">{item.name || item.symbol}</span>
                  <span className="text-[10px] text-[#64748B] font-mono shrink-0 ml-1">{item.unit || 'USD'}</span>
                </div>

                <div className="flex items-baseline justify-between mt-1.5">
                  <span className="text-xs sm:text-sm font-bold text-[#0F172A]">
                    {typeof item.last_price === 'number'
                      ? item.last_price.toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })
                      : item.last_price}
                  </span>

                  <span
                    className={`inline-flex items-center gap-0.5 text-[11px] font-bold ${
                      isPositive ? 'text-[#00B386]' : isNegative ? 'text-[#E53935]' : 'text-[#64748B]'
                    }`}
                  >
                    {isPositive && <TrendingUp className="w-3 h-3" />}
                    {isNegative && <TrendingDown className="w-3 h-3" />}
                    {!isPositive && !isNegative && <Minus className="w-3 h-3" />}
                    {isPositive ? '+' : ''}
                    {(item.change_percent || 0).toFixed(2)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Case 2: BOTH Commodities AND Currencies/ADRs are present -> Side-by-Side 2-column layout
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 items-stretch w-full">
      {/* Commodities Card */}
      {hasCommodities && (
        <div className="bg-[#FFFFFF] border border-[#E5E5E5] rounded-lg p-4 sm:p-5 shadow-sm space-y-3 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2.5 border-b border-[#F0F0F0]">
              <div className="flex items-center gap-2">
                <Coins className="w-4 h-4 text-[#0A1D37]" />
                <h2 className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-[#0A1D37]">
                  Commodity Benchmarks
                </h2>
              </div>
              <span className="text-[11px] font-medium text-[#6B7280]">International Quotes</span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {commodities.map((item) => {
                const isPositive = (item.change || 0) > 0 || (item.change_percent || 0) > 0;
                const isNegative = (item.change || 0) < 0 || (item.change_percent || 0) < 0;

                return (
                  <div
                    key={item.symbol || item.name}
                    className="bg-[#F8F9FA] border border-[#E2E8F0] rounded-lg p-2.5 hover:border-[#CBD5E1] transition-colors"
                  >
                    <div className="flex items-center justify-between text-xs font-semibold text-[#1E293B] mb-0.5">
                      <span className="truncate">{item.name || item.symbol}</span>
                      <span className="text-[10px] text-[#64748B] font-mono shrink-0 ml-1">{item.unit || 'USD'}</span>
                    </div>

                    <div className="flex items-baseline justify-between mt-1">
                      <span className="text-xs font-bold text-[#0F172A]">
                        {typeof item.last_price === 'number'
                          ? item.last_price.toLocaleString('en-US', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })
                          : item.last_price}
                      </span>

                      <span
                        className={`inline-flex items-center gap-0.5 text-[11px] font-bold ${
                          isPositive ? 'text-[#00B386]' : isNegative ? 'text-[#E53935]' : 'text-[#64748B]'
                        }`}
                      >
                        {isPositive && <TrendingUp className="w-3 h-3" />}
                        {isNegative && <TrendingDown className="w-3 h-3" />}
                        {!isPositive && !isNegative && <Minus className="w-3 h-3" />}
                        {isPositive ? '+' : ''}
                        {(item.change_percent || 0).toFixed(2)}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Currencies & ADRs Card */}
      {hasCurrenciesOrAdrs && (
        <div className="bg-[#FFFFFF] border border-[#E5E5E5] rounded-lg p-4 sm:p-5 shadow-sm space-y-3 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2.5 border-b border-[#F0F0F0]">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-[#0A1D37]" />
                <h2 className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-[#0A1D37]">
                  Currency Pairs & ADRs
                </h2>
              </div>
              <span className="text-[11px] font-medium text-[#6B7280]">FX & US Exchanges</span>
            </div>

            <div className="space-y-2.5">
              {/* Currency pairs row */}
              {currencyPairs.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {currencyPairs.map((pair) => {
                    const isPositive = (pair.change || 0) > 0 || (pair.change_percent || 0) > 0;
                    const isNegative = (pair.change || 0) < 0 || (pair.change_percent || 0) < 0;

                    return (
                      <div
                        key={pair.pair}
                        className="bg-[#F8F9FA] border border-[#E2E8F0] rounded p-2 text-center"
                      >
                        <div className="text-[10px] font-semibold text-[#64748B]">{pair.pair}</div>
                        <div className="text-xs font-bold text-[#0F172A] my-0.5">
                          ₹{pair.last_price?.toFixed(2)}
                        </div>
                        <div
                          className={`text-[10px] font-bold ${
                            isPositive ? 'text-[#00B386]' : isNegative ? 'text-[#E53935]' : 'text-[#64748B]'
                          }`}
                        >
                          {isPositive ? '+' : ''}
                          {(pair.change_percent || 0).toFixed(2)}%
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Indian ADRs row */}
              {adrs.length > 0 && (
                <div className="pt-2 border-t border-[#F0F0F0]">
                  <span className="text-[10px] font-semibold text-[#64748B] block mb-1.5 uppercase tracking-wide">
                    Indian ADRs (US Session)
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    {adrs.map((adr) => {
                      const isPositive = (adr.change || 0) > 0 || (adr.change_percent || 0) > 0;
                      const isNegative = (adr.change || 0) < 0 || (adr.change_percent || 0) < 0;

                      return (
                        <div
                          key={adr.symbol}
                          className="bg-[#F8F9FA] border border-[#E2E8F0] rounded p-2 flex items-center justify-between"
                        >
                          <div className="min-w-0 pr-1">
                            <div className="text-xs font-bold text-[#0F172A] truncate">{adr.company_name || adr.symbol}</div>
                            <div className="text-[10px] text-[#64748B]">${adr.last_price?.toFixed(2)}</div>
                          </div>

                          <span
                            className={`text-xs font-bold shrink-0 ${
                              isPositive ? 'text-[#00B386]' : isNegative ? 'text-[#E53935]' : 'text-[#64748B]'
                            }`}
                          >
                            {isPositive ? '+' : ''}
                            {(adr.change_percent || 0).toFixed(2)}%
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
