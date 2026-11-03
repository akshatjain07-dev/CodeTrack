import React, { useEffect, useState } from 'react';
import {
  X,
  ExternalLink,
  BookOpen,
  Video,
  Star,
  CheckCircle2,
  Clock,
  Circle,
  Calendar,
  Save,
} from 'lucide-react';
import type { Question, QuestionStatus, RevisionItem } from '../../types';
import { Badge } from './Badge';
import { Button } from './Button';

interface QuestionDrawerProps {
  question: Question | null;
  status: QuestionStatus;
  isBookmarked: boolean;
  notes: string;
  revision?: RevisionItem;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange: (status: QuestionStatus) => void;
  onToggleBookmark: () => void;
  onSaveNotes: (notes: string) => void;
  onScheduleRevision: () => void;
}

export const QuestionDrawer: React.FC<QuestionDrawerProps> = ({
  question,
  status,
  isBookmarked,
  notes,
  revision,
  isOpen,
  onClose,
  onStatusChange,
  onToggleBookmark,
  onSaveNotes,
  onScheduleRevision,
}) => {
  const [localNotes, setLocalNotes] = useState(notes);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  useEffect(() => {
    setLocalNotes(notes);
  }, [notes]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !question) return null;

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLocalNotes(e.target.value);
    setSaveStatus('idle');
  };

  const handleSaveNotes = () => {
    setSaveStatus('saving');
    onSaveNotes(localNotes);
    setTimeout(() => {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-200 animate-fade-in"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-surface-elevated border-l border-subtle flex flex-col shadow-2xl animate-fade-in">
          {/* Header */}
          <div className="px-6 py-4 border-b border-subtle flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-muted">{question.id}</span>
              <Badge variant="difficulty" difficulty={question.difficulty} />
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onToggleBookmark}
                className={`p-1.5 rounded hover:bg-surface-subtle transition-colors cursor-pointer ${
                  isBookmarked ? 'text-primary' : 'text-muted hover:text-primary'
                }`}
                title={isBookmarked ? 'Bookmarked' : 'Add bookmark'}
              >
                <Star className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
              </button>
              <button
                onClick={onClose}
                className="p-1.5 text-muted hover:text-primary hover:bg-surface-subtle rounded transition-colors cursor-pointer"
                aria-label="Close drawer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Title & Metadata */}
            <div>
              <h2 className="text-lg font-semibold text-primary mb-2 leading-snug">
                {question.title}
              </h2>
              <div className="flex flex-wrap items-center gap-2 text-xs text-secondary">
                <span className="px-2 py-0.5 rounded bg-surface text-primary border border-subtle">
                  {question.topicName}
                </span>
                {question.subtopic && (
                  <span className="text-muted font-mono">/ {question.subtopic}</span>
                )}
                <Badge variant="platform" platform={question.platform} />
              </div>
            </div>

            {/* Quick External Problem Links */}
            <div className="p-3.5 bg-surface rounded-md border border-subtle space-y-2.5">
              <span className="text-xs font-mono uppercase tracking-wider text-muted block">
                Official Links & Resources
              </span>
              <div className="flex flex-wrap gap-2">
                <a
                  href={question.problemUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium text-primary bg-surface-subtle hover:bg-surface border border-subtle hover:border-default transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Solve Problem
                </a>
                {question.articleUrl && (
                  <a
                    href={question.articleUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium text-secondary hover:text-primary bg-surface-subtle hover:bg-surface border border-subtle hover:border-default transition-colors"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    TUF Editorial
                  </a>
                )}
                {question.youtubeUrl && (
                  <a
                    href={question.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium text-secondary hover:text-primary bg-surface-subtle hover:bg-surface border border-subtle hover:border-default transition-colors"
                  >
                    <Video className="w-3.5 h-3.5" />
                    Video Solution
                  </a>
                )}
              </div>
            </div>

            {/* Status Control */}
            <div className="space-y-2">
              <span className="text-xs font-mono uppercase tracking-wider text-muted block">
                Solving Status
              </span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => onStatusChange('Not Started')}
                  className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium border transition-colors cursor-pointer ${
                    status === 'Not Started'
                      ? 'bg-surface-subtle text-primary border-default font-semibold shadow-xs'
                      : 'bg-surface text-muted border-subtle hover:bg-surface-subtle hover:text-secondary'
                  }`}
                >
                  <Circle className="w-3.5 h-3.5 text-muted" />
                  Not Started
                </button>
                <button
                  type="button"
                  onClick={() => onStatusChange('Attempted')}
                  className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium border transition-colors cursor-pointer ${
                    status === 'Attempted'
                      ? 'bg-surface-subtle text-primary border-default font-semibold shadow-xs'
                      : 'bg-surface text-muted border-subtle hover:bg-surface-subtle hover:text-secondary'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  Attempted
                </button>
                <button
                  type="button"
                  onClick={() => onStatusChange('Solved')}
                  className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium border transition-colors cursor-pointer ${
                    status === 'Solved'
                      ? 'bg-black text-white dark:bg-white dark:text-black border-transparent font-semibold shadow-xs'
                      : 'bg-surface text-muted border-subtle hover:bg-surface-subtle hover:text-secondary'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Solved
                </button>
              </div>
            </div>

            {/* Spaced Repetition Info */}
            <div className="p-3.5 bg-surface rounded-md border border-subtle space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-muted">
                  Revision Schedule
                </span>
                {revision && (
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-surface-subtle text-secondary border border-subtle">
                    Stage {revision.stage} of 5
                  </span>
                )}
              </div>
              {revision ? (
                <div className="space-y-1.5 text-xs text-primary pt-1">
                  <div className="flex justify-between">
                    <span className="text-secondary">Next Review:</span>
                    <span className="font-mono text-primary font-medium">{revision.nextReviewDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-secondary">Review Count:</span>
                    <span className="font-mono text-primary">{revision.reviewCount} times</span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs text-secondary">Not currently scheduled</span>
                  <Button size="sm" variant="outline" onClick={onScheduleRevision} icon={<Calendar className="w-3 h-3" />}>
                    Schedule Revision
                  </Button>
                </div>
              )}
            </div>

            {/* Personal Notes */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-muted">
                  My Notes & Approaches
                </span>
                {saveStatus === 'saving' && (
                  <span className="text-xs text-muted font-mono animate-pulse">Saving...</span>
                )}
                {saveStatus === 'saved' && (
                  <span className="text-xs text-secondary font-mono">Saved ✓</span>
                )}
              </div>
              <textarea
                value={localNotes}
                onChange={handleNotesChange}
                placeholder="Write your intuition, time/space complexity, edge cases, or code snippet here..."
                rows={6}
                className="w-full bg-surface text-primary placeholder-muted border border-subtle rounded-md p-3 text-xs font-mono leading-relaxed focus:outline-none focus:border-default focus:ring-1 focus:ring-primary resize-y"
              />
              <div className="flex justify-end">
                <Button size="sm" variant="secondary" onClick={handleSaveNotes} icon={<Save className="w-3.5 h-3.5" />}>
                  Save Notes
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
