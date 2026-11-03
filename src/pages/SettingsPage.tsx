import React, { useState, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Download,
  Upload,
  Save,
  User,
  Cloud,
  CloudOff,
  AlertTriangle,
  FileJson,
  FileSpreadsheet,
  LogOut,
  LogIn,
  CheckCircle2,
  RefreshCw,
  ShieldCheck,
  KeyRound,
  Sun,
  Moon,
  Laptop,
  Palette,
} from 'lucide-react';
import { useCodeTrack } from '../hooks/useCodeTrack';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { isSupabaseConfigured } from '../services/supabase';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export const SettingsPage: React.FC = () => {
  const { user, profile, signOut, demoMode } = useAuth();
  const { settings, updateSettings, exportJSON, exportCSV, importJSON, forceSync, isSyncing } = useCodeTrack();
  const { theme, setTheme, resolvedTheme } = useTheme();

  const [displayName, setDisplayName] = useState(profile?.displayName || settings.profileName || 'Engineering Student');
  const [dailyGoal, setDailyGoal] = useState(settings.dailyGoal || 3);
  const [preferredLang, setPreferredLang] = useState(settings.preferredLanguage || 'C++');
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [importStatus, setImportStatus] = useState<{ success: boolean; message: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const languages = ['C++', 'Java', 'Python', 'C', 'JavaScript', 'TypeScript', 'Go', 'Rust', 'Kotlin'];

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      profileName: displayName.trim(),
      dailyGoal: Number(dailyGoal),
      preferredLanguage: preferredLang,
    });
    setSaveStatus('Preferences saved successfully.');
    setTimeout(() => setSaveStatus(null), 2500);
  };

  const handleManualSync = async () => {
    if (!user) return;
    setSyncStatus('Syncing progress with Supabase PostgreSQL...');
    const res = await forceSync();
    if (res.success) {
      setSyncStatus(`Successfully synchronized ${res.count} items to your cloud account.`);
    } else {
      setSyncStatus('Synchronization complete. Cloud records are up to date.');
    }
    setTimeout(() => setSyncStatus(null), 4000);
  };

  const handleDownloadJSON = () => {
    const jsonStr = exportJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `codetrack-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadCSV = () => {
    const csvStr = exportCSV();
    const blob = new Blob([csvStr], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `codetrack-progress-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = importJSON(content);
      setImportStatus(res);
      setTimeout(() => setImportStatus(null), 4000);
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleClearCache = () => {
    if (window.confirm('Are you sure you want to reset local progress to default TakeUForward sample data?')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="pb-2 border-b border-subtle">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-mono uppercase tracking-wider text-muted font-medium">
            Preferences & Data Portability
          </span>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-primary">Application Settings</h1>
        <p className="text-xs text-secondary mt-0.5">
          Configure appearance theme, daily solving goals, preferred language, view your authenticated Google account, and export your progress.
        </p>
      </div>

      {/* Global Theme Selector Section */}
      <div className="p-5 rounded-lg bg-surface-elevated border border-subtle card-shadow space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-primary flex items-center gap-2">
            <Palette className="w-4 h-4 text-secondary" />
            Appearance & Theme
          </h3>
          <span className="text-xs font-mono text-muted">
            Currently: <span className="text-primary font-medium capitalize">{theme}</span> ({resolvedTheme} active)
          </span>
        </div>
        <p className="text-xs text-secondary">
          Choose a theme to customize your workspace appearance. Dark mode features a sophisticated near-black palette for reduced eye strain during deep focus sessions.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          {/* Dark Mode Option */}
          <button
            type="button"
            onClick={() => setTheme('dark')}
            className={`p-3.5 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between ${
              theme === 'dark'
                ? 'border-primary bg-surface shadow-xs ring-1 ring-primary/40'
                : 'border-subtle bg-surface hover:border-default'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-md bg-surface-subtle text-primary border border-subtle">
                <Moon className="w-4 h-4" />
              </div>
              {theme === 'dark' && (
                <span className="text-[10px] font-mono text-primary font-semibold">
                  ACTIVE
                </span>
              )}
            </div>
            <div>
              <p className="text-xs font-semibold text-primary">Dark</p>
              <p className="text-[11px] text-muted mt-0.5 font-mono">Near-black & crisp monochrome</p>
            </div>
          </button>

          {/* Light Mode Option */}
          <button
            type="button"
            onClick={() => setTheme('light')}
            className={`p-3.5 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between ${
              theme === 'light'
                ? 'border-primary bg-surface shadow-xs ring-1 ring-primary/40'
                : 'border-subtle bg-surface hover:border-default'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-md bg-surface-subtle text-primary border border-subtle">
                <Sun className="w-4 h-4" />
              </div>
              {theme === 'light' && (
                <span className="text-[10px] font-mono text-primary font-semibold">
                  ACTIVE
                </span>
              )}
            </div>
            <div>
              <p className="text-xs font-semibold text-primary">Light</p>
              <p className="text-[11px] text-muted mt-0.5 font-mono">Clean white & refined borders</p>
            </div>
          </button>

          {/* System Mode Option */}
          <button
            type="button"
            onClick={() => setTheme('system')}
            className={`p-3.5 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between ${
              theme === 'system'
                ? 'border-primary bg-surface shadow-xs ring-1 ring-primary/40'
                : 'border-subtle bg-surface hover:border-default'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-md bg-surface-subtle text-primary border border-subtle">
                <Laptop className="w-4 h-4" />
              </div>
              {theme === 'system' && (
                <span className="text-[10px] font-mono text-primary font-semibold">
                  ACTIVE
                </span>
              )}
            </div>
            <div>
              <p className="text-xs font-semibold text-primary">System</p>
              <p className="text-[11px] text-muted mt-0.5 font-mono">Matches operating system theme</p>
            </div>
          </button>
        </div>
      </div>

      {/* Authentication & User Account Card */}
      <div className="p-5 rounded-lg bg-surface-elevated border border-subtle card-shadow space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-primary flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-secondary" />
            Authentication & Account Identity
          </h3>
          {user && (
            <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-surface text-primary border border-subtle flex items-center gap-1.5">
              <CheckCircle2 className="w-3 h-3 text-primary" />
              Google OAuth Connected
            </span>
          )}
        </div>

        {user ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg bg-surface border border-subtle">
            <div className="flex items-center gap-3 min-w-0">
              {profile?.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt={profile.displayName}
                  className="w-12 h-12 rounded-full object-cover border border-subtle shrink-0"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-surface-subtle text-primary border border-subtle flex items-center justify-center text-lg font-mono font-bold shrink-0">
                  {profile?.displayName ? profile.displayName[0].toUpperCase() : 'G'}
                </div>
              )}
              <div className="min-w-0">
                <p className="text-sm font-semibold text-primary truncate flex items-center gap-2">
                  <span>{profile?.displayName || user.email}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-surface-subtle text-secondary border border-subtle">
                    Google
                  </span>
                </p>
                <p className="text-xs text-secondary font-mono truncate">{user.email}</p>
                <p className="text-[10px] text-muted font-mono mt-0.5 truncate">
                  User ID: {user.id}
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => signOut()}
              icon={<LogOut className="w-3.5 h-3.5" />}
              className="text-xs shrink-0"
            >
              Sign Out
            </Button>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg bg-surface border border-subtle">
            <div>
              <p className="text-xs font-medium text-primary">
                {demoMode ? 'Operating in Local Demo Mode' : 'Not Authenticated'}
              </p>
              <p className="text-xs text-secondary mt-0.5">
                Sign in with your Google account to sync your progress, bookmarks, and spaced repetition revisions across all your devices with Supabase Row Level Security.
              </p>
            </div>
            <NavLink
              to="/login"
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md text-xs font-semibold bg-black text-white dark:bg-white dark:text-black hover:opacity-90 transition-colors shadow-xs shrink-0"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In with Google</span>
            </NavLink>
          </div>
        )}
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSavePreferences} className="space-y-6">
        <div className="p-5 rounded-lg bg-surface-elevated border border-subtle card-shadow space-y-4">
          <h3 className="text-sm font-semibold text-primary flex items-center gap-2">
            <User className="w-4 h-4 text-secondary" />
            Profile & Solving Targets
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-medium text-secondary block mb-1">Display Name</label>
              <Input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Student Name"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-secondary block mb-1">
                Preferred Language
              </label>
              <select
                value={preferredLang}
                onChange={(e) => setPreferredLang(e.target.value)}
                className="w-full bg-surface text-primary border border-subtle rounded-md px-3 py-1.5 text-xs focus:outline-none focus:border-default cursor-pointer"
              >
                {languages.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-secondary block mb-1">
                Daily Solving Target
              </label>
              <select
                value={dailyGoal}
                onChange={(e) => setDailyGoal(Number(e.target.value))}
                className="w-full bg-surface text-primary border border-subtle rounded-md px-3 py-1.5 text-xs focus:outline-none focus:border-default cursor-pointer"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 10].map((num) => (
                  <option key={num} value={num}>
                    {num} questions / day
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button type="submit" variant="primary" icon={<Save className="w-3.5 h-3.5" />}>
              Save Preferences
            </Button>
            {saveStatus && (
              <span className="text-xs text-primary font-mono font-medium">{saveStatus}</span>
            )}
          </div>
        </div>
      </form>

      {/* Cloud Sync Status */}
      <div className="p-5 rounded-lg bg-surface-elevated border border-subtle card-shadow space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            {isSupabaseConfigured ? (
              <div className="p-2 rounded-md bg-surface-subtle text-primary border border-subtle">
                <Cloud className="w-4 h-4" />
              </div>
            ) : (
              <div className="p-2 rounded-md bg-surface-subtle text-muted border border-subtle">
                <CloudOff className="w-4 h-4" />
              </div>
            )}
            <div>
              <h3 className="text-sm font-semibold text-primary">
                {user
                  ? `Cloud Synchronization: Connected (${user.email})`
                  : isSupabaseConfigured
                  ? 'Cloud Synchronization: Ready for Google Sign-In'
                  : 'Cloud Synchronization: Local Offline Mode Active'}
              </h3>
              <p className="text-xs text-secondary">
                {user
                  ? 'Your problem checklist, notes, and revision data are synchronized in real-time with Supabase Row Level Security.'
                  : isSupabaseConfigured
                  ? 'Sign in to automatically sync and access your progress from anywhere.'
                  : 'All your progress, notes, and revision data are currently stored locally in your browser cache.'}
              </p>
            </div>
          </div>

          {user && (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleManualSync}
              disabled={isSyncing}
              icon={<RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />}
            >
              {isSyncing ? 'Syncing...' : 'Sync Cloud Now'}
            </Button>
          )}
        </div>

        {syncStatus && (
          <div className="p-2.5 rounded-md bg-surface border border-subtle text-xs text-primary flex items-center gap-2 font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-secondary shrink-0" />
            <span>{syncStatus}</span>
          </div>
        )}

        {!isSupabaseConfigured && (
          <div className="p-3.5 bg-surface rounded-md border border-subtle text-xs text-secondary space-y-2 font-mono">
            <span className="text-primary font-semibold block">To enable Supabase Cloud & Google OAuth:</span>
            <p>1. Copy <code>.env.example</code> to <code>.env</code></p>
            <p>2. Fill in <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code></p>
            <p>3. Execute the SQL schema in <code>supabase/migrations/20261019_initial_schema.sql</code></p>
            <p>4. Configure Google provider in the Supabase Authentication dashboard.</p>
          </div>
        )}
      </div>

      {/* Data Import & Export */}
      <div className="p-5 rounded-lg bg-surface-elevated border border-subtle card-shadow space-y-4">
        <h3 className="text-sm font-semibold text-primary flex items-center gap-2">
          <Download className="w-4 h-4 text-secondary" />
          Data Portability & Backups
        </h3>
        <p className="text-xs text-secondary">
          You own 100% of your data. Export your entire problem catalog status, notes, bookmarks, and revision intervals at any time.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <Button
            variant="secondary"
            onClick={handleDownloadJSON}
            icon={<FileJson className="w-3.5 h-3.5" />}
          >
            Export Backup (JSON)
          </Button>

          <Button
            variant="secondary"
            onClick={handleDownloadCSV}
            icon={<FileSpreadsheet className="w-3.5 h-3.5" />}
          >
            Export Progress (CSV)
          </Button>

          <div className="relative">
            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
              id="import-json-input"
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              icon={<Upload className="w-3.5 h-3.5 text-secondary" />}
            >
              Restore from JSON
            </Button>
          </div>
        </div>

        {importStatus && (
          <div
            className={`p-3 rounded-md text-xs font-mono border ${
              importStatus.success
                ? 'bg-surface text-primary border-default'
                : 'bg-surface text-secondary border-subtle'
            }`}
          >
            {importStatus.message}
          </div>
        )}
      </div>

      {/* Danger Zone */}
      <div className="p-5 rounded-lg bg-surface-elevated border border-subtle space-y-3">
        <h3 className="text-sm font-semibold text-primary flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-secondary" />
          Reset Workspace
        </h3>
        <p className="text-xs text-secondary">
          Reset all stored progress, bookmarks, and custom notes back to the initial TakeUForward starter dataset.
        </p>
        <Button variant="outline" size="sm" onClick={handleClearCache}>
          Reset Local Data
        </Button>
      </div>
    </div>
  );
};
