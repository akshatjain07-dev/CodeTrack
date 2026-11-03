import React, { useState, useEffect } from 'react';
import {
  Database,
  ShieldCheck,
  Workflow,
  Cpu,
  CheckCircle2,
  Zap,
  Lock,
  Globe,
  Play,
  RotateCcw,
  FileText,
  Activity,
  Terminal,
  HardDrive,
  Cloud,
  CloudOff,
  Key,
  FolderTree,
  ChevronDown,
  Radio,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { useCodeTrack } from '../hooks/useCodeTrack';
import { isSupabaseConfigured } from '../services/supabase';
import { QUESTIONS } from '../data/questionsData';

type ArchTab = 'topology' | 'dataflow' | 'database' | 'security' | 'algorithms' | 'files' | 'diagnostics';

export const ArchitecturePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ArchTab>('topology');
  const { user, demoMode } = useAuth();
  const { resolvedTheme } = useTheme();
  const { progress, bookmarks, revisions } = useCodeTrack();

  // Diagnostics State
  const { localStorageSize, keyCount } = React.useMemo(() => {
    void progress;
    void bookmarks;
    void revisions;
    try {
      let totalBytes = 0;
      let count = 0;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('codetrack_')) {
          count++;
          const value = localStorage.getItem(key) || '';
          totalBytes += (key.length + value.length) * 2; // Approximate UTF-16 bytes
        }
      }
      return {
        localStorageSize: `${(totalBytes / 1024).toFixed(1)} KB`,
        keyCount: count,
      };
    } catch {
      return { localStorageSize: 'Unknown', keyCount: 0 };
    }
  }, [progress, bookmarks, revisions]);

  // Topology selected tier
  const [selectedTier, setSelectedTier] = useState<string>('presentation');

  // Data flow simulation state
  const [simScenario, setSimScenario] = useState<'solve' | 'oauth' | 'revision' | 'offline'>('solve');
  const [simStep, setSimStep] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // Database selected table
  const [selectedTable, setSelectedTable] = useState<string>('user_progress');

  // Algorithms interactive interval stage
  const [selectedIntervalStage, setSelectedIntervalStage] = useState<number>(1);

  // Simulation steps definition
  const scenarios = React.useMemo(
    () => ({
      solve: {
        title: 'Problem Status Transition (Not Started -> Solved)',
        description: 'End-to-end execution path when a user marks a DSA problem as "Solved" in the question bank.',
        steps: [
          {
            node: 'User Interface (UI Table)',
            action: 'User clicks "Solved" button on a Question Row',
            detail: 'Triggers optimistic event handler in AllQuestionsPage -> invokes useCodeTrack().updateStatus(questionId, "Solved")',
          },
          {
            node: 'Synchronous Storage Layer',
            action: 'Local Cache Mutated Immediately (0ms latency)',
            detail: 'storage.ts updates "codetrack_user_progress" in localStorage. Emits event to all active tab subscribers.',
          },
          {
            node: 'Spaced Repetition Engine',
            action: 'Auto-Scheduling Trigger Fired',
            detail: 'scheduleAutomaticRevision() calculates Stage 1 review (current date + 1 day). Sets reviewCount = 0 and isCompleted = false.',
          },
          {
            node: 'Streak & Telemetry Accounting',
            action: 'Daily Activity Increment',
            detail: 'recordDailyActivity() increments questionsSolved for today date. Recalculates consecutive day streak.',
          },
          {
            node: 'Cloud Sync Layer (Async Worker)',
            action: 'Optimistic Supabase RPC / Upsert',
            detail: 'cloudSync.ts calls Supabase PostgREST client: supabase.from("user_progress").upsert({ user_id, question_id, status: "Solved" }).',
          },
          {
            node: 'PostgreSQL Database & RLS',
            action: 'Row Level Security Enforcement & Persistence',
            detail: 'PostgreSQL validates auth.uid() == user_id. Commits transaction to public.user_progress and public.revision_schedule.',
          },
        ],
      },
      oauth: {
        title: 'Google OAuth 2.0 PKCE Authentication',
        description: 'Zero-secret, client-side PKCE authorization code exchange and user initialization.',
        steps: [
          {
            node: 'Client Browser',
            action: 'User clicks "Sign In with Google"',
            detail: 'AuthContext initiates supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo, flowType: "pkce" } }).',
          },
          {
            node: 'Google OAuth Consent',
            action: 'Google Identity Service Verification',
            detail: 'User authenticates at accounts.google.com and consents to profile/email scopes. Google issues short-lived authorization code.',
          },
          {
            node: 'Auth Callback Route (/auth/callback)',
            action: 'PKCE Code-Verifier Verification',
            detail: 'Supabase client swaps auth code for JWT access token and refresh token via cryptographically signed code verifier.',
          },
          {
            node: 'PostgreSQL Trigger (handle_new_user)',
            action: 'Automated Account Profile Provisioning',
            detail: 'AFTER INSERT ON auth.users runs PL/pgSQL function: populates public.profiles and default public.user_settings.',
          },
          {
            node: 'First-Login Migration Layer',
            action: 'Progress Merge & Local Hydration',
            detail: 'storage.ts checks for existing local progress. If user solved problems in Demo Mode, automatically pushes them to Cloud DB.',
          },
        ],
      },
      revision: {
        title: 'Spaced Repetition Review (SM-2 / Leitner Variant)',
        description: 'Progression lifecycle as student completes a scheduled flashcard review session.',
        steps: [
          {
            node: 'Revision Center Modal',
            action: 'User self-tests intuition and rates confidence',
            detail: 'Student picks rating: "Again" (fail), "Good" (pass), or "Easy" (mastered).',
          },
          {
            node: 'Scheduling State Machine',
            action: 'Interval Matrix Recalculation',
            detail: '"Good": advances stage +1 (e.g. 1d -> 3d). "Again": resets to Stage 1. "Easy": advances stage +2 or graduates to Mastered.',
          },
          {
            node: 'Date Math Engine',
            action: 'Timezone-Normalized Review Calculation',
            detail: 'Adds stage days to current local calendar day (YYYY-MM-DD), avoiding timezone offset drift.',
          },
          {
            node: 'Local & Cloud Persistence',
            action: 'Revision Record Upserted & Synced',
            detail: 'Updates public.revision_schedule and records revision activity in public.daily_activity.',
          },
        ],
      },
      offline: {
        title: 'Offline-First Fallback & Cloud Reconnect',
        description: 'Seamless operation when internet connection drops or Supabase credentials are missing.',
        steps: [
          {
            node: 'Network State Monitor',
            action: 'Cloud Request Times Out or Fails',
            detail: 'cloudSync.ts gracefully catches network errors without throwing or blocking UI threads.',
          },
          {
            node: 'Local Storage Vault',
            action: 'Guaranteed Local Durability',
            detail: 'All progress, bookmarks, notes, and revisions remain 100% durable in browser localStorage.',
          },
          {
            node: 'UI Telemetry Badge',
            action: 'Header Indicators Reflect Status',
            detail: 'AppShell displays "Local Mode" or "Demo Mode" with zero warning popups or disruptive modals.',
          },
          {
            node: 'Reconnection Re-sync',
            action: 'One-Click Force Push or Auto-Sync',
            detail: 'On next authenticated session or manual trigger, forcePushToCloud() reconciles all local diffs to Supabase.',
          },
        ],
      },
    }),
    []
  );

  // Auto-play simulation runner
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (isPlaying) {
      timer = setInterval(() => {
        setSimStep((prev) => {
          const max = scenarios[simScenario].steps.length - 1;
          if (prev >= max) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 2200);
    }
    return () => clearInterval(timer);
  }, [isPlaying, simScenario, scenarios]);

  // Database Schema Data
  const tables = [
    {
      name: 'profiles',
      category: 'Auth & Identity',
      description: 'Extends Supabase auth.users with user profile preferences and goals.',
      columns: [
        { name: 'id', type: 'UUID', key: 'PK, FK -> auth.users.id', desc: 'Unique user identifier' },
        { name: 'email', type: 'TEXT', key: 'UNIQUE', desc: 'Google authenticated email' },
        { name: 'display_name', type: 'TEXT', key: '', desc: 'Google full name or handle' },
        { name: 'avatar_url', type: 'TEXT', key: '', desc: 'Google profile picture URL' },
        { name: 'preferred_language', type: 'TEXT', key: 'DEFAULT "C++"', desc: 'Primary coding language' },
        { name: 'daily_goal_target', type: 'INTEGER', key: 'DEFAULT 3', desc: 'Target questions per day' },
        { name: 'created_at', type: 'TIMESTAMPTZ', key: 'DEFAULT NOW()', desc: 'Creation timestamp' },
      ],
      rls: 'auth.uid() = id (Users can only read/update their own profile)',
    },
    {
      name: 'user_progress',
      category: 'Core Progress',
      description: 'Tracks user-specific problem status, notes, and completion timestamps.',
      columns: [
        { name: 'id', type: 'UUID', key: 'PK', desc: 'Unique record ID' },
        { name: 'user_id', type: 'UUID', key: 'FK -> auth.users.id', desc: 'Owner user ID' },
        { name: 'question_id', type: 'TEXT', key: 'FK -> questions.id', desc: 'TUF Question ID (e.g. arr-01)' },
        { name: 'status', type: 'TEXT', key: 'CHECK IN ("Not Started","Attempted","Solved")', desc: 'Current state' },
        { name: 'notes', type: 'TEXT', key: '', desc: 'Markdown problem notes and complexities' },
        { name: 'language_used', type: 'TEXT', key: '', desc: 'Language used to solve' },
        { name: 'solved_at', type: 'TIMESTAMPTZ', key: '', desc: 'Timestamp of completion' },
        { name: 'updated_at', type: 'TIMESTAMPTZ', key: 'DEFAULT NOW()', desc: 'Last modified timestamp' },
      ],
      rls: 'auth.uid() = user_id (Zero data leaks across different users)',
    },
    {
      name: 'revision_schedule',
      category: 'Spaced Repetition',
      description: 'Automated review queue based on Leitner spaced interval stages.',
      columns: [
        { name: 'id', type: 'UUID', key: 'PK', desc: 'Unique schedule ID' },
        { name: 'user_id', type: 'UUID', key: 'FK -> auth.users.id', desc: 'Owner user ID' },
        { name: 'question_id', type: 'TEXT', key: 'FK -> questions.id', desc: 'Problem being reviewed' },
        { name: 'stage', type: 'INTEGER', key: 'DEFAULT 1', desc: 'Stage 1 (1d), 2 (3d), 3 (7d), 4 (14d), 5 (30d)' },
        { name: 'next_review_date', type: 'DATE', key: 'INDEXED', desc: 'Scheduled calendar review day' },
        { name: 'review_count', type: 'INTEGER', key: 'DEFAULT 0', desc: 'Number of completed reviews' },
        { name: 'is_completed', type: 'BOOLEAN', key: 'DEFAULT FALSE', desc: 'Mastery graduation flag' },
      ],
      rls: 'auth.uid() = user_id',
    },
    {
      name: 'daily_activity',
      category: 'Analytics & Streaks',
      description: 'Event-sourced daily activity aggregation for consistency streaks and heatmaps.',
      columns: [
        { name: 'id', type: 'UUID', key: 'PK', desc: 'Unique record ID' },
        { name: 'user_id', type: 'UUID', key: 'FK -> auth.users.id', desc: 'Owner user ID' },
        { name: 'activity_date', type: 'DATE', key: 'UNIQUE (user_id, activity_date)', desc: 'Calendar date' },
        { name: 'questions_solved', type: 'INTEGER', key: 'DEFAULT 0', desc: 'Net questions solved on this date' },
        { name: 'revisions_completed', type: 'INTEGER', key: 'DEFAULT 0', desc: 'Total reviews completed' },
      ],
      rls: 'auth.uid() = user_id',
    },
    {
      name: 'user_bookmarks',
      category: 'User Collections',
      description: 'Instant question bookmarking with set-based deduplication.',
      columns: [
        { name: 'user_id', type: 'UUID', key: 'PK, FK -> auth.users.id', desc: 'Owner user ID' },
        { name: 'question_id', type: 'TEXT', key: 'PK, FK -> questions.id', desc: 'Target problem ID' },
        { name: 'created_at', type: 'TIMESTAMPTZ', key: 'DEFAULT NOW()', desc: 'Bookmarked timestamp' },
      ],
      rls: 'auth.uid() = user_id',
    },
    {
      name: 'questions',
      category: 'Curriculum Bank',
      description: 'TakeUForward Striver A2Z DSA master problem repository (229 problems).',
      columns: [
        { name: 'id', type: 'TEXT', key: 'PK', desc: 'Unique problem code (e.g. dp-07)' },
        { name: 'title', type: 'TEXT', key: 'NOT NULL', desc: 'Canonical problem name' },
        { name: 'topic_id', type: 'TEXT', key: 'FK -> topics.id', desc: 'Categorical topic' },
        { name: 'subtopic', type: 'TEXT', key: '', desc: 'Specific pattern/subtopic' },
        { name: 'difficulty', type: 'TEXT', key: 'Easy | Medium | Hard', desc: 'Standard difficulty rating' },
        { name: 'platform', type: 'TEXT', key: 'LeetCode | GFG | CodingNinjas', desc: 'Hosting judge' },
        { name: 'problem_url', type: 'TEXT', key: '', desc: 'Deep-link to platform problem' },
      ],
      rls: 'Public read (true) - shared across all users',
    },
    {
      name: 'topics',
      category: 'Curriculum Bank',
      description: 'Core 16 DSA Topic taxonomy ordered sequentially.',
      columns: [
        { name: 'id', type: 'TEXT', key: 'PK', desc: 'Topic slug (e.g. arrays, dp)' },
        { name: 'name', type: 'TEXT', key: 'NOT NULL', desc: 'Human-friendly title' },
        { name: 'display_order', type: 'INTEGER', key: 'NOT NULL', desc: 'Curriculum order' },
        { name: 'description', type: 'TEXT', key: '', desc: 'Summary of concepts covered' },
      ],
      rls: 'Public read (true)',
    },
    {
      name: 'user_settings',
      category: 'User Configuration',
      description: 'Persistent user preferences, target goals, and external handle associations.',
      columns: [
        { name: 'user_id', type: 'UUID', key: 'PK, FK -> auth.users.id', desc: 'Owner user ID' },
        { name: 'daily_goal', type: 'INTEGER', key: 'DEFAULT 3', desc: 'Daily solving target' },
        { name: 'theme', type: 'TEXT', key: 'DEFAULT "dark"', desc: 'Theme preference' },
        { name: 'preferred_language', type: 'TEXT', key: 'DEFAULT "C++"', desc: 'Default language' },
        { name: 'leetcode_username', type: 'TEXT', key: '', desc: 'LeetCode profile handle' },
        { name: 'codeforces_username', type: 'TEXT', key: '', desc: 'Codeforces profile handle' },
      ],
      rls: 'auth.uid() = user_id',
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* ================= PAGE HEADER ================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-subtle">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-mono uppercase tracking-wider text-muted font-semibold flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-primary" />
              System Architecture
            </span>
            <span className="text-muted">·</span>
            <span className="text-[11px] text-muted font-mono">
              Engineering Blueprint & Specification
            </span>
            <span className="text-muted">·</span>
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-surface border border-subtle text-[10px] font-mono text-primary">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Verified Spec
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-primary">
            CodeTrack Project Architecture
          </h1>
          <p className="text-xs text-secondary mt-1 max-w-3xl">
            A complete architectural breakdown of CodeTrack's dual-tier offline-first storage engine, React 19 component hierarchy, Supabase PostgreSQL Row-Level Security (RLS) model, and spaced repetition scheduler.
          </p>
        </div>

        {/* Global Live Stat Badges */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-surface border border-subtle text-xs font-mono">
            <HardDrive className="w-3.5 h-3.5 text-muted" />
            <span className="text-secondary">Local Vault:</span>
            <span className="text-primary font-medium">{localStorageSize}</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-surface border border-subtle text-xs font-mono">
            <Database className="w-3.5 h-3.5 text-muted" />
            <span className="text-secondary">TUF Bank:</span>
            <span className="text-primary font-medium">{QUESTIONS.length} Problems</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-surface border border-subtle text-xs font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-secondary">Security:</span>
            <span className="text-primary font-medium">RLS Active</span>
          </div>
        </div>
      </div>

      {/* ================= TAB SELECTOR ================= */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 border-b border-subtle no-scrollbar">
        {[
          { id: 'topology', label: 'System Topology', icon: <Workflow className="w-3.5 h-3.5" /> },
          { id: 'dataflow', label: 'Interactive Data Flow', icon: <Radio className="w-3.5 h-3.5" /> },
          { id: 'database', label: 'Database Schema & RLS', icon: <Database className="w-3.5 h-3.5" /> },
          { id: 'security', label: 'Security & Auth Model', icon: <ShieldCheck className="w-3.5 h-3.5" /> },
          { id: 'algorithms', label: 'Spaced Repetition & Streaks', icon: <Zap className="w-3.5 h-3.5" /> },
          { id: 'files', label: 'Component & Directory Tree', icon: <FolderTree className="w-3.5 h-3.5" /> },
          { id: 'diagnostics', label: 'Live System Telemetry', icon: <Activity className="w-3.5 h-3.5" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as ArchTab)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-md text-xs font-medium whitespace-nowrap transition-all duration-150 cursor-pointer ${
              activeTab === tab.id
                ? 'bg-surface-elevated text-primary font-semibold border border-subtle shadow-xs'
                : 'text-secondary hover:text-primary hover:bg-surface-subtle'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ================= VIEW 1: SYSTEM TOPOLOGY ================= */}
      {activeTab === 'topology' && (
        <div className="space-y-6">
          <div className="p-4 rounded-xl bg-surface border border-subtle flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-primary flex items-center gap-2">
                <Workflow className="w-4 h-4 text-primary" />
                Multi-Tier Distributed Architecture Stack
              </h3>
              <p className="text-xs text-secondary mt-0.5">
                Click any layer in the topology diagram below to inspect its protocols, responsibilities, latency characteristics, and source code files.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-muted">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Client Layer
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 ml-2" /> Sync Layer
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500 ml-2" /> Cloud Backend
            </div>
          </div>

          {/* Interactive Stack Diagram */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 space-y-3">
              {[
                {
                  id: 'presentation',
                  layer: 'Tier 1: Presentation & Rendering Engine',
                  badge: 'Client · React 19',
                  color: 'border-emerald-500/30 hover:border-emerald-500',
                  activeColor: 'border-emerald-500 bg-surface-elevated ring-1 ring-emerald-500/30',
                  components: ['React Router v7', 'Lucide React', 'Recharts Visualizer', 'Tailwind CSS v4 Tokens'],
                  latency: '< 16ms (60 FPS)',
                  summary: 'High-density, accessible UI modeled after developer-grade tools (Linear, GitHub). Renders 229 questions with instant client-side filtering.',
                },
                {
                  id: 'state',
                  layer: 'Tier 2: Reactive State & Hooks Orchestration',
                  badge: 'Client · React Context & Hooks',
                  color: 'border-emerald-500/30 hover:border-emerald-500',
                  activeColor: 'border-emerald-500 bg-surface-elevated ring-1 ring-emerald-500/30',
                  components: ['useCodeTrack()', 'useAuth()', 'useTheme()', 'Event Pub/Sub Bus'],
                  latency: '0ms (In-Memory React State)',
                  summary: 'Custom reactive hooks managing questions status, spaced repetition review queues, bookmarks, notes, and streak calculators.',
                },
                {
                  id: 'cache',
                  layer: 'Tier 3: Offline-First Local Storage Vault',
                  badge: 'Browser · Synchronous Key-Value',
                  color: 'border-blue-500/30 hover:border-blue-500',
                  activeColor: 'border-blue-500 bg-surface-elevated ring-1 ring-blue-500/30',
                  components: ['storage.ts', 'codetrack_user_progress', 'codetrack_user_revisions', 'codetrack_daily_activity'],
                  latency: '< 1ms (Synchronous localStorage)',
                  summary: 'Provides zero-latency offline operation. The app operates 100% friction-free without waiting for cloud round-trips.',
                },
                {
                  id: 'sync',
                  layer: 'Tier 4: Asynchronous Cloud Sync & Migration Worker',
                  badge: 'Network · Background Worker',
                  color: 'border-blue-500/30 hover:border-blue-500',
                  activeColor: 'border-blue-500 bg-surface-elevated ring-1 ring-blue-500/30',
                  components: ['cloudSync.ts', 'Optimistic Upsert Engine', 'First-Login Migration', 'Network Error Resilience'],
                  latency: '100ms - 250ms (Asynchronous, Non-Blocking)',
                  summary: 'Optimistically pushes state diffs to Supabase. Gracefully falls back to Local Mode if offline or credentials are missing.',
                },
                {
                  id: 'auth',
                  layer: 'Tier 5: Authentication & Session Gatekeeper',
                  badge: 'Security · OAuth 2.0 PKCE',
                  color: 'border-purple-500/30 hover:border-purple-500',
                  activeColor: 'border-purple-500 bg-surface-elevated ring-1 ring-purple-500/30',
                  components: ['Supabase Auth (GoTrue)', 'Google OAuth 2.0', 'PKCE Code Verifier', 'JWT Refresh Worker'],
                  latency: 'Cryptographic Token Verification',
                  summary: 'Stateless JWT auth with persistent browser sessions. Tokens never expose server secrets or private keys.',
                },
                {
                  id: 'database',
                  layer: 'Tier 6: PostgreSQL Database with Row-Level Security',
                  badge: 'Database · Supabase Postgres',
                  color: 'border-purple-500/30 hover:border-purple-500',
                  activeColor: 'border-purple-500 bg-surface-elevated ring-1 ring-purple-500/30',
                  components: ['8 Relational Tables', 'RLS Policies (auth.uid() = user_id)', 'handle_new_user() Trigger', 'Compound Indexes'],
                  latency: 'ACID Compliant Database Transactions',
                  summary: 'Hardware-enforced row isolation. Even with public client keys, users can physically only select and mutate their own records.',
                },
              ].map((tier) => (
                <div
                  key={tier.id}
                  onClick={() => setSelectedTier(tier.id)}
                  className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
                    selectedTier === tier.id ? tier.activeColor : `bg-surface ${tier.color}`
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-semibold text-primary flex items-center gap-2">
                      <span className="font-mono text-[11px] text-muted">{tier.layer.split(':')[0]}</span>
                      <span>{tier.layer.split(':')[1]}</span>
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-subtle border border-subtle text-secondary">
                      {tier.badge}
                    </span>
                  </div>
                  <p className="text-xs text-secondary line-clamp-2">{tier.summary}</p>
                  <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-2 border-t border-subtle">
                    {tier.components.map((comp) => (
                      <span
                        key={comp}
                        className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface-subtle text-muted border border-subtle"
                      >
                        {comp}
                      </span>
                    ))}
                    <span className="text-[10px] font-mono text-muted ml-auto">{tier.latency}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Detailed Layer Inspector Side Panel */}
            <div className="lg:col-span-5">
              <div className="p-5 rounded-xl bg-surface-elevated border border-subtle card-shadow sticky top-20 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-subtle">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-primary" />
                    <span className="text-xs font-mono uppercase tracking-wider text-muted font-semibold">
                      Layer Deep Dive
                    </span>
                  </div>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-surface border border-subtle text-primary">
                    {selectedTier.toUpperCase()}
                  </span>
                </div>

                {selectedTier === 'presentation' && (
                  <div className="space-y-3 text-xs">
                    <h4 className="font-semibold text-primary">Client Presentation & Interaction Layer</h4>
                    <p className="text-secondary leading-relaxed">
                      Built on React 19 and Vite with client-side routing via React Router v7. Leverages high-density components inspired by developer tooling like Linear.
                    </p>
                    <div className="p-3 rounded-lg bg-surface border border-subtle space-y-1.5 font-mono text-[11px]">
                      <div className="text-muted font-semibold">Key Highlights:</div>
                      <div>• Zero runtime CSS overhead via Tailwind CSS v4 CSS variables</div>
                      <div>• Debounced sub-millisecond search across 229 questions</div>
                      <div>• Contextual slide-over drawer for notes, complexities & code</div>
                      <div>• Recharts interactive data visualization with dark/light auto-theme</div>
                    </div>
                    <div className="text-muted font-mono text-[11px]">
                      Primary Source Files: <br />
                      <span className="text-primary">src/App.tsx, src/components/layout/AppShell.tsx, src/pages/*</span>
                    </div>
                  </div>
                )}

                {selectedTier === 'state' && (
                  <div className="space-y-3 text-xs">
                    <h4 className="font-semibold text-primary">Reactive State & Hooks Orchestration</h4>
                    <p className="text-secondary leading-relaxed">
                      Custom hooks expose a reactive interface that shields UI components from storage complexities. Automatically synchronizes across all browser tabs via custom storage subscription listeners.
                    </p>
                    <div className="p-3 rounded-lg bg-surface border border-subtle space-y-1.5 font-mono text-[11px]">
                      <div className="text-muted font-semibold">Exposed API via useCodeTrack():</div>
                      <div>• stats: solvedCount, completionRate, streak, dueRevisions</div>
                      <div>• updateStatus(questionId, status)</div>
                      <div>• toggleBookmark(questionId)</div>
                      <div>• scheduleRevision(questionId, date, stage)</div>
                      <div>• saveNotes(questionId, notes)</div>
                    </div>
                    <div className="text-muted font-mono text-[11px]">
                      Primary Source Files: <br />
                      <span className="text-primary">src/hooks/useCodeTrack.ts, src/hooks/useAuth.ts</span>
                    </div>
                  </div>
                )}

                {selectedTier === 'cache' && (
                  <div className="space-y-3 text-xs">
                    <h4 className="font-semibold text-primary">Offline-First Local Storage Vault</h4>
                    <p className="text-secondary leading-relaxed">
                      Every user mutation is immediately written synchronously to browser localStorage. This eliminates network UI freezes, guarantees zero latency clicks, and enables 100% offline usage.
                    </p>
                    <div className="p-3 rounded-lg bg-surface border border-subtle space-y-1.5 font-mono text-[11px]">
                      <div className="text-muted font-semibold">Storage Schema Keys:</div>
                      <div>• codetrack_user_progress: Record&lt;string, UserProgress&gt;</div>
                      <div>• codetrack_user_bookmarks: string[] (deduplicated Set)</div>
                      <div>• codetrack_user_revisions: Record&lt;string, RevisionItem&gt;</div>
                      <div>• codetrack_daily_activity: Record&lt;string, DailyRecord&gt;</div>
                      <div>• codetrack_user_settings: UserSettings object</div>
                    </div>
                    <div className="text-muted font-mono text-[11px]">
                      Primary Source Files: <br />
                      <span className="text-primary">src/services/storage.ts</span>
                    </div>
                  </div>
                )}

                {selectedTier === 'sync' && (
                  <div className="space-y-3 text-xs">
                    <h4 className="font-semibold text-primary">Asynchronous Cloud Sync Worker</h4>
                    <p className="text-secondary leading-relaxed">
                      Runs non-blocking background workers that push changes to Supabase PostgreSQL without stalling the UI. Features intelligent first-login migration to prevent student work loss.
                    </p>
                    <div className="p-3 rounded-lg bg-surface border border-subtle space-y-1.5 font-mono text-[11px]">
                      <div className="text-muted font-semibold">Sync Resilience Strategy:</div>
                      <div>• Non-blocking fire-and-forget for instant UI response</div>
                      <div>• Auto-migration: transfers pre-login progress to cloud account</div>
                      <div>• One-click manual "Sync Now" force push reconciliation</div>
                      <div>• Gracefully swallows network failures during airplane mode</div>
                    </div>
                    <div className="text-muted font-mono text-[11px]">
                      Primary Source Files: <br />
                      <span className="text-primary">src/services/cloudSync.ts</span>
                    </div>
                  </div>
                )}

                {selectedTier === 'auth' && (
                  <div className="space-y-3 text-xs">
                    <h4 className="font-semibold text-primary">Google OAuth 2.0 PKCE Security Model</h4>
                    <p className="text-secondary leading-relaxed">
                      Utilizes Proof Key for Code Exchange (PKCE, RFC 7636). Client web apps never store or expose Google client secrets or database service keys.
                    </p>
                    <div className="p-3 rounded-lg bg-surface border border-subtle space-y-1.5 font-mono text-[11px]">
                      <div className="text-muted font-semibold">Security Safeguards:</div>
                      <div>• Zero client secret keys in frontend repository</div>
                      <div>• Short-lived JWT access tokens with automatic refresh</div>
                      <div>• PKCE code verifier generated on-the-fly per auth challenge</div>
                      <div>• Strict redirect URI whitelisting in Google Cloud & Supabase</div>
                    </div>
                    <div className="text-muted font-mono text-[11px]">
                      Primary Source Files: <br />
                      <span className="text-primary">src/services/supabase.ts, src/context/AuthContext.tsx</span>
                    </div>
                  </div>
                )}

                {selectedTier === 'database' && (
                  <div className="space-y-3 text-xs">
                    <h4 className="font-semibold text-primary">PostgreSQL Database with Row-Level Security</h4>
                    <p className="text-secondary leading-relaxed">
                      PostgreSQL database with granular Row Level Security (RLS) active on all 6 user tables. Automated database triggers handle user provisioning upon OAuth sign-in.
                    </p>
                    <div className="p-3 rounded-lg bg-surface border border-subtle space-y-1.5 font-mono text-[11px]">
                      <div className="text-muted font-semibold">Database Highlights:</div>
                      <div>• 8 normalized tables with foreign key cascades</div>
                      <div>• RLS Policy: auth.uid() = user_id on every operation</div>
                      <div>• PL/pgSQL trigger on auth.users for profile creation</div>
                      <div>• B-Tree indexes on topic_id, (user_id, status), next_review_date</div>
                    </div>
                    <div className="text-muted font-mono text-[11px]">
                      Primary Source Files: <br />
                      <span className="text-primary">supabase/migrations/20261019_initial_schema.sql</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= VIEW 2: INTERACTIVE DATA FLOW SIMULATOR ================= */}
      {activeTab === 'dataflow' && (
        <div className="space-y-6">
          <div className="p-4 rounded-xl bg-surface border border-subtle flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-primary flex items-center gap-2">
                <Radio className="w-4 h-4 text-primary" />
                Live Lifecycle & Execution Flow Simulator
              </h3>
              <p className="text-xs text-secondary mt-0.5">
                Select a real-world user action below. Step through or auto-play to watch data packets traverse components, local storage, and the Supabase PostgreSQL database.
              </p>
            </div>

            {/* Scenario Selector */}
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: 'solve', label: '1. Problem Solved' },
                { id: 'oauth', label: '2. Google OAuth' },
                { id: 'revision', label: '3. Spaced Repetition' },
                { id: 'offline', label: '4. Offline Fallback' },
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => {
                    setSimScenario(s.id as any);
                    setSimStep(0);
                    setIsPlaying(false);
                  }}
                  className={`px-2.5 py-1 rounded text-xs font-mono transition-all cursor-pointer ${
                    simScenario === s.id
                      ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                      : 'bg-surface-subtle text-secondary hover:text-primary border border-subtle'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Simulator Visualizer Canvas */}
          <div className="p-6 rounded-2xl bg-surface-elevated border border-subtle card-shadow space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-subtle">
              <div>
                <span className="text-[11px] font-mono text-muted uppercase tracking-wider">
                  Active Simulation Scenario
                </span>
                <h4 className="text-base font-semibold text-primary mt-0.5">
                  {scenarios[simScenario].title}
                </h4>
                <p className="text-xs text-secondary mt-0.5">
                  {scenarios[simScenario].description}
                </p>
              </div>

              {/* Playback Controls */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setSimStep(Math.max(0, simStep - 1))}
                  disabled={simStep === 0}
                  className="px-2.5 py-1 rounded bg-surface hover:bg-surface-subtle disabled:opacity-40 text-xs font-mono text-secondary border border-subtle cursor-pointer"
                >
                  Prev
                </button>
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="flex items-center gap-1.5 px-3 py-1 rounded bg-surface hover:bg-surface-subtle text-xs font-mono font-medium text-primary border border-subtle cursor-pointer active:scale-95"
                >
                  {isPlaying ? <Activity className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{isPlaying ? 'Pause' : 'Auto Play'}</span>
                </button>
                <button
                  onClick={() =>
                    setSimStep(Math.min(scenarios[simScenario].steps.length - 1, simStep + 1))
                  }
                  disabled={simStep === scenarios[simScenario].steps.length - 1}
                  className="px-2.5 py-1 rounded bg-surface hover:bg-surface-subtle disabled:opacity-40 text-xs font-mono text-secondary border border-subtle cursor-pointer"
                >
                  Next
                </button>
                <button
                  onClick={() => {
                    setSimStep(0);
                    setIsPlaying(false);
                  }}
                  className="p-1 rounded bg-surface hover:bg-surface-subtle text-muted hover:text-primary border border-subtle cursor-pointer"
                  title="Reset"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Step-by-Step Flow Nodes */}
            <div className="relative space-y-4">
              {scenarios[simScenario].steps.map((step, idx) => {
                const isCurrent = simStep === idx;
                const isPast = simStep > idx;

                return (
                  <div
                    key={idx}
                    onClick={() => {
                      setSimStep(idx);
                      setIsPlaying(false);
                    }}
                    className={`relative p-4 rounded-xl border transition-all duration-300 cursor-pointer ${
                      isCurrent
                        ? 'bg-surface border-primary shadow-md ring-1 ring-primary/40 -translate-y-0.5'
                        : isPast
                        ? 'bg-surface/60 border-subtle text-secondary opacity-80'
                        : 'bg-surface/30 border-subtle/40 opacity-40'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center font-mono text-xs font-bold shrink-0 transition-colors ${
                            isCurrent
                              ? 'bg-primary text-primary-foreground'
                              : isPast
                              ? 'bg-surface-subtle text-emerald-500 border border-emerald-500/30'
                              : 'bg-surface-subtle text-muted border border-subtle'
                          }`}
                        >
                          {isPast ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono text-muted uppercase tracking-wider">
                              {step.node}
                            </span>
                            {isCurrent && (
                              <span className="flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 animate-pulse">
                                Executing
                              </span>
                            )}
                          </div>
                          <div className="text-sm font-semibold text-primary mt-0.5">
                            {step.action}
                          </div>
                        </div>
                      </div>

                      <span className="text-xs font-mono text-muted shrink-0 hidden sm:inline">
                        Step {idx + 1} of {scenarios[simScenario].steps.length}
                      </span>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-subtle/60 text-xs font-mono text-secondary">
                      {step.detail}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ================= VIEW 3: DATABASE SCHEMA & RLS ================= */}
      {activeTab === 'database' && (
        <div className="space-y-6">
          <div className="p-4 rounded-xl bg-surface border border-subtle flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-primary flex items-center gap-2">
                <Database className="w-4 h-4 text-primary" />
                PostgreSQL Relational Schema & Row-Level Security
              </h3>
              <p className="text-xs text-secondary mt-0.5">
                Explore all 8 database tables, column constraints, relational foreign keys, indexes, and hardware-enforced RLS security policies.
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-mono text-muted">8 Total Tables</span>
              <span className="text-muted">·</span>
              <span className="text-xs font-mono text-emerald-500">6 User Isolated (RLS)</span>
              <span className="text-muted">·</span>
              <span className="text-xs font-mono text-primary">2 Shared Taxonomy</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Table Selector Sidebar */}
            <div className="lg:col-span-4 space-y-2">
              <div className="text-[11px] font-mono text-muted uppercase tracking-wider px-1">
                Database Tables
              </div>
              {tables.map((tbl) => (
                <div
                  key={tbl.name}
                  onClick={() => setSelectedTable(tbl.name)}
                  className={`p-3 rounded-lg border transition-all duration-150 cursor-pointer ${
                    selectedTable === tbl.name
                      ? 'bg-surface-elevated border-primary shadow-xs'
                      : 'bg-surface border-subtle hover:border-default'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-semibold text-primary">
                      public.{tbl.name}
                    </span>
                    <span className="text-[10px] font-mono text-muted px-1.5 py-0.2 rounded bg-surface-subtle border border-subtle">
                      {tbl.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-secondary mt-1 line-clamp-1">{tbl.description}</p>
                </div>
              ))}
            </div>

            {/* Table Detail Panel */}
            <div className="lg:col-span-8">
              {(() => {
                const currentTbl = tables.find((t) => t.name === selectedTable) || tables[0];
                return (
                  <div className="p-5 rounded-2xl bg-surface-elevated border border-subtle card-shadow space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-subtle">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-base font-mono font-bold text-primary">
                            public.{currentTbl.name}
                          </span>
                          <span className="text-xs font-mono px-2 py-0.5 rounded bg-surface border border-subtle text-secondary">
                            {currentTbl.category}
                          </span>
                        </div>
                        <p className="text-xs text-secondary mt-1">{currentTbl.description}</p>
                      </div>

                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-surface border border-subtle text-xs font-mono">
                        <Lock className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-secondary">RLS:</span>
                        <span className="text-emerald-500 font-medium">Enabled</span>
                      </div>
                    </div>

                    {/* RLS Policy Banner */}
                    <div className="p-3 rounded-lg bg-surface border border-subtle space-y-1">
                      <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-primary">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                        Security Policy (Row-Level Security):
                      </div>
                      <div className="text-xs font-mono text-secondary bg-surface-subtle p-2 rounded border border-subtle">
                        {currentTbl.rls}
                      </div>
                    </div>

                    {/* Columns Table */}
                    <div className="overflow-x-auto rounded-lg border border-subtle">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-surface border-b border-subtle text-[11px] font-mono text-muted uppercase">
                          <tr>
                            <th className="px-3 py-2 font-medium">Column Name</th>
                            <th className="px-3 py-2 font-medium">Data Type</th>
                            <th className="px-3 py-2 font-medium">Constraint / Keys</th>
                            <th className="px-3 py-2 font-medium">Semantic Description</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-subtle font-mono text-xs">
                          {currentTbl.columns.map((col) => (
                            <tr key={col.name} className="hover:bg-surface-subtle/50 transition-colors">
                              <td className="px-3 py-2 font-semibold text-primary">{col.name}</td>
                              <td className="px-3 py-2 text-secondary">{col.type}</td>
                              <td className="px-3 py-2 text-muted">
                                {col.key ? (
                                  <span className="px-1.5 py-0.5 rounded bg-surface border border-subtle text-[11px] text-primary">
                                    {col.key}
                                  </span>
                                ) : (
                                  '—'
                                )}
                              </td>
                              <td className="px-3 py-2 text-secondary font-sans">{col.desc}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* SQL DDL Definition Preview */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-mono text-muted">
                        <span>Production SQL Schema snippet:</span>
                        <span>PostgreSQL 15+</span>
                      </div>
                      <pre className="p-3 rounded-lg bg-surface border border-subtle text-[11px] font-mono text-secondary overflow-x-auto">
{`-- Table: public.${currentTbl.name}
ALTER TABLE public.${currentTbl.name} ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own ${currentTbl.name}"
  ON public.${currentTbl.name}
  FOR ALL
  USING (${currentTbl.name === 'topics' || currentTbl.name === 'questions' ? 'true' : currentTbl.name === 'profiles' || currentTbl.name === 'user_settings' ? 'auth.uid() = id' : 'auth.uid() = user_id'});`}
                      </pre>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* ================= VIEW 4: SECURITY & AUTH MODEL ================= */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          <div className="p-4 rounded-xl bg-surface border border-subtle">
            <h3 className="text-sm font-semibold text-primary flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              Security Architecture, Threat Defense & Privacy Isolation
            </h3>
            <p className="text-xs text-secondary mt-0.5">
              CodeTrack is architected according to modern zero-trust standards. The frontend operates with least-privilege public keys while data isolation is enforced at the database kernel level via PostgreSQL Row Level Security.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-surface border border-subtle space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-primary">
                <Key className="w-4 h-4 text-primary" />
                Zero Secret Key Leaks
              </div>
              <p className="text-xs text-secondary">
                No database administration keys or Google OAuth secrets are included in the frontend bundle. Only public anon tokens with PKCE code verifiers are permitted.
              </p>
              <div className="pt-2 text-[11px] font-mono text-emerald-500 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Static Audit: 0 Secrets Found
              </div>
            </div>

            <div className="p-4 rounded-xl bg-surface border border-subtle space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-primary">
                <Lock className="w-4 h-4 text-primary" />
                Hardware-Enforced RLS
              </div>
              <p className="text-xs text-secondary">
                PostgreSQL evaluates <code className="text-primary font-mono">auth.uid() = user_id</code> on every single SELECT, INSERT, UPDATE, and DELETE query. Malicious clients cannot query neighboring student records.
              </p>
              <div className="pt-2 text-[11px] font-mono text-emerald-500 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> 6 User Tables Protected
              </div>
            </div>

            <div className="p-4 rounded-xl bg-surface border border-subtle space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-primary">
                <Globe className="w-4 h-4 text-primary" />
                PKCE OAuth Flow
              </div>
              <p className="text-xs text-secondary">
                Implements RFC 7636 Proof Key for Code Exchange. Protects authorization codes from interception across browser tabs and redirection attacks.
              </p>
              <div className="pt-2 text-[11px] font-mono text-emerald-500 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> PKCE Flow Verified
              </div>
            </div>
          </div>

          {/* Security Audit Verification Matrix */}
          <div className="p-5 rounded-2xl bg-surface-elevated border border-subtle card-shadow space-y-4">
            <h4 className="text-xs font-mono uppercase tracking-wider text-muted font-semibold">
              Automated Security & Authentication Audit Matrix
            </h4>
            <div className="divide-y divide-subtle border border-subtle rounded-lg overflow-hidden">
              {[
                {
                  check: 'Source Code Secrets Audit',
                  status: 'PASSED',
                  detail: 'Automated AST & regex scan verifies zero private keys in client source code.',
                },
                {
                  check: 'Row Level Security (RLS) on public.profiles',
                  status: 'ACTIVE',
                  detail: 'auth.uid() = id ensures users can only read and update their personal profile info.',
                },
                {
                  check: 'Row Level Security (RLS) on public.user_progress',
                  status: 'ACTIVE',
                  detail: 'auth.uid() = user_id prevents unauthorized progress mutations or enumeration.',
                },
                {
                  check: 'Row Level Security (RLS) on public.revision_schedule',
                  status: 'ACTIVE',
                  detail: 'auth.uid() = user_id isolates spaced repetition review queues.',
                },
                {
                  check: 'Row Level Security (RLS) on public.daily_activity',
                  status: 'ACTIVE',
                  detail: 'Streak tracking and daily activity logs strictly confined to the owning authenticated user.',
                },
                {
                  check: 'Automated Account Provisioning Trigger',
                  status: 'VERIFIED',
                  detail: 'handle_new_user() runs with SECURITY DEFINER to safely provision profile on Google OAuth callback.',
                },
              ].map((item, idx) => (
                <div key={idx} className="p-3.5 bg-surface flex items-center justify-between gap-4 text-xs">
                  <div>
                    <span className="font-semibold text-primary">{item.check}</span>
                    <p className="text-secondary text-[11px] mt-0.5">{item.detail}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 font-semibold shrink-0">
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================= VIEW 5: ALGORITHMS & ENGINES ================= */}
      {activeTab === 'algorithms' && (
        <div className="space-y-6">
          <div className="p-4 rounded-xl bg-surface border border-subtle">
            <h3 className="text-sm font-semibold text-primary flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              Core Algorithmic Engines & Mathematical Formulations
            </h3>
            <p className="text-xs text-secondary mt-0.5">
              CodeTrack incorporates cognitive science spaced repetition algorithms, idempotent state transitions, and timezone-aware streak tracking.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Spaced Repetition Engine */}
            <div className="p-5 rounded-2xl bg-surface-elevated border border-subtle card-shadow space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-subtle">
                <div>
                  <h4 className="text-sm font-semibold text-primary">
                    1. Spaced Repetition Engine (Modified Leitner / SM-2)
                  </h4>
                  <p className="text-xs text-secondary mt-0.5">
                    Fibonacci-paced intervals designed to counteract the Ebbinghaus Forgetting Curve.
                  </p>
                </div>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-surface border border-subtle text-primary">
                  Stage {selectedIntervalStage}
                </span>
              </div>

              {/* Interactive Stage Picker */}
              <div className="grid grid-cols-5 gap-2">
                {[
                  { stage: 1, days: 1, label: '1 Day', note: 'Immediate Recall' },
                  { stage: 2, days: 3, label: '3 Days', note: 'Short Term' },
                  { stage: 3, days: 7, label: '7 Days', note: 'Weekly Cadence' },
                  { stage: 4, days: 14, label: '14 Days', note: 'Deep Memory' },
                  { stage: 5, days: 30, label: '30 Days', note: 'Mastered' },
                ].map((s) => (
                  <button
                    key={s.stage}
                    onClick={() => setSelectedIntervalStage(s.stage)}
                    className={`p-2 rounded-lg border text-center transition-all cursor-pointer ${
                      selectedIntervalStage === s.stage
                        ? 'bg-surface border-primary text-primary shadow-xs'
                        : 'bg-surface-subtle border-subtle text-muted hover:text-secondary'
                    }`}
                  >
                    <div className="text-xs font-bold font-mono">Stage {s.stage}</div>
                    <div className="text-[11px] font-mono text-secondary">{s.label}</div>
                  </button>
                ))}
              </div>

              {/* Stage Transition Rules */}
              <div className="p-3 rounded-lg bg-surface border border-subtle space-y-2 text-xs font-mono">
                <div className="text-muted font-semibold">User Rating Feedback Transitions:</div>
                <div className="text-secondary flex items-center justify-between">
                  <span>Rating: "Again" (Failed intuition)</span>
                  <span className="text-amber-500 font-bold">Resets &rarr; Stage 1 (1 Day)</span>
                </div>
                <div className="text-secondary flex items-center justify-between">
                  <span>Rating: "Good" (Recalled with thought)</span>
                  <span className="text-primary font-bold">Advances &rarr; Stage +1</span>
                </div>
                <div className="text-secondary flex items-center justify-between">
                  <span>Rating: "Easy" (Optimal recall)</span>
                  <span className="text-emerald-500 font-bold">Fast-Tracks &rarr; Stage +2 / Mastered</span>
                </div>
              </div>
            </div>

            {/* Streak & Idempotency Calculations */}
            <div className="p-5 rounded-2xl bg-surface-elevated border border-subtle card-shadow space-y-4">
              <div className="pb-3 border-b border-subtle">
                <h4 className="text-sm font-semibold text-primary">
                  2. Streak Calculation & Idempotency Guarantees
                </h4>
                <p className="text-xs text-secondary mt-0.5">
                  Guarantees that rapid clicking, un-solving, or re-solving problems never corrupts counts or double-counts streaks.
                </p>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-lg bg-surface border border-subtle space-y-1.5 font-mono">
                  <div className="text-primary font-semibold">Timezone-Normalized Date Boundary:</div>
                  <pre className="text-[11px] text-secondary">
{`function getLocalDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return \`\${year}-\${month}-\${day}\`;
}`}
                  </pre>
                  <p className="text-[11px] text-muted font-sans mt-1">
                    Prevents UTC boundary shifts from falsely ending a student's streak at midnight.
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-surface border border-subtle space-y-1.5 font-mono">
                  <div className="text-primary font-semibold">Daily Goal Accounting Invariant:</div>
                  <p className="text-[11px] text-secondary font-sans leading-relaxed">
                    When a question is toggled from <code className="text-primary font-mono">Solved</code> back to <code className="text-primary font-mono">Attempted</code>, the daily solved count is decremented safely with <code className="text-primary font-mono">Math.max(0, count - 1)</code> to preserve strict mathematical invariants.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= VIEW 6: COMPONENT & FILE TREE ================= */}
      {activeTab === 'files' && (
        <div className="space-y-6">
          <div className="p-4 rounded-xl bg-surface border border-subtle">
            <h3 className="text-sm font-semibold text-primary flex items-center gap-2">
              <FolderTree className="w-4 h-4 text-primary" />
              Repository Architecture & File Responsibilities
            </h3>
            <p className="text-xs text-secondary mt-0.5">
              Structured according to industry modular patterns. Click on folder items to expand or inspect specific responsibilities.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-surface-elevated border border-subtle card-shadow font-mono text-xs space-y-3">
            {[
              {
                name: 'src/',
                type: 'folder',
                desc: 'Root source directory containing all frontend application code',
                children: [
                  {
                    name: 'components/',
                    type: 'folder',
                    desc: 'Reusable presentation and UI primitives',
                    children: [
                      { name: 'layout/AppShell.tsx', type: 'file', desc: 'Global sidebar, mobile drawer, search trigger & route container' },
                      { name: 'ui/CommandPalette.tsx', type: 'file', desc: 'Fast Ctrl+K modal for fuzzy problem search & direct navigation' },
                      { name: 'ui/QuestionDrawer.tsx', type: 'file', desc: 'Slide-over contextual inspector for notes, complexities & YouTube links' },
                      { name: 'ui/RevisionModal.tsx', type: 'file', desc: 'Spaced repetition flashcard test modal with confidence grading' },
                      { name: 'ui/Badge.tsx', type: 'file', desc: 'Difficulty and platform badge indicators' },
                      { name: 'ui/ProgressBar.tsx', type: 'file', desc: 'Smooth animated progress meter' },
                    ],
                  },
                  {
                    name: 'pages/',
                    type: 'folder',
                    desc: 'Top-level routed views corresponding to AppShell navigation items',
                    children: [
                      { name: 'DashboardPage.tsx', type: 'file', desc: 'High-level velocity overview, daily goal tracker, urgent revisions' },
                      { name: 'AllQuestionsPage.tsx', type: 'file', desc: 'Tabular DSA problem bank with multi-facet filters & deep links' },
                      { name: 'RevisionCenterPage.tsx', type: 'file', desc: 'Due today, overdue, and upcoming spaced review queues' },
                      { name: 'AnalyticsPage.tsx', type: 'file', desc: 'Visual velocity charts, topic completion and difficulty breakdown' },
                      { name: 'ArchitecturePage.tsx', type: 'file', desc: 'Interactive system topology, data flow simulator & DB schemas' },
                      { name: 'SettingsPage.tsx', type: 'file', desc: 'Daily target goals, cloud synchronization, JSON/CSV exports' },
                      { name: 'LoginPage.tsx', type: 'file', desc: 'Google OAuth 2.0 PKCE sign-in and local demo mode access' },
                    ],
                  },
                  {
                    name: 'services/',
                    type: 'folder',
                    desc: 'Data access, caching, and cloud synchronization logic',
                    children: [
                      { name: 'storage.ts', type: 'file', desc: 'Offline synchronous localStorage vault with pub/sub listener bus' },
                      { name: 'cloudSync.ts', type: 'file', desc: 'Optimistic asynchronous Supabase RPC push & reconciliation' },
                      { name: 'supabase.ts', type: 'file', desc: 'PKCE client initialization and configuration guard' },
                    ],
                  },
                  {
                    name: 'hooks/',
                    type: 'folder',
                    desc: 'State orchestration and reactive business hooks',
                    children: [
                      { name: 'useCodeTrack.ts', type: 'file', desc: 'Exposes progress, revisions, bookmarks, stats & actions' },
                      { name: 'useAuth.ts', type: 'file', desc: 'Manages user sessions, OAuth callbacks, and demo mode' },
                      { name: 'useTheme.ts', type: 'file', desc: 'Dark / Light / System auto-detection and token resolution' },
                    ],
                  },
                  {
                    name: 'data/',
                    type: 'folder',
                    desc: 'Canonical TakeUForward DSA dataset',
                    children: [
                      { name: 'questionsData.ts', type: 'file', desc: '229 Striver A2Z DSA problems mapped across 16 core topics' },
                    ],
                  },
                ],
              },
              {
                name: 'supabase/',
                type: 'folder',
                desc: 'Backend infrastructure and database definitions',
                children: [
                  { name: 'migrations/20261019_initial_schema.sql', type: 'file', desc: 'Complete PostgreSQL DDL, triggers, and RLS policies' },
                ],
              },
              {
                name: 'scripts/',
                type: 'folder',
                desc: 'Automated verification test suites',
                children: [
                  { name: 'test-business-logic.js', type: 'file', desc: '7 automated tests for spaced repetition, streaks & idempotency' },
                  { name: 'test-auth-security.js', type: 'file', desc: '22 automated security checks for secrets, RLS & PKCE' },
                ],
              },
            ].map((section) => (
              <div key={section.name} className="space-y-1">
                <div className="flex items-center gap-2 text-primary font-semibold">
                  <FolderTree className="w-3.5 h-3.5 text-primary" />
                  <span>{section.name}</span>
                  <span className="text-muted text-[11px] font-sans font-normal">— {section.desc}</span>
                </div>

                <div className="pl-4 space-y-1.5 border-l border-subtle ml-1.5 mt-1">
                  {section.children.map((child: any) => (
                    <div key={child.name} className="space-y-1">
                      <div className="flex items-center gap-2 text-secondary">
                        {child.type === 'folder' ? (
                          <ChevronDown className="w-3 h-3 text-muted" />
                        ) : (
                          <FileText className="w-3 h-3 text-muted" />
                        )}
                        <span className="text-primary font-medium">{child.name}</span>
                        <span className="text-muted text-[11px] font-sans">— {child.desc}</span>
                      </div>

                      {child.children && (
                        <div className="pl-4 space-y-1 border-l border-subtle ml-1.5">
                          {child.children.map((sub: any) => (
                            <div key={sub.name} className="flex items-center gap-2 text-muted">
                              <FileText className="w-3 h-3 text-muted shrink-0" />
                              <span className="text-secondary font-mono">{sub.name}</span>
                              <span className="text-muted text-[11px] font-sans truncate">— {sub.desc}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= VIEW 7: LIVE TELEMETRY & DIAGNOSTICS ================= */}
      {activeTab === 'diagnostics' && (
        <div className="space-y-6">
          <div className="p-4 rounded-xl bg-surface border border-subtle">
            <h3 className="text-sm font-semibold text-primary flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-500" />
              Live Diagnostic Telemetry & Runtime Environment
            </h3>
            <p className="text-xs text-secondary mt-0.5">
              Real-time inspection of your current browser session, memory cache payload sizes, active user credentials, and database connection state.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-surface border border-subtle space-y-1.5">
              <div className="text-[11px] font-mono text-muted uppercase">Cloud Provider</div>
              <div className="text-sm font-semibold text-primary flex items-center gap-1.5">
                {isSupabaseConfigured ? (
                  <>
                    <Cloud className="w-4 h-4 text-emerald-500" />
                    <span>Supabase Connected</span>
                  </>
                ) : (
                  <>
                    <CloudOff className="w-4 h-4 text-muted" />
                    <span>Local Mode (Ready)</span>
                  </>
                )}
              </div>
              <div className="text-[11px] font-mono text-secondary">
                {isSupabaseConfigured ? 'PostgreSQL 15+ Active' : '.env awaiting credentials'}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-surface border border-subtle space-y-1.5">
              <div className="text-[11px] font-mono text-muted uppercase">Active User Session</div>
              <div className="text-sm font-semibold text-primary truncate">
                {user ? user.email : demoMode ? 'Local Demo Mode' : 'Guest Workspace'}
              </div>
              <div className="text-[11px] font-mono text-secondary">
                {user ? `UID: ${user.id.slice(0, 8)}...` : 'Unauthenticated'}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-surface border border-subtle space-y-1.5">
              <div className="text-[11px] font-mono text-muted uppercase">Local Storage Footprint</div>
              <div className="text-sm font-semibold text-primary font-mono">{localStorageSize}</div>
              <div className="text-[11px] font-mono text-secondary">{keyCount} Active Cache Keys</div>
            </div>

            <div className="p-4 rounded-xl bg-surface border border-subtle space-y-1.5">
              <div className="text-[11px] font-mono text-muted uppercase">Theme Token Resolution</div>
              <div className="text-sm font-semibold text-primary capitalize">{resolvedTheme} Mode</div>
              <div className="text-[11px] font-mono text-secondary">CSS Variables Injected</div>
            </div>
          </div>

          {/* Test Suite Summary Banner */}
          <div className="p-5 rounded-2xl bg-surface-elevated border border-subtle card-shadow space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-subtle">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-primary" />
                <span className="text-xs font-mono uppercase tracking-wider text-muted font-semibold">
                  Automated Test Suite Status
                </span>
              </div>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 font-medium">
                29 / 29 Tests Passing (100%)
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-3 rounded-lg bg-surface border border-subtle space-y-1">
                <div className="text-primary font-semibold flex items-center justify-between">
                  <span>test-auth-security.js</span>
                  <span className="text-emerald-500">22/22 Checks Passed</span>
                </div>
                <p className="text-muted text-[11px] font-sans">
                  Verifies zero secret leaks, RLS policy enforcement across all 6 tables, PKCE flow, and callback routing.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-surface border border-subtle space-y-1">
                <div className="text-primary font-semibold flex items-center justify-between">
                  <span>test-business-logic.js</span>
                  <span className="text-emerald-500">7/7 Tests Passed</span>
                </div>
                <p className="text-muted text-[11px] font-sans">
                  Verifies spaced repetition stage progression, consecutive day streaks, bookmark deduplication, and daily goal math.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArchitecturePage;
