import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Clock } from 'lucide-react';
import { useCodeTrack } from '../hooks/useCodeTrack';
import { ProgressBar } from '../components/ui/ProgressBar';

export const TopicsPage: React.FC = () => {
  const { topicStats, stats } = useCodeTrack();
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-800/60">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono uppercase tracking-wider text-purple-400 font-semibold">
              Curriculum Architecture
            </span>
            <span className="text-zinc-600">·</span>
            <span className="text-xs text-zinc-500 font-mono">
              16 Essential DSA Knowledge Modules
            </span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">DSA Topics Breakdown</h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Structured roadmap extracted directly from TakeUForward Striver A2Z sheet. Click any module to practice its questions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono px-3 py-1.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300">
            {stats.solvedCount} / {stats.totalQuestions} Solved Across All Topics
          </span>
        </div>
      </div>

      {/* Grid of Topics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {topicStats.map(({ topic, total, solved, attempted, remaining, percentage }) => (
          <div
            key={topic.id}
            onClick={() => navigate(`/questions?topic=${topic.id}`)}
            className="p-5 rounded-lg bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-850/60 transition-all cursor-pointer group flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono text-zinc-500">Module {topic.displayOrder}</span>
                <span className="text-xs font-mono font-medium text-emerald-400">
                  {percentage}% complete
                </span>
              </div>
              <h3 className="text-base font-semibold text-zinc-100 group-hover:text-sky-400 transition-colors flex items-center justify-between">
                {topic.name}
                <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-sky-400 group-hover:translate-x-1 transition-all" />
              </h3>
              <p className="text-xs text-zinc-400 mt-1.5 line-clamp-2 leading-relaxed">
                {topic.description}
              </p>
            </div>

            <div className="space-y-2 pt-2 border-t border-zinc-800/60">
              <ProgressBar value={percentage} color="bg-sky-500" />
              <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 pt-1">
                <span className="flex items-center gap-1 text-emerald-400">
                  <CheckCircle2 className="w-3 h-3" /> {solved}/{total} solved
                </span>
                <span className="flex items-center gap-1 text-amber-400">
                  <Clock className="w-3 h-3" /> {attempted} attempted
                </span>
                <span className="text-zinc-500">{remaining} remaining</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
