import React, { useState, useMemo } from 'react';
import { PortfolioHolding } from '@/types/portfolio.types';
import { Search, Building2, Plus, ExternalLink, ArrowUpDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export type AssetFilter = 'ALL' | 'Stock' | 'ETF' | 'Mutual Fund' | 'Bond' | 'Gold';

interface HoldingsTabProps {
  holdings: PortfolioHolding[];
  onAddTransaction: () => void;
}

export const HoldingsTab: React.FC<HoldingsTabProps> = ({ holdings, onAddTransaction }) => {
  const navigate = useNavigate();
  const [selectedAssetFilter, setSelectedAssetFilter] = useState<AssetFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<'current_value' | 'unrealized_pnl_percent' | 'symbol'>('current_value');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const filteredAndSortedHoldings = useMemo(() => {
    let result = holdings;

    // Filter by asset type
    if (selectedAssetFilter !== 'ALL') {
      result = result.filter((h) => h.asset_type === selectedAssetFilter);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (h) =>
          h.symbol.toLowerCase().includes(q) ||
          (h.company_name && h.company_name.toLowerCase().includes(q)) ||
          (h.sector && h.sector.toLowerCase().includes(q))
      );
    }

    // Sort
    return [...result].sort((a, b) => {
      let valA = a[sortField] ?? 0;
      let valB = b[sortField] ?? 0;
      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [holdings, selectedAssetFilter, searchQuery, sortField, sortOrder]);

  const toggleSort = (field: 'current_value' | 'unrealized_pnl_percent' | 'symbol') => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const handleStockClick = (symbol: string) => {
    const cleanSym = symbol.trim().toUpperCase().replace('.NS', '').replace('.BO', '');
    navigate(`/stock/${encodeURIComponent(cleanSym)}`);
  };

  return (
    <div className="bg-white border border-[#E5E5E5] rounded-2xl p-6 shadow-2xs space-y-5 font-sans">
      {/* Top Filter Bar: Asset Type Pills + Search Input + Add Transaction */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pb-4 border-b border-[#F1F1EF]">
        {/* Asset Type Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {(['ALL', 'Stock', 'ETF', 'Mutual Fund', 'Bond', 'Gold'] as AssetFilter[]).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setSelectedAssetFilter(type)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                selectedAssetFilter === type
                  ? 'bg-[#0A1D37] border-[#0A1D37] text-white shadow-2xs font-bold'
                  : 'bg-white border-[#E5E5E5] text-[#5F6368] hover:text-[#0A1D37] hover:border-[#0A1D37]'
              }`}
            >
              {type === 'ALL' ? 'All Assets' : type}
            </button>
          ))}
        </div>

        {/* Search & Actions */}
        <div className="flex items-center gap-2.5">
          <div className="relative flex-1 sm:w-60">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#888888]" />
            <input
              type="text"
              placeholder="Search holdings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-[#E5E5E5] rounded-xl text-xs focus:outline-none focus:border-[#0A1D37]"
            />
          </div>

          <button
            type="button"
            onClick={onAddTransaction}
            className="px-3.5 py-1.5 bg-[#0A1D37] hover:bg-[#071426] text-white text-xs font-bold rounded-xl transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Add Stock</span>
          </button>
        </div>
      </div>

      {/* Holdings Counter Summary */}
      <div className="flex items-center justify-between text-xs text-[#5F6368]">
        <span>
          Showing <strong className="text-[#111111]">{filteredAndSortedHoldings.length}</strong> of{' '}
          <strong className="text-[#111111]">{holdings.length}</strong> total active holdings
        </span>
        <span className="text-[11px] text-[#888888]">Click any symbol row to view live interactive chart</span>
      </div>

      {/* Holdings Table */}
      {filteredAndSortedHoldings.length === 0 ? (
        <div className="p-12 text-center bg-[#FAFAF8] border border-dashed border-[#E5E5E5] rounded-xl space-y-3">
          <Building2 className="w-8 h-8 mx-auto text-[#888888]" />
          <p className="font-bold text-sm text-[#111111]">No Holdings Found</p>
          <p className="text-xs text-[#5F6368]">
            No holdings matching filter &quot;{selectedAssetFilter}&quot; and search query &quot;{searchQuery}&quot;.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#F1F1EF] text-[11px] font-semibold text-[#888888] uppercase tracking-wider font-mono">
                <th
                  onClick={() => toggleSort('symbol')}
                  className="py-3 px-4 cursor-pointer hover:text-[#0A1D37]"
                >
                  <div className="flex items-center gap-1">
                    <span>Symbol / Company</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4 text-center">Asset Class</th>
                <th className="py-3 px-4 text-right">Quantity</th>
                <th className="py-3 px-4 text-right">Avg Buy Price</th>
                <th className="py-3 px-4 text-right">Live Price</th>
                <th className="py-3 px-4 text-right">Total Cost</th>
                <th
                  onClick={() => toggleSort('current_value')}
                  className="py-3 px-4 text-right cursor-pointer hover:text-[#0A1D37]"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Current Value</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('unrealized_pnl_percent')}
                  className="py-3 px-4 text-right cursor-pointer hover:text-[#0A1D37]"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Unrealized P&amp;L</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F1EF] text-xs">
              {filteredAndSortedHoldings.map((h) => {
                const isPos = h.unrealized_pnl >= 0;
                return (
                  <tr
                    key={h.symbol}
                    onClick={() => handleStockClick(h.symbol)}
                    className="hover:bg-[#FAFAF8] transition-colors cursor-pointer group"
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#0A1D37] text-white flex items-center justify-center font-bold text-xs shrink-0">
                          {h.symbol.substring(0, 2)}
                        </div>
                        <div>
                          <span className="font-bold text-sm text-[#0A1D37] group-hover:underline block">
                            {h.symbol}
                          </span>
                          <span className="text-[11px] text-[#888888] block truncate max-w-[160px]">
                            {h.company_name}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-block px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-[#FAFAF8] border border-[#E5E5E5] text-[#0A1D37]">
                        {h.asset_type || 'Stock'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono font-bold text-[#111111]">
                      {h.quantity}
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono text-[#5F6368]">
                      ₹{h.average_buy_price?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono font-bold text-[#111111]">
                      ₹{h.current_price?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono text-[#5F6368]">
                      ₹{h.total_investment?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>

                    <td className="py-3.5 px-4 text-right font-bold text-sm text-[#111111]">
                      ₹{h.current_value?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>

                    <td className="py-3.5 px-4 text-right font-bold">
                      <div className={isPos ? 'text-[#00B386]' : 'text-[#E53935]'}>
                        {isPos ? '+' : ''}₹{h.unrealized_pnl?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                      <div className={`text-[11px] ${isPos ? 'text-[#00B386]' : 'text-[#E53935]'}`}>
                        ({isPos ? '+' : ''}{h.unrealized_pnl_percent?.toFixed(2)}%)
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
