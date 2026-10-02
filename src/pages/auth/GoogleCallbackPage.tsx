import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import { Logo } from '@/components/layout/Logo';
import { AlertCircle, Loader2 } from 'lucide-react';

export const GoogleCallbackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loginWithGoogleCode } = useAuthStore();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    if (error) {
      setErrorMessage(errorDescription || error || 'Google sign in was cancelled or failed.');
      return;
    }

    if (!code) {
      setErrorMessage('No authorization code was received from Google.');
      return;
    }

    const processAuth = async () => {
      try {
        // Exchange code with backend
        const redirectUri = window.location.origin + '/auth/google/callback';
        await loginWithGoogleCode(code, redirectUri);
        navigate('/market', { replace: true });
      } catch (err: any) {
        setErrorMessage(
          err.message || 'Failed to complete Google authentication. Please try again.'
        );
      }
    };

    processAuth();
  }, [searchParams, loginWithGoogleCode, navigate]);

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex flex-col justify-center items-center px-4">
      <div className="max-w-md w-full text-center space-y-6 bg-white p-8 border border-[#E5E5E5] rounded-sm shadow-xs">
        <Logo className="justify-center" />

        {errorMessage ? (
          <div className="space-y-4">
            <div className="w-12 h-12 mx-auto rounded-full bg-red-50 flex items-center justify-center text-red-600">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-[#111111]">Authentication Failed</h2>
              <p className="text-sm text-[#666666]">{errorMessage}</p>
            </div>
            <div className="pt-2">
              <Link
                to="/login"
                className="inline-block px-4 py-2 text-sm font-semibold text-white bg-[#111111] hover:bg-black rounded-sm transition-colors"
              >
                Back to Sign In
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <Loader2 className="w-8 h-8 mx-auto animate-spin text-[#0A1D37]" />
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-[#111111]">
                Authenticating with Google...
              </h2>
              <p className="text-sm text-[#666666]">
                Please wait while we connect your account securely.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GoogleCallbackPage;
