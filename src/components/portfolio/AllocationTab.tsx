import React, { useMemo } from 'react';
import { PortfolioAllocation, PortfolioHolding } from '@/types/portfolio.types';
import { PieChart, Layers, Sliders, ShieldCheck, Building2 } from 'lucide-react';

interface AllocationTabProps {
  allocation: PortfolioAllocation | null;
  holdings: PortfolioHolding[];
  totalValue: number;
}

export const AllocationTab: React.FC<AllocationTabProps> = ({
  allocation,
  holdings,
  totalValue,
}) => {
  const safeSectors = allocation?.sectors || [];
  const safeHoldings = allocation?.holdings || [];

  // Product Allocation Data
  const productAllocation = useMemo(() => {
    const counts: Record<string, { count: number; value: number }> = {
      Stocks: { count: 0, value: 0 },
      ETFs: { count: 0, value: 0 },
      'Mutual Funds': { count: 0, value: 0 },
      Bonds: { count: 0, value: 0 },
      Gold: { count: 0, value: 0 },
    };
    holdings.forEach((h) => {
      const type = h.asset_type || 'Stock';
      const key = type === 'Stock' ? 'Stocks' : type === 'ETF' ? 'ETFs' : type === 'Mutual Fund' ? 'Mutual Funds' : type === 'Bond' ? 'Bonds' : 'Gold';
      if (!counts[key]) counts[key] = { count: 0, value: 0 };
      counts[key].count += 1;
      counts[key].value += h.current_value || 0;
    });
    return Object.entries(counts).map(([name, d]) => ({
      name,
      count: d.count,
      value: d.value,
      percent: totalValue > 0 ? Number(((d.value / totalValue) * 100).toFixed(1)) : 0,
    }));
  }, [holdings, totalValue]);

  // Market Cap Split Data
  const marketCapSplit = useMemo(() => {
    let large = 0, mid = 0, small = 0;
    holdings.forEach((h) => {
      const cap = h.market_cap || 'Large Cap';
      const val = h.current_value || 0;
      if (cap === 'Large Cap') large += val;
      else if (cap === 'Mid Cap') mid += val;
      else small += val;
    });
    return [
      { cap: 'Large Cap', value: large, percent: totalValue > 0 ? Number(((large / totalValue) * 100).toFixed(1)) : 0 },
      { cap: 'Mid Cap', value: mid, percent: totalValue > 0 ? Number(((mid / totalValue) * 100).toFixed(1)) : 0 },
      { cap: 'Small Cap', value: small, percent: totalValue > 0 ? Number(((small / totalValue) * 100).toFixed(1)) : 0 },
    ];
  }, [holdings, totalValue]);

  return (
    <div className="space-y-6 font-sans">
      {/* Grid: Sector Allocation (2 Cols) + Asset Class Split (1 Col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Sector Breakdown */}
        <div className="lg:col-span-2 bg-white border border-[#E5E5E5] rounded-2xl p-6 shadow-2xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#F1F1EF]">
            <div>
              <h3 className="text-base font-bold text-[#111111]">Sector Allocation &amp; Diversification</h3>
              <p className="text-xs text-[#5F6368]">Industry exposure weights across your portfolio</p>
            </div>
            <span className="text-xs font-mono font-bold text-[#0A1D37] bg-[#FAFAF8] border border-[#E5E5E5] px-2.5 py-1 rounded-lg">
              {safeSectors.length} Active Sectors
            </span>
          </div>

          {safeSectors.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#888888]">
              No sector allocation data calculated yet. Add transactions to see sector breakdown.
            </div>
          ) : (
            <div className="space-y-4">
              {safeSectors.map((sec) => (
                <div key={sec.sector} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold text-[#111111]">
                    <span className="flex items-center gap-2">
                      <Building2 className="w-3.5 h-3.5 text-[#0A1D37]" />
                      {sec.sector}
                    </span>
                    <span className="font-mono">
                      ₹{sec.current_value?.toLocaleString('en-IN', { maximumFractionDigits: 0 })} ({sec.weight_percent?.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="h-2.5 w-full bg-[#F5F5F3] rounded-full overflow-hidden border border-[#E5E5E5]">
                    <div
                      className="h-full bg-[#0A1D37] rounded-full transition-all"
                      style={{ width: `${Math.min(100, sec.weight_percent || 0)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right 1 Col: Asset Class Split */}
        <div className="bg-white border border-[#E5E5E5] rounded-2xl p-6 shadow-2xs space-y-5">
          <div className="pb-3 border-b border-[#F1F1EF]">
            <h3 className="text-base font-bold text-[#111111]">Asset Class Breakdown</h3>
            <p className="text-xs text-[#5F6368]">Product classification distribution</p>
          </div>

          <div className="space-y-4">
            {productAllocation.map((item) => (
              <div key={item.name} className="p-3 bg-[#FAFAF8] border border-[#E5E5E5] rounded-xl space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold text-[#111111]">
                  <span>{item.name}</span>
                  <span className="font-mono text-[#0A1D37]">{item.percent}%</span>
                </div>
                <div className="h-2 w-full bg-white rounded-full overflow-hidden border border-[#E5E5E5]">
                  <div
                    className="h-full bg-[#0A1D37] rounded-full"
                    style={{ width: `${Math.min(100, item.percent)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-[#888888]">
                  <span>{item.count} assets</span>
                  <span>₹{item.value?.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Section: Market Cap Split */}
      <div className="bg-white border border-[#E5E5E5] rounded-2xl p-6 shadow-2xs space-y-4">
        <div className="pb-3 border-b border-[#F1F1EF]">
          <h3 className="text-base font-bold text-[#111111]">Market Capitalization Distribution</h3>
          <p className="text-xs text-[#5F6368]">Split across Large-cap, Mid-cap, and Small-cap equities</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {marketCapSplit.map((mc) => (
            <div key={mc.cap} className="p-4 bg-[#FAFAF8] border border-[#E5E5E5] rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-[#5F6368]">{mc.cap}</span>
                <span className="text-sm font-bold text-[#0A1D37]">{mc.percent}%</span>
              </div>
              <div className="h-2 w-full bg-white rounded-full overflow-hidden border border-[#E5E5E5]">
                <div
                  className="h-full bg-[#0A1D37] rounded-full"
                  style={{ width: `${Math.min(100, mc.percent)}%` }}
                />
              </div>
              <span className="text-xs font-semibold text-[#111111] block text-right font-mono">
                ₹{mc.value?.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
