import React, { useState, useEffect } from 'react';
import { RecordTransactionPayload } from '@/types/portfolio.types';
import { marketApi } from '@/services/api/market.api';
import { StockSearchResult } from '@/types/market.types';
import { X, Plus, Loader2, AlertCircle, Search, Briefcase } from 'lucide-react';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: RecordTransactionPayload) => Promise<any>;
}

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [symbol, setSymbol] = useState('');
  const [transactionType, setTransactionType] = useState<'BUY' | 'SELL' | 'SIP' | 'OTHER'>('BUY');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [transactionDate, setTransactionDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Stock search autocomplete state
  const [searchResults, setSearchResults] = useState<StockSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Fast selection helper that auto-fetches latest market price
  const handleSelectStock = async (sym: string) => {
    const cleanSym = sym.trim().toUpperCase();
    setSymbol(cleanSym);
    setSearchResults([]);

    try {
      const quote = await marketApi.getQuote(cleanSym);
      if (quote && quote.current_price && quote.current_price > 0) {
        setPrice(quote.current_price.toString());
      }
    } catch (err) {
      console.warn('Could not auto-fetch quote price:', err);
    }
  };

  useEffect(() => {
    if (!symbol.trim() || symbol.length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await marketApi.searchStocks(symbol);
        setSearchResults(results.slice(0, 5));
      } catch (err) {
        console.error('Error searching stocks:', err);
      } finally {
        setIsSearching(false);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [symbol]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!symbol.trim() || !quantity || !price) {
      setErrorMsg('Please enter stock symbol, quantity, and price per share.');
      return;
    }

    const qtyNum = parseFloat(quantity);
    const priceNum = parseFloat(price);

    if (isNaN(qtyNum) || qtyNum <= 0) {
      setErrorMsg('Quantity must be a positive number.');
      return;
    }
    if (isNaN(priceNum) || priceNum <= 0) {
      setErrorMsg('Price per share must be a positive number.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg(null);
      await onSubmit({
        symbol: symbol.trim().toUpperCase(),
        transaction_type: transactionType,
        quantity: qtyNum,
        price: priceNum,
        transaction_date: transactionDate ? new Date(transactionDate).toISOString() : undefined,
        notes: notes.trim() || undefined,
      });

      // Reset form
      setSymbol('');
      setQuantity('');
      setPrice('');
      setNotes('');
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to record transaction');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl border border-[#E5E5E5] shadow-2xl max-w-lg w-full overflow-hidden font-sans space-y-0"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#F1F1EF] bg-[#FAFAF8]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0A1D37] text-white flex items-center justify-center shrink-0">
              <Briefcase className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#111111]">Record Portfolio Transaction</h3>
              <p className="text-xs text-[#5F6368]">Add BUY or SELL execution with cost basis tracking</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-[#888888] hover:text-[#111111] hover:bg-[#E5E5E5]/50 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mx-5 mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Transaction Type Pills */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#5F6368] mb-1.5">
              Transaction Type
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['BUY', 'SELL', 'SIP', 'OTHER'] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setTransactionType(type)}
                  className={`py-2 text-xs font-bold rounded-xl transition-all border cursor-pointer ${
                    transactionType === type
                      ? type === 'BUY' || type === 'SIP'
                        ? 'bg-[#00B386] border-[#00B386] text-white shadow-2xs'
                        : 'bg-[#E53935] border-[#E53935] text-white shadow-2xs'
                      : 'bg-white border-[#E5E5E5] text-[#5F6368] hover:border-[#0A1D37]'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Stock Symbol Search Input */}
          <div className="relative">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#5F6368] mb-1.5">
              Stock Symbol / Ticker
            </label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="e.g. RELIANCE, TCS, HDFCBANK..."
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                className="w-full px-3.5 py-2.5 bg-white border border-[#E5E5E5] rounded-xl text-xs font-bold uppercase tracking-wider focus:outline-none focus:border-[#0A1D37]"
              />
              {isSearching && (
                <Loader2 className="w-4 h-4 animate-spin text-[#0A1D37] absolute right-3 top-1/2 -translate-y-1/2" />
              )}
            </div>

            {/* Popular Stocks Quick Chips */}
            {!symbol && (
              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                <span className="text-[10px] text-[#888888]">Popular:</span>
                {['RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'ICICIBANK', 'SBIN', 'TATAMOTORS', 'ITC'].map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => handleSelectStock(chip)}
                    className="px-2 py-0.5 bg-[#FAFAF8] hover:bg-[#0A1D37] text-[#0A1D37] hover:text-white border border-[#E5E5E5] rounded text-[10px] font-mono font-bold transition-colors cursor-pointer"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            )}

            {/* Search Dropdown Autocomplete */}
            {searchResults.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-[#E5E5E5] rounded-xl shadow-xl z-50 overflow-hidden divide-y divide-[#F1F1EF]">
                {searchResults.map((item) => (
                  <button
                    key={item.symbol}
                    type="button"
                    onClick={() => handleSelectStock(item.symbol)}
                    className="w-full px-3.5 py-2 text-left text-xs hover:bg-[#FAFAF8] flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <div>
                      <span className="font-bold text-[#0A1D37] block">{item.symbol}</span>
                      <span className="text-[10px] text-[#888888]">{item.name || item.symbol}</span>
                    </div>
                    <span className="text-[10px] uppercase font-mono bg-[#FAFAF8] px-1.5 py-0.5 rounded border border-[#E5E5E5]">
                      {item.exchange || 'NSE'}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quantity & Price per Share Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#5F6368] mb-1.5">
                Quantity (Shares)
              </label>
              <input
                type="number"
                required
                min="0.0001"
                step="any"
                placeholder="e.g. 50"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-[#E5E5E5] rounded-xl text-xs font-mono font-bold focus:outline-none focus:border-[#0A1D37]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#5F6368] mb-1.5">
                Price per Share (₹)
              </label>
              <input
                type="number"
                required
                min="0.01"
                step="any"
                placeholder="e.g. 2450.00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-[#E5E5E5] rounded-xl text-xs font-mono font-bold focus:outline-none focus:border-[#0A1D37]"
              />
            </div>
          </div>

          {/* Transaction Date */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#5F6368] mb-1.5">
              Execution Date
            </label>
            <input
              type="date"
              value={transactionDate}
              onChange={(e) => setTransactionDate(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-[#E5E5E5] rounded-xl text-xs font-mono focus:outline-none focus:border-[#0A1D37]"
            />
          </div>

          {/* Notes Optional */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#5F6368] mb-1.5">
              Notes (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Core long-term holding, Q4 rebalance..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-[#E5E5E5] rounded-xl text-xs focus:outline-none focus:border-[#0A1D37]"
            />
          </div>

          {/* Buttons */}
          <div className="pt-3 border-t border-[#F1F1EF] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white border border-[#E5E5E5] text-[#111111] hover:bg-[#F5F5F3] text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-[#0A1D37] hover:bg-[#071426] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Recording...</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Save Transaction</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
