import React, { Suspense, lazy, useEffect } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { PublicRoute } from './PublicRoute';
import { useAuthStore } from '@/store/useAuthStore';

// Lazy-loaded pages for optimal chunking and ultra-fast initial load
const LandingPage = lazy(() => import('@/pages/LandingPage'));
const MarketOverviewPage = lazy(() => import('@/pages/market/MarketOverviewPage'));
const StockViewPage = lazy(() => import('@/pages/market/StockViewPage'));
const AllIndicesPage = lazy(() => import('@/pages/market/AllIndicesPage'));
const GainersLosersPage = lazy(() => import('@/pages/market/GainersLosersPage'));
const AllEtfsPage = lazy(() => import('@/pages/market/AllEtfsPage'));
const AllSectorsPage = lazy(() => import('@/pages/market/AllSectorsPage'));
const SectorViewPage = lazy(() => import('@/pages/market/SectorViewPage'));
const PortfolioPage = lazy(() => import('@/pages/portfolio/PortfolioPage'));
const MarketReportsPage = lazy(() => import('@/pages/reports/MarketReportsPage'));
const NewsPage = lazy(() => import('@/pages/news/NewsPage'));
const NewsDetailPage = lazy(() => import('@/pages/news/NewsDetailPage'));
const AboutPage = lazy(() => import('@/pages/AboutPage'));
const WatchlistPage = lazy(() => import('@/pages/watchlist/WatchlistPage'));
const ProfilePage = lazy(() => import('@/pages/profile/ProfilePage'));
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage'));
const GoogleCallbackPage = lazy(() => import('@/pages/auth/GoogleCallbackPage'));

// Sleek page transition fallback loader
const PageLoader: React.FC = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="w-6 h-6 border-2 border-[#0A1D37] dark:border-white border-t-transparent rounded-full animate-spin" />
  </div>
);

// Scroll to top on route change
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

// Landing Route: Redirects authenticated users away from landing page directly to /market
const LandingRoute: React.FC = () => {
  const { isAuthenticated, isInitialized } = useAuthStore();

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#0A1D37] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/market" replace />;
  }

  return <LandingPage />;
};

export const AppRouter: React.FC = () => {
  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Main Landing Route - Guest only (redirects to /market after login) */}
          <Route path="/" element={<LandingRoute />} />

          {/* Publicly Accessible Market & Info Routes */}
          <Route path="/market" element={<MarketOverviewPage />} />
          <Route path="/stock/:symbol" element={<StockViewPage />} />
          <Route path="/indices" element={<AllIndicesPage />} />
          <Route path="/gainers-losers" element={<GainersLosersPage />} />
          <Route path="/etfs" element={<AllEtfsPage />} />
          <Route path="/sectors" element={<AllSectorsPage />} />
          <Route path="/sector/:sectorId" element={<SectorViewPage />} />
          <Route path="/news" element={<NewsPage />} />
          <Route path="/news/:newsId" element={<NewsDetailPage />} />
          <Route path="/about" element={<AboutPage />} />

          {/* Auth Guest Only Routes */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <RegisterPage />
              </PublicRoute>
            }
          />

          {/* OAuth Callback */}
          <Route path="/auth/google/callback" element={<GoogleCallbackPage />} />

          {/* Protected User Routes (Require Authentication — Locked until sign-in) */}
          <Route
            path="/portfolio"
            element={
              <ProtectedRoute>
                <PortfolioPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/watchlist"
            element={
              <ProtectedRoute>
                <WatchlistPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <MarketReportsPage />
              </ProtectedRoute>
            }
          />
          <Route path="/profile" element={<ProfilePage />} />

          {/* Catch-all fallback */}
          <Route path="*" element={<LandingRoute />} />
        </Routes>
      </Suspense>
    </>
  );
};

export default AppRouter;
