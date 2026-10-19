import React, { useState, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Calendar,
  AlertCircle,
  CheckCircle2,
  Clock,
  ExternalLink,
  Zap,
} from 'lucide-react';
import { useCodeTrack } from '../hooks/useCodeTrack';
import { QUESTIONS } from '../data/questionsData';
import type { Question, RevisionItem } from '../types';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { RevisionModal } from '../components/ui/RevisionModal';
import { getLocalDateString } from '../services/storage';

export const RevisionCenterPage: React.FC = () => {
  const { openDrawer } = useOutletContext<{ openDrawer: (q: Question) => void }>();
  const { revisions, completeRevision } = useCodeTrack();

  const [activeTab, setActiveTab] = useState<'due' | 'overdue' | 'upcoming' | 'completed'>('due');
  const [selectedRevisionQuestion, setSelectedRevisionQuestion] = useState<Question | null>(null);

  const todayStr = getLocalDateString();

  // Categorize revisions
  const categorized = useMemo(() => {
    const due: { question: Question; revision: RevisionItem }[] = [];
    const overdue: { question: Question; revision: RevisionItem }[] = [];
    const upcoming: { question: Question; revision: RevisionItem }[] = [];
    const completed: { question: Question; revision: RevisionItem }[] = [];

    Object.values(revisions).forEach((r) => {
      const q = QUESTIONS.find((item) => item.id === r.questionId);
      if (!q) return;

      if (r.isCompleted) {
        completed.push({ question: q, revision: r });
      } else if (r.nextReviewDate === todayStr) {
        due.push({ question: q, revision: r });
      } else if (r.nextReviewDate < todayStr) {
        overdue.push({ question: q, revision: r });
      } else {
        upcoming.push({ question: q, revision: r });
      }
    });

    return { due, overdue, upcoming, completed };
  }, [revisions, todayStr]);

  const activeList =
    activeTab === 'due'
      ? categorized.due
      : activeTab === 'overdue'
      ? categorized.overdue
      : activeTab === 'upcoming'
      ? categorized.upcoming
      : categorized.completed;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-800/60">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono uppercase tracking-wider text-amber-400 font-semibold">
              Spaced Repetition System
            </span>
            <span className="text-zinc-600">·</span>
            <span className="text-xs text-zinc-500 font-mono">
              Stage 1 (1d) → Stage 2 (3d) → Stage 3 (7d) → Stage 4 (14d) → Stage 5 (Mastered)
            </span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">Revision Center</h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Systematically review previously solved DSA problems to build permanent neural retention.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono px-3 py-1.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300">
            {categorized.due.length + categorized.overdue.length} Action Items Pending
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-800/80 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('due')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
            activeTab === 'due'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
          }`}
        >
          <Clock className="w-3.5 h-3.5 text-amber-400" />
          <span>Due Today</span>
          <span className="px-1.5 py-0.2 rounded-full bg-zinc-800 text-[10px] font-mono">
            {categorized.due.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('overdue')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
            activeTab === 'overdue'
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 font-semibold'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
          }`}
        >
          <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
          <span>Overdue</span>
          <span className="px-1.5 py-0.2 rounded-full bg-zinc-800 text-[10px] font-mono">
            {categorized.overdue.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('upcoming')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
            activeTab === 'upcoming'
              ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 font-semibold'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
          }`}
        >
          <Calendar className="w-3.5 h-3.5 text-sky-400" />
          <span>Upcoming Schedule</span>
          <span className="px-1.5 py-0.2 rounded-full bg-zinc-800 text-[10px] font-mono">
            {categorized.upcoming.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('completed')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
            activeTab === 'completed'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>Mastered</span>
          <span className="px-1.5 py-0.2 rounded-full bg-zinc-800 text-[10px] font-mono">
            {categorized.completed.length}
          </span>
        </button>
      </div>

      {/* List */}
      {activeList.length === 0 ? (
        <div className="p-12 text-center border border-zinc-800 rounded-lg bg-zinc-900/30 space-y-2">
          <div className="w-10 h-10 rounded-full bg-zinc-800/80 flex items-center justify-center mx-auto text-zinc-500 mb-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          </div>
          <h3 className="text-sm font-semibold text-zinc-200">
            {activeTab === 'due'
              ? 'All caught up for today!'
              : activeTab === 'overdue'
              ? 'No overdue revisions!'
              : activeTab === 'upcoming'
              ? 'No upcoming revisions scheduled'
              : 'No problems graduated to Mastered yet'}
          </h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            {activeTab === 'due'
              ? 'Great job keeping up with your intervals. Solving new questions automatically schedules their next revision.'
              : 'Solve more problems from the question bank to start their spaced repetition pipeline.'}
          </p>
        </div>
      ) : (
        <div className="divide-y divide-zinc-800/70 border border-zinc-800 rounded-lg overflow-hidden bg-zinc-900/40">
          {activeList.map(({ question: q, revision: r }) => (
            <div
              key={q.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-zinc-800/30 transition-colors gap-3"
            >
              <div className="flex items-start sm:items-center gap-3 min-w-0">
                <div className="p-2 rounded bg-zinc-800 text-zinc-400 border border-zinc-700/60 font-mono text-xs font-semibold shrink-0">
                  S{r.stage}
                </div>

                <div className="min-w-0">
                  <button
                    onClick={() => openDrawer(q)}
                    className="text-sm font-medium text-zinc-200 hover:text-white transition-colors truncate block text-left"
                  >
                    {q.title}
                  </button>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500 mt-0.5">
                    <span className="font-mono text-zinc-400">{q.topicName}</span>
                    <span>·</span>
                    <Badge variant="difficulty" difficulty={q.difficulty} />
                    <span>·</span>
                    <span className="font-mono text-zinc-400">
                      Scheduled: {r.nextReviewDate}
                    </span>
                    <span>·</span>
                    <span>Revised {r.reviewCount} times</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                <a
                  href={q.problemUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 text-zinc-500 hover:text-sky-400 rounded hover:bg-zinc-800 transition-colors"
                  title="Open problem link"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <Button size="sm" variant="ghost" onClick={() => openDrawer(q)}>
                  Notes
                </Button>

                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => setSelectedRevisionQuestion(q)}
                  icon={<Zap className="w-3.5 h-3.5" />}
                >
                  Test & Complete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Revision Test Modal */}
      <RevisionModal
        question={selectedRevisionQuestion}
        isOpen={Boolean(selectedRevisionQuestion)}
        onClose={() => setSelectedRevisionQuestion(null)}
        onComplete={(confidence) => {
          if (selectedRevisionQuestion) {
            completeRevision(selectedRevisionQuestion.id, confidence);
            setSelectedRevisionQuestion(null);
          }
        }}
      />
    </div>
  );
};
