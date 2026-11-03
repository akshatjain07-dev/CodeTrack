import React from 'react';
import { X, CheckCircle, RotateCcw, Zap, ExternalLink } from 'lucide-react';
import type { Question } from '../../types';
import { Badge } from './Badge';

interface RevisionModalProps {
  question: Question | null;
  isOpen: boolean;
  onClose: () => void;
  onComplete: (confidence: 'Again' | 'Good' | 'Easy') => void;
}

export const RevisionModal: React.FC<RevisionModalProps> = ({
  question,
  isOpen,
  onClose,
  onComplete,
}) => {
  if (!isOpen || !question) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-xs animate-fade-in duration-150" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-surface-elevated border border-subtle rounded-lg p-6 shadow-2xl space-y-6 animate-fade-in-scale">
        <div className="flex items-center justify-between border-b border-subtle pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-muted">{question.id}</span>
            <Badge variant="difficulty" difficulty={question.difficulty} />
          </div>
          <button
            onClick={onClose}
            className="p-1 text-muted hover:text-primary rounded transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-muted font-medium mb-1 block">
            Revision Session
          </span>
          <h2 className="text-base font-semibold text-primary mb-1.5">{question.title}</h2>
          <p className="text-xs text-secondary mb-4">
            Topic: <span className="text-primary font-medium">{question.topicName}</span> ({question.subtopic})
          </p>

          <a
            href={question.problemUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium text-primary bg-surface-subtle hover:bg-surface border border-subtle hover:border-default transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Open Problem to Re-solve
          </a>
        </div>

        <div className="space-y-3 pt-2">
          <span className="text-xs text-secondary font-medium block">
            How confident did you feel solving this?
          </span>

          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => onComplete('Again')}
              className="flex flex-col items-center p-3 rounded-md border border-subtle hover:border-default bg-surface hover:bg-surface-subtle text-secondary hover:text-primary transition-colors text-center group cursor-pointer"
            >
              <RotateCcw className="w-4 h-4 mb-1 text-muted group-hover:text-primary group-hover:scale-110 transition-all" />
              <span className="text-xs font-semibold">Again</span>
              <span className="text-[10px] text-muted mt-0.5 font-mono">Reset to 1d</span>
            </button>

            <button
              onClick={() => onComplete('Good')}
              className="flex flex-col items-center p-3 rounded-md border border-subtle hover:border-default bg-surface hover:bg-surface-subtle text-secondary hover:text-primary transition-colors text-center group cursor-pointer"
            >
              <CheckCircle className="w-4 h-4 mb-1 text-muted group-hover:text-primary group-hover:scale-110 transition-all" />
              <span className="text-xs font-semibold">Good</span>
              <span className="text-[10px] text-muted mt-0.5 font-mono">+3-7d stage</span>
            </button>

            <button
              onClick={() => onComplete('Easy')}
              className="flex flex-col items-center p-3 rounded-md border border-subtle hover:border-default bg-surface hover:bg-surface-subtle text-secondary hover:text-primary transition-colors text-center group cursor-pointer"
            >
              <Zap className="w-4 h-4 mb-1 text-muted group-hover:text-primary group-hover:scale-110 transition-all" />
              <span className="text-xs font-semibold">Easy</span>
              <span className="text-[10px] text-muted mt-0.5 font-mono">Advance stage</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
