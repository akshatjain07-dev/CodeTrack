import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Database,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { Logo } from '../components/Logo';
import { useAuth } from '../context/AuthContext';

export const Login: React.FC = () => {
  const { signInWithGoogle, setDemoMode, isConfigured, error } = useAuth();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const res = await signInWithGoogle('/');
      if (res.error) {
        setDemoMode(true);
        navigate('/');
      }
    } catch {
      setDemoMode(true);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoAccess = () => {
    setDemoMode(true);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#09090B] text-[#FAFAFA] flex flex-col justify-between p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-[#6366F1]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[350px] h-[350px] bg-[#10B981]/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Top Navbar */}
      <header className="relative z-10 flex items-center justify-between max-w-5xl mx-auto w-full">
        <Logo variant="horizontal" size="md" showProBadge={true} />

        <button
          onClick={handleDemoAccess}
          className="text-xs font-semibold text-[#A1A1AA] hover:text-[#FAFAFA] px-3 py-1.5 rounded-lg border border-[#27272A] hover:bg-[#18181B] transition-colors cursor-pointer"
        >
          Quick Demo Preview &rarr;
        </button>
      </header>

      {/* Centered Login Card */}
      <main className="relative z-10 my-auto flex flex-col items-center justify-center max-w-md mx-auto w-full">
        <div className="w-full p-8 rounded-2xl bg-[#18181B] border border-[#27272A] shadow-2xl shadow-black/80 space-y-6">
          {/* Card Header with Centered Vertical Logo */}
          <div className="text-center space-y-3 flex flex-col items-center">
            <Logo variant="vertical" size="lg" />
            <p className="text-xs text-[#A1A1AA] max-w-xs mx-auto leading-relaxed pt-1">
              Supercharge your DSA preparation with algorithmic spaced repetition and synchronized roadmap tracking.
            </p>
          </div>

          {/* Error Notice */}
          {error && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
              {error}
            </div>
          )}

          {/* Supabase Status Banner */}
          {!isConfigured && (
            <div className="p-3 rounded-lg bg-[#09090B] border border-[#27272A] text-[11px] text-[#A1A1AA] flex items-start gap-2">
              <Database className="w-4 h-4 text-[#6366F1] flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-[#FAFAFA] font-semibold">Demo Sandbox Active: </span>
                Clicking "Sign in with Google" or "Explore as Guest" will instantly load mock data with full persistence.
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            {/* Primary Google Sign In Button */}
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-white hover:bg-zinc-100 text-zinc-900 font-semibold text-sm flex items-center justify-center gap-3 shadow-lg shadow-white/5 transition-all duration-150 group cursor-pointer"
            >
              {/* Google G SVG */}
              <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
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
              <span>{loading ? 'Connecting...' : 'Sign in with Google'}</span>
            </button>

            {/* Guest / Demo Access Button */}
            <button
              onClick={handleDemoAccess}
              className="w-full py-2.5 px-4 rounded-xl bg-[#27272A] hover:bg-[#3F3F46] text-[#FAFAFA] font-semibold text-xs flex items-center justify-center gap-2 border border-[#3F3F46] transition-colors cursor-pointer"
            >
              <span>Explore as Guest Developer</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#A1A1AA]" />
            </button>
          </div>

          {/* Feature Highlights */}
          <div className="pt-4 border-t border-[#27272A] space-y-2">
            <div className="flex items-center gap-2 text-xs text-[#A1A1AA]">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981] flex-shrink-0" />
              <span>Striver A2Z, NeetCode 150 & Blind 75 bundled</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#A1A1AA]">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981] flex-shrink-0" />
              <span>Anki-style confidence intervals & revision deck</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#A1A1AA]">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981] flex-shrink-0" />
              <span>Automatic cloud backup with Supabase PostgreSQL</span>
            </div>
          </div>
        </div>

        <p className="text-[11px] text-[#71717A] text-center mt-6">
          By signing in, you agree to CodeTrack's Developer Terms & Privacy Policy.
        </p>
      </main>

      {/* Page Footer */}
      <footer className="relative z-10 max-w-5xl mx-auto w-full text-center text-xs text-[#71717A] py-2">
        CodeTrack &bull; Built with React, Tailwind CSS, and Supabase
      </footer>
    </div>
  );
};
