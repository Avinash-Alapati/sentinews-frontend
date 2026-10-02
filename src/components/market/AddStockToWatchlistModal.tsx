import React, { useState } from 'react';
import { useWatchlists } from '@/hooks/useWatchlists';
import { X, Plus, Check, Bookmark, Loader2, FolderPlus, AlertCircle } from 'lucide-react';

export interface AddStockToWatchlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  stock: {
    symbol: string;
    name?: string;
    exchange?: string;
  } | null;
}

export const AddStockToWatchlistModal: React.FC<AddStockToWatchlistModalProps> = ({
  isOpen,
  onClose,
  stock,
}) => {
  const { watchlists, addStock, createWatchlist } = useWatchlists();

  const [isCreating, setIsCreating] = useState(false);
  const [newWatchlistName, setNewWatchlistName] = useState('');
  const [addingWatchlistId, setAddingWatchlistId] = useState<number | null>(null);
  const [addedWatchlistIds, setAddedWatchlistIds] = useState<Set<number>>(new Set());
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen || !stock) return null;

  const handleAddStockToWatchlist = async (watchlistId: number) => {
    try {
      setAddingWatchlistId(watchlistId);
      setErrorMsg(null);
      await addStock(watchlistId, stock.symbol, stock.exchange || 'NSE');
      setAddedWatchlistIds((prev) => new Set(prev).add(watchlistId));
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to add stock to watchlist.');
    } finally {
      setAddingWatchlistId(null);
    }
  };

  const handleCreateAndAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWatchlistName.trim()) return;

    try {
      setIsCreating(true);
      setErrorMsg(null);
      const newWatchlist = await createWatchlist(newWatchlistName.trim());
      await addStock(newWatchlist.id, stock.symbol, stock.exchange || 'NSE');
      setAddedWatchlistIds((prev) => new Set(prev).add(newWatchlist.id));
      setNewWatchlistName('');
      setIsCreatingNew(false);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create watchlist.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white rounded-2xl border border-[#E5E5E5] shadow-2xl max-w-md w-full overflow-hidden font-sans space-y-0"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#F1F1EF] bg-[#FAFAF8]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0A1D37] text-white flex items-center justify-center shrink-0">
              <Bookmark className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#111111]">Save to Watchlist</h3>
              <p className="text-xs text-[#5F6368]">
                Add <span className="font-bold text-[#0A1D37]">{stock.symbol}</span> ({stock.name || stock.symbol})
              </p>
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
          <div className="mx-5 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Content: List of Watchlists */}
        <div className="p-5 space-y-4 max-h-[320px] overflow-y-auto">
          <div className="text-xs font-bold uppercase tracking-wider text-[#5F6368]">
            Your Watchlists
          </div>

          {watchlists.length === 0 ? (
            <div className="text-center py-6 text-xs text-[#888888]">
              No watchlists created yet. Create your first watchlist below.
            </div>
          ) : (
            <div className="space-y-2">
              {watchlists.map((wl) => {
                const isAlreadyInWatchlist =
                  wl.stocks?.some(
                    (s) => s.symbol.toUpperCase() === stock.symbol.toUpperCase()
                  ) || addedWatchlistIds.has(wl.id);

                const isAdding = addingWatchlistId === wl.id;

                return (
                  <div
                    key={wl.id}
                    className="flex items-center justify-between p-3 rounded-xl border border-[#E5E5E5] hover:border-[#0A1D37]/30 hover:bg-[#FAFAF8] transition-all"
                  >
                    <div>
                      <span className="font-bold text-sm text-[#111111] block">
                        {wl.name}
                      </span>
                      <span className="text-[11px] text-[#888888]">
                        {wl.stock_count || wl.stocks?.length || 0} stocks
                      </span>
                    </div>

                    {isAlreadyInWatchlist ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-semibold">
                        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                        Added
                      </span>
                    ) : (
                      <button
                        type="button"
                        disabled={isAdding}
                        onClick={() => handleAddStockToWatchlist(wl.id)}
                        className="px-3.5 py-1.5 bg-[#0A1D37] text-white hover:bg-[#071426] text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs disabled:opacity-50"
                      >
                        {isAdding ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            Adding...
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                            Add
                          </>
                        )}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Inline Create New Watchlist Toggle/Form */}
          {isCreatingNew ? (
            <form onSubmit={handleCreateAndAdd} className="pt-2 border-t border-[#F1F1EF] space-y-3">
              <label className="block text-xs font-bold text-[#111111]">
                New Watchlist Name
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  autoFocus
                  value={newWatchlistName}
                  onChange={(e) => setNewWatchlistName(e.target.value)}
                  placeholder="e.g. High Growth, Tech Stocks..."
                  className="flex-1 px-3 py-2 bg-white border border-[#E5E5E5] rounded-xl text-xs focus:outline-none focus:border-[#0A1D37]"
                />
                <button
                  type="submit"
                  disabled={isCreating || !newWatchlistName.trim()}
                  className="px-4 py-2 bg-[#00B386] text-white hover:bg-[#009b74] text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1 shadow-2xs disabled:opacity-50"
                >
                  {isCreating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Plus className="w-4 h-4 stroke-[2.5]" />
                      Create & Add
                    </>
                  )}
                </button>
              </div>
              <button
                type="button"
                onClick={() => setIsCreatingNew(false)}
                className="text-xs text-[#888888] hover:text-[#111111] transition-colors"
              >
                Cancel
              </button>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setIsCreatingNew(true)}
              className="w-full py-2.5 px-4 rounded-xl border border-dashed border-[#0A1D37]/40 hover:border-[#0A1D37] text-xs font-bold text-[#0A1D37] hover:bg-[#FAFAF8] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <FolderPlus className="w-4 h-4" />
              <span>Create New Watchlist</span>
            </button>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#FAFAF8] border-t border-[#F1F1EF] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white border border-[#E5E5E5] text-[#111111] hover:bg-[#F5F5F3] text-xs font-semibold rounded-lg transition-colors cursor-pointer shadow-2xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
