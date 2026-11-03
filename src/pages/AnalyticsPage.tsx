import React, { useState, useMemo } from 'react';
import { useOutletContext, NavLink } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  CartesianGrid,
  AreaChart,
  Area,
} from 'recharts';
import {
  CheckCircle2,
  Clock,
  Circle,
  Flame,
  Sparkles,
  Layers,
  ArrowRight,
  AlertCircle,
  Upload,
} from 'lucide-react';
import { useCodeTrack } from '../hooks/useCodeTrack';
import type { Question } from '../types';
import { Button } from '../components/ui/Button';
import { ProgressBar } from '../components/ui/ProgressBar';
import { SheetImportModal } from '../components/ui/SheetImportModal';

export const AnalyticsPage: React.FC = () => {
  const { openDrawer } = useOutletContext<{ openDrawer: (q: Question) => void }>();
  const {
    stats,
    progress,
    topicStats,
    sheetStats,
    activityMap,
    questions,
  } = useCodeTrack();

  const [timeWindowDays, setTimeWindowDays] = useState<14 | 30>(14);
  const [topicSortBy, setTopicSortBy] = useState<'weakest' | 'strongest' | 'curriculum'>('weakest');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [targetImportSheet, setTargetImportSheet] = useState('love-babbar-450');

  // ================= 1. DIFFICULTY ANALYSIS =================
  const difficultyAnalysis = useMemo(() => {
    const diffs: Record<'Easy' | 'Medium' | 'Hard', { total: number; solved: number; attempted: number }> = {
      Easy: { total: 0, solved: 0, attempted: 0 },
      Medium: { total: 0, solved: 0, attempted: 0 },
      Hard: { total: 0, solved: 0, attempted: 0 },
    };

    questions.forEach((q) => {
      const d = q.difficulty;
      if (diffs[d]) {
        diffs[d].total++;
        const s = progress[q.id]?.status;
        if (s === 'Solved') diffs[d].solved++;
        else if (s === 'Attempted') diffs[d].attempted++;
      }
    });

    return (['Easy', 'Medium', 'Hard'] as const).map((level) => {
      const data = diffs[level];
      const pct = data.total > 0 ? Math.round((data.solved / data.total) * 100) : 0;
      return {
        level,
        total: data.total,
        solved: data.solved,
        attempted: data.attempted,
        percentage: pct,
      };
    });
  }, [questions, progress]);

  // ================= 2. TOPIC PROGRESS CHART DATA =================
  const sortedTopics = useMemo(() => {
    const cloned = [...topicStats];
    if (topicSortBy === 'weakest') {
      return cloned.sort((a, b) => a.percentage - b.percentage);
    }
    if (topicSortBy === 'strongest') {
      return cloned.sort((a, b) => b.percentage - a.percentage);
    }
    return cloned; // curriculum order
  }, [topicStats, topicSortBy]);

  const topicChartData = useMemo(() => {
    return sortedTopics.map((t) => ({
      name: t.topic.name,
      percentage: t.percentage,
      solved: t.solved,
      total: t.total,
      remaining: t.remaining,
    }));
  }, [sortedTopics]);

  // ================= 3. DAILY ACTIVITY TIMELINE =================
  const dailyTimelineData = useMemo(() => {
    const result = [];
    for (let i = timeWindowDays - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateKey = `${y}-${m}-${day}`;
      const shortLabel = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      const record = activityMap[dateKey];
      const solved = record?.questionsSolved || 0;
      const revisions = record?.revisionsCompleted || 0;

      result.push({
        date: dateKey,
        label: shortLabel,
        solved,
        revisions,
        total: solved + revisions,
      });
    }
    return result;
  }, [activityMap, timeWindowDays]);

  const totalPeriodSolved = useMemo(() => {
    return dailyTimelineData.reduce((acc, curr) => acc + curr.solved, 0);
  }, [dailyTimelineData]);

  // ================= 4. RECOMMENDED NEXT TOPIC & PROBLEM =================
  const recommendation = useMemo(() => {
    // Find the unfinished topic with the lowest non-100% completion rate that has available problems
    const unfinishedTopics = topicStats
      .filter((t) => t.total > 0 && t.percentage < 100 && t.remaining > 0)
      .sort((a, b) => a.percentage - b.percentage);

    if (unfinishedTopics.length === 0) {
      return null;
    }

    const priorityTopic = unfinishedTopics[0];
    const candidateQuestion = questions.find(
      (q) =>
        q.topicId === priorityTopic.topic.id &&
        (!progress[q.id] || progress[q.id].status === 'Not Started')
    );

    return {
      topic: priorityTopic.topic,
      percentage: priorityTopic.percentage,
      remaining: priorityTopic.remaining,
      question: candidateQuestion || null,
    };
  }, [topicStats, questions, progress]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono uppercase tracking-wider text-muted font-medium">
              Performance Telemetry
            </span>
            <span className="text-muted">·</span>
            <span className="text-xs text-muted font-mono">
              Live Verified Analytics ({questions.length} unique questions)
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-primary">Analytics & Insights</h1>
          <p className="text-sm text-secondary mt-0.5">
            Real data calculations derived strictly from your question logs, verified DSA curriculums, and revision sessions.
          </p>
        </div>
      </div>

      {/* ================= SECTION 1: OVERALL PROGRESS CARDS ================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Total Unique */}
        <div className="p-4 rounded-xl bg-card border border-border shadow-xs">
          <div className="flex items-center justify-between text-xs text-secondary mb-1">
            <span>Unique Questions</span>
            <Layers className="w-4 h-4 text-secondary" />
          </div>
          <div className="text-2xl font-bold font-mono text-primary">{stats.totalQuestions}</div>
          <p className="text-[11px] text-secondary mt-1 font-mono">Canonical question pool</p>
        </div>

        {/* Total Solved */}
        <div className="p-4 rounded-xl bg-card border border-border shadow-xs">
          <div className="flex items-center justify-between text-xs text-secondary mb-1">
            <span>Questions Solved</span>
            <CheckCircle2 className="w-4 h-4 text-status-success" />
          </div>
          <div className="text-2xl font-bold font-mono text-status-success">{stats.solvedCount}</div>
          <div className="mt-2">
            <ProgressBar value={stats.completionPercentage} showText />
          </div>
        </div>

        {/* Attempted */}
        <div className="p-4 rounded-xl bg-card border border-border shadow-xs">
          <div className="flex items-center justify-between text-xs text-secondary mb-1">
            <span>In Progress</span>
            <Clock className="w-4 h-4 text-accent-yellow" />
          </div>
          <div className="text-2xl font-bold font-mono text-accent-yellow">{stats.attemptedCount}</div>
          <p className="text-[11px] text-secondary mt-1 font-mono">Active unfinished problems</p>
        </div>

        {/* Not Started */}
        <div className="p-4 rounded-xl bg-card border border-border shadow-xs">
          <div className="flex items-center justify-between text-xs text-secondary mb-1">
            <span>Not Started</span>
            <Circle className="w-4 h-4 text-secondary" />
          </div>
          <div className="text-2xl font-bold font-mono text-primary">{stats.unsolvedCount}</div>
          <p className="text-[11px] text-secondary mt-1 font-mono">Remaining to practice</p>
        </div>
      </div>

      {/* ================= SECTION 7: RECOMMENDED NEXT ACTION ================= */}
      {recommendation && (
        <div className="p-5 rounded-xl bg-card border border-accent-yellow/30 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded bg-accent-yellow/20 text-accent-yellow border border-accent-yellow/30">
                <Sparkles className="w-4 h-4" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-accent-yellow">
                Progress-Based Recommendation
              </span>
            </div>
            <h3 className="text-base font-bold text-primary">
              Focus Area: {recommendation.topic.name} ({recommendation.percentage}% complete)
            </h3>
            <p className="text-xs text-secondary max-w-xl">
              This topic currently has the lowest completion rate with {recommendation.remaining} unsolved problems.
              Strengthening this area will build balanced coverage across technical interview patterns.
            </p>
            <p className="text-[10px] text-muted font-mono pt-0.5">
              * Progress-based recommendation calculated strictly from your unfinished curriculum status.
            </p>
          </div>

          {recommendation.question && (
            <div className="shrink-0">
              <Button
                variant="primary"
                onClick={() => openDrawer(recommendation.question!)}
                icon={<ArrowRight className="w-4 h-4" />}
                className="text-xs"
              >
                Solve Next: {recommendation.question.title}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* ================= SECTION 2: TOPIC-WISE PROGRESS (Horizontal Bar Chart) ================= */}
      <div className="p-5 rounded-xl bg-card border border-border shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-primary">Curriculum Completion Across 19 DSA Topics</h3>
            <p className="text-xs text-secondary mt-0.5">
              Identify strengths and weak spots across your data structure and algorithm topics.
            </p>
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-muted text-[11px] font-mono">Sort by:</span>
            <div className="inline-flex rounded-lg border border-border p-0.5 bg-sidebar">
              <button
                onClick={() => setTopicSortBy('weakest')}
                className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
                  topicSortBy === 'weakest'
                    ? 'bg-card text-accent-yellow font-bold shadow-xs'
                    : 'text-secondary hover:text-primary'
                }`}
              >
                Lowest Completion
              </button>
              <button
                onClick={() => setTopicSortBy('strongest')}
                className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
                  topicSortBy === 'strongest'
                    ? 'bg-card text-status-success font-bold shadow-xs'
                    : 'text-secondary hover:text-primary'
                }`}
              >
                Highest
              </button>
              <button
                onClick={() => setTopicSortBy('curriculum')}
                className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
                  topicSortBy === 'curriculum'
                    ? 'bg-card text-primary font-bold shadow-xs'
                    : 'text-secondary hover:text-primary'
                }`}
              >
                Curriculum Order
              </button>
            </div>
          </div>
        </div>

        {/* Recharts Horizontal Bar Chart */}
        <div className="h-96 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={topicChartData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#382343" />
              <XAxis
                type="number"
                domain={[0, 100]}
                unit="%"
                stroke="#C8B8D4"
                fontSize={11}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={130}
                stroke="#FFF8F0"
                fontSize={11}
                tickLine={false}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    return (
                      <div className="p-3 bg-sidebar border border-border rounded-lg shadow-xl text-xs space-y-1 font-mono">
                        <p className="font-bold text-primary font-sans">{d.name}</p>
                        <p className="text-status-success">Solved: {d.solved} / {d.total}</p>
                        <p className="text-accent-yellow">Completion: {d.percentage}%</p>
                        <p className="text-secondary">Remaining: {d.remaining}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="percentage" radius={[0, 4, 4, 0]} barSize={14}>
                {topicChartData.map((entry, index) => {
                  // Low: pink, Medium: yellow, High: success green
                  let fill = '#F04483';
                  if (entry.percentage >= 80) fill = '#70D6A3';
                  else if (entry.percentage >= 40) fill = '#FFD447';
                  return <Cell key={`cell-${index}`} fill={fill} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ================= SECTION 3: DIFFICULTY ANALYSIS & SECTION 5: CONSISTENCY ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Difficulty Breakdown (2 Cols on lg) */}
        <div className="lg:col-span-2 p-5 rounded-xl bg-card border border-border shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-primary">Difficulty Breakdown</h3>
              <p className="text-xs text-secondary mt-0.5">
                Distribution of solved questions strictly based on verified metadata.
              </p>
            </div>
            <span className="text-xs font-mono text-muted">LeetCode / GFG Standard</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {difficultyAnalysis.map((item) => {
              const colorClass =
                item.level === 'Easy'
                  ? 'text-status-success border-status-success/30 bg-status-success/10'
                  : item.level === 'Medium'
                  ? 'text-accent-yellow border-accent-yellow/30 bg-accent-yellow/10'
                  : 'text-accent-pink border-accent-pink/30 bg-accent-pink/10';

              const barColor =
                item.level === 'Easy'
                  ? 'bg-status-success'
                  : item.level === 'Medium'
                  ? 'bg-accent-yellow'
                  : 'bg-accent-pink';

              return (
                <div key={item.level} className="p-4 rounded-xl bg-sidebar/60 border border-border space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold font-mono border ${colorClass}`}>
                      {item.level}
                    </span>
                    <span className="text-xs font-mono font-bold text-primary">
                      {item.percentage}%
                    </span>
                  </div>

                  <div>
                    <div className="text-xl font-bold font-mono text-primary">
                      {item.solved} <span className="text-xs font-normal text-muted">/ {item.total}</span>
                    </div>
                    <div className="mt-2 w-full h-2 bg-card rounded-full overflow-hidden border border-border/50">
                      <div
                        className={`h-full ${barColor} rounded-full transition-all duration-500`}
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>

                  <p className="text-[11px] text-secondary font-mono">
                    {item.total - item.solved} remaining to solve
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 5: Consistency Telemetry */}
        <div className="p-5 rounded-xl bg-card border border-border shadow-md space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 rounded-lg bg-accent-pink/15 text-accent-pink border border-accent-pink/30">
                <Flame className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-primary">Consistency Telemetry</h3>
            </div>
            <p className="text-xs text-secondary leading-relaxed">
              Streaks are determined by local calendar day boundaries. A day counts towards your streak if at least 1 question is marked Solved or 1 spaced revision is completed.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <div className="p-3 rounded-lg bg-sidebar border border-border flex items-center justify-between">
              <span className="text-xs text-secondary font-medium">Current Active Streak</span>
              <span className="text-xl font-bold font-mono text-accent-pink">
                {stats.currentStreak} <span className="text-xs font-normal text-muted">days</span>
              </span>
            </div>

            <div className="p-3 rounded-lg bg-sidebar border border-border flex items-center justify-between">
              <span className="text-xs text-secondary font-medium">All-Time Longest Streak</span>
              <span className="text-xl font-bold font-mono text-accent-yellow">
                {stats.longestStreak} <span className="text-xs font-normal text-muted">days</span>
              </span>
            </div>
          </div>

          <div className="text-[11px] text-muted font-mono border-t border-border pt-2 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>Resets if no activity occurs for 2 consecutive days.</span>
          </div>
        </div>
      </div>

      {/* ================= SECTION 4: DAILY ACTIVITY (Real Historical Solves) ================= */}
      <div className="p-5 rounded-xl bg-card border border-border shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-primary">Daily Solves Timeline</h3>
            <p className="text-xs text-secondary mt-0.5">
              Verified daily problem solving and review volume over the chosen period.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-secondary">
              Period Total: <strong className="text-accent-yellow">{totalPeriodSolved}</strong> solves
            </span>
            <div className="inline-flex rounded-lg border border-border p-0.5 bg-sidebar">
              <button
                onClick={() => setTimeWindowDays(14)}
                className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
                  timeWindowDays === 14
                    ? 'bg-card text-accent-yellow font-bold shadow-xs'
                    : 'text-secondary hover:text-primary'
                }`}
              >
                Past 14 Days
              </button>
              <button
                onClick={() => setTimeWindowDays(30)}
                className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
                  timeWindowDays === 30
                    ? 'bg-card text-accent-yellow font-bold shadow-xs'
                    : 'text-secondary hover:text-primary'
                }`}
              >
                Past 30 Days
              </button>
            </div>
          </div>
        </div>

        {totalPeriodSolved === 0 ? (
          <div className="py-12 text-center text-secondary border border-dashed border-border rounded-lg bg-sidebar/40 p-6 space-y-2">
            <Clock className="w-8 h-8 mx-auto text-muted" />
            <p className="text-sm font-medium text-primary">No activity records logged in the past {timeWindowDays} days</p>
            <p className="text-xs text-secondary max-w-sm mx-auto">
              Historical activity is strictly drawn from your actual solving events. Mark a problem as solved today to begin your activity chart.
            </p>
          </div>
        ) : (
          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyTimelineData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="solvesGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FFD447" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#FFD447" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#382343" vertical={false} />
                <XAxis dataKey="label" stroke="#C8B8D4" fontSize={10} tickLine={false} />
                <YAxis stroke="#C8B8D4" fontSize={10} allowDecimals={false} tickLine={false} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="p-3 bg-sidebar border border-border rounded-lg shadow-xl text-xs space-y-1 font-mono">
                          <p className="font-bold text-primary font-sans">{d.label} ({d.date})</p>
                          <p className="text-accent-yellow">Questions Solved: {d.solved}</p>
                          <p className="text-accent-pink">Revisions Done: {d.revisions}</p>
                          <p className="text-primary font-bold">Total Actions: {d.total}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="solved"
                  stroke="#FFD447"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#solvesGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* ================= SECTION 6: COLLECTION-WISE PROGRESS COMPARISON ================= */}
      <div className="p-5 rounded-xl bg-card border border-border shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-primary">Cross-Collection Progress</h3>
            <p className="text-xs text-secondary mt-0.5">
              Comparison across the five core DSA sheets. Questions with shared canonical identity update across all sheets simultaneously.
            </p>
          </div>
          <span className="text-xs text-secondary font-mono">
            {sheetStats.filter((s) => s.isImported).length} of 5 Active
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {sheetStats.map((sheet) => {
            return (
              <div
                key={sheet.id}
                className={`p-4 rounded-xl border transition-all ${
                  sheet.isImported
                    ? 'bg-sidebar/80 border-border hover:border-accent-yellow/40'
                    : 'bg-sidebar/30 border-border/40 opacity-75'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-bold text-primary truncate">{sheet.name}</h4>
                  {sheet.isImported ? (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-status-success/15 text-status-success border border-status-success/30 font-semibold">
                      Active ({sheet.total})
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-card text-muted border border-border">
                      Not Imported
                    </span>
                  )}
                </div>

                <p className="text-xs text-secondary line-clamp-2 min-h-8">
                  {sheet.description}
                </p>

                {sheet.isImported ? (
                  <div className="mt-3 pt-3 border-t border-border/60 space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-secondary">{sheet.solved} / {sheet.total} solved</span>
                      <span className="text-accent-yellow font-bold">{sheet.percentage}%</span>
                    </div>
                    <ProgressBar value={sheet.percentage} />
                    <NavLink
                      to={`/questions?sheet=${sheet.id}`}
                      className="inline-flex items-center gap-1 text-xs text-accent-yellow hover:underline pt-1 font-medium"
                    >
                      <span>Open in Question Workspace</span>
                      <ArrowRight className="w-3 h-3" />
                    </NavLink>
                  </div>
                ) : (
                  <div className="mt-3 pt-3 border-t border-border/60">
                    <button
                      onClick={() => {
                        setTargetImportSheet(sheet.id);
                        setIsImportModalOpen(true);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-accent-pink/15 text-accent-pink hover:bg-accent-pink/25 border border-accent-pink/30 transition-colors w-full justify-center"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      Import {sheet.name}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Sheet Import Modal */}
      <SheetImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        defaultSheetId={targetImportSheet}
      />
    </div>
  );
};
