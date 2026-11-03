import React, { useState, useEffect, useMemo } from 'react';
import { NavLink, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import {
  LayoutDashboard,
  CheckSquare,
  Bookmark,
  RotateCcw,
  BarChart3,
  Layers,
  Settings,
  Search,
  Sun,
  Moon,
  LogOut,
  User,
  ChevronDown,
  PanelLeftClose,
  PanelLeftOpen,
  X,
  GraduationCap,
  ListOrdered,
  Code2,
  Terminal,
  Sparkles,
  FileSpreadsheet,
} from 'lucide-react';
import { useCodeTrack } from '../../hooks/useCodeTrack';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { TOPICS } from '../../data/questionsData';
import { type QuestionSheet } from '../../data/sheetsData';
import { Kbd } from '../ui/Kbd';

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  onOpenCommandPalette: () => void;
}

const STORAGE_KEY_TOPICS_OPEN = 'codetrack_sidebar_topics_open';
const STORAGE_KEY_SHEETS_OPEN = 'codetrack_sidebar_sheets_open';

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
  onOpenCommandPalette,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, profile, signOut } = useAuth();
  const { stats, settings, bookmarks, questions, sheetStats } = useCodeTrack();
  const { resolvedTheme, toggleTheme } = useTheme();

  // Collapsible sections state persisted to localStorage
  const [topicsOpen, setTopicsOpen] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_TOPICS_OPEN);
    return saved !== null ? saved === 'true' : true;
  });

  const [sheetsOpen, setSheetsOpen] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_SHEETS_OPEN);
    return saved !== null ? saved === 'true' : true;
  });

  const toggleTopics = () => {
    setTopicsOpen((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY_TOPICS_OPEN, String(next));
      return next;
    });
  };

  const toggleSheets = () => {
    setSheetsOpen((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY_SHEETS_OPEN, String(next));
      return next;
    });
  };

  // Close mobile drawer on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileOpen) {
        onCloseMobile();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileOpen, onCloseMobile]);

  // Compute real question counts per topic from active questions
  const topicCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    questions.forEach((q) => {
      counts[q.topicId] = (counts[q.topicId] || 0) + 1;
    });
    return counts;
  }, [questions]);

  // Primary workspace nav items with 15-16px text & clean icons
  const workspaceItems = [
    {
      label: 'Dashboard',
      to: '/dashboard',
      icon: <LayoutDashboard className="w-[18px] h-[18px] shrink-0" />,
    },
    {
      label: 'All Questions',
      to: '/questions',
      icon: <CheckSquare className="w-[18px] h-[18px] shrink-0" />,
      badge: stats.totalQuestions,
    },
    {
      label: 'Bookmarks',
      to: '/bookmarks',
      icon: <Bookmark className="w-[18px] h-[18px] shrink-0" />,
      badge: bookmarks.length,
    },
    {
      label: 'Revision Center',
      to: '/revisions',
      icon: <RotateCcw className="w-[18px] h-[18px] shrink-0" />,
      alertCount: stats.dueTodayRevisionsCount + stats.overdueRevisionsCount,
    },
    {
      label: 'Analytics',
      to: '/analytics',
      icon: <BarChart3 className="w-[18px] h-[18px] shrink-0" />,
    },
  ];

  const renderSheetIcon = (iconName: QuestionSheet['iconName']) => {
    switch (iconName) {
      case 'GraduationCap':
        return <GraduationCap className="w-4 h-4 shrink-0" />;
      case 'ListOrdered':
        return <ListOrdered className="w-4 h-4 shrink-0" />;
      case 'Code2':
        return <Code2 className="w-4 h-4 shrink-0" />;
      case 'Terminal':
        return <Terminal className="w-4 h-4 shrink-0" />;
      case 'Sparkles':
        return <Sparkles className="w-4 h-4 shrink-0" />;
      default:
        return <FileSpreadsheet className="w-4 h-4 shrink-0" />;
    }
  };

  const currentTopic = location.pathname === '/questions' ? searchParams.get('topic') : null;
  const currentSheet = location.pathname === '/questions' ? searchParams.get('sheet') : null;

  // Render navigation content
  const renderNavContent = (isMobile: boolean = false) => (
    <div className="flex-1 overflow-y-auto px-3.5 py-3 space-y-5 text-[15px] select-none scrollbar-thin">
      {/* Search Bar Quick Action Trigger */}
      <button
        onClick={() => {
          if (isMobile) onCloseMobile();
          onOpenCommandPalette();
        }}
        className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm text-secondary bg-card/60 hover:bg-card border border-border/80 hover:border-accent-yellow/50 transition-all duration-150 cursor-pointer shadow-xs active:scale-[0.99] group"
      >
        <span className="flex items-center gap-2.5">
          <Search className="w-4 h-4 text-muted group-hover:text-accent-yellow transition-colors shrink-0" />
          <span className="truncate">Search questions...</span>
        </span>
        <div className="flex items-center gap-1 shrink-0">
          <Kbd>Ctrl</Kbd>
          <Kbd>K</Kbd>
        </div>
      </button>

      {/* SECTION: WORKSPACE NAVIGATION */}
      <div className="space-y-1.5">
        <div className="px-3 py-1 text-[12px] font-bold uppercase tracking-wider text-secondary/60">
          Workspace
        </div>
        <nav className="space-y-1">
          {workspaceItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => {
                if (isMobile) onCloseMobile();
              }}
              className={({ isActive }) => {
                const isExactActive =
                  item.to === '/questions'
                    ? isActive && !currentTopic && !currentSheet
                    : isActive;

                return `group flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium transition-all duration-150 text-[15px] ${
                  isExactActive
                    ? 'bg-card text-primary font-semibold shadow-sm border-l-4 border-accent-yellow'
                    : 'text-secondary hover:text-primary hover:bg-card/50'
                }`;
              }}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-secondary group-hover:text-primary transition-colors">
                  {item.icon}
                </span>
                <span className="truncate">{item.label}</span>
              </div>
              {item.alertCount ? (
                <span className="px-2 py-0.5 text-xs font-mono font-bold rounded-full bg-accent-pink/20 text-accent-pink border border-accent-pink/30 shrink-0">
                  {item.alertCount}
                </span>
              ) : item.badge !== undefined ? (
                <span className="px-2 py-0.5 text-xs font-mono font-semibold rounded-md bg-card/60 text-secondary border border-border/50 shrink-0">
                  {item.badge}
                </span>
              ) : null}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* SECTION: DSA TOPICS (Collapsible) */}
      <div className="space-y-1.5 border-t border-border/60 pt-4">
        <button
          onClick={toggleTopics}
          className="w-full flex items-center justify-between px-3 py-1.5 text-[12px] font-bold uppercase tracking-wider text-secondary/60 hover:text-primary transition-colors cursor-pointer group"
          aria-expanded={topicsOpen}
        >
          <span className="flex items-center gap-2">
            <Layers className="w-3.5 h-3.5 text-secondary group-hover:text-accent-yellow transition-colors" />
            <span>DSA Topics</span>
            <span className="text-xs font-normal text-muted font-mono">({TOPICS.length})</span>
          </span>
          <ChevronDown
            className={`w-4 h-4 text-secondary transition-transform duration-200 ${
              topicsOpen ? 'rotate-0' : '-rotate-90'
            }`}
          />
        </button>

        {topicsOpen && (
          <div className="space-y-0.5 pt-1 max-h-72 overflow-y-auto pr-1 scrollbar-thin">
            {TOPICS.map((topic) => {
              const count = topicCounts[topic.id] || 0;
              const isActive = location.pathname === '/questions' && currentTopic === topic.id;

              return (
                <button
                  key={topic.id}
                  onClick={() => {
                    navigate(`/questions?topic=${topic.id}`);
                    if (isMobile) onCloseMobile();
                  }}
                  className={`w-full group flex items-center justify-between px-3.5 py-2 rounded-lg text-[14px] transition-all duration-150 cursor-pointer text-left ${
                    isActive
                      ? 'bg-card text-accent-yellow font-semibold border-l-3 border-accent-yellow shadow-xs'
                      : 'text-secondary hover:text-primary hover:bg-card/50'
                  }`}
                  title={`${topic.name}${count > 0 ? ` (${count} questions)` : ''}`}
                >
                  <span className="truncate pr-2 font-medium">{topic.name}</span>
                  {count > 0 ? (
                    <span
                      className={`text-xs font-mono px-2 py-0.5 rounded-md shrink-0 ${
                        isActive
                          ? 'bg-accent-yellow/20 text-accent-yellow font-bold border border-accent-yellow/40'
                          : 'text-muted bg-card/60 group-hover:text-secondary'
                      }`}
                    >
                      {count}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* SECTION: QUESTION SHEETS (Collapsible) */}
      <div className="space-y-1.5 border-t border-border/60 pt-4">
        <button
          onClick={toggleSheets}
          className="w-full flex items-center justify-between px-3 py-1.5 text-[12px] font-bold uppercase tracking-wider text-secondary/60 hover:text-primary transition-colors cursor-pointer group"
          aria-expanded={sheetsOpen}
        >
          <span className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-secondary group-hover:text-accent-pink transition-colors" />
            <span>Question Sheets</span>
            <span className="text-xs font-normal text-muted font-mono">({sheetStats.length})</span>
          </span>
          <ChevronDown
            className={`w-4 h-4 text-secondary transition-transform duration-200 ${
              sheetsOpen ? 'rotate-0' : '-rotate-90'
            }`}
          />
        </button>

        {sheetsOpen && (
          <div className="space-y-1 pt-1">
            {sheetStats.map((sheet) => {
              const isActive = location.pathname === '/questions' && currentSheet === sheet.id;

              return (
                <button
                  key={sheet.id}
                  onClick={() => {
                    navigate(`/questions?sheet=${sheet.id}`);
                    if (isMobile) onCloseMobile();
                  }}
                  className={`w-full group flex flex-col p-2.5 rounded-xl text-xs transition-all duration-150 cursor-pointer text-left border ${
                    isActive
                      ? 'bg-card text-primary font-semibold border-border shadow-xs'
                      : 'border-transparent text-secondary hover:text-primary hover:bg-card/50'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="flex items-center gap-2.5 truncate font-medium text-[14px]">
                      {renderSheetIcon(sheet.iconName)}
                      <span className="truncate">{sheet.name}</span>
                    </span>

                    {sheet.isImported ? (
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-sidebar text-accent-yellow border border-border shrink-0">
                        {sheet.total}
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded text-muted bg-card border border-border shrink-0">
                        Not imported
                      </span>
                    )}
                  </div>

                  {sheet.isImported && (
                    <div className="mt-2 w-full flex items-center justify-between text-xs font-mono text-secondary">
                      <span>
                        {sheet.solved} / {sheet.total} solved
                      </span>
                      <span className="text-accent-yellow font-bold">{sheet.percentage}%</span>
                    </div>
                  )}

                  {sheet.isImported && (
                    <div className="mt-1 w-full h-1.5 bg-sidebar rounded-full overflow-hidden border border-border/40">
                      <div
                        className="h-full bg-accent-yellow rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${sheet.percentage}%` }}
                      />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  // Render bottom section: Settings & User Account Menu (NO demo mode, NO Google sign in button)
  const renderBottomSection = (isMobile: boolean = false) => (
    <div className="p-3.5 border-t border-border bg-sidebar/95 space-y-2.5">
      {/* Settings Navigation Link */}
      <NavLink
        to="/settings"
        onClick={() => {
          if (isMobile) onCloseMobile();
        }}
        className={({ isActive }) =>
          `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[15px] font-medium transition-all duration-150 ${
            isActive
              ? 'bg-card text-primary font-semibold border-l-4 border-accent-yellow shadow-xs'
              : 'text-secondary hover:text-primary hover:bg-card/50'
          }`
        }
      >
        <span className="flex items-center gap-3">
          <Settings className="w-[18px] h-[18px] text-secondary shrink-0" />
          <span>Settings</span>
        </span>
      </NavLink>

      {/* User Profile / Account Menu Card */}
      <div className="p-3 rounded-xl bg-card border border-border space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            {profile?.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt={profile.displayName}
                className="w-8 h-8 rounded-full object-cover border border-border shrink-0"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-sidebar text-accent-yellow border border-border flex items-center justify-center text-xs font-mono font-bold shrink-0">
                {profile?.displayName
                  ? profile.displayName[0].toUpperCase()
                  : settings.profileName
                  ? settings.profileName[0].toUpperCase()
                  : <User className="w-4 h-4 text-secondary" />}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="text-[13px] text-primary font-bold truncate">
                {profile?.displayName || settings.profileName || 'Engineering Student'}
              </div>
              <div className="text-[11px] text-muted truncate font-mono">
                {user?.email || 'Local Workspace'}
              </div>
            </div>
          </div>
        </div>

        {/* User sign out action if authenticated */}
        {user ? (
          <button
            onClick={() => {
              if (isMobile) onCloseMobile();
              signOut();
            }}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-border transition-colors cursor-pointer"
            title="Sign out of account"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        ) : (
          <NavLink
            to="/login"
            onClick={() => {
              if (isMobile) onCloseMobile();
            }}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold text-secondary hover:text-primary hover:bg-sidebar border border-border transition-colors block text-center"
          >
            <span>Account / Sign In</span>
          </NavLink>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* ============================================================ */}
      {/* 1. DESKTOP SIDEBAR (COLLAPSIBLE W-72 / W-16)                  */}
      {/* ============================================================ */}
      <aside
        className={`hidden md:flex flex-col border-r border-border bg-sidebar backdrop-blur-md fixed inset-y-0 left-0 z-30 transition-[width] duration-300 ease-in-out ${
          isCollapsed ? 'w-16' : 'w-72'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-border shrink-0">
          <NavLink
            to="/dashboard"
            className="flex items-center gap-3 group overflow-hidden"
            title="CodeTrack DSA Workspace"
          >
            <img
              src="/images/codetrack-icon.png"
              alt="CodeTrack Logo"
              className="w-7 h-7 rounded-lg object-contain transition-transform duration-200 group-hover:scale-105 shrink-0"
            />
            {!isCollapsed && (
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="font-bold text-base tracking-tight text-primary font-sans truncate">
                  CodeTrack
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-card text-accent-yellow font-bold border border-border shrink-0">
                  DSA
                </span>
              </div>
            )}
          </NavLink>

          <button
            onClick={onToggleCollapse}
            className="p-1.5 text-secondary hover:text-primary rounded-lg hover:bg-card transition-colors cursor-pointer"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label="Toggle sidebar collapse"
          >
            {isCollapsed ? (
              <PanelLeftOpen className="w-4 h-4 text-secondary" />
            ) : (
              <PanelLeftClose className="w-4 h-4 text-secondary" />
            )}
          </button>
        </div>

        {/* Collapsed Mode vs Expanded Mode */}
        {isCollapsed ? (
          <div className="flex-1 flex flex-col items-center py-4 space-y-2">
            {workspaceItems.map((item) => {
              const isActive = location.pathname === item.to;
              return (
                <div key={item.to} className="relative group">
                  <NavLink
                    to={item.to}
                    className={`p-2.5 rounded-xl flex items-center justify-center transition-colors ${
                      isActive
                        ? 'bg-card text-accent-yellow shadow-xs'
                        : 'text-secondary hover:text-primary hover:bg-card/50'
                    }`}
                  >
                    {item.icon}
                  </NavLink>
                  <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 z-50 px-2.5 py-1 bg-card text-primary text-xs font-semibold rounded-md shadow-lg border border-border whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    {item.label}
                  </div>
                </div>
              );
            })}

            <div className="w-8 h-px bg-border my-2" />

            {/* Quick search icon in collapsed mode */}
            <div className="relative group">
              <button
                onClick={onOpenCommandPalette}
                className="p-2.5 rounded-xl flex items-center justify-center text-secondary hover:text-primary hover:bg-card/50 transition-colors"
                title="Search (Ctrl+K)"
              >
                <Search className="w-4 h-4" />
              </button>
              <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 z-50 px-2.5 py-1 bg-card text-primary text-xs font-semibold rounded-md shadow-lg border border-border whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                Search Questions (Ctrl+K)
              </div>
            </div>

            {/* Bottom items in collapsed mode */}
            <div className="mt-auto flex flex-col items-center space-y-2 pt-2 border-t border-border w-full">
              <div className="relative group">
                <NavLink
                  to="/settings"
                  className={({ isActive }) =>
                    `p-2.5 rounded-xl flex items-center justify-center transition-colors ${
                      isActive
                        ? 'bg-card text-accent-yellow shadow-xs'
                        : 'text-secondary hover:text-primary hover:bg-card/50'
                    }`
                  }
                >
                  <Settings className="w-4 h-4" />
                </NavLink>
                <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 z-50 px-2.5 py-1 bg-card text-primary text-xs font-semibold rounded-md shadow-lg border border-border whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  Settings
                </div>
              </div>

              {/* Theme toggle icon */}
              <div className="relative group">
                <button
                  onClick={toggleTheme}
                  className="p-2.5 text-secondary hover:text-primary rounded-xl hover:bg-card/50 transition-colors cursor-pointer"
                  aria-label="Toggle theme"
                >
                  {resolvedTheme === 'dark' ? (
                    <Sun className="w-4 h-4 text-accent-yellow" />
                  ) : (
                    <Moon className="w-4 h-4 text-secondary" />
                  )}
                </button>
                <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 z-50 px-2.5 py-1 bg-card text-primary text-xs font-semibold rounded-md shadow-lg border border-border whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  Toggle Theme
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Expanded Mode */
          <>
            {renderNavContent(false)}
            {renderBottomSection(false)}
          </>
        )}
      </aside>

      {/* ============================================================ */}
      {/* 2. MOBILE DRAWER SIDEBAR                                     */}
      {/* ============================================================ */}
      {isMobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex animate-in fade-in duration-200"
          onClick={onCloseMobile}
        >
          <div
            className="w-80 max-w-[85vw] h-full bg-sidebar border-r border-border flex flex-col shadow-2xl animate-in slide-in-from-left duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile Header */}
            <div className="h-14 px-4 flex items-center justify-between border-b border-border shrink-0">
              <NavLink
                to="/dashboard"
                onClick={onCloseMobile}
                className="flex items-center gap-2.5"
              >
                <img
                  src="/images/codetrack-icon.png"
                  alt="CodeTrack Logo"
                  className="w-7 h-7 rounded-lg object-contain"
                />
                <span className="font-bold text-base text-primary">CodeTrack</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-card text-accent-yellow font-bold border border-border">
                  DSA
                </span>
              </NavLink>

              <button
                onClick={onCloseMobile}
                className="p-1.5 text-secondary hover:text-primary rounded-lg hover:bg-card transition-colors cursor-pointer"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {renderNavContent(true)}
            {renderBottomSection(true)}
          </div>
        </div>
      )}
    </>
  );
};
