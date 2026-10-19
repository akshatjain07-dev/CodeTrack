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
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-zinc-900 border-l border-zinc-800 flex flex-col shadow-2xl">
          {/* Header */}
          <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-zinc-500">{question.id}</span>
              <Badge variant="difficulty" difficulty={question.difficulty} />
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onToggleBookmark}
                className={`p-1.5 rounded hover:bg-zinc-800 transition-colors ${
                  isBookmarked ? 'text-amber-400' : 'text-zinc-500 hover:text-zinc-300'
                }`}
                title={isBookmarked ? 'Bookmarked' : 'Add bookmark'}
              >
                <Star className={`w-4 h-4 ${isBookmarked ? 'fill-amber-400' : ''}`} />
              </button>
              <button
                onClick={onClose}
                className="p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Title & Metadata */}
            <div>
              <h2 className="text-lg font-semibold text-zinc-100 mb-2 leading-snug">
                {question.title}
              </h2>
              <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400">
                <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                  {question.topicName}
                </span>
                {question.subtopic && (
                  <span className="text-zinc-500 font-mono">/ {question.subtopic}</span>
                )}
                <Badge variant="platform" platform={question.platform} />
              </div>
            </div>

            {/* Quick External Problem Links */}
            <div className="p-3 bg-zinc-950/60 rounded-md border border-zinc-800/80 space-y-2">
              <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider block">
                Official Links & Resources
              </span>
              <div className="flex flex-wrap gap-2">
                <a
                  href={question.problemUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium text-sky-400 hover:text-sky-300 bg-sky-950/30 hover:bg-sky-950/50 border border-sky-800/40 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Solve Problem
                </a>
                {question.articleUrl && (
                  <a
                    href={question.articleUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium text-zinc-300 hover:text-white bg-zinc-800/60 hover:bg-zinc-800 border border-zinc-700/50 transition-colors"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    TUF Article
                  </a>
                )}
                {question.youtubeUrl && (
                  <a
                    href={question.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium text-rose-400 hover:text-rose-300 bg-rose-950/30 hover:bg-rose-950/50 border border-rose-800/40 transition-colors"
                  >
                    <Video className="w-3.5 h-3.5" />
                    Video Solution
                  </a>
                )}
              </div>
            </div>

            {/* Status Control */}
            <div className="space-y-2">
              <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider block">
                Solving Status
              </span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => onStatusChange('Not Started')}
                  className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium border transition-colors ${
                    status === 'Not Started'
                      ? 'bg-zinc-800 text-white border-zinc-600'
                      : 'bg-zinc-950/40 text-zinc-400 border-zinc-800 hover:bg-zinc-800/40'
                  }`}
                >
                  <Circle className="w-3 h-3 text-zinc-500" />
                  Not Started
                </button>
                <button
                  type="button"
                  onClick={() => onStatusChange('Attempted')}
                  className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium border transition-colors ${
                    status === 'Attempted'
                      ? 'bg-amber-950/40 text-amber-300 border-amber-700/60'
                      : 'bg-zinc-950/40 text-zinc-400 border-zinc-800 hover:bg-zinc-800/40'
                  }`}
                >
                  <Clock className="w-3 h-3 text-amber-400" />
                  Attempted
                </button>
                <button
                  type="button"
                  onClick={() => onStatusChange('Solved')}
                  className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium border transition-colors ${
                    status === 'Solved'
                      ? 'bg-emerald-950/40 text-emerald-300 border-emerald-700/60'
                      : 'bg-zinc-950/40 text-zinc-400 border-zinc-800 hover:bg-zinc-800/40'
                  }`}
                >
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  Solved
                </button>
              </div>
            </div>

            {/* Spaced Repetition Info */}
            <div className="p-3 bg-zinc-950/60 rounded-md border border-zinc-800/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Revision Schedule
                </span>
                {revision && (
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-zinc-800 text-amber-300 border border-zinc-700">
                    Stage {revision.stage} of 5
                  </span>
                )}
              </div>
              {revision ? (
                <div className="space-y-1 text-xs text-zinc-300">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Next Review:</span>
                    <span className="font-mono text-zinc-200">{revision.nextReviewDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Review Count:</span>
                    <span className="font-mono text-zinc-200">{revision.reviewCount} times</span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs text-zinc-500">Not currently scheduled</span>
                  <Button size="sm" variant="outline" onClick={onScheduleRevision} icon={<Calendar className="w-3 h-3" />}>
                    Schedule Revision
                  </Button>
                </div>
              )}
            </div>

            {/* Personal Notes */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  My Approach & Notes
                </span>
                {saveStatus === 'saving' && (
                  <span className="text-xs text-zinc-500 animate-pulse">Saving...</span>
                )}
                {saveStatus === 'saved' && (
                  <span className="text-xs text-emerald-400">Saved ✓</span>
                )}
              </div>
              <textarea
                value={localNotes}
                onChange={handleNotesChange}
                placeholder="Write your intuition, time/space complexity, edge cases, or code snippet here..."
                rows={6}
                className="w-full bg-zinc-950/80 text-zinc-200 placeholder-zinc-600 border border-zinc-800 rounded-md p-3 text-xs font-mono leading-relaxed focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 resize-y"
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
