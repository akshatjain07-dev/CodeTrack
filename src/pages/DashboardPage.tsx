import React from 'react';
import { useOutletContext, NavLink } from 'react-router-dom';
import {
  CheckCircle2,
  Clock,
  Circle,
  Flame,
  ArrowRight,
  RotateCcw,
  Star,
  ExternalLink,
  Target,
  Sparkles,
} from 'lucide-react';
import { useCodeTrack } from '../hooks/useCodeTrack';
import { QUESTIONS } from '../data/questionsData';
import type { Question } from '../types';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { ProgressBar } from '../components/ui/ProgressBar';

export const DashboardPage: React.FC = () => {
  const { openDrawer } = useOutletContext<{ openDrawer: (q: Question) => void }>();
  const {
    stats,
    progress,
    bookmarks,
    activityMap,
    settings,
    updateStatus,
    toggleBookmark,
  } = useCodeTrack();

  // Find next question to solve (first uncompleted problem)
  const nextQuestionToSolve = QUESTIONS.find((q) => !progress[q.id] || progress[q.id].status === 'Not Started') || QUESTIONS[0];

  // Recently attempted or solved questions
  const recentQuestions = Object.values(progress)
    .filter((p) => p.status === 'Solved' || p.status === 'Attempted')
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5)
    .map((p) => QUESTIONS.find((q) => q.id === p.questionId))
    .filter(Boolean) as Question[];

  // Prepare 12-week activity grid (84 days)
  const activityDays = Array.from({ length: 84 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (83 - i));
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    const record = activityMap[dateStr];
    const total = (record?.questionsSolved || 0) + (record?.revisionsCompleted || 0);
    return { dateStr, total };
  });

  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="space-y-6">
      {/* ================= HEADER & WELCOME ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-800/60">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono uppercase tracking-wider text-sky-400 font-semibold">
              Workspace Overview
            </span>
            <span className="text-zinc-600">·</span>
            <span className="text-xs text-zinc-500 font-mono">{todayFormatted}</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">
            Welcome back, {settings.profileName || 'Engineer'}
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            You've solved{' '}
            <span className="text-emerald-400 font-medium font-mono">
              {stats.solvedCount}
            </span>{' '}
            of{' '}
            <span className="text-zinc-200 font-mono">{stats.totalQuestions}</span> questions.
            Keep the momentum going!
          </p>
        </div>

        {nextQuestionToSolve && (
          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              onClick={() => openDrawer(nextQuestionToSolve)}
              icon={<Sparkles className="w-3.5 h-3.5" />}
            >
              Continue: {nextQuestionToSolve.title}
            </Button>
          </div>
        )}
      </div>

      {/* ================= REVISION ALERT BANNER (If Due) ================= */}
      {(stats.dueTodayRevisionsCount > 0 || stats.overdueRevisionsCount > 0) && (
        <div className="p-3.5 rounded-lg border border-amber-800/50 bg-amber-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-md bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <RotateCcw className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-amber-200">
                Spaced Repetition: {stats.dueTodayRevisionsCount} Due Today, {stats.overdueRevisionsCount} Overdue
              </h4>
              <p className="text-xs text-amber-300/80">
                Reviewing questions at timed intervals strengthens retention before interviews.
              </p>
            </div>
          </div>
          <NavLink
            to="/revisions"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium bg-amber-500 text-zinc-950 hover:bg-amber-400 transition-colors shrink-0 font-semibold"
          >
            Start Revision
            <ArrowRight className="w-3 h-3" />
          </NavLink>
        </div>
      )}

      {/* ================= METRIC CARDS (High-density, restrained) ================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Total Solved */}
        <div className="p-4 rounded-lg bg-zinc-900/60 border border-zinc-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
            <span>Total Solved</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <div className="text-2xl font-bold font-mono text-zinc-100">
              {stats.solvedCount}
              <span className="text-xs font-normal text-zinc-500 ml-1">/ {stats.totalQuestions}</span>
            </div>
            <div className="mt-2">
              <ProgressBar value={stats.completionPercentage} color="bg-emerald-500" showText />
            </div>
          </div>
        </div>

        {/* Attempted */}
        <div className="p-4 rounded-lg bg-zinc-900/60 border border-zinc-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
            <span>In Progress</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <div className="text-2xl font-bold font-mono text-zinc-100">
              {stats.attemptedCount}
              <span className="text-xs font-normal text-zinc-500 ml-1">problems</span>
            </div>
            <p className="text-[11px] text-zinc-500 mt-2 font-mono">
              {stats.unsolvedCount} remaining to attempt
            </p>
          </div>
        </div>

        {/* Daily Goal */}
        <div className="p-4 rounded-lg bg-zinc-900/60 border border-zinc-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
            <span>Today's Target</span>
            <Target className="w-4 h-4 text-sky-400" />
          </div>
          <div>
            <div className="text-2xl font-bold font-mono text-zinc-100">
              {stats.todaySolvedCount}
              <span className="text-xs font-normal text-zinc-500 ml-1">/ {stats.dailyGoal}</span>
            </div>
            <div className="mt-2">
              <ProgressBar
                value={(stats.todaySolvedCount / stats.dailyGoal) * 100}
                color="bg-sky-500"
                showText
              />
            </div>
          </div>
        </div>

        {/* Streak */}
        <div className="p-4 rounded-lg bg-zinc-900/60 border border-zinc-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
            <span>Activity Streak</span>
            <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
          </div>
          <div>
            <div className="text-2xl font-bold font-mono text-zinc-100">
              {stats.currentStreak}
              <span className="text-xs font-normal text-zinc-500 ml-1">days active</span>
            </div>
            <p className="text-[11px] text-zinc-500 mt-2 font-mono">
              Best: {stats.longestStreak} days
            </p>
          </div>
        </div>
      </div>

      {/* ================= 12-WEEK ACTIVITY CONTRIBUTION MATRIX ================= */}
      <div className="p-5 rounded-lg bg-zinc-900/60 border border-zinc-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
              Activity Consistency (Past 12 Weeks)
            </span>
            <span className="text-[11px] font-mono text-zinc-500">
              · Recorded from daily problem solves & revisions
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 font-mono">
            <span>Less</span>
            <span className="w-2.5 h-2.5 rounded-xs bg-zinc-800" />
            <span className="w-2.5 h-2.5 rounded-xs bg-sky-950 border border-sky-800/50" />
            <span className="w-2.5 h-2.5 rounded-xs bg-sky-700" />
            <span className="w-2.5 h-2.5 rounded-xs bg-sky-400" />
            <span>More</span>
          </div>
        </div>

        {/* Heatmap Grid */}
        <div className="overflow-x-auto pb-1">
          <div className="inline-grid grid-rows-7 grid-flow-col gap-1">
            {activityDays.map((day) => {
              let color = 'bg-zinc-800/60';
              if (day.total >= 5) color = 'bg-sky-400';
              else if (day.total >= 3) color = 'bg-sky-600';
              else if (day.total >= 1) color = 'bg-sky-900/80 border border-sky-700/60';

              return (
                <div
                  key={day.dateStr}
                  title={`${day.dateStr}: ${day.total} activities recorded`}
                  className={`w-3 h-3 rounded-xs ${color} transition-transform hover:scale-125 cursor-pointer`}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* ================= RECENTLY WORKED ON TABLE ================= */}
      <div className="p-5 rounded-lg bg-zinc-900/60 border border-zinc-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-zinc-200">Recently Updated Questions</h3>
          <NavLink
            to="/questions"
            className="text-xs font-medium text-sky-400 hover:text-sky-300 transition-colors inline-flex items-center gap-1"
          >
            View all {stats.totalQuestions} questions
            <ArrowRight className="w-3 h-3" />
          </NavLink>
        </div>

        {recentQuestions.length === 0 ? (
          <div className="py-8 text-center text-xs text-zinc-500">
            No recently worked on questions yet. Start solving from the question bank!
          </div>
        ) : (
          <div className="divide-y divide-zinc-800/70 border border-zinc-800/80 rounded-md overflow-hidden bg-zinc-950/40">
            {recentQuestions.map((q) => {
              const currentStatus = progress[q.id]?.status || 'Not Started';
              const isBookmarked = bookmarks.includes(q.id);

              return (
                <div
                  key={q.id}
                  className="flex items-center justify-between p-3.5 hover:bg-zinc-800/30 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Status Cycler Button */}
                    <button
                      onClick={() => {
                        const nextStatus =
                          currentStatus === 'Not Started'
                            ? 'Attempted'
                            : currentStatus === 'Attempted'
                            ? 'Solved'
                            : 'Not Started';
                        updateStatus(q.id, nextStatus);
                      }}
                      className="p-1 hover:bg-zinc-800 rounded transition-colors shrink-0"
                      title="Click to cycle status"
                    >
                      {currentStatus === 'Solved' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : currentStatus === 'Attempted' ? (
                        <Clock className="w-4 h-4 text-amber-400" />
                      ) : (
                        <Circle className="w-4 h-4 text-zinc-500" />
                      )}
                    </button>

                    <div className="min-w-0">
                      <button
                        onClick={() => openDrawer(q)}
                        className="text-sm font-medium text-zinc-200 hover:text-white transition-colors truncate block text-left"
                      >
                        {q.title}
                      </button>
                      <div className="flex items-center gap-2 text-xs text-zinc-500 mt-0.5">
                        <span className="font-mono">{q.topicName}</span>
                        <span>·</span>
                        <Badge variant="difficulty" difficulty={q.difficulty} />
                        <span>·</span>
                        <Badge variant="platform" platform={q.platform} />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => toggleBookmark(q.id)}
                      className={`p-1.5 rounded hover:bg-zinc-800 transition-colors ${
                        isBookmarked ? 'text-amber-400' : 'text-zinc-600 hover:text-zinc-400'
                      }`}
                    >
                      <Star className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-amber-400' : ''}`} />
                    </button>

                    <a
                      href={q.problemUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 text-zinc-500 hover:text-sky-400 rounded hover:bg-zinc-800 transition-colors"
                      title="Open external problem link"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>

                    <Button size="sm" variant="ghost" onClick={() => openDrawer(q)}>
                      Notes
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
