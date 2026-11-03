import React, { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  Flame,
  Target,
  Sun,
  Moon,
  Search,
  Menu,
  LogOut,
  LogIn,
  Bell,
  ChevronRight,
} from 'lucide-react';
import { useCodeTrack } from '../../hooks/useCodeTrack';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { Sidebar } from './Sidebar';
import { CommandPalette } from '../ui/CommandPalette';
import { QuestionDrawer } from '../ui/QuestionDrawer';
import type { Question } from '../../types';

const STORAGE_KEY_SIDEBAR_COLLAPSED = 'codetrack_sidebar_collapsed';

export const AppShell: React.FC = () => {
  const location = useLocation();
  const { user, profile, signOut } = useAuth();
  const {
    stats,
    progress,
    bookmarks,
    revisions,
    updateStatus,
    toggleBookmark,
    saveNotes,
    scheduleRevision,
  } = useCodeTrack();
  const { resolvedTheme, toggleTheme } = useTheme();

  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDrawerQuestion, setActiveDrawerQuestion] = useState<Question | null>(null);

  // Desktop sidebar collapse state persisted to localStorage
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEY_SIDEBAR_COLLAPSED) === 'true';
  });

  const toggleCollapsed = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY_SIDEBAR_COLLAPSED, String(next));
      return next;
    });
  };

  // Dynamic Breadcrumb resolver based on route & query parameters
  const getBreadcrumbs = () => {
    const params = new URLSearchParams(location.search);
    const topicParam = params.get('topic');
    const sheetParam = params.get('sheet');

    if (location.pathname === '/dashboard') {
      return { section: 'Dashboard', sub: null };
    }
    if (location.pathname === '/questions') {
      if (topicParam) return { section: 'Questions', sub: topicParam };
      if (sheetParam) return { section: 'Questions', sub: sheetParam };
      return { section: 'All Questions', sub: null };
    }
    if (location.pathname === '/bookmarks') {
      return { section: 'Bookmarks', sub: null };
    }
    if (location.pathname === '/revisions') {
      return { section: 'Revision Center', sub: null };
    }
    if (location.pathname === '/analytics') {
      return { section: 'Analytics', sub: null };
    }
    if (location.pathname === '/topics') {
      return { section: 'DSA Topics', sub: null };
    }
    if (location.pathname === '/platforms') {
      return { section: 'Platforms', sub: null };
    }
    if (location.pathname === '/architecture') {
      return { section: 'System Architecture', sub: null };
    }
    if (location.pathname === '/settings') {
      return { section: 'Settings', sub: null };
    }
    return { section: 'Workspace', sub: null };
  };

  const breadcrumbs = getBreadcrumbs();

  // Spaced repetition due questions count
  const todayIso = new Date().toISOString().split('T')[0];
  const dueRevisionsCount = Object.values(revisions).filter(
    (r) => r.nextReviewDate && r.nextReviewDate.slice(0, 10) <= todayIso
  ).length;

  return (
    <div className="min-h-screen flex bg-app text-primary font-sans transition-colors duration-250">
      {/* ================= MODERN UPGRADED SIDEBAR ================= */}
      <Sidebar
        isCollapsed={isCollapsed}
        onToggleCollapse={toggleCollapsed}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
      />

      {/* ================= MOBILE HEADER ================= */}
      <div className="md:hidden fixed top-0 inset-x-0 h-14 bg-surface border-b border-subtle z-40 px-4 flex items-center justify-between transition-colors duration-250">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-1.5 text-secondary hover:text-primary transition-transform duration-150 active:scale-95 cursor-pointer"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <NavLink to="/dashboard" className="flex items-center gap-2">
            <img src="/images/codetrack-icon.png" alt="CodeTrack" className="w-6 h-6 rounded" />
            <span className="font-semibold text-sm text-primary flex items-center gap-1.5">
              CodeTrack
              <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-surface-subtle text-secondary border border-subtle">
                DSA
              </span>
            </span>
          </NavLink>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-1.5 text-secondary hover:text-primary rounded transition-all duration-200 active:scale-90 cursor-pointer"
            title="Toggle Theme"
          >
            {resolvedTheme === 'dark' ? (
              <Sun className="w-4 h-4 text-accent-yellow transition-transform hover:rotate-45" />
            ) : (
              <Moon className="w-4 h-4 text-primary transition-transform hover:-rotate-12" />
            )}
          </button>
          <button
            onClick={() => setIsCommandPaletteOpen(true)}
            className="p-1.5 text-secondary hover:text-primary transition-transform active:scale-95 cursor-pointer"
            aria-label="Quick Search"
          >
            <Search className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-surface-subtle border border-subtle text-xs font-mono">
            <Flame className="w-3 h-3 text-accent-yellow" />
            <span>{stats.currentStreak}d</span>
          </div>
        </div>
      </div>

      {/* ================= MAIN CONTENT WRAPPER ================= */}
      <div
        className={`flex-1 flex flex-col min-h-screen transition-[padding] duration-300 ease-in-out ${
          isCollapsed ? 'md:pl-16' : 'md:pl-72'
        }`}
      >
        {/* Top Navigation Bar on Desktop */}
        <header className="hidden md:flex h-15 border-b border-subtle px-8 items-center justify-between bg-surface/90 sticky top-0 z-20 backdrop-blur-md transition-colors duration-250">
          {/* Left: Dynamic Breadcrumb */}
          <div className="flex items-center gap-2 text-sm">
            <NavLink
              to="/dashboard"
              className="text-secondary hover:text-primary font-medium transition-colors"
            >
              CodeTrack
            </NavLink>
            <ChevronRight className="w-3.5 h-3.5 text-muted" />
            <span className="font-semibold text-primary">
              {breadcrumbs.section}
            </span>
            {breadcrumbs.sub && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-muted" />
                <span className="text-accent-yellow font-medium max-w-[200px] truncate">
                  {breadcrumbs.sub}
                </span>
              </>
            )}
          </div>

          {/* Right: Search, Goal gauge, Notifications, Theme toggle, Account */}
          <div className="flex items-center gap-3">
            {/* Quick Search Button */}
            <button
              onClick={() => setIsCommandPaletteOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-subtle hover:bg-surface border border-subtle hover:border-default text-xs text-secondary hover:text-primary transition-all duration-150 cursor-pointer shadow-xs group"
              aria-label="Search questions"
            >
              <Search className="w-3.5 h-3.5 text-muted group-hover:text-primary transition-colors" />
              <span className="hidden sm:inline">Search questions...</span>
              <kbd className="hidden sm:inline ml-1.5 px-1.5 py-0.5 rounded text-[10px] font-mono bg-surface border border-subtle text-muted">
                Ctrl K
              </kbd>
            </button>

            {/* Daily Goal Gauge */}
            <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-surface-subtle border border-subtle text-xs">
              <Target className="w-3.5 h-3.5 text-accent-yellow" />
              <span className="text-secondary text-[11px] font-medium">Daily Goal:</span>
              <span className="font-mono font-semibold text-primary text-[11px]">
                {stats.todaySolvedCount}/{stats.dailyGoal}
              </span>
              <div className="w-12 h-1.5 bg-surface rounded-full overflow-hidden border border-subtle">
                <div
                  className="h-full bg-accent-yellow rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, (stats.todaySolvedCount / Math.max(1, stats.dailyGoal)) * 100)}%`,
                  }}
                />
              </div>
            </div>

            {/* Streak Counter */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-subtle border border-subtle text-xs font-mono transition-transform hover:scale-102">
              <Flame className="w-3.5 h-3.5 text-accent-yellow" />
              <span className="text-primary font-medium">{stats.currentStreak}d Streak</span>
            </div>

            {/* Revision Due Notification Bell (Real system data) */}
            <NavLink
              to="/revisions"
              className="relative p-2 rounded-lg text-secondary hover:text-primary hover:bg-surface-subtle transition-colors cursor-pointer"
              title={
                dueRevisionsCount > 0
                  ? `${dueRevisionsCount} question${dueRevisionsCount === 1 ? '' : 's'} due for spaced revision`
                  : 'Revision Center — All caught up'
              }
              aria-label="Revision reminders"
            >
              <Bell className="w-4 h-4" />
              {dueRevisionsCount > 0 && (
                <span className="absolute top-1 right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-accent-pink text-[10px] font-bold text-white leading-none shadow-xs">
                  {dueRevisionsCount}
                </span>
              )}
            </NavLink>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 text-secondary hover:text-primary hover:bg-surface-subtle rounded-lg transition-all duration-150 cursor-pointer"
              title={resolvedTheme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle theme"
            >
              {resolvedTheme === 'dark' ? (
                <Sun className="w-4 h-4 text-accent-yellow transition-transform hover:rotate-45" />
              ) : (
                <Moon className="w-4 h-4 text-primary transition-transform hover:-rotate-12" />
              )}
            </button>

            {/* User Profile / Account Menu */}
            {user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-subtle">
                <NavLink
                  to="/settings"
                  className="flex items-center gap-2 p-1 rounded-lg hover:bg-surface-subtle transition-colors group"
                  title="Account Settings"
                >
                  {profile?.avatarUrl ? (
                    <img
                      src={profile.avatarUrl}
                      alt={profile.displayName}
                      className="w-7 h-7 rounded-full object-cover border border-subtle group-hover:border-default"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-surface-subtle text-accent-yellow border border-subtle font-bold font-mono text-xs flex items-center justify-center group-hover:border-default">
                      {profile?.displayName?.[0] || 'U'}
                    </div>
                  )}
                  <div className="hidden xl:flex flex-col text-left">
                    <span className="text-xs font-semibold text-primary max-w-[110px] truncate leading-tight">
                      {profile?.displayName || 'User'}
                    </span>
                    <span className="text-[10px] text-muted truncate leading-tight">
                      {user.email}
                    </span>
                  </div>
                </NavLink>

                <button
                  onClick={() => signOut()}
                  className="p-1.5 text-secondary hover:text-primary hover:bg-surface-subtle rounded-lg transition-all duration-150 cursor-pointer active:scale-95"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <NavLink
                to="/login"
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-accent-pink hover:bg-pink-hover text-white transition-all duration-150 flex items-center gap-1.5 shadow-xs active:scale-[0.98]"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </NavLink>
            )}
          </div>
        </header>

        {/* Dynamic Route Content */}
        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto pt-16 md:pt-8">
          <div key={location.pathname} className="animate-page-enter">
            <Outlet context={{ openDrawer: setActiveDrawerQuestion }} />
          </div>
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
