# SentiNews Frontend

SentiNews is a financial news, market intelligence, and portfolio tracking platform built with React, TypeScript, Vite, Tailwind CSS, and Zustand.

## Project Structure Architecture

```
frontend/
│
├── public/
│
├── src/
│   │
│   ├── assets/
│   │
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Dialog.tsx
│   │   │   └── Badge.tsx
│   │   │
│   │   ├── layout/
│   │   │   ├── Navbar.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── MarketTickerTape.tsx
│   │   │   └── SEBIDisclaimerBanner.tsx
│   │   │
│   │   ├── market/
│   │   │   ├── MarketStatusBadge.tsx
│   │   │   ├── MarketIndexCard.tsx
│   │   │   ├── MarketIndicesGrid.tsx
│   │   │   ├── StockSearchModal.tsx
│   │   │   ├── StockCandleChart.tsx
│   │   │   ├── MoversTable.tsx
│   │   │   └── QuoteStatsGrid.tsx
│   │   │
│   │   ├── reports/
│   │   │   ├── MarketReportHeader.tsx
│   │   │   ├── ReportTypeToggle.tsx
│   │   │   ├── IndexSnapshot.tsx
│   │   │   ├── PreviousSessionRecap.tsx
│   │   │   ├── MarketBreadth.tsx
│   │   │   ├── SectorPerformance.tsx
│   │   │   ├── StocksInFocus.tsx
│   │   │   ├── FiiDiiActivity.tsx
│   │   │   ├── MarketDrivers.tsx
│   │   │   ├── MarketEvents.tsx
│   │   │   ├── CorporateActions.tsx
│   │   │   ├── IPOWatch.tsx
│   │   │   └── DailyMarketSummary.tsx
│   │   │
│   │   ├── news/
│   │   │   ├── NewsCard.tsx
│   │   │   ├── FullCoverageModal.tsx
│   │   │   └── NewsFilterBar.tsx
│   │   │
│   │   └── portfolio/
│   │       ├── PortfolioSummaryCards.tsx
│   │       ├── HoldingsTable.tsx
│   │       ├── AddHoldingDialog.tsx
│   │       └── AllocationDonutChart.tsx
│   │
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── LoginPage.tsx
│   │   │   ├── RegisterPage.tsx
│   │   │   └── GoogleCallbackPage.tsx
│   │   │
│   │   ├── dashboard/
│   │   │   └── DashboardPage.tsx
│   │   │
│   │   ├── market/
│   │   │   └── StockDetailPage.tsx
│   │   │
│   │   ├── reports/
│   │   │   └── MarketReportsPage.tsx
│   │   │
│   │   ├── news/
│   │   │   └── NewsPage.tsx
│   │   │
│   │   └── portfolio/
│   │       ├── PortfolioPage.tsx
│   │       └── PortfolioNewsPage.tsx
│   │
│   ├── layouts/
│   │   ├── AuthLayout.tsx
│   │   └── DashboardLayout.tsx
│   │
│   ├── routes/
│   │   ├── AppRouter.tsx
│   │   ├── ProtectedRoute.tsx
│   │   └── PublicRoute.tsx
│   │
│   ├── hooks/
│   │   ├── auth/
│   │   │   └── useAuth.ts
│   │   ├── market/
│   │   │   ├── useMarketOverview.ts
│   │   │   ├── useMarketQuote.ts
│   │   │   ├── useMarketHistory.ts
│   │   │   └── useMarketMovers.ts
│   │   ├── reports/
│   │   │   ├── usePreMarketReport.ts
│   │   │   └── usePostMarketReport.ts
│   │   ├── news/
│   │   │   ├── useLatestNews.ts
│   │   │   └── useTrendingNews.ts
│   │   └── portfolio/
│   │       ├── usePortfolio.ts
│   │       ├── useHoldings.ts
│   │       └── usePortfolioNews.ts
│   │
│   ├── services/
│   │   ├── api/
│   │   │   ├── client.ts
│   │   │   ├── auth.api.ts
│   │   │   ├── market.api.ts
│   │   │   ├── reports.api.ts
│   │   │   ├── news.api.ts
│   │   │   └── portfolio.api.ts
│   │   │
│   │   └── websocket/
│   │       ├── marketSocket.ts
│   │       └── WebSocketProvider.tsx
│   │
│   ├── store/
│   │   ├── useAuthStore.ts
│   │   └── usePortfolioStore.ts
│   │
│   ├── types/
│   │   ├── auth.types.ts
│   │   ├── market.types.ts
│   │   ├── reports.types.ts
│   │   ├── news.types.ts
│   │   ├── portfolio.types.ts
│   │   └── common.types.ts
│   │
│   ├── config/
│   │   ├── env.ts
│   │   └── market.config.ts
│   │
│   ├── utils/
│   │   ├── formatCurrency.ts
│   │   ├── formatPercentage.ts
│   │   ├── formatDate.ts
│   │   └── marketHelpers.ts
│   │
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
│
├── .env
├── .env.example
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## Setup & Running

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```