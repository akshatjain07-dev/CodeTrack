import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../services/supabase';

export const LoginPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleGoogleSignIn = async () => {
    if (!isSupabaseConfigured || !supabase) {
      setErrorMsg(
        'Supabase credentials are not configured in your .env file yet. Please provide VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
      );
      return;
    }

    try {
      setLoading(true);
      setErrorMsg(null);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to initialize Google Sign-In.');
    } finally {
      setLoading(false);
    }
  };

  const handleBypassToDemo = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-lg p-8 shadow-2xl space-y-6">
        {/* Branding */}
        <div className="text-center space-y-2">
          <div className="w-10 h-10 rounded-md bg-sky-500 mx-auto flex items-center justify-center font-mono font-bold text-slate-950 text-base shadow-sm">
            CT
          </div>
          <h1 className="text-xl font-semibold text-white tracking-tight">CodeTrack Authentication</h1>
          <p className="text-xs text-zinc-400">
            Sign in with Google to synchronize your DSA progress, personal notes, and spaced repetition schedules across devices.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-950/40 border border-rose-800/50 rounded-md text-xs text-rose-300 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-md text-sm font-medium bg-white text-zinc-900 hover:bg-zinc-100 transition-colors shadow-sm cursor-pointer disabled:opacity-50"
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
            <span>{loading ? 'Connecting to Google...' : 'Continue with Google'}</span>
          </button>

          <button
            onClick={handleBypassToDemo}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-xs font-medium text-zinc-300 hover:text-white bg-zinc-800/80 hover:bg-zinc-800 border border-zinc-700/60 transition-colors cursor-pointer"
          >
            <span>Continue in Local Demo Mode</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Security assurance */}
        <div className="pt-2 border-t border-zinc-800 text-center">
          <span className="text-[11px] text-zinc-500 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" />
            Supabase PostgreSQL with Row Level Security
          </span>
        </div>
      </div>
    </div>
  );
};
