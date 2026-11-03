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
import type { Question, RevisionItem } from '../types';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { RevisionModal } from '../components/ui/RevisionModal';
import { getLocalDateString } from '../services/storage';

export const RevisionCenterPage: React.FC = () => {
  const { openDrawer } = useOutletContext<{ openDrawer: (q: Question) => void }>();
  const { revisions, completeRevision, questions } = useCodeTrack();

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
      const q = questions.find((item) => item.id === r.questionId);
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
  }, [revisions, todayStr, questions]);

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-subtle">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono uppercase tracking-wider text-muted font-medium">
              Spaced Repetition System
            </span>
            <span className="text-muted">·</span>
            <span className="text-xs text-muted font-mono">
              Stage 1 (1d) → Stage 2 (3d) → Stage 3 (7d) → Stage 4 (14d) → Stage 5 (Mastered)
            </span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-primary">Revision Center</h1>
          <p className="text-xs text-secondary mt-0.5">
            Systematically review previously solved DSA problems to build permanent neural retention.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono px-3 py-1.5 rounded-md bg-surface border border-subtle text-primary">
            {categorized.due.length + categorized.overdue.length} Items Requiring Review
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-subtle pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('due')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
            activeTab === 'due'
              ? 'bg-surface-elevated text-primary border border-default font-semibold shadow-xs'
              : 'text-secondary hover:text-primary hover:bg-surface-subtle'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Due Today</span>
          <span className="px-1.5 py-0.2 rounded-full bg-surface-subtle text-primary text-[10px] font-mono border border-subtle">
            {categorized.due.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('overdue')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
            activeTab === 'overdue'
              ? 'bg-surface-elevated text-primary border border-default font-semibold shadow-xs'
              : 'text-secondary hover:text-primary hover:bg-surface-subtle'
          }`}
        >
          <AlertCircle className="w-3.5 h-3.5" />
          <span>Overdue</span>
          <span className="px-1.5 py-0.2 rounded-full bg-surface-subtle text-primary text-[10px] font-mono border border-subtle">
            {categorized.overdue.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('upcoming')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
            activeTab === 'upcoming'
              ? 'bg-surface-elevated text-primary border border-default font-semibold shadow-xs'
              : 'text-secondary hover:text-primary hover:bg-surface-subtle'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Upcoming Revisions</span>
          <span className="px-1.5 py-0.2 rounded-full bg-surface-subtle text-secondary text-[10px] font-mono border border-subtle">
            {categorized.upcoming.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('completed')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
            activeTab === 'completed'
              ? 'bg-surface-elevated text-primary border border-default font-semibold shadow-xs'
              : 'text-secondary hover:text-primary hover:bg-surface-subtle'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Mastered & Graduated</span>
          <span className="px-1.5 py-0.2 rounded-full bg-surface-subtle text-secondary text-[10px] font-mono border border-subtle">
            {categorized.completed.length}
          </span>
        </button>
      </div>

      {/* Revision List */}
      {activeList.length === 0 ? (
        <div className="p-12 text-center border border-subtle rounded-lg bg-surface-elevated space-y-2 animate-fade-in">
          <CheckCircle2 className="w-8 h-8 text-secondary mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-primary">No revisions in this category</h3>
          <p className="text-xs text-secondary max-w-sm mx-auto">
            {activeTab === 'due' || activeTab === 'overdue'
              ? "You are completely caught up! Solve new questions or schedule revisions from the Question Drawer."
              : 'Items scheduled for spaced repetition will populate here.'}
          </p>
        </div>
      ) : (
        <div key={activeTab} className="divide-y divide-subtle border border-subtle rounded-md overflow-hidden bg-surface-elevated">
          {activeList.map(({ question: q, revision: r }, idx) => (
            <div
              key={q.id}
              style={{ animationDelay: `${Math.min(idx * 40, 240)}ms` }}
              className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-surface-subtle transition-colors duration-150 animate-fade-in"
            >
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-muted">{q.id}</span>
                  <Badge variant="difficulty" difficulty={q.difficulty} />
                  <Badge variant="platform" platform={q.platform} />
                  <span className="text-[11px] font-mono px-2 py-0.2 rounded bg-surface border border-subtle text-secondary">
                    Stage {r.stage}/5
                  </span>
                </div>
                <h4 className="text-sm font-semibold text-primary truncate">{q.title}</h4>
                <div className="flex items-center gap-3 text-xs text-secondary font-mono">
                  <span>Topic: {q.topicName}</span>
                  <span>·</span>
                  <span>Scheduled: {r.nextReviewDate}</span>
                  <span>·</span>
                  <span>Reviewed: {r.reviewCount} times</span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={q.problemUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-muted hover:text-primary rounded hover:bg-surface border border-subtle transition-colors duration-150"
                  title="Open Problem Link"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <Button size="sm" variant="outline" onClick={() => openDrawer(q)}>
                  Notes
                </Button>

                {!r.isCompleted && (
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => setSelectedRevisionQuestion(q)}
                    icon={<Zap className="w-3.5 h-3.5" />}
                  >
                    Complete Review
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Revision Modal */}
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
