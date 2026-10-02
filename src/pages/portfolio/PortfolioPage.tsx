import React, { useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { usePortfolio } from '@/hooks/usePortfolio';
import { PortfolioHeader } from '@/components/portfolio/PortfolioHeader';
import { PortfolioTabNav, PortfolioTab } from '@/components/portfolio/PortfolioTabNav';
import { OverviewTab } from '@/components/portfolio/OverviewTab';
import { HoldingsTab } from '@/components/portfolio/HoldingsTab';
import { AllocationTab } from '@/components/portfolio/AllocationTab';
import { PerformanceTab } from '@/components/portfolio/PerformanceTab';
import { RiskTab } from '@/components/portfolio/RiskTab';
import { TransactionsTab } from '@/components/portfolio/TransactionsTab';
import { AddTransactionModal } from '@/components/portfolio/AddTransactionModal';
import { Loader2, AlertCircle } from 'lucide-react';

export const PortfolioPage: React.FC = () => {
  const {
    portfolio,
    overview,
    holdings,
    transactions,
    allocation,
    performance,
    newsFeed,
    isLoading,
    isRefreshing,
    error,
    refreshPortfolio,
    recordTransaction,
  } = usePortfolio();

  // Active section tab
  const [activeTab, setActiveTab] = useState<PortfolioTab>('OVERVIEW');

  // Transaction modal state
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#111111] flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-[1140px] mx-auto px-4 sm:px-6 py-8 w-full space-y-6">
        {/* Error Alert Banner */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center justify-between text-xs text-red-700 shadow-2xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              type="button"
              onClick={() => refreshPortfolio()}
              className="font-bold underline hover:text-red-900 cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading Skeleton */}
        {isLoading && !portfolio ? (
          <div className="space-y-6 animate-pulse">
            <div className="bg-white border border-[#E5E5E5] rounded-2xl p-6 h-48" />
            <div className="bg-white border border-[#E5E5E5] rounded-2xl p-6 h-96" />
          </div>
        ) : (
          <>
            {/* Header: Portfolio Name + 4 KPI Cards + Add Action */}
            <PortfolioHeader
              portfolioName={portfolio?.name}
              overview={overview}
              isRefreshing={isRefreshing}
              onRefresh={refreshPortfolio}
              onAddTransaction={() => setShowModal(true)}
            />

            {/* Navigation Tabs (Overview, Holdings, Allocation, Performance, Risk, Transactions) */}
            <PortfolioTabNav
              activeTab={activeTab}
              onTabChange={setActiveTab}
              holdingsCount={holdings.length}
              transactionsCount={transactions.length}
            />

            {/* Active Tab View */}
            {activeTab === 'OVERVIEW' && (
              <OverviewTab
                overview={overview}
                holdings={holdings}
                allocation={allocation}
                performance={performance}
                newsFeed={newsFeed}
                onAddTransaction={() => setShowModal(true)}
                onNavigateTab={(tab) => setActiveTab(tab)}
              />
            )}

            {activeTab === 'HOLDINGS' && (
              <HoldingsTab
                holdings={holdings}
                onAddTransaction={() => setShowModal(true)}
              />
            )}

            {activeTab === 'ALLOCATION' && (
              <AllocationTab
                allocation={allocation}
                holdings={holdings}
                totalValue={overview?.current_value ?? 0}
              />
            )}

            {activeTab === 'PERFORMANCE' && (
              <PerformanceTab
                performance={performance}
                overview={overview}
                holdings={holdings}
              />
            )}

            {activeTab === 'RISK' && (
              <RiskTab
                holdings={holdings}
                allocation={allocation}
                totalValue={overview?.current_value ?? 0}
              />
            )}

            {activeTab === 'TRANSACTIONS' && (
              <TransactionsTab
                transactions={transactions}
                onAddTransaction={() => setShowModal(true)}
              />
            )}
          </>
        )}
      </main>

      {/* Record Transaction Modal */}
      <AddTransactionModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={recordTransaction}
      />

      <Footer />
    </div>
  );
};

export default PortfolioPage;
