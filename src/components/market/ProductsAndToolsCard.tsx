import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PieChart,
  TrendingUp,
  Newspaper,
  Bookmark,
  Rocket,
  ChevronRight,
  Clock,
} from 'lucide-react';

interface ToolItem {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  path?: string;
  isComingSoon?: boolean;
  color: string;
  bgColor: string;
}

const PRODUCTS_AND_TOOLS: ToolItem[] = [
  {
    id: 'portfolio',
    name: 'Portfolio',
    description: 'Track holdings, P&L & allocations',
    icon: PieChart,
    path: '/portfolio',
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50 border-emerald-200',
  },
  {
    id: 'market',
    name: 'Market',
    description: 'Indian equities & benchmark indices',
    icon: TrendingUp,
    path: '/market',
    color: 'text-[#0A1D37]',
    bgColor: 'bg-[#F5F5F3] border-[#E5E5E5]',
  },
  {
    id: 'news',
    name: 'News',
    description: 'Live financial market intelligence',
    icon: Newspaper,
    path: '/news',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50 border-blue-200',
  },
  {
    id: 'watchlist',
    name: 'Watchlist',
    description: 'Personal stock monitor & alerts',
    icon: Bookmark,
    path: '/watchlist',
    color: 'text-purple-700',
    bgColor: 'bg-purple-50 border-purple-200',
  },
  {
    id: 'ipos',
    name: 'IPOs',
    description: 'Initial Public Offerings & updates',
    icon: Rocket,
    isComingSoon: true,
    color: 'text-amber-700',
    bgColor: 'bg-amber-50 border-amber-200',
  },
];

export const ProductsAndToolsCard: React.FC = () => {
  const navigate = useNavigate();

  const handleItemClick = (item: ToolItem) => {
    if (item.isComingSoon) return;
    if (item.path) {
      navigate(item.path);
    }
  };

  return (
    <div className="bg-white border border-[#E5E5E5] rounded-xl p-4 sm:p-5 shadow-2xs space-y-4">
      {/* Header */}
      <div className="pb-3 border-b border-[#E5E5E5] flex items-center justify-between">
        <div>
          <h3 className="text-base sm:text-lg font-bold tracking-tight text-[#111111]">
            Products & Tools
          </h3>
          <p className="text-xs text-[#5F6368] mt-0.5 hidden sm:block">
            Essential tools & financial utilities
          </p>
        </div>
      </div>

      {/* MOBILE / RESPONSIVE VIEW (Icons like a mobile phone home screen with small names below) */}
      <div className="grid grid-cols-5 gap-2 sm:gap-4 lg:hidden items-start justify-items-center py-1">
        {PRODUCTS_AND_TOOLS.map((item) => {
          const Icon = item.icon;
          const isSoon = item.isComingSoon;

          return (
            <div
              key={item.id}
              onClick={() => handleItemClick(item)}
              className={`flex flex-col items-center group relative cursor-pointer ${
                isSoon ? 'opacity-80' : ''
              }`}
            >
              {/* Phone App Icon Box */}
              <div
                className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl border flex items-center justify-center transition-transform active:scale-95 shadow-2xs ${item.bgColor}`}
              >
                <Icon className={`w-6 h-6 ${item.color}`} />
              </div>

              {/* Small Label Below Icon */}
              <span className="text-[11px] font-medium text-[#111111] text-center mt-1.5 truncate max-w-[64px] leading-tight">
                {item.name}
              </span>

              {/* Coming Soon Indicator */}
              {isSoon && (
                <span className="mt-0.5 text-[8px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 border border-amber-300 uppercase tracking-tighter">
                  Soon
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* DESKTOP VIEW (Sleek rows with description & navigation chevron) */}
      <div className="hidden lg:flex flex-col gap-3">
        {PRODUCTS_AND_TOOLS.map((item) => {
          const Icon = item.icon;
          const isSoon = item.isComingSoon;

          return (
            <div
              key={item.id}
              onClick={() => handleItemClick(item)}
              className={`p-3.5 rounded-lg border transition-all flex items-center justify-between gap-3 ${
                isSoon
                  ? 'bg-[#FAFAF8] border-[#E5E5E5] opacity-80 cursor-not-allowed'
                  : 'bg-white border-[#E5E5E5] hover:border-[#0A1D37] hover:shadow-xs cursor-pointer group'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-10 h-10 rounded-lg border flex items-center justify-center shrink-0 ${item.bgColor}`}
                >
                  <Icon className={`w-5 h-5 ${item.color}`} />
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-[#111111] group-hover:text-[#0A1D37] transition-colors truncate">
                      {item.name}
                    </span>
                    {isSoon && (
                      <span className="inline-flex items-center gap-1 text-[9px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 font-mono shrink-0">
                        <Clock className="w-2.5 h-2.5" />
                        <span>Coming Soon</span>
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#5F6368] truncate mt-0.5">
                    {item.description}
                  </p>
                </div>
              </div>

              {!isSoon && (
                <div className="flex items-center text-[#888888] group-hover:text-[#0A1D37] transition-colors shrink-0">
                  <ChevronRight className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProductsAndToolsCard;
