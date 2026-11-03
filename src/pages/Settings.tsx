import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  User,
  Database,
  Flame,
  CheckCircle2,
  Trash2,
  Download,
  Save,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useProblems } from '../context/ProblemContext';

export const Settings: React.FC = () => {
  const { user, profile, isConfigured } = useAuth();
  const { stats, resetProgress, questions } = useProblems();

  const [dailyGoal, setDailyGoal] = useState(stats.dailyGoal);
  const [preferredLang, setPreferredLang] = useState('Python 3');
  const [leetcodeHandle, setLeetcodeHandle] = useState('alex_rivers');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleExportData = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      user: profile,
      stats,
      questions,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `codetrack-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-[#18181B] border border-[#27272A]">
        <div>
          <h1 className="text-2xl font-black text-[#FAFAFA] flex items-center gap-2.5">
            <SettingsIcon className="w-6 h-6 text-[#6366F1]" />
            Application Settings
          </h1>
          <p className="text-xs text-[#A1A1AA] mt-1">
            Manage your daily targets, synchronization services, and profile configurations.
          </p>
        </div>

        {savedSuccess && (
          <div className="px-3.5 py-1.5 rounded-lg bg-[#10B981]/10 border border-[#10B981]/20 text-[#10B981] text-xs font-semibold flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            <span>Preferences Saved</span>
          </div>
        )}
      </div>

      {/* Profile Section */}
      <div className="p-6 rounded-xl bg-[#18181B] border border-[#27272A] space-y-4">
        <h2 className="text-base font-bold text-[#FAFAFA] flex items-center gap-2">
          <User className="w-4 h-4 text-[#6366F1]" />
          Profile & Account
        </h2>

        <div className="flex items-center gap-4 p-4 rounded-lg bg-[#09090B] border border-[#27272A]">
          {profile?.avatarUrl ? (
            <img
              src={profile.avatarUrl}
              alt="Avatar"
              className="w-14 h-14 rounded-full object-cover border-2 border-[#6366F1]"
            />
          ) : (
            <div className="w-14 h-14 rounded-full bg-[#6366F1]/20 border border-[#6366F1]/30 flex items-center justify-center text-[#6366F1] font-bold text-lg">
              {profile?.displayName ? profile.displayName[0].toUpperCase() : 'A'}
            </div>
          )}

          <div className="space-y-0.5">
            <h3 className="text-base font-bold text-[#FAFAFA]">
              {profile?.displayName || 'Alex Rivers'}
            </h3>
            <p className="text-xs text-[#A1A1AA]">
              {user ? user.email : 'alex.rivers@codetrack.dev'}
            </p>
            <span className="inline-block text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-[#6366F1]/20 text-[#6366F1] border border-[#6366F1]/30 mt-1">
              Pro Lifetime Tier
            </span>
          </div>
        </div>
      </div>

      {/* Target & Learning Preferences */}
      <form onSubmit={handleSavePreferences} className="p-6 rounded-xl bg-[#18181B] border border-[#27272A] space-y-5">
        <h2 className="text-base font-bold text-[#FAFAFA] flex items-center gap-2">
          <Flame className="w-4 h-4 text-amber-400" />
          Practice Targets
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#A1A1AA]">Daily Problem Goal</label>
            <input
              type="number"
              min="1"
              max="20"
              value={dailyGoal}
              onChange={(e) => setDailyGoal(Number(e.target.value))}
              className="w-full bg-[#09090B] border border-[#27272A] rounded-lg px-3 py-2 text-xs text-[#FAFAFA] focus:outline-none focus:border-[#6366F1]"
            />
            <p className="text-[11px] text-[#71717A]">
              Number of problems to solve each day to keep your streak glowing.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#A1A1AA]">Primary Programming Language</label>
            <select
              value={preferredLang}
              onChange={(e) => setPreferredLang(e.target.value)}
              className="w-full bg-[#09090B] border border-[#27272A] rounded-lg px-3 py-2 text-xs text-[#FAFAFA] focus:outline-none focus:border-[#6366F1]"
            >
              <option value="Python 3">Python 3</option>
              <option value="C++ 20">C++ 20</option>
              <option value="Java 21">Java 21</option>
              <option value="TypeScript">TypeScript / JavaScript</option>
              <option value="Go">Go</option>
              <option value="Rust">Rust</option>
            </select>
            <p className="text-[11px] text-[#71717A]">
              Preferred language for template generation and solution snippets.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#A1A1AA]">LeetCode Username Handle</label>
            <input
              type="text"
              value={leetcodeHandle}
              onChange={(e) => setLeetcodeHandle(e.target.value)}
              className="w-full bg-[#09090B] border border-[#27272A] rounded-lg px-3 py-2 text-xs text-[#FAFAFA] focus:outline-none focus:border-[#6366F1]"
            />
            <p className="text-[11px] text-[#71717A]">
              For direct badge linking and submission synchronization.
            </p>
          </div>
        </div>

        <button
          type="submit"
          className="px-4 py-2 rounded-lg bg-[#6366F1] hover:bg-[#4F46E5] text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
        >
          <Save className="w-3.5 h-3.5" />
          <span>Save Preferences</span>
        </button>
      </form>

      {/* Supabase Cloud Connection Status Card */}
      <div className="p-6 rounded-xl bg-[#18181B] border border-[#27272A] space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-[#FAFAFA] flex items-center gap-2">
            <Database className="w-4 h-4 text-[#6366F1]" />
            Supabase Cloud & Database Integration
          </h2>
          <span
            className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
              isConfigured
                ? 'text-[#10B981] bg-[#10B981]/10 border-[#10B981]/25'
                : 'text-amber-400 bg-amber-500/10 border-amber-500/25'
            }`}
          >
            {isConfigured ? 'Connected & Active' : 'Fallback / Local Sandbox'}
          </span>
        </div>

        <div className="p-4 rounded-lg bg-[#09090B] border border-[#27272A] space-y-3 text-xs">
          <p className="text-[#A1A1AA] leading-relaxed">
            CodeTrack connects to your Supabase instance to store question statuses, bookmarks, spaced repetition notes, and OAuth sessions.
          </p>
          <div className="space-y-1 font-mono text-[11px] text-[#71717A]">
            <p>
              VITE_SUPABASE_URL: <span className="text-[#FAFAFA]">{import.meta.env.VITE_SUPABASE_URL || '(Not set - using local mock client)'}</span>
            </p>
            <p>
              VITE_SUPABASE_ANON_KEY: <span className="text-[#FAFAFA]">{import.meta.env.VITE_SUPABASE_ANON_KEY ? '••••••••••••••••' : '(Not set)'}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Data Management & Danger Zone */}
      <div className="p-6 rounded-xl bg-[#18181B] border border-[#27272A] space-y-4">
        <h2 className="text-base font-bold text-[#FAFAFA]">Data Management</h2>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleExportData}
            className="px-4 py-2 rounded-lg bg-[#27272A] hover:bg-[#3F3F46] text-[#FAFAFA] text-xs font-semibold flex items-center gap-2 transition-colors border border-[#3F3F46] cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export Progress JSON</span>
          </button>

          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to reset your local progress to defaults?')) {
                resetProgress();
              }
            }}
            className="px-4 py-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold flex items-center gap-2 transition-colors border border-rose-500/20 cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>Reset to Mock Data</span>
          </button>
        </div>
      </div>
    </div>
  );
};
