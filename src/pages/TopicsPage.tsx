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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-subtle">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono uppercase tracking-wider text-muted font-medium">
              Curriculum Architecture
            </span>
            <span className="text-muted">·</span>
            <span className="text-xs text-muted font-mono">
              {topicStats.length} Essential DSA Knowledge Modules
            </span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-primary">DSA Topics Breakdown</h1>
          <p className="text-xs text-secondary mt-0.5">
            Structured roadmap extracted directly from TakeUForward Striver A2Z sheet. Click any module to practice its questions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono px-3 py-1.5 rounded-md bg-surface border border-subtle text-primary">
            {stats.solvedCount} / {stats.totalQuestions} Solved Across All Topics
          </span>
        </div>
      </div>

      {/* Grid of Topics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {topicStats.map(({ topic, total, solved, attempted, remaining, percentage }, idx) => (
          <div
            key={topic.id}
            onClick={() => navigate(`/questions?topic=${topic.id}`)}
            style={{ animationDelay: `${Math.min(idx * 30, 240)}ms` }}
            className="p-5 rounded-lg bg-surface-elevated border border-subtle hover:border-default hover:bg-surface-subtle transition-all duration-150 cursor-pointer group flex flex-col justify-between space-y-4 card-shadow animate-fade-in"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono text-muted">Module {topic.displayOrder}</span>
                <span className="text-xs font-mono font-medium text-primary">
                  {percentage}% complete
                </span>
              </div>
              <h3 className="text-base font-semibold text-primary group-hover:underline transition-colors flex items-center justify-between">
                {topic.name}
                <ArrowRight className="w-4 h-4 text-muted group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </h3>
              <p className="text-xs text-secondary mt-1.5 line-clamp-2 leading-relaxed">
                {topic.description}
              </p>
            </div>

            <div className="space-y-2 pt-2 border-t border-subtle">
              <ProgressBar value={percentage} />
              <div className="flex items-center justify-between text-[11px] font-mono text-secondary pt-1">
                <span className="flex items-center gap-1 text-primary">
                  <CheckCircle2 className="w-3 h-3" /> {solved}/{total} solved
                </span>
                <span className="flex items-center gap-1 text-secondary">
                  <Clock className="w-3 h-3" /> {attempted} attempted
                </span>
                <span className="text-muted">{remaining} left</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
