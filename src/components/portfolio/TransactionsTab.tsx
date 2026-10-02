import React, { useState, useMemo } from 'react';
import { PortfolioTransaction } from '@/types/portfolio.types';
import { History, Plus, ArrowUpRight, ArrowDownRight, Tag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export type TransactionTypeFilter = 'ALL' | 'BUY' | 'SELL' | 'SIP' | 'OTHER';

interface TransactionsTabProps {
  transactions: PortfolioTransaction[];
  onAddTransaction: () => void;
}

export const TransactionsTab: React.FC<TransactionsTabProps> = ({
  transactions,
  onAddTransaction,
}) => {
  const navigate = useNavigate();
  const [selectedTxFilter, setSelectedTxFilter] = useState<TransactionTypeFilter>('ALL');

  const filteredTransactions = useMemo(() => {
    let result = transactions;
    if (selectedTxFilter !== 'ALL') {
      result = result.filter((tx) => tx.transaction_type === selectedTxFilter);
    }
    // Chronological order (latest first)
    return [...result].sort(
      (a, b) => new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime()
    );
  }, [transactions, selectedTxFilter]);

  const handleStockClick = (symbol: string) => {
    const cleanSym = symbol.trim().toUpperCase().replace('.NS', '').replace('.BO', '');
    navigate(`/stock/${encodeURIComponent(cleanSym)}`);
  };

  return (
    <div className="bg-white border border-[#E5E5E5] rounded-2xl p-6 shadow-2xs space-y-5 font-sans">
      {/* Top Filter Bar: Type Filter Pills + Add Button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pb-4 border-b border-[#F1F1EF]">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {(['ALL', 'BUY', 'SELL', 'SIP', 'OTHER'] as TransactionTypeFilter[]).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setSelectedTxFilter(type)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                selectedTxFilter === type
                  ? 'bg-[#0A1D37] border-[#0A1D37] text-white shadow-2xs font-bold'
                  : 'bg-white border-[#E5E5E5] text-[#5F6368] hover:text-[#0A1D37] hover:border-[#0A1D37]'
              }`}
            >
              {type === 'ALL' ? 'All Transactions' : type}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={onAddTransaction}
          className="px-3.5 py-1.5 bg-[#0A1D37] hover:bg-[#071426] text-white text-xs font-bold rounded-xl transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer shrink-0"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Record New Transaction</span>
        </button>
      </div>

      {/* Transactions Summary Counter */}
      <div className="flex items-center justify-between text-xs text-[#5F6368]">
        <span>
          Showing <strong className="text-[#111111]">{filteredTransactions.length}</strong> of{' '}
          <strong className="text-[#111111]">{transactions.length}</strong> total transaction history records
        </span>
      </div>

      {/* Table */}
      {filteredTransactions.length === 0 ? (
        <div className="p-12 text-center bg-[#FAFAF8] border border-dashed border-[#E5E5E5] rounded-xl space-y-3">
          <History className="w-8 h-8 mx-auto text-[#888888]" />
          <p className="font-bold text-sm text-[#111111]">No Transactions Found</p>
          <p className="text-xs text-[#5F6368]">
            No transaction records matching filter &quot;{selectedTxFilter}&quot;.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#F1F1EF] text-[11px] font-semibold text-[#888888] uppercase tracking-wider font-mono">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Symbol</th>
                <th className="py-3 px-4 text-center">Type</th>
                <th className="py-3 px-4 text-right">Quantity</th>
                <th className="py-3 px-4 text-right">Price per share</th>
                <th className="py-3 px-4 text-right">Total Amount</th>
                <th className="py-3 px-4">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F1EF] text-xs">
              {filteredTransactions.map((tx) => {
                const isBuy = tx.transaction_type === 'BUY' || tx.transaction_type === 'SIP';
                const formattedDate = new Date(tx.transaction_date).toLocaleDateString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                });

                return (
                  <tr key={tx.id} className="hover:bg-[#FAFAF8] transition-colors">
                    <td className="py-3.5 px-4 font-mono text-[#5F6368] whitespace-nowrap">
                      {formattedDate}
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        onClick={() => handleStockClick(tx.symbol)}
                        className="font-bold text-sm text-[#0A1D37] hover:underline cursor-pointer"
                      >
                        {tx.symbol}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${
                          isBuy
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-rose-50 text-rose-800 border-rose-200'
                        }`}
                      >
                        {isBuy ? (
                          <ArrowUpRight className="w-3 h-3 stroke-[2.5]" />
                        ) : (
                          <ArrowDownRight className="w-3.5 h-3.5 stroke-[2.5]" />
                        )}
                        <span>{tx.transaction_type}</span>
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono font-bold text-[#111111]">
                      {tx.quantity}
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono text-[#5F6368]">
                      ₹{tx.price?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono font-bold text-[#111111]">
                      ₹{tx.total_amount?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>

                    <td className="py-3.5 px-4 text-[#888888] text-[11px] truncate max-w-[200px]">
                      {tx.notes || '—'}
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
