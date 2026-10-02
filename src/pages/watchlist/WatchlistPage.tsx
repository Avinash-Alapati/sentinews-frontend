import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import {
  Bookmark,
  Plus,
  TrendingUp,
  TrendingDown,
  Trash2,
  ArrowUpRight,
  Search,
  Pencil,
  X,
  Loader2,
  RefreshCw,
  AlertCircle,
  FolderPlus,
  MoreVertical,
  ArrowLeft,
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useWatchlists } from '@/hooks/useWatchlists';
import { marketApi } from '@/services/api/market.api';
import { StockSearchResult } from '@/types/market.types';
import { Watchlist } from '@/types/watchlist.types';

export const WatchlistPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedWatchlistIdParam = searchParams.get('id');

  const {
    watchlists,
    activeWatchlist,
    activeWatchlistId,
    setActiveWatchlistId,
    enrichedStocks,
    isLoadingWatchlists,
    isLoadingQuotes,
    error,
    setError,
    createWatchlist,
    updateWatchlist,
    deleteWatchlist,
    addStock,
    removeStock,
    refetchQuotes,
  } = useWatchlists();

  // Search filter states
  const [watchlistSearchQuery, setWatchlistSearchQuery] = useState('');
  const [stockSearchQuery, setStockSearchQuery] = useState('');

  // 3-Dots menu open state
  const [active3DotId, setActive3DotId] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Target watchlist for rename/delete actions
  const [targetWatchlist, setTargetWatchlist] = useState<Watchlist | null>(null);

  // Modal visibility states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddStockModal, setShowAddStockModal] = useState(false);

  // Form states
  const [newWatchlistName, setNewWatchlistName] = useState('');
  const [renameWatchlistName, setRenameWatchlistName] = useState('');

  // Add stock form state
  const [stockSymbolInput, setStockSymbolInput] = useState('');
  const [stockExchange, setStockExchange] = useState('NSE');
  const [stockNotes, setStockNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Auto-complete stock search results
  const [searchResults, setSearchResults] = useState<StockSearchResult[]>([]);
  const [isSearchingStocks, setIsSearchingStocks] = useState(false);

  // Sync selected watchlist ID from URL parameter
  useEffect(() => {
    if (selectedWatchlistIdParam) {
      const idNum = parseInt(selectedWatchlistIdParam, 10);
      if (!isNaN(idNum) && idNum !== activeWatchlistId) {
        setActiveWatchlistId(idNum);
      }
    }
  }, [selectedWatchlistIdParam, activeWatchlistId, setActiveWatchlistId]);

  // Close 3-dots dropdown menu on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActive3DotId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter watchlists by name for main view
  const filteredWatchlists = useMemo(() => {
    if (!watchlistSearchQuery.trim()) return watchlists;
    const q = watchlistSearchQuery.toLowerCase().trim();
    return watchlists.filter((w) => w.name.toLowerCase().includes(q));
  }, [watchlists, watchlistSearchQuery]);

  // Filter stocks in active watchlist based on stock search bar
  const filteredStocks = useMemo(() => {
    if (!stockSearchQuery.trim()) return enrichedStocks;
    const q = stockSearchQuery.toLowerCase().trim();
    return enrichedStocks.filter(
      (s) =>
        s.symbol.toLowerCase().includes(q) ||
        (s.name && s.name.toLowerCase().includes(q))
    );
  }, [enrichedStocks, stockSearchQuery]);

  // Debounced search for stocks in Add Stock modal
  useEffect(() => {
    if (!stockSymbolInput.trim() || stockSymbolInput.length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingStocks(true);
      try {
        const results = await marketApi.searchStocks(stockSymbolInput);
        setSearchResults(results.slice(0, 6));
      } catch (err) {
        console.error('Stock search error:', err);
      } finally {
        setIsSearchingStocks(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [stockSymbolInput]);

  // Handler: Open Watchlist Stocks Detail View
  const handleOpenWatchlist = (wId: number) => {
    setActiveWatchlistId(wId);
    setSearchParams({ id: String(wId) });
  };

  // Handler: Go Back to Watchlists Overview Page
  const handleBackToWatchlists = () => {
    setSearchParams({});
  };

  // Handler: Create Watchlist
  const handleCreateWatchlist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWatchlistName.trim()) return;
    setIsSubmitting(true);
    setFormError(null);
    try {
      const created = await createWatchlist(newWatchlistName.trim());
      setNewWatchlistName('');
      setShowCreateModal(false);
      if (created) {
        handleOpenWatchlist(created.id);
      }
    } catch (err: any) {
      setFormError(err.message || 'Failed to create watchlist');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler: Rename Watchlist
  const handleRenameWatchlist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetWatchlist || !renameWatchlistName.trim()) return;
    setIsSubmitting(true);
    setFormError(null);
    try {
      await updateWatchlist(targetWatchlist.id, renameWatchlistName.trim());
      setShowRenameModal(false);
      setTargetWatchlist(null);
    } catch (err: any) {
      setFormError(err.message || 'Failed to rename watchlist');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler: Delete Watchlist
  const handleDeleteWatchlist = async () => {
    if (!targetWatchlist) return;
    setIsSubmitting(true);
    try {
      await deleteWatchlist(targetWatchlist.id);
      setShowDeleteModal(false);
      setTargetWatchlist(null);
      if (selectedWatchlistIdParam && parseInt(selectedWatchlistIdParam, 10) === targetWatchlist.id) {
        handleBackToWatchlists();
      }
    } catch (err: any) {
      setFormError(err.message || 'Failed to delete watchlist');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler: Add Stock to Selected Watchlist
  const handleAddStock = async (e: React.FormEvent) => {
    e.preventDefault();
    const wId = targetWatchlist ? targetWatchlist.id : (activeWatchlist ? activeWatchlist.id : null);
    if (!wId || !stockSymbolInput.trim()) return;
    const cleanSym = stockSymbolInput.trim().toUpperCase();

    setIsSubmitting(true);
    setFormError(null);

    try {
      await addStock(wId, cleanSym, stockExchange, stockNotes.trim() || undefined);
      setStockSymbolInput('');
      setStockNotes('');
      setSearchResults([]);
      setShowAddStockModal(false);
    } catch (err: any) {
      setFormError(err.message || `Failed to add ${cleanSym} to watchlist`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler: Remove Stock from Active Watchlist
  const handleRemoveStock = async (e: React.MouseEvent, symbol: string) => {
    e.stopPropagation();
    if (!activeWatchlist) return;
    try {
      await removeStock(activeWatchlist.id, symbol);
    } catch (err: any) {
      console.error('Failed to remove stock:', err);
    }
  };

  // Handler: Open Stock Chart View on Row Click
  const handleStockClick = (symbol: string) => {
    const rawSym = symbol.includes(':') ? symbol.split(':')[1] : symbol;
    const cleanSym = rawSym.trim().toUpperCase().replace('.NS', '').replace('.BO', '');
    navigate(`/stock/${encodeURIComponent(cleanSym)}`);
  };

  // Current active watchlist for detail view
  const currentDetailWatchlist = selectedWatchlistIdParam
    ? watchlists.find((w) => w.id === parseInt(selectedWatchlistIdParam, 10)) || activeWatchlist
    : null;

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#111111] flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-[1140px] mx-auto px-4 sm:px-6 py-8 w-full pb-20 md:pb-12">
        <div className="space-y-6">

          {/* Top Header - ONLY SHOWN WHEN ON WATCHLISTS OVERVIEW VIEW */}
          {!currentDetailWatchlist && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#E5E5E5]">
              <div>
                <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#111111] flex items-center gap-2.5">
                  <Bookmark className="w-6 h-6 text-[#0A1D37]" />
                  <span>My Watchlists</span>
                </h1>
                <p className="text-xs text-[#666666] mt-1">
                  Create custom watchlists and track live Indian market equity feeds in real-time.
                </p>
              </div>

              <div className="flex items-center gap-2.5 shrink-0">
                <button
                  onClick={() => refetchQuotes()}
                  disabled={isLoadingQuotes}
                  title="Refresh Market Quotes"
                  className="p-2 text-[#666666] hover:text-[#111111] bg-white border border-[#E5E5E5] hover:border-[#111111] rounded-sm transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoadingQuotes ? 'animate-spin' : ''}`} />
                </button>

                <button
                  onClick={() => {
                    setFormError(null);
                    setNewWatchlistName('');
                    setShowCreateModal(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#0A1D37] hover:bg-[#071426] rounded-sm transition-colors shadow-2xs shrink-0"
                >
                  <FolderPlus className="w-4 h-4" />
                  <span>Create Watchlist</span>
                </button>
              </div>
            </div>
          )}

          {/* Error Notification Banner */}
          {error && (
            <div className="flex items-center justify-between p-3 text-xs bg-rose-50 border border-rose-200 text-rose-800 rounded-sm">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-rose-600 hover:text-rose-900 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* VIEW 1: WATCHLISTS OVERVIEW PAGE (When no specific watchlist is selected) */}
          {!currentDetailWatchlist ? (
            <div className="bg-white border border-[#E5E5E5] rounded-sm p-4 sm:p-6 shadow-2xs space-y-6">
              
              {/* Watchlists List Search Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E5E5E5]">
                <div className="flex items-center gap-2">
                  <Bookmark className="w-4 h-4 text-[#0A1D37]" />
                  <h2 className="text-base font-semibold text-[#111111]">
                    Watchlists
                  </h2>
                </div>

                {/* Real-time search box for watchlists */}
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#888888]" />
                  <input
                    type="text"
                    placeholder="Search watchlists..."
                    value={watchlistSearchQuery}
                    onChange={(e) => setWatchlistSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-8 py-2 text-xs bg-[#FAFAF8] border border-[#E5E5E5] rounded-sm focus:outline-none focus:border-[#111111] transition-colors"
                  />
                  {watchlistSearchQuery && (
                    <button
                      onClick={() => setWatchlistSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#888888] hover:text-[#111111]"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* LIST OF WATCHLIST CARDS (Stacked one by one down) */}
              {isLoadingWatchlists ? (
                <div className="flex items-center justify-center gap-2 py-16 text-xs text-[#888888]">
                  <Loader2 className="w-5 h-5 animate-spin text-[#0A1D37]" />
                  <span>Loading your watchlists...</span>
                </div>
              ) : filteredWatchlists.length === 0 ? (
                <div className="text-center py-16 px-4 space-y-3">
                  <Bookmark className="w-10 h-10 text-[#CCCCCC] mx-auto" />
                  <p className="text-xs text-[#666666]">
                    {watchlistSearchQuery
                      ? `No watchlists matched "${watchlistSearchQuery}".`
                      : 'No watchlists available. Click "Create Watchlist" above to start.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredWatchlists.map((w) => {
                    const is3DotOpen = active3DotId === w.id;

                    return (
                      <div
                        key={w.id}
                        onClick={() => handleOpenWatchlist(w.id)}
                        className="group flex items-center justify-between p-4 bg-[#FAFAF8] hover:bg-white border border-[#E5E5E5] hover:border-[#0A1D37] rounded-sm transition-all cursor-pointer shadow-2xs hover:shadow-xs"
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div className="w-10 h-10 rounded-sm bg-white border border-[#E5E5E5] group-hover:border-[#0A1D37] text-[#0A1D37] flex items-center justify-center shrink-0 transition-colors">
                            <Bookmark className="w-5 h-5" />
                          </div>

                          <div className="min-w-0">
                            <h3 className="text-base font-semibold text-[#111111] group-hover:text-[#0A1D37] truncate transition-colors">
                              {w.name}
                            </h3>
                          </div>
                        </div>

                        {/* Right side: 3-dots more menu */}
                        <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                          
                          {/* 3-DOTS MORE BUTTON */}
                          <div className="relative">
                            <button
                              onClick={() => {
                                setActive3DotId((prev) => (prev === w.id ? null : w.id));
                              }}
                              title="More options"
                              className="p-1.5 text-[#666666] hover:text-[#111111] hover:bg-[#E5E5E5] rounded-sm transition-colors"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>

                            {/* 3-DOTS DROPDOWN MENU */}
                            {is3DotOpen && (
                              <div
                                ref={menuRef}
                                className="absolute right-0 top-full mt-1 w-44 bg-white border border-[#E5E5E5] rounded-sm shadow-lg z-50 py-1 divide-y divide-[#F5F5F3]"
                              >
                                <button
                                  onClick={() => {
                                    setActive3DotId(null);
                                    setTargetWatchlist(w);
                                    setRenameWatchlistName(w.name);
                                    setFormError(null);
                                    setShowRenameModal(true);
                                  }}
                                  className="w-full px-3 py-2 text-xs text-left text-[#111111] hover:bg-[#FAFAF8] flex items-center gap-2 transition-colors"
                                >
                                  <Pencil className="w-3.5 h-3.5 text-[#0A1D37]" />
                                  <span>Edit / Rename</span>
                                </button>

                                <button
                                  onClick={() => {
                                    setActive3DotId(null);
                                    setTargetWatchlist(w);
                                    setFormError(null);
                                    setShowAddStockModal(true);
                                  }}
                                  className="w-full px-3 py-2 text-xs text-left text-[#111111] hover:bg-[#FAFAF8] flex items-center gap-2 transition-colors"
                                >
                                  <Plus className="w-3.5 h-3.5 text-[#0A1D37]" />
                                  <span>Add Stocks</span>
                                </button>

                                {watchlists.length > 1 && (
                                  <button
                                    onClick={() => {
                                      setActive3DotId(null);
                                      setTargetWatchlist(w);
                                      setFormError(null);
                                      setShowDeleteModal(true);
                                    }}
                                    className="w-full px-3 py-2 text-xs text-left text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span>Delete Watchlist</span>
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            
            /* VIEW 2: WATCHLIST DETAIL STOCKS PAGE (When a specific watchlist is clicked) */
            <div className="space-y-6">
              
              {/* Detail Page Header Bar - Clean side-by-side layout for mobile & desktop */}
              <div className="flex items-center justify-between gap-2.5 bg-white p-3 sm:p-4 border border-[#E5E5E5] rounded-sm shadow-2xs">
                
                {/* Left side: Back button & Watchlist Name */}
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <button
                    onClick={handleBackToWatchlists}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 text-xs font-semibold text-[#111111] bg-[#FAFAF8] border border-[#E5E5E5] hover:bg-[#F5F5F3] hover:border-[#111111] rounded-sm transition-colors shrink-0"
                    title="Back to Watchlists"
                  >
                    <ArrowLeft className="w-4 h-4 text-[#0A1D37]" />
                    <span className="hidden sm:inline">Back</span>
                  </button>

                  <div className="flex items-center gap-2 min-w-0 truncate">
                    <h2 className="text-base sm:text-lg font-semibold text-[#111111] truncate">
                      {currentDetailWatchlist.name}
                    </h2>
                    {isLoadingQuotes && (
                      <span className="hidden md:flex items-center gap-1 text-[11px] text-[#0A1D37]">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Updating quotes...
                      </span>
                    )}
                  </div>
                </div>

                {/* Right side controls: 3-dots menu & + Add Stocks button */}
                <div className="flex items-center gap-2 shrink-0">
                  
                  {/* 3-DOTS MENU FOR THIS WATCHLIST */}
                  <div className="relative">
                    <button
                      onClick={() => {
                        setActive3DotId((prev) => (prev === currentDetailWatchlist.id ? null : currentDetailWatchlist.id));
                      }}
                      title="Watchlist Options"
                      className="p-1.5 sm:p-2 text-[#666666] hover:text-[#111111] bg-white border border-[#E5E5E5] hover:border-[#111111] rounded-sm transition-colors"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {active3DotId === currentDetailWatchlist.id && (
                      <div
                        ref={menuRef}
                        className="absolute right-0 top-full mt-1 w-44 bg-white border border-[#E5E5E5] rounded-sm shadow-lg z-50 py-1 divide-y divide-[#F5F5F3]"
                      >
                        <button
                          onClick={() => {
                            setActive3DotId(null);
                            setTargetWatchlist(currentDetailWatchlist);
                            setRenameWatchlistName(currentDetailWatchlist.name);
                            setFormError(null);
                            setShowRenameModal(true);
                          }}
                          className="w-full px-3 py-2 text-xs text-left text-[#111111] hover:bg-[#FAFAF8] flex items-center gap-2 transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5 text-[#0A1D37]" />
                          <span>Rename Watchlist</span>
                        </button>

                        {watchlists.length > 1 && (
                          <button
                            onClick={() => {
                              setActive3DotId(null);
                              setTargetWatchlist(currentDetailWatchlist);
                              setFormError(null);
                              setShowDeleteModal(true);
                            }}
                            className="w-full px-3 py-2 text-xs text-left text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete Watchlist</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Add Stocks Button */}
                  <button
                    onClick={() => {
                      setTargetWatchlist(currentDetailWatchlist);
                      setFormError(null);
                      setStockSymbolInput('');
                      setStockNotes('');
                      setSearchResults([]);
                      setShowAddStockModal(true);
                    }}
                    title="Add Stocks"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3.5 sm:py-2 text-xs font-semibold text-white bg-[#0A1D37] hover:bg-[#071426] rounded-sm transition-colors shadow-2xs shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">Add Stocks</span>
                  </button>
                </div>
              </div>

              {/* Stocks Search / Filter Bar */}
              <div className="flex items-center justify-between gap-3 bg-white p-3 border border-[#E5E5E5] rounded-sm">
                <span className="text-xs font-semibold text-[#666666] uppercase tracking-wider hidden sm:inline">
                  Watchlist Stocks Feed
                </span>
                <div className="relative w-full sm:w-72">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#888888]" />
                  <input
                    type="text"
                    placeholder="Filter stocks in this watchlist..."
                    value={stockSearchQuery}
                    onChange={(e) => setStockSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-8 py-1.5 text-xs bg-[#FAFAF8] border border-[#E5E5E5] rounded-sm focus:outline-none focus:border-[#111111] transition-colors"
                  />
                  {stockSearchQuery && (
                    <button
                      onClick={() => setStockSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#888888] hover:text-[#111111]"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* STOCKS TABLE LIST */}
              <div className="bg-white border border-[#E5E5E5] rounded-sm shadow-2xs overflow-hidden">
                {filteredStocks.length === 0 ? (
                  <div className="text-center py-16 px-4 space-y-3">
                    <div className="w-12 h-12 bg-[#FAFAF8] border border-[#E5E5E5] rounded-full mx-auto flex items-center justify-center text-[#888888]">
                      <Bookmark className="w-6 h-6 text-[#0A1D37]" />
                    </div>
                    <h3 className="text-base font-semibold text-[#111111]">
                      {stockSearchQuery ? 'No stocks match your filter' : 'No stocks in this watchlist'}
                    </h3>
                    <p className="text-xs text-[#666666] max-w-sm mx-auto leading-relaxed">
                      {stockSearchQuery
                        ? `No equities matched "${stockSearchQuery}". Try searching with a different ticker or company name.`
                        : `Start tracking live Indian equities by adding your first stock to "${currentDetailWatchlist.name}".`}
                    </p>

                    {!stockSearchQuery && (
                      <button
                        onClick={() => {
                          setTargetWatchlist(currentDetailWatchlist);
                          setFormError(null);
                          setStockSymbolInput('');
                          setStockNotes('');
                          setSearchResults([]);
                          setShowAddStockModal(true);
                        }}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#0A1D37] hover:bg-[#071426] rounded-sm transition-colors mt-2"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add Stocks</span>
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-[#E5E5E5] bg-[#FAFAF8] text-[11px] font-semibold text-[#666666] uppercase tracking-wider">
                          <th className="py-3 px-4 sm:px-6">Symbol / Company</th>
                          <th className="py-3 px-4 text-right">LTP (₹)</th>
                          <th className="py-3 px-4 text-right">Change</th>
                          <th className="py-3 px-4 text-right hidden md:table-cell">24H High / Low</th>
                          <th className="py-3 px-4 text-right hidden sm:table-cell">Volume</th>
                          <th className="py-3 px-4 sm:px-6 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E5E5E5] text-sm">
                        {filteredStocks.map((item) => {
                          const isPositive = (item.change ?? 0) >= 0;
                          const hasPrice = item.price && item.price > 0;

                          return (
                            <tr
                              key={item.symbol}
                              onClick={() => handleStockClick(item.symbol)}
                              title={`Click to open ${item.symbol} stock chart`}
                              className="hover:bg-[#F5F5F3] cursor-pointer transition-colors group"
                            >
                              {/* Symbol & Company Name */}
                              <td className="py-3.5 px-4 sm:px-6">
                                <div className="flex flex-col">
                                  <div className="flex items-center gap-2">
                                    <span className="font-semibold text-[#111111] group-hover:text-[#0A1D37] flex items-center gap-1">
                                      <span>{item.symbol}</span>
                                      <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-[#0A1D37]" />
                                    </span>
                                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-xs bg-[#F5F5F3] text-[#666666]">
                                      {item.exchange || 'NSE'}
                                    </span>
                                  </div>
                                  <span className="text-xs text-[#666666] truncate max-w-[180px] sm:max-w-none">
                                    {item.name || `${item.symbol} Ltd.`}
                                  </span>
                                  {item.notes && (
                                    <span className="text-[11px] text-[#888888] italic truncate max-w-[200px] mt-0.5">
                                      Note: {item.notes}
                                    </span>
                                  )}
                                </div>
                              </td>

                              {/* Last Traded Price (LTP) */}
                              <td className="py-3.5 px-4 text-right font-semibold text-[#111111]">
                                {hasPrice
                                  ? `₹${item.price!.toLocaleString('en-IN', {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    })}`
                                  : '-'}
                              </td>

                              {/* Price Change & Percentage */}
                              <td className="py-3.5 px-4 text-right">
                                {hasPrice ? (
                                  <div
                                    className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-xs ${
                                      isPositive
                                        ? 'text-emerald-700 bg-emerald-50'
                                        : 'text-rose-700 bg-rose-50'
                                    }`}
                                  >
                                    {isPositive ? (
                                      <TrendingUp className="w-3.5 h-3.5" />
                                    ) : (
                                      <TrendingDown className="w-3.5 h-3.5" />
                                    )}
                                    <span>
                                      {isPositive ? '+' : ''}
                                      {item.change!.toFixed(2)} ({isPositive ? '+' : ''}
                                      {item.changePercent!.toFixed(2)}%)
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-xs text-[#888888]">-</span>
                                )}
                              </td>

                              {/* Day High / Low */}
                              <td className="py-3.5 px-4 text-right text-xs text-[#666666] hidden md:table-cell">
                                {item.day_high && item.day_low ? (
                                  <span>
                                    ₹{item.day_high.toFixed(1)} / ₹{item.day_low.toFixed(1)}
                                  </span>
                                ) : (
                                  '-'
                                )}
                              </td>

                              {/* Volume */}
                              <td className="py-3.5 px-4 text-right text-xs text-[#666666] hidden sm:table-cell font-mono">
                                {item.volume || '-'}
                              </td>

                              {/* Row Actions */}
                              <td className="py-3.5 px-4 sm:px-6 text-right">
                                <button
                                  onClick={(e) => handleRemoveStock(e, item.symbol)}
                                  title="Remove stock from watchlist"
                                  className="p-1.5 text-[#888888] hover:text-red-600 hover:bg-red-50 rounded-sm transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </main>

      {/* MODAL 1: Create Watchlist */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#E5E5E5] rounded-sm max-w-sm w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-[#111111]">Create New Watchlist</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-[#888888] hover:text-[#111111]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="p-2 text-xs bg-rose-50 text-rose-700 border border-rose-200 rounded-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateWatchlist} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#666666]">
                  Watchlist Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. IT Leaders, High Dividend"
                  value={newWatchlistName}
                  onChange={(e) => setNewWatchlistName(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-[#FAFAF8] border border-[#E5E5E5] rounded-sm focus:outline-none focus:border-[#111111]"
                  autoFocus
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3.5 py-2 text-xs font-medium text-[#666666] hover:bg-[#F5F5F3] rounded-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !newWatchlistName.trim()}
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#0A1D37] hover:bg-[#071426] rounded-sm transition-colors disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Create Watchlist</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Rename Watchlist */}
      {showRenameModal && targetWatchlist && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#E5E5E5] rounded-sm max-w-sm w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-[#111111]">Rename Watchlist</h3>
              <button
                onClick={() => setShowRenameModal(false)}
                className="text-[#888888] hover:text-[#111111]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="p-2 text-xs bg-rose-50 text-rose-700 border border-rose-200 rounded-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleRenameWatchlist} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#666666]">
                  Watchlist Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="Watchlist Name"
                  value={renameWatchlistName}
                  onChange={(e) => setRenameWatchlistName(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-[#FAFAF8] border border-[#E5E5E5] rounded-sm focus:outline-none focus:border-[#111111]"
                  autoFocus
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRenameModal(false)}
                  className="px-3.5 py-2 text-xs font-medium text-[#666666] hover:bg-[#F5F5F3] rounded-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !renameWatchlistName.trim()}
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#0A1D37] hover:bg-[#071426] rounded-sm transition-colors disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Delete Watchlist Confirmation */}
      {showDeleteModal && targetWatchlist && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#E5E5E5] rounded-sm max-w-sm w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-[#111111]">Delete Watchlist</h3>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="text-[#888888] hover:text-[#111111]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#666666] leading-relaxed">
              Are you sure you want to delete <strong className="text-[#111111]">"{targetWatchlist.name}"</strong>?
              This action will permanently remove the watchlist and all stocks inside it.
            </p>

            {formError && (
              <div className="p-2 text-xs bg-rose-50 text-rose-700 border border-rose-200 rounded-xs">
                {formError}
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="px-3.5 py-2 text-xs font-medium text-[#666666] hover:bg-[#F5F5F3] rounded-sm transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteWatchlist}
                disabled={isSubmitting}
                className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-sm transition-colors disabled:opacity-50 flex items-center gap-1.5"
              >
                {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Delete Watchlist</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: Add Stock to Watchlist */}
      {showAddStockModal && (targetWatchlist || activeWatchlist) && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#E5E5E5] rounded-sm max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-[#111111]">
                  Add Stock to Watchlist
                </h3>
                <p className="text-xs text-[#666666]">
                  Watchlist: <strong className="text-[#0A1D37]">{(targetWatchlist || activeWatchlist)?.name}</strong>
                </p>
              </div>
              <button
                onClick={() => setShowAddStockModal(false)}
                className="text-[#888888] hover:text-[#111111]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="p-2 text-xs bg-rose-50 text-rose-700 border border-rose-200 rounded-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleAddStock} className="space-y-4">
              {/* Symbol input with autocomplete */}
              <div className="space-y-1.5 relative">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#666666]">
                  NSE / BSE Symbol or Company Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="e.g. RELIANCE, TCS, TATAMOTORS, HDFCBANK"
                    value={stockSymbolInput}
                    onChange={(e) => setStockSymbolInput(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-[#FAFAF8] border border-[#E5E5E5] rounded-sm focus:outline-none focus:border-[#111111] font-mono uppercase"
                    autoFocus
                  />
                  {isSearchingStocks && (
                    <Loader2 className="w-4 h-4 animate-spin absolute right-3 top-1/2 -translate-y-1/2 text-[#888888]" />
                  )}
                </div>

                {/* Autocomplete dropdown suggestions */}
                {searchResults.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-[#E5E5E5] rounded-sm shadow-lg max-h-48 overflow-y-auto z-50 divide-y divide-[#E5E5E5]">
                    {searchResults.map((res) => (
                      <button
                        key={res.symbol}
                        type="button"
                        onClick={() => {
                          setStockSymbolInput(res.symbol);
                          if (res.exchange) setStockExchange(res.exchange);
                          setSearchResults([]);
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-[#FAFAF8] flex items-center justify-between transition-colors text-xs"
                      >
                        <div>
                          <span className="font-semibold text-[#111111]">{res.symbol}</span>
                          <span className="text-[#666666] ml-2 text-[11px]">{res.name}</span>
                        </div>
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-xs bg-[#F5F5F3] text-[#666666]">
                          {res.exchange || 'NSE'}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Exchange Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#666666]">
                  Exchange
                </label>
                <div className="flex items-center gap-4 text-xs font-medium">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="exchange"
                      value="NSE"
                      checked={stockExchange === 'NSE'}
                      onChange={() => setStockExchange('NSE')}
                      className="text-[#0A1D37] focus:ring-[#0A1D37]"
                    />
                    <span>NSE (National Stock Exchange)</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="exchange"
                      value="BSE"
                      checked={stockExchange === 'BSE'}
                      onChange={() => setStockExchange('BSE')}
                      className="text-[#0A1D37] focus:ring-[#0A1D37]"
                    />
                    <span>BSE (Bombay Stock Exchange)</span>
                  </label>
                </div>
              </div>

              {/* Research Notes */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#666666]">
                  Personal Notes (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Target ₹3200, Q2 result review"
                  value={stockNotes}
                  onChange={(e) => setStockNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#FAFAF8] border border-[#E5E5E5] rounded-sm focus:outline-none focus:border-[#111111]"
                />
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddStockModal(false)}
                  className="px-3.5 py-2 text-xs font-medium text-[#666666] hover:bg-[#F5F5F3] rounded-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !stockSymbolInput.trim()}
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#0A1D37] hover:bg-[#071426] rounded-sm transition-colors disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Add Stocks</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default WatchlistPage;
