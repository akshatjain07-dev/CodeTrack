import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Flame,
  CheckCircle2,
  Layers,
  ArrowRight,
  ExternalLink,
  Bookmark,
  Sparkles,
  Shuffle,
  Target,
  Clock,
} from 'lucide-react';
import { useProblems } from '../context/ProblemContext';
import { useAuth } from '../context/AuthContext';
import type { DSAQuestion } from '../data/mockData';

export const Dashboard: React.FC = () => {
  const { questions, stats, toggleStatus, toggleBookmark } = useProblems();
  const { profile } = useAuth();
  const navigate = useNavigate();

  // Pick 3 recent or suggested questions for continue practicing
  const continuePracticingQuestions: DSAQuestion[] = React.useMemo(() => {
    const attempted = questions.filter((q) => q.status === 'Attempted');
    const unsolved = questions.filter((q) => q.status === 'Unsolved');
    const combined = [...attempted, ...unsolved];
    return combined.slice(0, 3);
  }, [questions]);

  // Pick a random unsolved problem for the "Daily Shuffle"
  const handleShuffle = () => {
    const unsolved = questions.filter((q) => q.status !== 'Solved');
    if (unsolved.length > 0) {
      const random = unsolved[Math.floor(Math.random() * unsolved.length)];
      window.open(random.problemUrl, '_blank');
    }
  };

  const getDifficultyBadge = (difficulty: 'Easy' | 'Medium' | 'Hard') => {
    switch (difficulty) {
      case 'Easy':
        return 'text-[#10B981] bg-[#10B981]/10 border-[#10B981]/20';
      case 'Medium':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'Hard':
        return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#18181B] via-[#1c192e] to-[#18181B] border border-[#27272A] p-6 lg:p-8">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#6366F1]/10 border border-[#6366F1]/20 text-[#6366F1] text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Interview Prep Season 2026</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#FAFAFA] tracking-tight">
              Ready to code, {profile?.displayName?.split(' ')[0] || 'Developer'}?
            </h1>
            <p className="text-sm text-[#A1A1AA] leading-relaxed">
              You are currently on an <span className="text-[#FAFAFA] font-semibold">{stats.currentStreak}-day streak</span>. Solve {Math.max(1, stats.dailyGoal - stats.solvedToday)} more problem today to hit your daily target and stay interview-ready.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => navigate('/library')}
              className="px-4 py-2.5 rounded-lg bg-[#6366F1] hover:bg-[#4F46E5] text-white text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-lg shadow-indigo-500/25 transition-all duration-150"
            >
              <span>Continue Practicing</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={handleShuffle}
              className="px-4 py-2.5 rounded-lg bg-[#27272A] hover:bg-[#3F3F46] text-[#FAFAFA] text-xs sm:text-sm font-semibold flex items-center gap-2 border border-[#3F3F46] transition-all duration-150"
            >
              <Shuffle className="w-4 h-4 text-[#A1A1AA]" />
              <span>Random Pick</span>
            </button>
          </div>
        </div>

        {/* Ambient background glow */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-[#6366F1]/10 blur-3xl pointer-events-none" />
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Metric 1: Total Solved */}
        <div className="p-6 rounded-xl bg-[#18181B] border border-[#27272A] hover:border-[#3F3F46] transition-all flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-lg bg-[#10B981]/10 border border-[#10B981]/20 flex items-center justify-center text-[#10B981]">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider">
                  Total Solved
                </span>
                <p className="text-2xl font-black text-[#FAFAFA] tracking-tight">
                  {stats.totalSolved} <span className="text-xs font-normal text-[#71717A]">/ {stats.totalQuestions}</span>
                </p>
              </div>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20">
              {Math.round((stats.totalSolved / stats.totalQuestions) * 100)}%
            </span>
          </div>

          {/* Difficulty Breakdown Bars */}
          <div className="space-y-2 pt-2 border-t border-[#27272A]">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#A1A1AA]">Easy</span>
              <span className="font-semibold text-[#FAFAFA]">{stats.easySolved} / {stats.easyTotal}</span>
            </div>
            <div className="w-full h-1.5 bg-[#27272A] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#10B981] rounded-full"
                style={{ width: `${(stats.easySolved / stats.easyTotal) * 100}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-[#A1A1AA]">Medium</span>
              <span className="font-semibold text-[#FAFAFA]">{stats.mediumSolved} / {stats.mediumTotal}</span>
            </div>
            <div className="w-full h-1.5 bg-[#27272A] rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-400 rounded-full"
                style={{ width: `${(stats.mediumSolved / stats.mediumTotal) * 100}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-[#A1A1AA]">Hard</span>
              <span className="font-semibold text-[#FAFAFA]">{stats.hardSolved} / {stats.hardTotal}</span>
            </div>
            <div className="w-full h-1.5 bg-[#27272A] rounded-full overflow-hidden">
              <div
                className="h-full bg-rose-400 rounded-full"
                style={{ width: `${(stats.hardSolved / stats.hardTotal) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Metric 2: Current Streak */}
        <div className="p-6 rounded-xl bg-[#18181B] border border-[#27272A] hover:border-[#3F3F46] transition-all flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Flame className="w-5 h-5 fill-amber-400" />
              </div>
              <div>
                <span className="text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider">
                  Current Streak
                </span>
                <p className="text-2xl font-black text-[#FAFAFA] tracking-tight">
                  {stats.currentStreak} Days
                </p>
              </div>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
              On Fire
            </span>
          </div>

          <div className="space-y-3 pt-2 border-t border-[#27272A]">
            <div className="flex items-center justify-between text-xs text-[#A1A1AA]">
              <span>Personal Best:</span>
              <span className="font-semibold text-[#FAFAFA]">{stats.bestStreak} Days</span>
            </div>
            <div className="flex items-center justify-between text-xs text-[#A1A1AA]">
              <span>Today's Target:</span>
              <span className="font-semibold text-[#FAFAFA]">
                {stats.solvedToday} / {stats.dailyGoal} Solved
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-[#09090B] border border-[#27272A] flex items-center gap-2">
              <Target className="w-4 h-4 text-[#6366F1]" />
              <p className="text-[11px] text-[#A1A1AA]">
                Consistency beats intensity. Keep the chain unbroken!
              </p>
            </div>
          </div>
        </div>

        {/* Metric 3: Active Sheet Progress */}
        <div className="p-6 rounded-xl bg-[#18181B] border border-[#27272A] hover:border-[#3F3F46] transition-all flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-lg bg-[#6366F1]/10 border border-[#6366F1]/20 flex items-center justify-center text-[#6366F1]">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider">
                  Active Sheet
                </span>
                <p className="text-xl font-black text-[#FAFAFA] tracking-tight truncate max-w-[160px]">
                  {stats.activeSheetTitle}
                </p>
              </div>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#6366F1]/10 text-[#6366F1] border border-[#6366F1]/20">
              {stats.activeSheetProgress}%
            </span>
          </div>

          <div className="space-y-3 pt-2 border-t border-[#27272A]">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#A1A1AA]">Completed Questions</span>
              <span className="font-semibold text-[#FAFAFA]">
                {stats.activeSheetSolved} / {stats.activeSheetTotal}
              </span>
            </div>
            <div className="w-full h-2 bg-[#27272A] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#6366F1] to-[#10B981] rounded-full transition-all duration-500"
                style={{ width: `${stats.activeSheetProgress}%` }}
              />
            </div>
            <button
              onClick={() => navigate('/collections')}
              className="w-full py-2 rounded-lg bg-[#27272A] hover:bg-[#3F3F46] text-[#FAFAFA] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>Switch or Explore Sheets</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* "Continue Practicing" Table */}
      <div className="p-6 rounded-xl bg-[#18181B] border border-[#27272A] space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-[#FAFAFA] flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#6366F1]" />
              Continue Practicing
            </h2>
            <p className="text-xs text-[#A1A1AA]">
              Recommended high-frequency problems queued up for your active study session
            </p>
          </div>
          <button
            onClick={() => navigate('/library')}
            className="text-xs font-semibold text-[#6366F1] hover:text-[#818CF8] flex items-center gap-1 transition-colors"
          >
            <span>View All Problems</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-lg border border-[#27272A]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#09090B] border-b border-[#27272A] text-[11px] font-semibold text-[#71717A] uppercase tracking-wider">
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Problem Name</th>
                <th className="py-3 px-4">Topic</th>
                <th className="py-3 px-4">Difficulty</th>
                <th className="py-3 px-4">Platform</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#27272A] text-xs">
              {continuePracticingQuestions.map((q) => (
                <tr key={q.id} className="hover:bg-[#27272A]/30 transition-colors group">
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <button
                      onClick={() => toggleStatus(q.id)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all border ${
                        q.status === 'Solved'
                          ? 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/30'
                          : q.status === 'Attempted'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          : 'bg-[#27272A] text-[#A1A1AA] border-[#3F3F46] hover:border-[#6366F1]'
                      }`}
                      title="Click to cycle status"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{q.status}</span>
                    </button>
                  </td>

                  <td className="py-3.5 px-4 font-medium text-[#FAFAFA]">
                    <div className="flex items-center gap-2">
                      <span className="text-[#71717A] font-mono text-[11px]">
                        #{q.number}
                      </span>
                      <a
                        href={q.problemUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:text-[#6366F1] transition-colors"
                      >
                        {q.title}
                      </a>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap text-[#A1A1AA]">
                    <span className="px-2 py-0.5 rounded bg-[#27272A] text-[11px] font-medium text-[#FAFAFA]">
                      {q.topic}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${getDifficultyBadge(
                        q.difficulty
                      )}`}
                    >
                      {q.difficulty}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap text-[#A1A1AA]">
                    {q.platform}
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => toggleBookmark(q.id)}
                        className={`p-1.5 rounded-md transition-colors ${
                          q.bookmarked
                            ? 'text-amber-400 bg-amber-500/10'
                            : 'text-[#71717A] hover:text-[#FAFAFA] hover:bg-[#27272A]'
                        }`}
                        title={q.bookmarked ? 'Bookmarked' : 'Add to bookmarks'}
                      >
                        <Bookmark
                          className={`w-4 h-4 ${q.bookmarked ? 'fill-amber-400' : ''}`}
                        />
                      </button>
                      <a
                        href={q.problemUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-md text-[#6366F1] hover:bg-[#6366F1]/15 transition-colors"
                        title="Open on LeetCode"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
