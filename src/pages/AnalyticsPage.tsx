import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from 'recharts';
import {
  TrendingUp,
  BarChart2,
  Flame,
  Target,
  CheckCircle2,
  Layers,
} from 'lucide-react';
import { useCodeTrack } from '../hooks/useCodeTrack';
import { QUESTIONS } from '../data/questionsData';
import { ProgressBar } from '../components/ui/ProgressBar';

export const AnalyticsPage: React.FC = () => {
  const { stats, topicStats, progress, activityMap } = useCodeTrack();

  // Difficulty Distribution
  const difficultyData = useMemo(() => {
    let easySolved = 0;
    let mediumSolved = 0;
    let hardSolved = 0;

    let easyTotal = 0;
    let mediumTotal = 0;
    let hardTotal = 0;

    QUESTIONS.forEach((q) => {
      const isSolved = progress[q.id]?.status === 'Solved';
      if (q.difficulty === 'Easy') {
        easyTotal++;
        if (isSolved) easySolved++;
      } else if (q.difficulty === 'Medium') {
        mediumTotal++;
        if (isSolved) mediumSolved++;
      } else if (q.difficulty === 'Hard') {
        hardTotal++;
        if (isSolved) hardSolved++;
      }
    });

    return [
      { name: 'Easy', solved: easySolved, total: easyTotal, color: '#10B981' },
      { name: 'Medium', solved: mediumSolved, total: mediumTotal, color: '#F59E0B' },
      { name: 'Hard', solved: hardSolved, total: hardTotal, color: '#EF4444' },
    ];
  }, [progress]);

  // Weekly solving velocity (last 7 recorded days)
  const activityTrendData = useMemo(() => {
    const dates = Object.keys(activityMap).sort().slice(-7);
    if (dates.length === 0) {
      return [
        { date: 'Today', solved: stats.todaySolvedCount, revisions: 0 },
      ];
    }
    return dates.map((d) => ({
      date: d.slice(5), // MM-DD
      solved: activityMap[d].questionsSolved,
      revisions: activityMap[d].revisionsCompleted,
    }));
  }, [activityMap, stats.todaySolvedCount]);

  // Status pie chart data
  const statusPieData = useMemo(() => {
    return [
      { name: 'Solved', value: stats.solvedCount, color: '#10B981' },
      { name: 'Attempted', value: stats.attemptedCount, color: '#F59E0B' },
      { name: 'Not Started', value: stats.unsolvedCount, color: '#374151' },
    ];
  }, [stats]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-800/60">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono uppercase tracking-wider text-sky-400 font-semibold">
              Performance Telemetry
            </span>
            <span className="text-zinc-600">·</span>
            <span className="text-xs text-zinc-500 font-mono">
              Live Verified Database Records
            </span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">Analytics & Insights</h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Real data calculations derived strictly from your question logs and revision sessions.
          </p>
        </div>
      </div>

      {/* KPI Summary Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-4 rounded-lg bg-zinc-900/60 border border-zinc-800">
          <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
            <span>Overall Completion</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-zinc-100">
            {stats.completionPercentage}%
          </div>
          <span className="text-[11px] text-zinc-500 font-mono">
            {stats.solvedCount} of {stats.totalQuestions} solved
          </span>
        </div>

        <div className="p-4 rounded-lg bg-zinc-900/60 border border-zinc-800">
          <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
            <span>Consistency Streak</span>
            <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-zinc-100">
            {stats.currentStreak} Days
          </div>
          <span className="text-[11px] text-zinc-500 font-mono">
            Record: {stats.longestStreak} days
          </span>
        </div>

        <div className="p-4 rounded-lg bg-zinc-900/60 border border-zinc-800">
          <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
            <span>Active Goal Target</span>
            <Target className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-zinc-100">
            {stats.dailyGoal} / day
          </div>
          <span className="text-[11px] text-zinc-500 font-mono">
            {stats.todaySolvedCount} solved today
          </span>
        </div>

        <div className="p-4 rounded-lg bg-zinc-900/60 border border-zinc-800">
          <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
            <span>Taxonomy Covered</span>
            <Layers className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-zinc-100">
            {topicStats.filter((t) => t.solved > 0).length} / {topicStats.length}
          </div>
          <span className="text-[11px] text-zinc-500 font-mono">topics actively started</span>
        </div>
      </div>

      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Solving Velocity Chart */}
        <div className="p-5 rounded-lg bg-zinc-900/60 border border-zinc-800 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-sky-400" />
              Solving & Revision Velocity (Recent Days)
            </h3>
            <span className="text-xs font-mono text-zinc-500">Problems / Day</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activityTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="date" stroke="#71717a" fontSize={11} tickLine={false} />
                <YAxis stroke="#71717a" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#18181b',
                    borderColor: '#27272a',
                    borderRadius: '6px',
                    fontSize: '12px',
                    color: '#f4f4f5',
                  }}
                />
                <Bar dataKey="solved" name="Solved" fill="#38BDF8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="revisions" name="Revisions" fill="#F59E0B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Difficulty Breakdown */}
        <div className="p-5 rounded-lg bg-zinc-900/60 border border-zinc-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-emerald-400" />
              Difficulty Mastery Ratio
            </h3>
            <span className="text-xs font-mono text-zinc-500">Solved vs Available</span>
          </div>

          <div className="space-y-4 pt-2">
            {difficultyData.map((d) => {
              const pct = d.total > 0 ? Math.round((d.solved / d.total) * 100) : 0;
              return (
                <div key={d.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-zinc-300 flex items-center gap-2">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: d.color }}
                      />
                      {d.name}
                    </span>
                    <span className="font-mono text-zinc-400">
                      {d.solved} / {d.total} ({pct}%)
                    </span>
                  </div>
                  <ProgressBar
                    value={pct}
                    color={
                      d.name === 'Easy'
                        ? 'bg-emerald-500'
                        : d.name === 'Medium'
                        ? 'bg-amber-500'
                        : 'bg-rose-500'
                    }
                  />
                </div>
              );
            })}
          </div>

          {/* Status Donut representation */}
          <div className="pt-4 border-t border-zinc-800/60 flex items-center justify-between">
            <div className="text-xs text-zinc-400 space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Solved: {stats.solvedCount}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>Attempted: {stats.attemptedCount}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-zinc-600" />
                <span>Not Started: {stats.unsolvedCount}</span>
              </div>
            </div>
            <div className="w-24 h-24">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusPieData}
                    innerRadius={25}
                    outerRadius={40}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {statusPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Topic-wise Breakdown Detailed List */}
      <div className="p-5 rounded-lg bg-zinc-900/60 border border-zinc-800 space-y-4">
        <h3 className="text-sm font-semibold text-zinc-200">
          Curriculum Progress Across All 16 Topics
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {topicStats.map(({ topic, total, solved, percentage }) => (
            <div
              key={topic.id}
              className="p-3.5 rounded-md bg-zinc-950/60 border border-zinc-800/80 space-y-2 hover:border-zinc-700 transition-colors"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-zinc-200">{topic.name}</span>
                <span className="font-mono text-zinc-400">
                  {solved} / {total} ({percentage}%)
                </span>
              </div>
              <ProgressBar value={percentage} color="bg-sky-500" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
