import React, { useState, useMemo } from 'react';
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
  BookOpen,
  Bookmark,
  Check,
  Edit2,
  Trophy,
} from 'lucide-react';
import { useCodeTrack } from '../hooks/useCodeTrack';
import { useAnimatedCounter } from '../hooks/useAnimatedCounter';
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
    questions,
    updateStatus,
    toggleBookmark,
    updateDailyGoal,
  } = useCodeTrack();

  // Smooth animated counter numbers for statistics
  const animatedSolved = useAnimatedCounter(stats.solvedCount, 400);
  const animatedAttempted = useAnimatedCounter(stats.attemptedCount, 400);
  const animatedRemaining = useAnimatedCounter(stats.unsolvedCount, 400);
  const animatedStreak = useAnimatedCounter(stats.currentStreak, 400);
  const animatedTodaySolved = useAnimatedCounter(stats.todaySolvedCount, 400);

  // Micro-interaction states
  const [poppingQuestionId, setPoppingQuestionId] = useState<string | null>(null);
  const [poppingBookmarkId, setPoppingBookmarkId] = useState<string | null>(null);

  // Daily target custom editor state
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [customGoalInput, setCustomGoalInput] = useState(String(stats.dailyGoal || 3));

  // Find next question to solve (first uncompleted problem)
  const nextQuestionToSolve = useMemo(() => {
    return (
      questions.find((q) => !progress[q.id] || progress[q.id].status === 'Not Started') ||
      questions[0]
    );
  }, [questions, progress]);

  // Recently attempted or solved questions
  const recentQuestions = useMemo(() => {
    return Object.values(progress)
      .filter((p) => p.status === 'Solved' || p.status === 'Attempted')
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 6)
      .map((p) => questions.find((q) => q.id === p.questionId))
      .filter(Boolean) as Question[];
  }, [progress, questions]);

  // Prepare 12-week activity contribution grid (84 days)
  const activityDays = useMemo(() => {
    return Array.from({ length: 84 }).map((_, i) => {
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
  }, [activityMap]);

  const todayFormatted = useMemo(() => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }, []);

  const handleStatusCycle = (qId: string, currentStatus: string) => {
    setPoppingQuestionId(qId);
    setTimeout(() => setPoppingQuestionId(null), 300);
    const nextStatus =
      currentStatus === 'Not Started'
        ? 'Attempted'
        : currentStatus === 'Attempted'
        ? 'Solved'
        : 'Not Started';
    updateStatus(qId, nextStatus);
  };

  const handleBookmarkToggle = (qId: string) => {
    setPoppingBookmarkId(qId);
    setTimeout(() => setPoppingBookmarkId(null), 300);
    toggleBookmark(qId);
  };

  const handleSaveGoal = (targetNum?: number) => {
    const val = targetNum !== undefined ? targetNum : parseInt(customGoalInput, 10);
    if (!isNaN(val) && val >= 1 && val <= 50) {
      updateDailyGoal(val);
      setCustomGoalInput(String(val));
      setIsEditingGoal(false);
    }
  };

  const todayGoal = stats.dailyGoal || 3;
  const todayProgressPct = Math.min(100, Math.round((stats.todaySolvedCount / todayGoal) * 100));
  const remainingToday = Math.max(0, todayGoal - stats.todaySolvedCount);
  const isTargetAchieved = stats.todaySolvedCount >= todayGoal;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* ================= HEADER & WELCOME ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono uppercase tracking-wider text-muted font-medium">
              Workspace Overview
            </span>
            <span className="text-muted">·</span>
            <span className="text-xs text-muted font-mono">{todayFormatted}</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-primary">
            Welcome back, {settings.profileName || 'Engineer'}
          </h1>
          <p className="text-sm text-secondary mt-0.5">
            You've solved{' '}
            <span className="text-accent-yellow font-bold font-mono">
              {animatedSolved}
            </span>{' '}
            of{' '}
            <span className="text-primary font-semibold font-mono">{stats.totalQuestions}</span> unique
            DSA questions across your active curriculums.
          </p>
        </div>

        {nextQuestionToSolve && (
          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              onClick={() => openDrawer(nextQuestionToSolve)}
              icon={<Sparkles className="w-4 h-4" />}
              className="shadow-md"
            >
              Continue: {nextQuestionToSolve.title}
            </Button>
          </div>
        )}
      </div>

      {/* ================= REVISION ALERT BANNER (If Due) ================= */}
      {(stats.dueTodayRevisionsCount > 0 || stats.overdueRevisionsCount > 0) && (
        <div className="p-4 rounded-xl border border-accent-yellow/30 bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-accent-yellow/15 text-accent-yellow border border-accent-yellow/30 shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-primary">
                Spaced Repetition: {stats.dueTodayRevisionsCount} Due Today, {stats.overdueRevisionsCount} Overdue
              </h4>
              <p className="text-xs text-secondary mt-0.5">
                Reviewing questions at calculated intervals builds long-term recall for technical interviews.
              </p>
            </div>
          </div>
          <NavLink
            to="/revisions"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-accent-pink text-white hover:bg-accent-pink/90 transition-all duration-150 shrink-0 shadow-xs"
          >
            <span>Start Revision</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </NavLink>
        </div>
      )}

      {/* ================= SECTION A: DAILY CODING TARGET HERO ================= */}
      <div className="p-6 rounded-xl bg-card border border-border shadow-lg relative overflow-hidden">
        {/* Ambient background highlight */}
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-accent-yellow/5 blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Left: Progress info & calculation */}
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-accent-yellow/15 text-accent-yellow border border-accent-yellow/30">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-accent-yellow">
                  Daily Coding Target
                </span>
                <h2 className="text-xl font-bold text-primary">
                  {animatedTodaySolved} / {todayGoal} questions completed
                </h2>
              </div>
            </div>

            {/* Clear Target Achieved State or Remaining Info */}
            {isTargetAchieved ? (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-status-success/15 border border-status-success/30 text-status-success text-xs font-medium w-fit">
                <Trophy className="w-4 h-4 shrink-0 text-accent-yellow" />
                <span>Target achieved for today! Great dedication.</span>
              </div>
            ) : (
              <p className="text-xs text-secondary">
                <strong className="text-accent-yellow font-semibold">{todayProgressPct}%</strong> of today's target
                completed · <span className="text-primary font-medium">{remainingToday}</span> {remainingToday === 1 ? 'question' : 'questions'} remaining.
              </p>
            )}

            {/* Progress bar */}
            <div className="pt-1 max-w-xl">
              <ProgressBar value={todayProgressPct} />
            </div>
          </div>

          {/* Right: Interactive Goal Setter */}
          <div className="p-4 rounded-lg bg-sidebar/80 border border-border/70 flex flex-col justify-between shrink-0 min-w-[260px]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-secondary uppercase tracking-wider">
                Target Questions / Day
              </span>
              <button
                onClick={() => setIsEditingGoal(!isEditingGoal)}
                className="text-xs text-accent-yellow hover:underline flex items-center gap-1 font-medium"
              >
                <Edit2 className="w-3 h-3" />
                {isEditingGoal ? 'Cancel' : 'Change'}
              </button>
            </div>

            {isEditingGoal ? (
              <div className="space-y-2.5 pt-1">
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={customGoalInput}
                    onChange={(e) => setCustomGoalInput(e.target.value)}
                    className="w-20 px-2.5 py-1.5 text-sm font-mono font-bold bg-card border border-border rounded text-primary text-center focus:outline-hidden focus:border-accent-yellow"
                  />
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => handleSaveGoal()}
                    className="text-xs"
                  >
                    <Check className="w-3.5 h-3.5 mr-1" />
                    Save Goal
                  </Button>
                </div>
                <div className="flex items-center gap-1.5 pt-1">
                  {[1, 3, 5, 10].map((num) => (
                    <button
                      key={num}
                      onClick={() => handleSaveGoal(num)}
                      className="px-2 py-1 text-xs rounded border border-border bg-card hover:border-accent-yellow text-secondary hover:text-primary transition-colors font-mono"
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between pt-1">
                <span className="text-2xl font-bold font-mono text-accent-yellow">
                  {todayGoal} <span className="text-xs font-normal text-secondary">problems/day</span>
                </span>
                <div className="flex items-center gap-1">
                  {[1, 3, 5].map((preset) => (
                    <button
                      key={preset}
                      onClick={() => handleSaveGoal(preset)}
                      className={`px-2 py-0.5 text-xs rounded border font-mono transition-colors ${
                        todayGoal === preset
                          ? 'bg-accent-yellow text-neutral-900 font-bold border-accent-yellow'
                          : 'border-border text-secondary hover:text-primary bg-card/60'
                      }`}
                      title={`Set target to ${preset}`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ================= SECTION B: FIVE CORE OVERVIEW STATISTIC CARDS ================= */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Total Questions Available */}
        <div className="p-4 rounded-xl bg-card border border-border shadow-xs flex flex-col justify-between hover:border-accent-yellow/40 transition-all">
          <div className="flex items-center justify-between text-xs text-secondary mb-2">
            <span>Problem Bank</span>
            <BookOpen className="w-4 h-4 text-secondary" />
          </div>
          <div>
            <div className="text-2xl font-bold font-mono text-primary">
              {stats.totalQuestions}
            </div>
            <p className="text-[11px] text-secondary mt-1 font-mono">
              Unique canonical DSA problems
            </p>
          </div>
        </div>

        {/* Total Solved */}
        <div className="p-4 rounded-xl bg-card border border-border shadow-xs flex flex-col justify-between hover:border-status-success/40 transition-all">
          <div className="flex items-center justify-between text-xs text-secondary mb-2">
            <span>Total Solved</span>
            <CheckCircle2 className="w-4 h-4 text-status-success" />
          </div>
          <div>
            <div className="text-2xl font-bold font-mono text-status-success">
              {animatedSolved}
            </div>
            <div className="mt-2">
              <ProgressBar value={stats.completionPercentage} showText />
            </div>
          </div>
        </div>

        {/* Attempted */}
        <div className="p-4 rounded-xl bg-card border border-border shadow-xs flex flex-col justify-between hover:border-accent-yellow/40 transition-all">
          <div className="flex items-center justify-between text-xs text-secondary mb-2">
            <span>Attempted</span>
            <Clock className="w-4 h-4 text-accent-yellow" />
          </div>
          <div>
            <div className="text-2xl font-bold font-mono text-accent-yellow">
              {animatedAttempted}
            </div>
            <p className="text-[11px] text-secondary mt-1 font-mono">
              In-progress solutions
            </p>
          </div>
        </div>

        {/* Questions Remaining */}
        <div className="p-4 rounded-xl bg-card border border-border shadow-xs flex flex-col justify-between hover:border-accent-pink/40 transition-all">
          <div className="flex items-center justify-between text-xs text-secondary mb-2">
            <span>Remaining</span>
            <Circle className="w-4 h-4 text-secondary" />
          </div>
          <div>
            <div className="text-2xl font-bold font-mono text-primary">
              {animatedRemaining}
            </div>
            <p className="text-[11px] text-secondary mt-1 font-mono">
              Unattempted problems
            </p>
          </div>
        </div>

        {/* Streak */}
        <div className="p-4 rounded-xl bg-card border border-border shadow-xs flex flex-col justify-between hover:border-accent-pink/40 transition-all col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-xs text-secondary mb-2">
            <span>Current Streak</span>
            <Flame className="w-4 h-4 text-accent-pink" />
          </div>
          <div>
            <div className="text-2xl font-bold font-mono text-accent-pink">
              {animatedStreak} <span className="text-xs font-normal text-secondary">days</span>
            </div>
            <p className="text-[11px] text-secondary mt-1 font-mono">
              Best streak: {stats.longestStreak} days
            </p>
          </div>
        </div>
      </div>

      {/* ================= SECTION C: QUICK ACTION SHORTCUTS ================= */}
      <div className="p-4 rounded-xl bg-card border border-border shadow-xs flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-secondary">
          Quick Actions:
        </span>
        <div className="flex flex-wrap items-center gap-2">
          {nextQuestionToSolve && (
            <Button
              size="sm"
              variant="primary"
              onClick={() => openDrawer(nextQuestionToSolve)}
              className="text-xs flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Continue Solving
            </Button>
          )}

          <NavLink to="/bookmarks">
            <Button size="sm" variant="secondary" className="text-xs flex items-center gap-1.5">
              <Bookmark className="w-3.5 h-3.5 text-accent-yellow" />
              Bookmarks ({bookmarks.length})
            </Button>
          </NavLink>

          <NavLink to="/revisions">
            <Button size="sm" variant="secondary" className="text-xs flex items-center gap-1.5">
              <RotateCcw className="w-3.5 h-3.5 text-accent-pink" />
              Revisions ({stats.dueTodayRevisionsCount + stats.overdueRevisionsCount})
            </Button>
          </NavLink>

          <NavLink to="/questions">
            <Button size="sm" variant="secondary" className="text-xs flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" />
              Browse All ({stats.totalQuestions})
            </Button>
          </NavLink>

          <Button
            size="sm"
            variant="secondary"
            onClick={() => setIsEditingGoal(true)}
            className="text-xs flex items-center gap-1.5"
          >
            <Target className="w-3.5 h-3.5 text-accent-yellow" />
            Set Daily Goal
          </Button>
        </div>
      </div>

      {/* ================= 12-WEEK ACTIVITY CONTRIBUTION MATRIX ================= */}
      <div className="p-5 rounded-xl bg-card border border-border shadow-md space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">
              Activity Consistency (Past 12 Weeks)
            </span>
            <span className="text-[11px] font-mono text-secondary hidden md:inline">
              · Daily solves & spaced repetition reviews
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-secondary font-mono">
            <span>Less</span>
            <span className="w-2.5 h-2.5 rounded-xs bg-sidebar border border-border" />
            <span className="w-2.5 h-2.5 rounded-xs bg-accent-yellow/30 border border-accent-yellow/40" />
            <span className="w-2.5 h-2.5 rounded-xs bg-accent-yellow/70" />
            <span className="w-2.5 h-2.5 rounded-xs bg-accent-yellow" />
            <span>More</span>
          </div>
        </div>

        {/* Heatmap Grid */}
        <div className="overflow-x-auto pb-1">
          <div className="inline-grid grid-rows-7 grid-flow-col gap-1">
            {activityDays.map((day) => {
              let color = 'bg-sidebar border border-border/50';
              if (day.total >= 5) color = 'bg-accent-yellow text-neutral-900';
              else if (day.total >= 3) color = 'bg-accent-yellow/70';
              else if (day.total >= 1) color = 'bg-accent-yellow/30 border border-accent-yellow/40';

              return (
                <div
                  key={day.dateStr}
                  title={`${day.dateStr}: ${day.total} activities recorded`}
                  className={`w-3 h-3 rounded-xs ${color} transition-all duration-150 hover:scale-125 cursor-pointer`}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* ================= SECTION D: RECENT ACTIVITY ================= */}
      <div className="p-5 rounded-xl bg-card border border-border shadow-md space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-primary">Recently Worked On Questions</h3>
            <span className="text-xs text-secondary font-mono">
              ({recentQuestions.length} recent)
            </span>
          </div>
          <NavLink
            to="/questions"
            className="text-xs font-semibold text-accent-yellow hover:underline inline-flex items-center gap-1 group"
          >
            <span>View all questions</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform duration-150 group-hover:translate-x-0.5" />
          </NavLink>
        </div>

        {recentQuestions.length === 0 ? (
          <div className="py-12 text-center text-secondary border border-dashed border-border rounded-lg bg-sidebar/40 p-6 space-y-3">
            <BookOpen className="w-8 h-8 mx-auto text-muted" />
            <p className="text-sm font-medium text-primary">No questions solved or attempted yet</p>
            <p className="text-xs text-secondary max-w-sm mx-auto">
              Start working on questions from Striver A2Z or NeetCode to build your coding momentum and track your daily targets.
            </p>
            <NavLink to="/questions">
              <Button size="sm" variant="primary" className="mt-2 text-xs">
                Explore Question Catalog
              </Button>
            </NavLink>
          </div>
        ) : (
          <div className="divide-y divide-border border border-border rounded-lg overflow-hidden bg-sidebar/50">
            {recentQuestions.map((q) => {
              const currentStatus = progress[q.id]?.status || 'Not Started';
              const isBookmarked = bookmarks.includes(q.id);
              const isPoppingCheck = poppingQuestionId === q.id;
              const isPoppingStar = poppingBookmarkId === q.id;

              return (
                <div
                  key={q.id}
                  className="flex items-center justify-between p-3.5 hover:bg-card/70 transition-colors duration-150"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Status Cycler Button with Micro-pop */}
                    <button
                      onClick={() => handleStatusCycle(q.id, currentStatus)}
                      className={`p-1 hover:bg-card rounded-md transition-transform duration-150 shrink-0 cursor-pointer ${
                        isPoppingCheck ? 'scale-125' : 'active:scale-90'
                      }`}
                      title="Click to cycle status (Not Started -> Attempted -> Solved)"
                    >
                      {currentStatus === 'Solved' ? (
                        <CheckCircle2 className="w-4 h-4 text-status-success" />
                      ) : currentStatus === 'Attempted' ? (
                        <Clock className="w-4 h-4 text-accent-yellow" />
                      ) : (
                        <Circle className="w-4 h-4 text-muted" />
                      )}
                    </button>

                    <div className="min-w-0">
                      <button
                        onClick={() => openDrawer(q)}
                        className="text-sm font-semibold text-primary hover:text-accent-yellow transition-colors truncate block text-left cursor-pointer"
                      >
                        {q.title}
                      </button>
                      <div className="flex items-center gap-2 text-xs text-secondary mt-0.5">
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
                      onClick={() => handleBookmarkToggle(q.id)}
                      className={`p-1.5 rounded-md hover:bg-card transition-transform duration-150 cursor-pointer ${
                        isBookmarked ? 'text-accent-yellow' : 'text-muted hover:text-secondary'
                      } ${isPoppingStar ? 'scale-125' : 'active:scale-110'}`}
                      title={isBookmarked ? 'Remove bookmark' : 'Bookmark problem'}
                    >
                      <Star className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
                    </button>

                    <a
                      href={q.problemUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 text-secondary hover:text-primary rounded-md hover:bg-card transition-colors duration-150"
                      title="Open official problem link"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>

                    <Button size="sm" variant="ghost" onClick={() => openDrawer(q)} className="text-xs">
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
