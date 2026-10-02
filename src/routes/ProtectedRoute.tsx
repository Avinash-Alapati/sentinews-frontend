import React from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Lock, ArrowRight, ShieldAlert } from 'lucide-react';

interface ProtectedRouteProps {
  children?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isInitialized } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#0A1D37] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    // Determine friendly page title based on current pathname
    const pageName = location.pathname.includes('portfolio')
      ? 'Portfolio'
      : location.pathname.includes('watchlist')
      ? 'Watchlist'
      : location.pathname.includes('reports')
      ? 'Market Reports'
      : 'Protected Feature';

    return (
      <div className="min-h-screen bg-[#FAFAF8] text-[#111111] flex flex-col font-sans">
        <Navbar />

        <main className="flex-1 flex items-center justify-center py-16 px-4 sm:px-6">
          <div className="max-w-md w-full bg-white border border-[#E5E5E5] rounded-sm p-8 shadow-xs text-center space-y-6">
            <div className="w-14 h-14 mx-auto rounded-full bg-[#0A1D37]/5 border border-[#0A1D37]/10 flex items-center justify-center text-[#0A1D37]">
              <Lock className="w-7 h-7 stroke-[1.8]" />
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-[11px] font-semibold text-amber-800 uppercase tracking-wider">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                <span>Authentication Required</span>
              </div>
              <h2 className="text-2xl font-semibold text-[#111111] tracking-tight">
                {pageName} is Locked
              </h2>
              <p className="text-sm text-[#5F6368] leading-relaxed">
                Access to {pageName.toLowerCase()} is reserved for signed-in users. Please sign in or create an account to unlock.
              </p>
            </div>

            <div className="pt-2 space-y-3">
              <button
                type="button"
                onClick={() => navigate('/login', { state: { from: location } })}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 text-sm font-semibold text-white bg-[#0A1D37] hover:bg-[#071426] rounded-sm transition-all duration-150 shadow-xs cursor-pointer active:scale-[0.98]"
              >
                <span>Sign In / Register to Unlock</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <Link
                to="/market"
                className="block text-xs font-medium text-[#5F6368] hover:text-[#0A1D37] transition-colors"
              >
                Go to Public Market Page
              </Link>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
