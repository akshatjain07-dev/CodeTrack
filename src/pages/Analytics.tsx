import React, { useMemo, useState } from 'react';
import {
  BarChart2,
  Calendar,
  Flame,
  TrendingUp,
  Award,
  Sparkles,
  Target,
  Zap,
} from 'lucide-react';
import { useProblems } from '../context/ProblemContext';
import { generateMockHeatmap } from '../data/mockData';
import type { HeatmapDay } from '../data/mockData';

export const Analytics: React.FC = () => {
  const { questions, stats } = useProblems();
  const [hoveredDay, setHoveredDay] = useState<HeatmapDay | null>(null);

  // Generate 52-week (364 days) heatmap data
  const heatmapDays = useMemo(() => generateMockHeatmap(), []);

  // Completion Ring Calculations dynamically derived from real user stats
  const completionPercentage = stats.totalQuestions > 0
    ? Math.min(100, Math.round((stats.totalSolved / stats.totalQuestions) * 100))
    : 0;
  const ringRadius = 70;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringStrokeDashoffset = ringCircumference - (completionPercentage / 100) * ringCircumference;

  // Topic Mastery dynamically derived from real 661 questions and live user progress
  const topicMasteryList = useMemo(() => {
    const topicMap: Record<string, { solved: number; total: number }> = {};
    questions.forEach((q) => {
      const top = q.topic;
      if (!topicMap[top]) {
        topicMap[top] = { solved: 0, total: 0 };
      }
      topicMap[top].total++;
      if (q.status === 'Solved') {
        topicMap[top].solved++;
      }
    });

    const benchmarks: Record<string, number> = {
      Arrays: 75,
      'Dynamic Programming': 60,
      Graphs: 55,
      'Binary Trees': 65,
      'Stacks & Queues': 70,
      'Linked List': 70,
      'Binary Search': 65,
      Strings: 70,
      Greedy: 60,
      Recursion: 60,
    };

    return Object.entries(topicMap)
      .map(([name, data]) => ({
        name,
        solved: data.solved,
        total: data.total,
        percentage: data.total > 0 ? Math.round((data.solved / data.total) * 100) : 0,
        benchmark: benchmarks[name] || 60,
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 6);
  }, [questions]);

  // Difficulty Distribution for Donut Chart
  const difficultyData = useMemo(() => {
    const easy = stats.easySolved || 68;
    const medium = stats.mediumSolved || 62;
    const hard = stats.hardSolved || 12;
    const total = easy + medium + hard;

    const easyPct = Math.round((easy / total) * 100);
    const medPct = Math.round((medium / total) * 100);
    const hardPct = 100 - easyPct - medPct;

    return {
      easy: { count: easy, percentage: easyPct, color: '#10B981' },
      medium: { count: medium, percentage: medPct, color: '#F59E0B' },
      hard: { count: hard, percentage: hardPct, color: '#F43F5E' },
      total,
    };
  }, [stats]);

  // Donut SVG circumference and segment offsets
  const donutRadius = 60;
  const donutCircumference = 2 * Math.PI * donutRadius;
  const easyDash = (difficultyData.easy.percentage / 100) * donutCircumference;
  const medDash = (difficultyData.medium.percentage / 100) * donutCircumference;
  const hardDash = (difficultyData.hard.percentage / 100) * donutCircumference;

  const easyOffset = 0;
  const medOffset = -easyDash;
  const hardOffset = -(easyDash + medDash);

  const getHeatmapColor = (count: number) => {
    if (count === 0) return 'bg-[#18181B] border-[#27272A]';
    if (count === 1) return 'bg-[#10B981]/25 border-[#10B981]/40';
    if (count === 2) return 'bg-[#10B981]/50 border-[#10B981]/60';
    if (count === 3) return 'bg-[#10B981]/75 border-[#10B981]/80';
    return 'bg-[#10B981] border-[#34D399] shadow-xs shadow-[#10B981]/40';
  };

  // Month labels across 52 weeks
  const monthLabels = [
    { name: 'Jan', col: 0 },
    { name: 'Feb', col: 4 },
    { name: 'Mar', col: 9 },
    { name: 'Apr', col: 13 },
    { name: 'May', col: 18 },
    { name: 'Jun', col: 22 },
    { name: 'Jul', col: 26 },
    { name: 'Aug', col: 31 },
    { name: 'Sep', col: 35 },
    { name: 'Oct', col: 40 },
    { name: 'Nov', col: 44 },
    { name: 'Dec', col: 48 },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner / Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-[#18181B] border border-[#27272A]">
        <div>
          <h1 className="text-2xl font-black text-[#FAFAFA] flex items-center gap-2.5">
            <BarChart2 className="w-6 h-6 text-[#6366F1]" />
            DSA Analytics & Progress Insights
          </h1>
          <p className="text-xs text-[#A1A1AA] mt-1">
            Engineered telemetry tracking problem completion velocity, topic mastery benchmarks, and consistency.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[#10B981] text-xs font-semibold flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4" />
            <span>Top 5% Interview Velocity</span>
          </div>
          <div className="px-3.5 py-1.5 rounded-lg bg-[#6366F1]/10 border border-[#6366F1]/20 text-[#6366F1] text-xs font-semibold flex items-center gap-1.5">
            <Sparkles className="w-4 h-4" />
            <span>Target: 2026 Hiring Season</span>
          </div>
        </div>
      </div>

      {/* Row 1: Completion Ring & Difficulty Donut & Quick Streak KPI */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 1. COMPLETION RING CARD */}
        <div className="p-6 rounded-2xl bg-[#18181B] border border-[#27272A] flex flex-col items-center justify-between space-y-4">
          <div className="w-full flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#A1A1AA] flex items-center gap-1.5">
              <Target className="w-4 h-4 text-[#6366F1]" />
              Completion Ring
            </span>
            <span className="text-xs font-bold text-[#10B981] bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              On Pace
            </span>
          </div>

          {/* Circular Progress Indicator */}
          <div className="relative flex items-center justify-center my-2">
            <svg className="w-44 h-44 -rotate-90 transform" viewBox="0 0 160 160">
              {/* Background Track */}
              <circle
                cx="80"
                cy="80"
                r={ringRadius}
                className="text-[#27272A]"
                strokeWidth="12"
                stroke="currentColor"
                fill="transparent"
              />
              {/* Progress Gradient Track */}
              <circle
                cx="80"
                cy="80"
                r={ringRadius}
                stroke="url(#completionGradient)"
                strokeWidth="12"
                strokeDasharray={ringCircumference}
                strokeDashoffset={ringStrokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-1000 ease-out"
              />
              <defs>
                <linearGradient id="completionGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#6366F1" />
                  <stop offset="100%" stopColor="#10B981" />
                </linearGradient>
              </defs>
            </svg>

            {/* Inner Ring Text */}
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-3xl font-black text-[#FAFAFA] tracking-tight">
                {completionPercentage}%
              </span>
              <span className="text-[11px] font-semibold text-[#10B981] uppercase tracking-wider mt-0.5">
                Solved
              </span>
              <span className="text-[10px] text-[#71717A] mt-0.5">306 / 450 Goal</span>
            </div>
          </div>

          <div className="w-full text-center border-t border-[#27272A] pt-3 text-xs text-[#A1A1AA]">
            <span className="text-[#FAFAFA] font-semibold">144 problems</span> remaining to hit full
            roadmap mastery.
          </div>
        </div>

        {/* 2. DIFFICULTY DISTRIBUTION DONUT CARD */}
        <div className="p-6 rounded-2xl bg-[#18181B] border border-[#27272A] flex flex-col items-center justify-between space-y-4">
          <div className="w-full flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#A1A1AA] flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-400" />
              Difficulty Distribution
            </span>
            <span className="text-xs font-semibold text-[#A1A1AA]">
              {difficultyData.total} Solved
            </span>
          </div>

          {/* Donut Chart SVG */}
          <div className="relative flex items-center justify-center my-2">
            <svg className="w-44 h-44 -rotate-90 transform" viewBox="0 0 160 160">
              {/* Easy Arc */}
              <circle
                cx="80"
                cy="80"
                r={donutRadius}
                stroke="#10B981"
                strokeWidth="16"
                strokeDasharray={`${easyDash} ${donutCircumference}`}
                strokeDashoffset={easyOffset}
                fill="transparent"
                className="transition-all duration-700"
              />
              {/* Medium Arc */}
              <circle
                cx="80"
                cy="80"
                r={donutRadius}
                stroke="#F59E0B"
                strokeWidth="16"
                strokeDasharray={`${medDash} ${donutCircumference}`}
                strokeDashoffset={medOffset}
                fill="transparent"
                className="transition-all duration-700"
              />
              {/* Hard Arc */}
              <circle
                cx="80"
                cy="80"
                r={donutRadius}
                stroke="#F43F5E"
                strokeWidth="16"
                strokeDasharray={`${hardDash} ${donutCircumference}`}
                strokeDashoffset={hardOffset}
                fill="transparent"
                className="transition-all duration-700"
              />
            </svg>

            {/* Donut Center */}
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-2xl font-black text-[#FAFAFA]">
                {difficultyData.total}
              </span>
              <span className="text-[10px] text-[#A1A1AA] uppercase tracking-wider">
                Problems
              </span>
            </div>
          </div>

          {/* Donut Legend */}
          <div className="w-full grid grid-cols-3 gap-2 border-t border-[#27272A] pt-3 text-center">
            <div className="p-1.5 rounded-lg bg-[#09090B] border border-[#27272A]">
              <span className="text-[10px] font-bold text-[#10B981]">Easy</span>
              <p className="text-xs font-bold text-[#FAFAFA]">{difficultyData.easy.percentage}%</p>
              <span className="text-[9px] text-[#71717A]">{difficultyData.easy.count} solved</span>
            </div>
            <div className="p-1.5 rounded-lg bg-[#09090B] border border-[#27272A]">
              <span className="text-[10px] font-bold text-amber-400">Medium</span>
              <p className="text-xs font-bold text-[#FAFAFA]">{difficultyData.medium.percentage}%</p>
              <span className="text-[9px] text-[#71717A]">{difficultyData.medium.count} solved</span>
            </div>
            <div className="p-1.5 rounded-lg bg-[#09090B] border border-[#27272A]">
              <span className="text-[10px] font-bold text-rose-400">Hard</span>
              <p className="text-xs font-bold text-[#FAFAFA]">{difficultyData.hard.percentage}%</p>
              <span className="text-[9px] text-[#71717A]">{difficultyData.hard.count} solved</span>
            </div>
          </div>
        </div>

        {/* 3. STREAK & VELOCITY SUMMARY CARD */}
        <div className="p-6 rounded-2xl bg-[#18181B] border border-[#27272A] flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#A1A1AA] flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-amber-400" />
              Streak & Momentum
            </span>
            <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              Active Fire
            </span>
          </div>

          <div className="space-y-4 my-auto py-2">
            <div className="p-4 rounded-xl bg-[#09090B] border border-[#27272A] flex items-center justify-between">
              <div>
                <span className="text-[11px] text-[#71717A] font-semibold uppercase">
                  Current Streak
                </span>
                <p className="text-3xl font-black text-amber-400 mt-0.5">
                  {stats.currentStreak} Days
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Flame className="w-5 h-5 fill-amber-400" />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#09090B] border border-[#27272A] flex items-center justify-between">
              <div>
                <span className="text-[11px] text-[#71717A] font-semibold uppercase">
                  Longest Streak
                </span>
                <p className="text-3xl font-black text-[#6366F1] mt-0.5">
                  {stats.bestStreak} Days
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[#6366F1]/10 border border-[#6366F1]/20 flex items-center justify-center text-[#6366F1]">
                <Zap className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="border-t border-[#27272A] pt-3 text-xs text-[#A1A1AA] flex items-center justify-between">
            <span>Daily Goal Target:</span>
            <span className="font-bold text-[#FAFAFA]">
              {stats.solvedToday} / {stats.dailyGoal} Solved Today
            </span>
          </div>
        </div>
      </div>

      {/* Row 2: 52x7 CONSISTENCY GRID (GitHub-style Heat Map) */}
      <div className="p-6 rounded-2xl bg-[#18181B] border border-[#27272A] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-[#FAFAFA] flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#10B981]" />
              Consistency Grid (52-Week Year Activity)
            </h2>
            <p className="text-xs text-[#A1A1AA]">
              GitHub-style 52x7 daily submission heat map showing continuous consistency and practice frequency.
            </p>
          </div>

          {/* Activity Heatmap Legend */}
          <div className="flex items-center gap-2 text-xs text-[#71717A]">
            <span>Less</span>
            <span className="w-3 h-3 rounded-xs bg-[#18181B] border border-[#27272A]" title="0 solves" />
            <span className="w-3 h-3 rounded-xs bg-[#10B981]/25 border border-[#10B981]/40" title="1 solve" />
            <span className="w-3 h-3 rounded-xs bg-[#10B981]/50 border border-[#10B981]/60" title="2 solves" />
            <span className="w-3 h-3 rounded-xs bg-[#10B981]/75 border border-[#10B981]/80" title="3 solves" />
            <span className="w-3 h-3 rounded-xs bg-[#10B981] border border-[#34D399]" title="4+ solves" />
            <span>More</span>
          </div>
        </div>

        {/* Heatmap Outer Container with Horizontal Scroll if needed */}
        <div className="p-4 rounded-xl bg-[#09090B] border border-[#27272A] overflow-x-auto">
          {/* Month Header row */}
          <div className="flex text-[10px] text-[#71717A] font-mono mb-2 pl-7 min-w-max">
            {monthLabels.map((m) => (
              <span
                key={m.name}
                className="inline-block"
                style={{ width: `${(52 / 12) * 15.5}px` }}
              >
                {m.name}
              </span>
            ))}
          </div>

          <div className="flex gap-2 min-w-max">
            {/* Day of Week Labels (Mon, Wed, Fri) */}
            <div className="flex flex-col justify-between text-[9px] text-[#71717A] font-mono py-0.5 select-none w-5">
              <span>Sun</span>
              <span>Tue</span>
              <span>Thu</span>
              <span>Sat</span>
            </div>

            {/* 52x7 Grid Cells */}
            <div className="inline-grid grid-flow-col grid-rows-7 gap-1">
              {heatmapDays.map((d, idx) => (
                <div
                  key={idx}
                  onMouseEnter={() => setHoveredDay(d)}
                  onMouseLeave={() => setHoveredDay(null)}
                  className={`w-3 h-3 rounded-xs border transition-all duration-150 hover:scale-125 cursor-pointer ${getHeatmapColor(
                    d.count
                  )}`}
                  title={`${d.date}: ${d.count} problem${d.count === 1 ? '' : 's'} solved`}
                />
              ))}
            </div>
          </div>

          {/* Footer Tooltip status bar */}
          <div className="mt-4 flex items-center justify-between text-xs text-[#71717A] px-1 border-t border-[#27272A] pt-3">
            <span>52 weeks of tracked DSA consistency</span>
            <span>
              {hoveredDay ? (
                <span className="text-[#FAFAFA] font-medium bg-[#18181B] px-2.5 py-1 rounded border border-[#27272A]">
                  {hoveredDay.date}:{' '}
                  <strong className="text-[#10B981]">
                    {hoveredDay.count} problem{hoveredDay.count === 1 ? '' : 's'}
                  </strong>{' '}
                  solved
                </span>
              ) : (
                'Hover over any block to inspect date and solve volume'
              )}
            </span>
            <span className="text-[#10B981] font-semibold">Active Streak: {stats.currentStreak} Days</span>
          </div>
        </div>
      </div>

      {/* Row 3: TOPIC MASTERY (Arrays, DP, Trees, Strings, Graphs) */}
      <div className="p-6 rounded-2xl bg-[#18181B] border border-[#27272A] space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-[#FAFAFA] flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-[#6366F1]" />
              Topic Mastery (Arrays, DP, Trees, Strings, Graphs)
            </h2>
            <p className="text-xs text-[#A1A1AA]">
              Progress bar layout with Indigo completion bars and Emerald indicator markers signaling interview-readiness threshold.
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-[#A1A1AA]">
              <span className="w-3 h-3 rounded-sm bg-[#6366F1]" />
              Solved Progress
            </span>
            <span className="flex items-center gap-1.5 text-[#10B981]">
              <span className="w-2 h-2 rounded-full bg-[#10B981]" />
              Target Benchmark Marker
            </span>
          </div>
        </div>

        {/* Topic Mastery Bars */}
        <div className="space-y-5 pt-2">
          {topicMasteryList.map((item) => {
            const isBenchmarkMet = item.percentage >= item.benchmark;

            return (
              <div key={item.name} className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="font-bold text-[#FAFAFA] text-sm">{item.name}</span>
                    <span className="text-[11px] text-[#A1A1AA]">
                      {item.solved} of {item.total} solved
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {isBenchmarkMet && (
                      <span className="text-[10px] font-semibold text-[#10B981] bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                        Benchmark Reached
                      </span>
                    )}
                    <span className="font-mono font-bold text-[#FAFAFA] w-10 text-right">
                      {item.percentage}%
                    </span>
                  </div>
                </div>

                {/* Progress Track */}
                <div className="relative w-full h-3.5 bg-[#09090B] border border-[#27272A] rounded-full overflow-hidden">
                  {/* Indigo Bar */}
                  <div
                    className="h-full bg-gradient-to-r from-[#6366F1] to-[#818CF8] rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${item.percentage}%` }}
                  />

                  {/* Emerald Indicator Marker (Benchmark Pin) */}
                  <div
                    className="absolute top-0 bottom-0 w-1 bg-[#10B981] shadow-sm shadow-[#10B981] z-10"
                    style={{ left: `${item.benchmark}%` }}
                    title={`Mastery Target: ${item.benchmark}%`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
