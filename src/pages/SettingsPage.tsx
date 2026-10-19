import React, { useState, useRef } from 'react';
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
} from 'lucide-react';
import { useCodeTrack } from '../hooks/useCodeTrack';
import { isSupabaseConfigured } from '../services/supabase';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export const SettingsPage: React.FC = () => {
  const { settings, updateSettings, exportJSON, exportCSV, importJSON } = useCodeTrack();

  const [displayName, setDisplayName] = useState(settings.profileName || 'Engineering Student');
  const [dailyGoal, setDailyGoal] = useState(settings.dailyGoal || 3);
  const [preferredLang, setPreferredLang] = useState(settings.preferredLanguage || 'C++');
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
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
    // Reset file input
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
      <div className="pb-2 border-b border-zinc-800/60">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-mono uppercase tracking-wider text-sky-400 font-semibold">
            Preferences & Data Portability
          </span>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-white">Application Settings</h1>
        <p className="text-xs text-zinc-400 mt-0.5">
          Configure personal solving goals, preferred language, theme, and export your progress.
        </p>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSavePreferences} className="space-y-6">
        <div className="p-5 rounded-lg bg-zinc-900/60 border border-zinc-800 space-y-4">
          <h3 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
            <User className="w-4 h-4 text-sky-400" />
            Profile & Solving Targets
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-medium text-zinc-300 block mb-1">Display Name</label>
              <Input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Student Name"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-zinc-300 block mb-1">
                Preferred Language
              </label>
              <select
                value={preferredLang}
                onChange={(e) => setPreferredLang(e.target.value)}
                className="w-full bg-zinc-900 text-zinc-200 border border-zinc-700/60 rounded-md px-3 py-1.5 text-xs focus:outline-none focus:border-sky-500"
              >
                {languages.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-zinc-300 block mb-1">
                Daily Solving Target
              </label>
              <select
                value={dailyGoal}
                onChange={(e) => setDailyGoal(Number(e.target.value))}
                className="w-full bg-zinc-900 text-zinc-200 border border-zinc-700/60 rounded-md px-3 py-1.5 text-xs focus:outline-none focus:border-sky-500"
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
              <span className="text-xs text-emerald-400 font-medium">{saveStatus}</span>
            )}
          </div>
        </div>
      </form>

      {/* Cloud Sync Status */}
      <div className="p-5 rounded-lg bg-zinc-900/60 border border-zinc-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {isSupabaseConfigured ? (
              <div className="p-2 rounded-md bg-emerald-950/40 text-emerald-400 border border-emerald-800/40">
                <Cloud className="w-4 h-4" />
              </div>
            ) : (
              <div className="p-2 rounded-md bg-zinc-800 text-zinc-400 border border-zinc-700/40">
                <CloudOff className="w-4 h-4" />
              </div>
            )}
            <div>
              <h3 className="text-sm font-semibold text-zinc-200">
                {isSupabaseConfigured
                  ? 'Cloud Synchronization: Connected'
                  : 'Cloud Synchronization: Local Offline Mode Active'}
              </h3>
              <p className="text-xs text-zinc-400">
                {isSupabaseConfigured
                  ? 'Your progress is backed by Supabase PostgreSQL with Row Level Security.'
                  : 'All your progress, notes, and revision data are currently stored securely in your browser localStorage.'}
              </p>
            </div>
          </div>
        </div>

        {!isSupabaseConfigured && (
          <div className="p-3 bg-zinc-950/80 rounded-md border border-zinc-800 text-xs text-zinc-400 space-y-1.5 font-mono">
            <span className="text-zinc-300 font-semibold block">To enable Supabase Cloud & Google Auth:</span>
            <p>1. Copy <code className="text-sky-300">.env.example</code> to <code className="text-sky-300">.env</code></p>
            <p>2. Fill in <code className="text-amber-300">VITE_SUPABASE_URL</code> and <code className="text-amber-300">VITE_SUPABASE_ANON_KEY</code></p>
            <p>3. Execute the SQL schema in <code className="text-emerald-300">supabase/migrations/20261019_initial_schema.sql</code></p>
          </div>
        )}
      </div>

      {/* Data Import & Export */}
      <div className="p-5 rounded-lg bg-zinc-900/60 border border-zinc-800 space-y-4">
        <h3 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
          <Download className="w-4 h-4 text-sky-400" />
          Data Portability & Backups
        </h3>
        <p className="text-xs text-zinc-400">
          You own 100% of your data. Export your entire problem catalog status, notes, bookmarks, and revision intervals at any time.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <Button
            variant="secondary"
            onClick={handleDownloadJSON}
            icon={<FileJson className="w-3.5 h-3.5 text-amber-400" />}
          >
            Export Backup (JSON)
          </Button>

          <Button
            variant="secondary"
            onClick={handleDownloadCSV}
            icon={<FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />}
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
              icon={<Upload className="w-3.5 h-3.5 text-sky-400" />}
            >
              Restore from JSON
            </Button>
          </div>
        </div>

        {importStatus && (
          <div
            className={`p-3 rounded-md text-xs font-medium border ${
              importStatus.success
                ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/40'
                : 'bg-rose-950/40 text-rose-300 border-rose-800/40'
            }`}
          >
            {importStatus.message}
          </div>
        )}
      </div>

      {/* Danger Zone */}
      <div className="p-5 rounded-lg bg-zinc-900/60 border border-rose-950/50 space-y-3">
        <h3 className="text-sm font-semibold text-rose-300 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-400" />
          Reset Workspace
        </h3>
        <p className="text-xs text-zinc-400">
          Reset all stored progress, bookmarks, and custom notes back to the initial TakeUForward starter dataset.
        </p>
        <Button variant="danger" size="sm" onClick={handleClearCache}>
          Reset Local Data
        </Button>
      </div>
    </div>
  );
};
