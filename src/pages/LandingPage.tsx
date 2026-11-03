import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Sun,
  Moon,
  Laptop,
  CheckCircle2,
  Flame,
  Bookmark,
  BarChart3,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';

export const LandingPage: React.FC = () => {
  const { user, demoMode, setDemoMode } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  const isAuthenticated = Boolean(user || demoMode);

  const handleStartTracking = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/login', { state: { from: { pathname: '/dashboard' } } });
    }
  };

  const handleExploreDemo = () => {
    setDemoMode(true);
    navigate('/dashboard');
  };

  const scrollToFeatures = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const elem = document.getElementById('features');
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-app text-primary flex flex-col relative transition-colors duration-250">
      {/* Background Engineering Grid */}
      <div className="absolute inset-0 bg-grid-pattern pointer-events-none opacity-20 dark:opacity-15" />

      {/* ================= HEADER ================= */}
      <header className="relative z-20 w-full border-b border-subtle bg-app/90 backdrop-blur-md sticky top-0 transition-colors duration-250">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo & Brand Wordmark */}
          <NavLink to="/" className="flex items-center gap-2.5 group">
            <img
              src="/images/codetrack-icon.png"
              alt="CodeTrack Logo"
              className="w-7 h-7 rounded-md object-contain transition-transform duration-200 group-hover:scale-105"
            />
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-sm tracking-tight text-primary transition-colors">
                CodeTrack
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface-subtle text-secondary border border-subtle transition-colors">
                DSA
              </span>
            </div>
          </NavLink>

          {/* Center / Right Nav Items */}
          <div className="flex items-center gap-4 sm:gap-6">
            <a
              href="#features"
              onClick={scrollToFeatures}
              className="text-xs sm:text-sm font-medium text-secondary hover:text-primary transition-colors duration-150 cursor-pointer"
            >
              Features
            </a>

            {/* Accessible Theme Selector with smooth transitions */}
            <div className="flex items-center p-0.5 rounded-md bg-surface border border-subtle transition-colors duration-200">
              <button
                onClick={() => setTheme('light')}
                className={`p-1.5 rounded transition-all duration-200 cursor-pointer ${
                  theme === 'light'
                    ? 'bg-surface-subtle text-primary font-semibold shadow-xs scale-105'
                    : 'text-muted hover:text-primary hover:scale-105'
                }`}
                title="Light Theme"
                aria-label="Light Theme"
              >
                <Sun className="w-3.5 h-3.5 transition-transform duration-200" />
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`p-1.5 rounded transition-all duration-200 cursor-pointer ${
                  theme === 'dark'
                    ? 'bg-surface-subtle text-primary font-semibold shadow-xs scale-105'
                    : 'text-muted hover:text-primary hover:scale-105'
                }`}
                title="Dark Theme"
                aria-label="Dark Theme"
              >
                <Moon className="w-3.5 h-3.5 transition-transform duration-200" />
              </button>
              <button
                onClick={() => setTheme('system')}
                className={`p-1.5 rounded transition-all duration-200 cursor-pointer ${
                  theme === 'system'
                    ? 'bg-surface-subtle text-primary font-semibold shadow-xs scale-105'
                    : 'text-muted hover:text-primary hover:scale-105'
                }`}
                title="System OS Theme"
                aria-label="System Theme"
              >
                <Laptop className="w-3.5 h-3.5 transition-transform duration-200" />
              </button>
            </div>

            {/* Auth Navigation */}
            {isAuthenticated ? (
              <NavLink
                to="/dashboard"
                className="px-3.5 py-1.5 rounded-md text-xs sm:text-sm font-medium bg-black text-white dark:bg-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-all duration-150 shadow-xs hover:shadow-sm active:scale-[0.98] flex items-center gap-1.5"
              >
                <span>Open Workspace</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
              </NavLink>
            ) : (
              <NavLink
                to="/login"
                className="px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium text-secondary hover:text-primary transition-colors duration-150"
              >
                Sign In
              </NavLink>
            )}
          </div>
        </div>
      </header>

      {/* ================= HERO SECTION (Staggered Animation Sequence) ================= */}
      <main className="relative z-10 flex-1 flex flex-col justify-center items-center px-4 sm:px-6 pt-16 pb-20 text-center max-w-4xl mx-auto">
        {/* Original CodeTrack Emblem with Subtle Entrance & Glow */}
        <div className="mb-6 relative inline-flex items-center justify-center animate-fade-in-scale">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl p-2 bg-surface-elevated border border-subtle card-shadow flex items-center justify-center transition-all duration-300 hover:scale-[1.04] animate-logo-glow cursor-pointer group">
            <img
              src="/images/codetrack-icon.png"
              alt="CodeTrack Logo"
              className="w-16 h-16 sm:w-20 sm:h-20 object-contain rounded-xl transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        </div>

        {/* Minimal Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface border border-subtle text-xs font-mono text-secondary mb-6 animate-fade-in-up delay-75 fill-mode-backwards">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          <span>Curated Striver's SDE Sheet & TakeUForward Roadmap</span>
        </div>

        {/* Strong Centered Tagline with Smooth Upward Fade */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-primary leading-[1.12] mb-5 animate-fade-in-up delay-150 fill-mode-backwards">
          Track Your Progress. Master DSA.
        </h1>

        {/* Short Description with Slight Delay */}
        <p className="text-sm sm:text-base lg:text-lg text-secondary max-w-2xl leading-relaxed mb-8 animate-fade-in-up delay-250 fill-mode-backwards">
          A focused workspace to solve problems, build consistency, and track your DSA journey.
        </p>

        {/* Action Buttons with Entrance & Hover Effects */}
        <div className="flex flex-col sm:flex-row items-center gap-3.5 mb-6 w-full sm:w-auto animate-fade-in-up delay-350 fill-mode-backwards">
          <button
            onClick={handleStartTracking}
            className="w-full sm:w-auto px-6 py-2.5 rounded-md text-sm font-semibold bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 transition-all duration-200 shadow-xs hover:shadow-md hover:scale-[1.01] active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer group"
          >
            <span>Start Tracking</span>
            <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
          </button>

          <a
            href="#features"
            onClick={scrollToFeatures}
            className="w-full sm:w-auto px-5 py-2.5 rounded-md text-sm font-medium text-secondary hover:text-primary bg-surface hover:bg-surface-subtle border border-subtle hover:border-default transition-all duration-200 hover:scale-[1.01] active:scale-[0.98] flex items-center justify-center cursor-pointer shadow-xs"
          >
            Explore Features
          </a>
        </div>

        {/* Option to explore without signing in */}
        {!isAuthenticated && (
          <div className="pt-2 animate-fade-in-up delay-400 fill-mode-backwards">
            <button
              onClick={handleExploreDemo}
              className="text-xs text-secondary hover:text-primary underline underline-offset-4 font-mono transition-colors duration-150 cursor-pointer hover:opacity-90"
            >
              Explore workspace in demo mode without signing in →
            </button>
          </div>
        )}
      </main>

      {/* ================= MINIMAL FEATURE OVERVIEW ================= */}
      <section id="features" className="relative z-10 w-full py-16 px-4 sm:px-6 bg-surface border-t border-subtle transition-colors duration-250">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-mono uppercase tracking-wider text-muted font-medium block mb-1">
              Engineered for Coding Interview Prep
            </span>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-primary">
              Minimal, distraction-free tools built for daily execution.
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Feature 1 */}
            <div className="p-5 rounded-lg bg-surface-elevated border border-subtle card-shadow flex flex-col justify-between hover:border-default transition-all duration-250 hover:-translate-y-0.5 group">
              <div>
                <div className="w-8 h-8 rounded-md bg-surface-subtle border border-subtle text-primary flex items-center justify-center mb-3 transition-transform duration-200 group-hover:scale-105">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-mono uppercase tracking-wider font-semibold text-primary mb-1.5">
                  DSA Problem Tracking
                </h3>
                <p className="text-xs text-secondary leading-relaxed">
                  Curated TakeUForward problem taxonomy across LeetCode, GFG, and CodingNinjas with verified links.
                </p>
              </div>
              <div className="pt-3 mt-3 border-t border-subtle text-[11px] font-mono text-muted">
                229 curated problems
              </div>
            </div>

            {/* Feature 2 */}
            <div className="p-5 rounded-lg bg-surface-elevated border border-subtle card-shadow flex flex-col justify-between hover:border-default transition-all duration-250 hover:-translate-y-0.5 group">
              <div>
                <div className="w-8 h-8 rounded-md bg-surface-subtle border border-subtle text-primary flex items-center justify-center mb-3 transition-transform duration-200 group-hover:scale-105">
                  <Flame className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-mono uppercase tracking-wider font-semibold text-primary mb-1.5">
                  Daily Goals & Streaks
                </h3>
                <p className="text-xs text-secondary leading-relaxed">
                  Set daily solve quotas, maintain activity streaks, and review 12-week consistency heatmaps.
                </p>
              </div>
              <div className="pt-3 mt-3 border-t border-subtle text-[11px] font-mono text-muted">
                Habit-forming discipline
              </div>
            </div>

            {/* Feature 3 */}
            <div className="p-5 rounded-lg bg-surface-elevated border border-subtle card-shadow flex flex-col justify-between hover:border-default transition-all duration-250 hover:-translate-y-0.5 group">
              <div>
                <div className="w-8 h-8 rounded-md bg-surface-subtle border border-subtle text-primary flex items-center justify-center mb-3 transition-transform duration-200 group-hover:scale-105">
                  <Bookmark className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-mono uppercase tracking-wider font-semibold text-primary mb-1.5">
                  Bookmarks & Revision
                </h3>
                <p className="text-xs text-secondary leading-relaxed">
                  SM-2 spaced repetition with stage intervals to review tough questions before you forget them.
                </p>
              </div>
              <div className="pt-3 mt-3 border-t border-subtle text-[11px] font-mono text-muted">
                Long-term interview recall
              </div>
            </div>

            {/* Feature 4 */}
            <div className="p-5 rounded-lg bg-surface-elevated border border-subtle card-shadow flex flex-col justify-between hover:border-default transition-all duration-250 hover:-translate-y-0.5 group">
              <div>
                <div className="w-8 h-8 rounded-md bg-surface-subtle border border-subtle text-primary flex items-center justify-center mb-3 transition-transform duration-200 group-hover:scale-105">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-mono uppercase tracking-wider font-semibold text-primary mb-1.5">
                  Progress Analytics
                </h3>
                <p className="text-xs text-secondary leading-relaxed">
                  Real-time velocity charts, topic coverage percentages, and difficulty breakdowns.
                </p>
              </div>
              <div className="pt-3 mt-3 border-t border-subtle text-[11px] font-mono text-muted">
                Data-driven insights
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="relative z-10 w-full py-8 border-t border-subtle bg-app text-xs text-muted transition-colors duration-250">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src="/images/codetrack-icon.png" alt="CodeTrack" className="w-4 h-4 rounded" />
            <span className="font-semibold text-secondary">CodeTrack</span>
            <span>· Track. Practice. Grow.</span>
          </div>
          <p>© 2026 CodeTrack. A focused workspace for technical interview preparation.</p>
        </div>
      </footer>
    </div>
  );
};
