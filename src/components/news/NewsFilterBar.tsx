import React from 'react';
import { Search, Flame, Globe2, Laptop, Building2, Zap, TrendingUp } from 'lucide-react';

export interface NewsFilterBarProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  isTrendingOnly: boolean;
  onToggleTrending: () => void;
}

const CATEGORIES = [
  { id: 'ALL', label: 'All News', icon: Globe2 },
  { id: 'Markets', label: 'Markets', icon: TrendingUp },
  { id: 'Information Technology', label: 'Tech & AI', icon: Laptop },
  { id: 'Banking', label: 'Banking & Finance', icon: Building2 },
  { id: 'Energy', label: 'Energy & Commodities', icon: Zap },
  { id: 'Economy', label: 'Macro Economy', icon: Globe2 },
];

export const NewsFilterBar: React.FC<NewsFilterBarProps> = ({
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  isTrendingOnly,
  onToggleTrending,
}) => {
  return (
    <div className="space-y-4 w-full">
      {/* Search Input & Trending Toggle */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input Box */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#888888]" />
          <input
            type="text"
            placeholder="Search news by topic, headline, company or ticker symbol..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E5E5E5] rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#0A1D37] focus:ring-1 focus:ring-[#0A1D37] transition-all font-sans"
          />
        </div>

        {/* Trending Stories Toggle Button in Navy Blue (#0A1D37) */}
        <button
          type="button"
          onClick={onToggleTrending}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs border ${
            isTrendingOnly
              ? 'bg-[#0A1D37] border-[#0A1D37] text-white'
              : 'bg-white border-[#E5E5E5] text-[#5F6368] hover:text-[#0A1D37] hover:border-[#0A1D37]'
          }`}
        >
          <Flame className={`w-4 h-4 ${isTrendingOnly ? 'text-amber-400' : 'text-amber-500'}`} />
          <span>Trending Top Stories</span>
        </button>
      </div>

      {/* Category Filter Pills styled in Navy Blue (#0A1D37) for active state */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-none">
        {CATEGORIES.map((cat) => {
          const IconComp = cat.icon;
          const isActive = !isTrendingOnly && selectedCategory === cat.id;

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                if (isTrendingOnly) onToggleTrending();
                onSelectCategory(cat.id);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer border ${
                isActive
                  ? 'bg-[#0A1D37] border-[#0A1D37] text-white shadow-2xs font-bold'
                  : 'bg-white border-[#E5E5E5] text-[#5F6368] hover:text-[#0A1D37] hover:border-[#0A1D37]'
              }`}
            >
              <IconComp className="w-3.5 h-3.5" />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default NewsFilterBar;
