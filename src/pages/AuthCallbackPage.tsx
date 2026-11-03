import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ShieldCheck, AlertCircle, RefreshCw, ArrowLeft } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../services/supabase';

export const AuthCallbackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [statusMessage, setStatusMessage] = useState('Verifying Google credentials...');
  const [errorMessage, setErrorMessage] = useState<string | null>(() => {
    const errorParam = searchParams.get('error') || searchParams.get('error_code');
    const errorDescription = searchParams.get('error_description');
    if (errorParam || errorDescription) {
      return errorDescription || errorParam || 'Authentication request was denied or cancelled by Google.';
    }
    if (!isSupabaseConfigured || !supabase) {
      return 'Supabase client is not configured. Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in .env';
    }
    return null;
  });

  useEffect(() => {
    if (errorMessage || !supabase) return;
    const client = supabase;


    let isMounted = true;
    let timeoutId: number;

    const completeAuth = async () => {
      try {
        setStatusMessage('Exchanging OAuth authorization code for session...');

        // In PKCE flow, supabase automatically parses the code in URL
        const { data: { session }, error: sessionError } = await client.auth.getSession();

        if (sessionError) {
          throw sessionError;
        }

        if (session) {
          if (!isMounted) return;
          setStatusMessage('Session established! Redirecting to CodeTrack...');
          const redirectPath = sessionStorage.getItem('codetrack_auth_redirect') || '/';
          sessionStorage.removeItem('codetrack_auth_redirect');
          
          // Slight delay for smooth visual transition
          setTimeout(() => {
            navigate(redirectPath, { replace: true });
          }, 600);
          return;
        }

        // If session not immediately available, listen for SIGNED_IN event
        const { data: { subscription } } = client.auth.onAuthStateChange((event, newSession) => {
          if (!isMounted) return;
          if (event === 'SIGNED_IN' && newSession) {
            subscription.unsubscribe();
            setStatusMessage('Welcome! Loading your workspace...');
            const redirectPath = sessionStorage.getItem('codetrack_auth_redirect') || '/';

            sessionStorage.removeItem('codetrack_auth_redirect');
            setTimeout(() => {
              navigate(redirectPath, { replace: true });
            }, 500);
          }
        });

        // Set safety timeout in case the code is stale or invalid
        timeoutId = window.setTimeout(() => {
          if (isMounted) {
            subscription.unsubscribe();
            setErrorMessage(
              'Authentication timed out or the authorization code expired. Please return to login and try again.'
            );
          }
        }, 12000);

      } catch (err) {
        if (!isMounted) return;
        const msg = err instanceof Error ? err.message : 'An unexpected error occurred during Google authentication.';
        setErrorMessage(msg);
      }
    };

    completeAuth();

    return () => {
      isMounted = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [navigate, searchParams, errorMessage]);


  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-lg p-8 shadow-2xl space-y-6 text-center">
        {/* Branding */}
        <div className="w-12 h-12 rounded-lg bg-sky-500 mx-auto flex items-center justify-center font-mono font-bold text-slate-950 text-lg shadow-sm">
          CT
        </div>

        <h1 className="text-xl font-semibold text-white tracking-tight">
          {errorMessage ? 'Authentication Failed' : 'Completing Sign-In'}
        </h1>

        {errorMessage ? (
          <div className="space-y-4">
            <div className="p-4 bg-rose-950/40 border border-rose-800/60 rounded-md text-xs text-rose-300 text-left flex items-start gap-3">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <div>
                <p className="font-semibold text-rose-200">Unable to complete Google sign-in</p>
                <p className="mt-1 text-rose-300/90">{errorMessage}</p>
              </div>
            </div>

            <button
              onClick={() => navigate('/login', { replace: true })}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Return to Login
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-3 py-4">
              <RefreshCw className="w-6 h-6 text-sky-400 animate-spin" />
              <span className="text-sm font-medium text-zinc-300">{statusMessage}</span>
            </div>

            <p className="text-xs text-zinc-500">
              Please wait while we establish your secure encrypted session with Supabase and Google OAuth.
            </p>
          </div>
        )}

        <div className="pt-3 border-t border-zinc-800 text-center">
          <span className="text-[11px] text-zinc-500 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Row Level Security Protected
          </span>
        </div>
      </div>
    </div>
  );
};
