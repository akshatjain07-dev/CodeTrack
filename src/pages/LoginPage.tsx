import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, NavLink } from 'react-router-dom';
import { ArrowRight, ShieldCheck, AlertCircle, Info, Lock, ArrowLeft } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export const LoginPage: React.FC = () => {
  const { user, isConfigured, signInWithGoogle, setDemoMode, error: authContextError, clearError } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Retrieve origin target path if redirected from ProtectedRoute (defaulting to /dashboard)
  const from = (location.state as any)?.from?.pathname || '/dashboard';

  // If already authenticated, redirect immediately
  useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

  const activeError = errorMessage || authContextError;

  const handleGoogleSignIn = async () => {
    setErrorMessage(null);
    clearError();

    if (!isConfigured) {
      setErrorMessage(
        'Supabase authentication is not configured yet. Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file to enable live Google Sign-In.'
      );
      return;
    }

    try {
      setLoading(true);
      const { error } = await signInWithGoogle(from);
      if (error) {
        setErrorMessage(error.message || 'Failed to initialize Google authentication flow.');
        setLoading(false);
      }
      // If successful, browser redirects to Google OAuth
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred during Google sign-in.';
      setErrorMessage(msg);
      setLoading(false);
    }
  };

  const handleBypassToDemo = () => {
    setDemoMode(true);
    navigate(from, { replace: true });
  };

  return (
    <div className="min-h-screen bg-app text-primary flex flex-col justify-center items-center p-4 relative transition-colors duration-200">
      {/* Background Engineering Grid */}
      <div className="absolute inset-0 bg-grid-pattern pointer-events-none opacity-20 dark:opacity-15" />

      {/* Back to Home Link */}
      <div className="w-full max-w-md mb-4 flex items-center justify-between relative z-10">
        <NavLink
          to="/"
          className="inline-flex items-center gap-1.5 text-xs text-secondary hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to CodeTrack Home</span>
        </NavLink>
      </div>

      <div className="w-full max-w-md bg-surface-elevated border border-subtle rounded-xl p-8 card-shadow space-y-6 relative z-10 animate-fade-in-up">
        {/* Official Logo & Branding */}
        <div className="text-center space-y-3">
          <div className="w-14 h-14 rounded-xl p-2 bg-surface border border-subtle card-shadow mx-auto flex items-center justify-center animate-fade-in-scale hover:shadow-md transition-shadow">
            <img
              src="/images/codetrack-icon.png"
              alt="CodeTrack Logo"
              className="w-10 h-10 object-contain rounded-lg hover:scale-105 transition-transform duration-200"
            />
          </div>
          <div className="space-y-1">
            <h1 className="text-xl font-bold text-primary tracking-tight">CodeTrack Authentication</h1>
            <p className="text-xs text-secondary leading-relaxed">
              Sign in with Google to synchronize your DSA progress, personal notes, and spaced repetition schedules across devices.
            </p>
          </div>
        </div>

        {/* Configuration Notice if Supabase is unconfigured */}
        {!isConfigured && (
          <div className="p-3.5 bg-surface border border-subtle rounded-lg text-xs space-y-2">
            <div className="flex items-center gap-2 font-medium text-primary">
              <Info className="w-4 h-4 shrink-0 text-muted" />
              <span>Supabase Setup Required for Live Auth</span>
            </div>
            <p className="text-[11px] leading-relaxed text-secondary">
              To enable real Google Sign-In, configure credentials in your <code className="px-1 py-0.5 rounded bg-surface-subtle text-primary font-mono text-[10px] border border-subtle">.env</code> file and enable Google provider in Supabase.
            </p>
            <div className="text-[11px] text-muted font-mono pt-1 border-t border-subtle">
              You can explore the complete application using Local Demo Mode below.
            </div>
          </div>
        )}

        {/* Error notification */}
        {activeError && (
          <div className="p-3.5 bg-surface border border-default rounded-lg text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-primary" />
            <div className="space-y-1">
              <p className="font-semibold text-primary">Authentication Notice</p>
              <p className="text-[11px] leading-relaxed text-secondary">{activeError}</p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3 pt-1">
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold bg-white text-black hover:bg-zinc-100 border border-zinc-300 dark:border-transparent transition-all duration-150 shadow-xs cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-md active:scale-[0.98]"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{loading ? 'Redirecting to Google...' : 'Continue with Google'}</span>
          </button>

          <button
            onClick={handleBypassToDemo}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-medium text-secondary hover:text-primary bg-surface hover:bg-surface-subtle border border-subtle transition-all duration-150 cursor-pointer active:scale-[0.98]"
          >
            <span>Continue in Local Demo Mode</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>

        {/* Security assurance */}
        <div className="pt-3 border-t border-subtle flex items-center justify-between text-[11px] text-muted">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-secondary" />
            Supabase RLS Protected
          </span>
          <span className="flex items-center gap-1">
            <Lock className="w-3 h-3 text-secondary" />
            OAuth 2.0 PKCE Flow
          </span>
        </div>
      </div>
    </div>
  );
};
