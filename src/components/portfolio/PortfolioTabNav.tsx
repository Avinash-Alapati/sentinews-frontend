import React from 'react';
import {
  LayoutDashboard,
  PieChart,
  Briefcase,
  TrendingUp,
  ShieldAlert,
  History,
} from 'lucide-react';

export type PortfolioTab =
  | 'OVERVIEW'
  | 'ALLOCATION'
  | 'HOLDINGS'
  | 'PERFORMANCE'
  | 'RISK'
  | 'TRANSACTIONS';

interface PortfolioTabNavProps {
  activeTab: PortfolioTab;
  onTabChange: (tab: PortfolioTab) => void;
  holdingsCount: number;
  transactionsCount: number;
}

export const PortfolioTabNav: React.FC<PortfolioTabNavProps> = ({
  activeTab,
  onTabChange,
  holdingsCount,
  transactionsCount,
}) => {
  const tabs: { id: PortfolioTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    {
      id: 'OVERVIEW',
      label: 'Overview',
      icon: <LayoutDashboard className="w-4 h-4 stroke-[2]" />,
    },
    {
      id: 'HOLDINGS',
      label: 'Holdings',
      icon: <Briefcase className="w-4 h-4 stroke-[2]" />,
      badge: holdingsCount,
    },
    {
      id: 'ALLOCATION',
      label: 'Allocation',
      icon: <PieChart className="w-4 h-4 stroke-[2]" />,
    },
    {
      id: 'PERFORMANCE',
      label: 'Performance',
      icon: <TrendingUp className="w-4 h-4 stroke-[2]" />,
    },
    {
      id: 'RISK',
      label: 'Risk & Health',
      icon: <ShieldAlert className="w-4 h-4 stroke-[2]" />,
    },
    {
      id: 'TRANSACTIONS',
      label: 'Transactions',
      icon: <History className="w-4 h-4 stroke-[2]" />,
      badge: transactionsCount,
    },
  ];

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-b border-[#E5E5E5]">
      {tabs.map((tab) => {
        const isSelected = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={`px-4 py-3 text-xs font-bold transition-all cursor-pointer border-b-2 flex items-center gap-2 whitespace-nowrap ${
              isSelected
                ? 'border-[#0A1D37] text-[#0A1D37] bg-white'
                : 'border-transparent text-[#5F6368] hover:text-[#111111] hover:border-[#E5E5E5]'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span
                className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded-full ${
                  isSelected
                    ? 'bg-[#0A1D37] text-white'
                    : 'bg-[#F5F5F3] text-[#5F6368] border border-[#E5E5E5]'
                }`}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
