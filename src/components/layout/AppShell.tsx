import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  CheckSquare,
  Bookmark,
  RotateCcw,
  BarChart3,
  Layers,
  Settings,
  Search,
  Flame,
  Target,
  Sun,
  Moon,
  Code2,
  Menu,
  X,
  CloudOff,
  Cloud,
} from 'lucide-react';
import { useCodeTrack } from '../../hooks/useCodeTrack';
import { isSupabaseConfigured } from '../../services/supabase';
import { CommandPalette } from '../ui/CommandPalette';
import { QuestionDrawer } from '../ui/QuestionDrawer';
import type { Question } from '../../types';
import { Kbd } from '../ui/Kbd';

export const AppShell: React.FC = () => {
  const { stats, settings, updateSettings, progress, bookmarks, revisions, updateStatus, toggleBookmark, saveNotes, scheduleRevision } = useCodeTrack();
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDrawerQuestion, setActiveDrawerQuestion] = useState<Question | null>(null);

  const toggleTheme = () => {
    const newTheme = settings.theme === 'dark' ? 'light' : 'dark';
    updateSettings({ theme: newTheme });
    if (newTheme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  };

  const navItems = [
    { label: 'Dashboard', to: '/', icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: 'All Questions', to: '/questions', icon: <CheckSquare className="w-4 h-4" />, badge: stats.totalQuestions },
    { label: 'Bookmarks', to: '/bookmarks', icon: <Bookmark className="w-4 h-4" />, badge: bookmarks.length },
    {
      label: 'Revision Center',
      to: '/revisions',
      icon: <RotateCcw className="w-4 h-4" />,
      alertCount: stats.dueTodayRevisionsCount + stats.overdueRevisionsCount,
    },
    { label: 'Analytics', to: '/analytics', icon: <BarChart3 className="w-4 h-4" /> },
    { label: 'Topics', to: '/topics', icon: <Layers className="w-4 h-4" /> },
    { label: 'Platforms', to: '/platforms', icon: <Code2 className="w-4 h-4" /> },
    { label: 'Settings', to: '/settings', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen flex bg-zinc-950 text-zinc-100 font-sans selection:bg-sky-500/30 selection:text-sky-200">
      {/* ================= DESKTOP SIDEBAR ================= */}
      <aside className="hidden md:flex flex-col w-60 border-r border-zinc-800/80 bg-zinc-900/60 backdrop-blur-md fixed inset-y-0 z-30">
        {/* Brand Header */}
        <div className="h-14 px-5 flex items-center justify-between border-b border-zinc-800/80">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-sky-500 flex items-center justify-center font-mono font-bold text-slate-950 text-sm shadow-xs">
              CT
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-sm tracking-tight text-white flex items-center gap-1.5">
                CodeTrack
                <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-zinc-800 text-zinc-400 border border-zinc-700/50">
                  DSA
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Global Quick Search Button */}
        <div className="p-3">
          <button
            onClick={() => setIsCommandPaletteOpen(true)}
            className="w-full flex items-center justify-between px-3 py-1.5 rounded-md text-xs text-zinc-400 bg-zinc-950/80 hover:bg-zinc-800/80 border border-zinc-800 hover:border-zinc-700 transition-all cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-zinc-500" />
              Quick search...
            </span>
            <div className="flex items-center gap-1">
              <Kbd>Ctrl</Kbd>
              <Kbd>K</Kbd>
            </div>
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto pt-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-zinc-800 text-white font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                }`
              }
            >
              <div className="flex items-center gap-2.5">
                {item.icon}
                <span>{item.label}</span>
              </div>
              {item.alertCount ? (
                <span className="px-1.5 py-0.2 text-[10px] font-mono font-semibold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  {item.alertCount}
                </span>
              ) : item.badge !== undefined ? (
                <span className="text-[11px] font-mono text-zinc-500">{item.badge}</span>
              ) : null}
            </NavLink>
          ))}
        </nav>

        {/* Bottom Status & Settings */}
        <div className="p-3 border-t border-zinc-800/80 bg-zinc-900/40 space-y-2">
          {/* Mode Pill */}
          <div className="flex items-center justify-between px-2.5 py-1.5 rounded-md bg-zinc-950/60 border border-zinc-800 text-[11px]">
            <span className="flex items-center gap-1.5 text-zinc-400">
              {isSupabaseConfigured ? (
                <>
                  <Cloud className="w-3 h-3 text-emerald-400" />
                  Cloud Sync
                </>
              ) : (
                <>
                  <CloudOff className="w-3 h-3 text-zinc-500" />
                  Local Mode
                </>
              )}
            </span>
            <NavLink
              to="/settings"
              className="text-[10px] font-mono text-sky-400 hover:text-sky-300 transition-colors"
            >
              {isSupabaseConfigured ? 'Active' : 'Setup .env'}
            </NavLink>
          </div>

          {/* User profile preview */}
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-6 h-6 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-mono font-medium text-zinc-300">
                {settings.profileName ? settings.profileName[0] : 'S'}
              </div>
              <span className="text-xs text-zinc-300 font-medium truncate">
                {settings.profileName || 'Student'}
              </span>
            </div>
            <button
              onClick={toggleTheme}
              className="p-1.5 text-zinc-400 hover:text-white rounded hover:bg-zinc-800 transition-colors"
              title="Toggle theme"
            >
              {settings.theme === 'dark' ? (
                <Sun className="w-3.5 h-3.5" />
              ) : (
                <Moon className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>
      </aside>

      {/* ================= MOBILE HEADER ================= */}
      <div className="md:hidden fixed top-0 inset-x-0 h-14 bg-zinc-900 border-b border-zinc-800 z-40 px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-1.5 text-zinc-400 hover:text-white"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <span className="font-semibold text-sm text-white flex items-center gap-1.5">
            CodeTrack
            <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-zinc-800 text-zinc-400">
              DSA
            </span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCommandPaletteOpen(true)}
            className="p-1.5 text-zinc-400 hover:text-white"
          >
            <Search className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-xs font-mono">
            <Flame className="w-3 h-3 text-amber-500 fill-amber-500" />
            <span>{stats.currentStreak}d</span>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-30 pt-14 bg-black/80 backdrop-blur-md">
          <nav className="p-4 space-y-1 bg-zinc-900 border-b border-zinc-800">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2.5 rounded-md text-sm font-medium ${
                    isActive ? 'bg-zinc-800 text-white font-semibold' : 'text-zinc-400'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  {item.icon}
                  <span>{item.label}</span>
                </div>
                {item.alertCount ? (
                  <span className="px-1.5 py-0.5 text-xs font-mono font-semibold rounded-full bg-amber-500/20 text-amber-300">
                    {item.alertCount}
                  </span>
                ) : null}
              </NavLink>
            ))}
          </nav>
        </div>
      )}

      {/* ================= MAIN CONTENT WRAPPER ================= */}
      <div className="flex-1 md:pl-60 flex flex-col min-h-screen">
        {/* Top Metric Bar */}
        <header className="hidden md:flex h-14 border-b border-zinc-800/80 px-8 items-center justify-between bg-zinc-950/80 sticky top-0 z-20 backdrop-blur-sm">
          <div className="flex items-center gap-6">
            {/* Daily Goal Gauge */}
            <div className="flex items-center gap-2 text-xs">
              <Target className="w-3.5 h-3.5 text-sky-400" />
              <span className="text-zinc-400">Today's Goal:</span>
              <span className="font-mono font-medium text-zinc-200">
                {stats.todaySolvedCount} / {stats.dailyGoal} solved
              </span>
              <div className="w-16 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-sky-500 rounded-full transition-all"
                  style={{
                    width: `${Math.min(100, (stats.todaySolvedCount / stats.dailyGoal) * 100)}%`,
                  }}
                />
              </div>
            </div>

            {/* Streak Counter */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 text-xs font-mono">
              <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span className="text-zinc-200 font-medium">{stats.currentStreak} Day Streak</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-zinc-400 font-mono">
              {stats.solvedCount} / {stats.totalQuestions} ({stats.completionPercentage}%)
            </span>
            <NavLink
              to="/questions"
              className="px-2.5 py-1 rounded text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700/60 transition-colors"
            >
              Solve Problem
            </NavLink>
          </div>
        </header>

        {/* Dynamic Route Content */}
        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto pt-16 md:pt-8">
          <Outlet context={{ openDrawer: setActiveDrawerQuestion }} />
        </main>
      </div>

      {/* Global Command Palette */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onSelectQuestion={(q) => setActiveDrawerQuestion(q)}
      />

      {/* Global Question Drawer */}
      <QuestionDrawer
        question={activeDrawerQuestion}
        isOpen={Boolean(activeDrawerQuestion)}
        onClose={() => setActiveDrawerQuestion(null)}
        status={activeDrawerQuestion ? progress[activeDrawerQuestion.id]?.status || 'Not Started' : 'Not Started'}
        isBookmarked={activeDrawerQuestion ? bookmarks.includes(activeDrawerQuestion.id) : false}
        notes={activeDrawerQuestion ? progress[activeDrawerQuestion.id]?.notes || '' : ''}
        revision={activeDrawerQuestion ? revisions[activeDrawerQuestion.id] : undefined}
        onStatusChange={(newStatus) => {
          if (activeDrawerQuestion) {
            updateStatus(activeDrawerQuestion.id, newStatus);
          }
        }}
        onToggleBookmark={() => {
          if (activeDrawerQuestion) {
            toggleBookmark(activeDrawerQuestion.id);
          }
        }}
        onSaveNotes={(newNotes) => {
          if (activeDrawerQuestion) {
            saveNotes(activeDrawerQuestion.id, newNotes);
          }
        }}
        onScheduleRevision={() => {
          if (activeDrawerQuestion) {
            scheduleRevision(activeDrawerQuestion.id);
          }
        }}
      />
    </div>
  );
};
