import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  Flame,
  ArrowRight,
  Star,
  Layers,
  BarChart3,
  RotateCcw,
  ChevronDown,
  ShieldCheck,
  Terminal,
} from 'lucide-react';
import { Logo } from '../components/Logo';
import { InteractiveDsaBackground } from '../components/InteractiveDsaBackground';
import { MOCK_SHEETS } from '../data/mockData';

export const Landing: React.FC = () => {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (idx: number) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  const avatars = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces&auto=format',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces&auto=format',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces&auto=format',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=faces&auto=format',
    'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100&h=100&fit=crop&crop=faces&auto=format',
  ];

  const faqs = [
    {
      q: 'Can I track both Striver A2Z and Love Babbar 450 sheets together?',
      a: 'Yes! CodeTrack automatically maps canonical questions across Striver A2Z, Love Babbar 450, NeetCode 150/250, and Apna College. Solving a problem in one sheet marks it solved across all overlapping collections.',
    },
    {
      q: 'How does the Revision Deck determine which problems need review?',
      a: 'The revision engine monitors confidence levels (Low, Medium, High), bookmark flags, and days elapsed since your last attempt. Problems rated Low or due for review automatically surface in your revision queue.',
    },
    {
      q: 'Does CodeTrack support offline and local progress?',
      a: 'Absolutely. CodeTrack saves your progress instantly to your browser storage and will synchronize automatically whenever Supabase or cloud credentials are connected.',
    },
    {
      q: 'Can I filter questions by difficulty, topic, or platform?',
      a: 'Yes, the Problem Library provides multi-dimensional filtering by topic (Arrays, DP, Trees, Strings, Graphs, etc.), difficulty (Easy, Medium, Hard), status, and platform links directly to LeetCode and GeeksforGeeks.',
    },
  ];

  return (
    <div className="relative min-h-screen bg-[#09090B] text-[#FAFAFA] flex flex-col font-sans selection:bg-[#6366F1] selection:text-white overflow-hidden">
      {/* ================= ATMOSPHERIC AMBIENT GLOWS & BACKGROUND LAYERS ================= */}
      {/* 1. Atmospheric Ambient Glows (Blur Blobs) */}
      <div className="absolute top-[30%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-indigo-500/10 blur-[150px] rounded-full pointer-events-none z-0" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none z-0" />
      <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-violet-600/5 blur-[120px] rounded-full pointer-events-none z-0" />

      {/* 2. Dot-Matrix Grid with Edge Radial Fade */}
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.015)_0%,transparent_80%)] bg-[size:24px_24px] pointer-events-none z-0"
        style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)' }}
      />

      {/* 3. Ghostly DSA Binary Tree Overlay (Left) */}
      <div className="absolute top-[25%] left-[-4%] md:left-[2%] w-[200px] md:w-[280px] opacity-10 select-none pointer-events-none z-0">
        <svg viewBox="0 0 280 250" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
          {/* Level 0 to Level 1 */}
          <line x1="140" y1="25" x2="70" y2="80" stroke="#FAFAFA" strokeWidth="1.2" strokeDasharray="3 3" />
          <line x1="140" y1="25" x2="210" y2="80" stroke="#FAFAFA" strokeWidth="1.2" strokeDasharray="3 3" />
          {/* Level 1 to Level 2 */}
          <line x1="70" y1="80" x2="35" y2="150" stroke="#FAFAFA" strokeWidth="1.2" />
          <line x1="70" y1="80" x2="105" y2="150" stroke="#FAFAFA" strokeWidth="1.2" />
          <line x1="210" y1="80" x2="175" y2="150" stroke="#FAFAFA" strokeWidth="1.2" />
          <line x1="210" y1="80" x2="245" y2="150" stroke="#FAFAFA" strokeWidth="1.2" />
          {/* Level 2 to Leaves */}
          <line x1="35" y1="150" x2="18" y2="220" stroke="#FAFAFA" strokeWidth="1" strokeDasharray="2 2" />
          <line x1="35" y1="150" x2="52" y2="220" stroke="#FAFAFA" strokeWidth="1" strokeDasharray="2 2" />
          <line x1="105" y1="150" x2="88" y2="220" stroke="#FAFAFA" strokeWidth="1" strokeDasharray="2 2" />
          <line x1="105" y1="150" x2="122" y2="220" stroke="#FAFAFA" strokeWidth="1" strokeDasharray="2 2" />
          <line x1="175" y1="150" x2="158" y2="220" stroke="#FAFAFA" strokeWidth="1" strokeDasharray="2 2" />
          <line x1="175" y1="150" x2="192" y2="220" stroke="#FAFAFA" strokeWidth="1" strokeDasharray="2 2" />
          <line x1="245" y1="150" x2="228" y2="220" stroke="#FAFAFA" strokeWidth="1" strokeDasharray="2 2" />
          <line x1="245" y1="150" x2="262" y2="220" stroke="#FAFAFA" strokeWidth="1" strokeDasharray="2 2" />
          {/* Vertices */}
          <circle cx="140" cy="25" r="7" fill="#18181B" stroke="#6366F1" strokeWidth="1.5" />
          <circle cx="70" cy="80" r="6" fill="#18181B" stroke="#FAFAFA" strokeWidth="1.2" />
          <circle cx="210" cy="80" r="6" fill="#18181B" stroke="#FAFAFA" strokeWidth="1.2" />
          <circle cx="35" cy="150" r="5" fill="#18181B" stroke="#FAFAFA" strokeWidth="1.2" />
          <circle cx="105" cy="150" r="5" fill="#18181B" stroke="#10B981" strokeWidth="1.2" />
          <circle cx="175" cy="150" r="5" fill="#18181B" stroke="#FAFAFA" strokeWidth="1.2" />
          <circle cx="245" cy="150" r="5" fill="#18181B" stroke="#6366F1" strokeWidth="1.2" />
          {[18, 52, 88, 122, 158, 192, 228, 262].map((x, idx) => (
            <circle key={idx} cx={x} cy="220" r="3.5" fill="#18181B" stroke="#FAFAFA" strokeWidth="1" />
          ))}
        </svg>
      </div>

      {/* 4. Ghostly DSA Directed Network Graph Overlay (Right) */}
      <div className="absolute top-[15%] right-[-4%] md:right-[2%] w-[200px] md:w-[280px] opacity-10 select-none pointer-events-none z-0">
        <svg viewBox="0 0 280 250" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
          <path d="M 40 50 L 120 20 L 200 60 L 250 130 L 170 140 L 90 110 Z" stroke="#FAFAFA" strokeWidth="1.2" />
          <path d="M 120 20 L 170 140 L 140 220 L 50 190 L 90 110" stroke="#FAFAFA" strokeWidth="1.2" strokeDasharray="4 3" />
          <path d="M 170 140 L 220 210 L 140 220" stroke="#FAFAFA" strokeWidth="1.2" />
          <path d="M 200 60 L 170 140" stroke="#10B981" strokeWidth="1.2" />
          <path d="M 40 50 L 50 190" stroke="#6366F1" strokeWidth="1.2" strokeDasharray="3 3" />
          <circle cx="40" cy="50" r="6" fill="#18181B" stroke="#FAFAFA" strokeWidth="1.2" />
          <circle cx="120" cy="20" r="7" fill="#18181B" stroke="#6366F1" strokeWidth="1.5" />
          <circle cx="200" cy="60" r="6" fill="#18181B" stroke="#FAFAFA" strokeWidth="1.2" />
          <circle cx="250" cy="130" r="5" fill="#18181B" stroke="#10B981" strokeWidth="1.2" />
          <circle cx="170" cy="140" r="8" fill="#18181B" stroke="#6366F1" strokeWidth="1.5" />
          <circle cx="90" cy="110" r="6" fill="#18181B" stroke="#FAFAFA" strokeWidth="1.2" />
          <circle cx="50" cy="190" r="6" fill="#18181B" stroke="#FAFAFA" strokeWidth="1.2" />
          <circle cx="140" cy="220" r="7" fill="#18181B" stroke="#10B981" strokeWidth="1.2" />
          <circle cx="220" cy="210" r="5" fill="#18181B" stroke="#FAFAFA" strokeWidth="1.2" />
        </svg>
      </div>

      {/* 5. Interactive Mouse-Tracking Background (Spotlight & Canvas Nodes) */}
      <InteractiveDsaBackground />

      {/* ================= NAVBAR (z-40) ================= */}
      <header className="sticky top-0 z-40 w-full border-b border-[#27272A] bg-[#09090B]/85 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo on the left */}
          <Link to="/" className="group flex items-center">
            <Logo variant="horizontal" />
          </Link>

          {/* Navigation links in center */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#A1A1AA]">
            <a href="#features" className="hover:text-[#FAFAFA] transition-colors">
              Features
            </a>
            <a href="#supported-sheets" className="hover:text-[#FAFAFA] transition-colors">
              Supported Sheets
            </a>
            <a href="#faq" className="hover:text-[#FAFAFA] transition-colors">
              FAQ
            </a>
          </nav>

          {/* Actions on the right */}
          <div className="flex items-center gap-3 sm:gap-4">
            <NavLink
              to="/login"
              className="text-sm font-medium text-[#A1A1AA] hover:text-[#FAFAFA] transition-colors px-3 py-1.5"
            >
              Sign In
            </NavLink>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-5 py-2 rounded-full bg-[#6366F1] hover:bg-[#4F46E5] text-white text-sm font-semibold shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-1.5"
            >
              <span>Start Tracking</span>
              <span className="text-xs">↗</span>
            </button>
          </div>
        </div>
      </header>

      {/* ================= HERO SECTION ================= */}
      <section className="relative z-10 pt-16 pb-20 sm:pt-24 sm:pb-32 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center flex flex-col items-center">
        {/* Release / Status Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#18181B] border border-[#27272A] text-xs font-semibold text-[#A1A1AA] mb-8 hover:border-[#6366F1]/50 transition-colors shadow-sm">
          <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
          <span className="text-[#FAFAFA]">v2.5 Live</span>
          <span className="text-[#27272A]">|</span>
          <span className="text-[#6366F1]">Striver A2Z & Love Babbar 450 Integrated</span>
        </div>

        {/* Hero Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-[#FAFAFA] leading-[1.1] max-w-4xl">
          Track Your Progress.{' '}
          <span className="bg-gradient-to-r from-[#6366F1] via-[#818CF8] to-[#10B981] bg-clip-text text-transparent">
            Master DSA.
          </span>
        </h1>

        {/* Subtext */}
        <p className="mt-6 text-base sm:text-lg lg:text-xl text-[#A1A1AA] max-w-2xl leading-relaxed">
          The ultimate workspace to organize your DSA sheets, maintain daily consistency, and crack
          your technical interviews.
        </p>

        {/* CTA Area */}
        <div className="mt-10 flex flex-col sm:flex-row items-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#6366F1] hover:bg-[#4F46E5] text-white text-base font-bold shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-[1.03] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group cursor-pointer"
          >
            <span>Start Tracking</span>
            <span className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
              ↗
            </span>
          </button>

          <NavLink
            to="/library"
            className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-[#18181B] hover:bg-[#27272A] text-[#FAFAFA] text-base font-semibold border border-[#27272A] hover:border-[#3F3F46] transition-all flex items-center justify-center gap-2"
          >
            <Terminal className="w-4 h-4 text-[#A1A1AA]" />
            <span>Explore Problem Library</span>
          </NavLink>
        </div>

        {/* Social Proof: Avatar Group + Gold Stars + Text */}
        <div className="mt-12 flex flex-col sm:flex-row items-center gap-4 pt-6 border-t border-[#27272A]/50">
          <div className="flex -space-x-2.5 overflow-hidden">
            {avatars.map((url, i) => (
              <img
                key={i}
                src={url}
                alt="CS Student"
                className="inline-block h-9 w-9 rounded-full ring-2 ring-[#09090B] object-cover"
              />
            ))}
          </div>

          <div className="flex flex-col items-center sm:items-start text-xs">
            <div className="flex items-center gap-1 text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <span className="font-semibold text-[#FAFAFA] mt-0.5">
              Trusted by 1000+ CS students
            </span>
          </div>
        </div>

        {/* Interactive Workspace Mockup Preview */}
        <div className="mt-16 w-full max-w-5xl rounded-2xl bg-[#18181B] border border-[#27272A] p-2 sm:p-4 shadow-2xl shadow-indigo-500/10 text-left overflow-hidden">
          <div className="flex items-center justify-between pb-3 px-3 border-b border-[#27272A]">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500/80" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
              <span className="ml-3 text-xs font-mono text-[#71717A]">codetrack-terminal ~ dashboard</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-[#A1A1AA]">
              <span className="flex items-center gap-1 text-[#10B981]">
                <CheckCircle2 className="w-3.5 h-3.5" /> 142 Solved
              </span>
              <span className="flex items-center gap-1 text-amber-400">
                <Flame className="w-3.5 h-3.5 fill-amber-400" /> 18d Streak
              </span>
            </div>
          </div>

          <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-[#09090B] border border-[#27272A] space-y-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#A1A1AA]">
                Current Active Roadmap
              </span>
              <div className="flex items-center justify-between">
                <h4 className="text-base font-bold text-[#FAFAFA]">Striver A2Z Sheet</h4>
                <span className="text-xs font-bold text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded border border-[#10B981]/20">
                  42% Done
                </span>
              </div>
              <div className="w-full h-1.5 bg-[#27272A] rounded-full overflow-hidden mt-3">
                <div className="w-[42%] h-full bg-gradient-to-r from-[#6366F1] to-[#10B981] rounded-full" />
              </div>
              <p className="text-[11px] text-[#71717A] pt-1">192 of 455 questions solved</p>
            </div>

            <div className="p-4 rounded-xl bg-[#09090B] border border-[#27272A] space-y-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#A1A1AA]">
                Spaced Revision Queue
              </span>
              <div className="flex items-center justify-between">
                <h4 className="text-base font-bold text-[#FAFAFA]">4 Problems Due Today</h4>
                <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  Due Now
                </span>
              </div>
              <p className="text-xs text-[#A1A1AA]">
                LRU Cache, Edit Distance, Next Permutation, Dijkstra
              </p>
              <p className="text-[11px] text-[#71717A] pt-1">Based on confidence scoring</p>
            </div>

            <div className="p-4 rounded-xl bg-[#09090B] border border-[#27272A] space-y-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#A1A1AA]">
                52-Week Consistency
              </span>
              <div className="flex items-center justify-between">
                <h4 className="text-base font-bold text-[#FAFAFA]">18-Day Active Streak</h4>
                <span className="text-xs font-bold text-[#6366F1] bg-[#6366F1]/10 px-2 py-0.5 rounded border border-[#6366F1]/20">
                  Top 5%
                </span>
              </div>
              <div className="flex items-center gap-1 pt-2">
                {[...Array(16)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-3 h-3 rounded-xs ${
                      i > 11 ? 'bg-[#10B981]' : i > 5 ? 'bg-[#10B981]/60' : 'bg-[#10B981]/30'
                    }`}
                  />
                ))}
              </div>
              <p className="text-[11px] text-[#71717A] pt-1">GitHub-style heat map tracker</p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FEATURES SECTION ================= */}
      <section id="features" className="relative z-10 py-20 bg-[#09090B] border-t border-[#27272A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-semibold text-[#6366F1] uppercase tracking-widest px-3 py-1 rounded-full bg-[#6366F1]/10 border border-[#6366F1]/20">
              Purpose-Built For Developers
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-[#FAFAFA] tracking-tight mt-4">
              Everything you need to conquer DSA.
            </h2>
            <p className="text-[#A1A1AA] text-sm sm:text-base mt-3">
              No bloated spreadsheets. No forgotten problems. An engineered dashboard designed for
              continuous progress and retention.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-[#18181B] border border-[#27272A] hover:border-[#6366F1]/50 transition-all duration-200 group">
              <div className="w-10 h-10 rounded-xl bg-[#6366F1]/10 border border-[#6366F1]/20 flex items-center justify-center text-[#6366F1] mb-5 group-hover:scale-110 transition-transform">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-[#FAFAFA]">Consistency Heatmap</h3>
              <p className="text-xs text-[#A1A1AA] mt-2 leading-relaxed">
                Full 52-week contribution grid tracking your daily solves with streak records and
                momentum indicators.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#18181B] border border-[#27272A] hover:border-[#10B981]/50 transition-all duration-200 group">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-[#10B981] mb-5 group-hover:scale-110 transition-transform">
                <RotateCcw className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-[#FAFAFA]">Spaced Repetition</h3>
              <p className="text-xs text-[#A1A1AA] mt-2 leading-relaxed">
                Automated Revision Deck sorts bookmarked problems and low-confidence solutions so you
                never blank out in live interviews.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#18181B] border border-[#27272A] hover:border-amber-500/50 transition-all duration-200 group">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-5 group-hover:scale-110 transition-transform">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-[#FAFAFA]">Multi-Sheet Unified Sync</h3>
              <p className="text-xs text-[#A1A1AA] mt-2 leading-relaxed">
                Track Striver A2Z, Love Babbar 450, NeetCode 150/250, and Apna College without double
                logging identical questions.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#18181B] border border-[#27272A] hover:border-sky-500/50 transition-all duration-200 group">
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 mb-5 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-[#FAFAFA]">Topic Mastery Metrics</h3>
              <p className="text-xs text-[#A1A1AA] mt-2 leading-relaxed">
                Instant analytics for Arrays, DP, Trees, Strings, and Graphs with completion rings
                and difficulty distributions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= SUPPORTED SHEETS SECTION ================= */}
      <section id="supported-sheets" className="relative z-10 py-20 bg-[#18181B]/40 border-t border-[#27272A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <span className="text-xs font-semibold text-[#10B981] uppercase tracking-widest px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                Industry Curated
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-[#FAFAFA] tracking-tight mt-3">
                Supported DSA Sheets
              </h2>
              <p className="text-[#A1A1AA] text-sm mt-1">
                Pre-configured roadmaps covering foundational patterns to tier-1 company cracker sets.
              </p>
            </div>

            <button
              onClick={() => navigate('/collections')}
              className="mt-4 md:mt-0 text-xs sm:text-sm font-semibold text-[#6366F1] hover:text-[#818CF8] flex items-center gap-1.5 transition-colors"
            >
              <span>Explore all collections</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {MOCK_SHEETS.map((sheet) => (
              <div
                key={sheet.id}
                className="p-6 rounded-2xl bg-[#18181B] border border-[#27272A] hover:border-[#3F3F46] transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#09090B] text-[#A1A1AA] border border-[#27272A]">
                      {sheet.category}
                    </span>
                    <span className="text-xs font-bold text-[#10B981]">{sheet.progress}% Done</span>
                  </div>

                  <h3 className="text-lg font-bold text-[#FAFAFA]">{sheet.title}</h3>
                  <p className="text-xs text-[#A1A1AA] mt-1 font-medium">{sheet.author}</p>
                  <p className="text-xs text-[#71717A] mt-2.5 leading-relaxed">{sheet.tagline}</p>

                  <div className="flex flex-wrap gap-1.5 mt-4">
                    {sheet.popularTopics.map((top, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-medium px-2 py-0.5 rounded bg-[#27272A]/60 text-[#FAFAFA]"
                      >
                        {top}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-[#27272A]/70 flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#A1A1AA]">
                    {sheet.totalQuestions} Questions
                  </span>
                  <button
                    onClick={() => navigate('/collections')}
                    className="text-xs font-bold text-[#6366F1] hover:text-[#818CF8] flex items-center gap-1"
                  >
                    <span>View Sheet</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= FAQ SECTION ================= */}
      <section id="faq" className="relative z-10 py-20 bg-[#09090B] border-t border-[#27272A]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-xs font-semibold text-[#6366F1] uppercase tracking-widest px-3 py-1 rounded-full bg-[#6366F1]/10 border border-[#6366F1]/20">
              Got Questions?
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-[#FAFAFA] tracking-tight mt-3">
              Frequently Asked Questions
            </h2>
            <p className="text-[#A1A1AA] text-sm mt-2">
              Everything you need to know about tracking your DSA roadmap on CodeTrack.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-xl bg-[#18181B] border border-[#27272A] overflow-hidden transition-all duration-200"
                >
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 font-semibold text-sm sm:text-base text-[#FAFAFA] hover:text-[#6366F1] transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-[#A1A1AA] transition-transform duration-200 flex-shrink-0 ${
                        isOpen ? 'rotate-180 text-[#6366F1]' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-[#A1A1AA] leading-relaxed border-t border-[#27272A]/50">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= BOTTOM CTA ================= */}
      <section className="relative z-10 py-20 bg-gradient-to-b from-[#18181B] to-[#09090B] border-t border-[#27272A] text-center px-4">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-3xl sm:text-5xl font-black text-[#FAFAFA] tracking-tight">
            Start Your Interview Prep Journey Now.
          </h2>
          <p className="text-[#A1A1AA] text-sm sm:text-base max-w-xl mx-auto">
            Join computer science students preparing for top product firms. Master DSA patterns with
            focus and precision.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="px-8 py-3.5 rounded-full bg-[#6366F1] hover:bg-[#4F46E5] text-white text-base font-bold shadow-xl shadow-indigo-500/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Start Tracking Free</span>
              <span>↗</span>
            </button>
          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="relative z-10 border-t border-[#27272A] bg-[#09090B] py-10 px-4 sm:px-6 lg:px-8 text-xs text-[#71717A]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#FAFAFA] tracking-tight">
              codetrack<span className="text-[#6366F1]">.</span>
            </span>
            <span>— The developer-first DSA tracker.</span>
          </div>
          <div className="flex items-center gap-6">
            <NavLink to="/dashboard" className="hover:text-[#FAFAFA] transition-colors">
              Dashboard
            </NavLink>
            <NavLink to="/library" className="hover:text-[#FAFAFA] transition-colors">
              Problem Library
            </NavLink>
            <NavLink to="/collections" className="hover:text-[#FAFAFA] transition-colors">
              Collections
            </NavLink>
            <NavLink to="/analytics" className="hover:text-[#FAFAFA] transition-colors">
              Analytics
            </NavLink>
          </div>
          <div>© 2026 CodeTrack. Open source student edition.</div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
