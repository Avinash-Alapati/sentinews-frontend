import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import logoSvg from '@/assets/SentiNews_logo_exact.svg';
import { ArrowRight, Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { authApi } from '@/services/api/auth.api';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading, error, clearError } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Return to intended page if redirected from a protected route, defaulting to /market
  const from = (location.state as any)?.from?.pathname || '/market';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearError();

    if (!email.trim() || !password) {
      setLocalError('Please enter both email and password.');
      return;
    }

    try {
      await login({ email: email.trim(), password });
      navigate(from, { replace: true });
    } catch (err: any) {
      // Error handled by store
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setIsGoogleLoading(true);
      setLocalError(null);
      const redirectUri = window.location.origin + '/auth/google/callback';
      const data = await authApi.getGoogleLoginUrl(redirectUri);
      if (data?.authorization_url) {
        window.location.href = data.authorization_url;
      }
    } catch (err: any) {
      setIsGoogleLoading(false);
      setLocalError(
        err.response?.data?.detail ||
        'Unable to initialize Google Sign In. Please ensure Google OAuth credentials are configured.'
      );
    }
  };

  const displayError = localError || error;

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex flex-col justify-between py-12 px-4 sm:px-6">
      <div className="max-w-md w-full mx-auto space-y-8">
        <div className="text-center space-y-3">
          <h1 className="text-2xl sm:text-[26px] font-semibold text-[#111111] tracking-tight flex items-center justify-center gap-2.5 flex-wrap">
            <span>Sign in to</span>
            <Link to="/" className="inline-flex items-center group">
              <img
                src={logoSvg}
                alt="SentiNews"
                className="h-8 sm:h-9 w-auto object-contain transition-transform group-hover:scale-[0.98]"
              />
            </Link>
          </h1>
          <p className="text-sm text-[#666666]">
            Access Indian market intelligence and portfolio insights
          </p>
        </div>

        <div className="bg-[#FFFFFF] border border-[#E5E5E5] p-8 rounded-sm shadow-xs space-y-5">
          {displayError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-sm flex items-start gap-2.5 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
              <span>{displayError}</span>
            </div>
          )}

          {/* Google Sign In Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isGoogleLoading || isLoading}
            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-white border border-[#E5E5E5] hover:bg-[#F9F9F8] text-[#111111] text-sm font-medium rounded-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isGoogleLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-[#666666]" />
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
            )}
            <span>Continue with Google</span>
          </button>

          <div className="relative flex items-center justify-center my-3">
            <div className="border-t border-[#E5E5E5] w-full" />
            <span className="bg-[#FFFFFF] px-3 text-xs text-[#888888] uppercase tracking-wider absolute">
              or
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#111111]">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-3.5 py-2.5 bg-[#FAFAF8] border border-[#E5E5E5] rounded-sm text-sm focus:outline-none focus:border-[#111111] transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#111111]">
                  Password
                </label>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 bg-[#FAFAF8] border border-[#E5E5E5] rounded-sm text-sm focus:outline-none focus:border-[#111111] transition-colors pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#888888] hover:text-[#111111] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 text-sm font-semibold text-[#FAFAF8] bg-[#111111] hover:bg-black rounded-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-[#E5E5E5] text-center text-xs text-[#666666]">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-[#111111] hover:underline">
              Get Started
            </Link>
          </div>
        </div>
      </div>

      <div className="text-center text-xs text-[#888888] pt-8">
        <Link to="/" className="hover:text-[#111111] transition-colors">
          ← Back to Sentinews Home
        </Link>
      </div>
    </div>
  );
};

export default LoginPage;
