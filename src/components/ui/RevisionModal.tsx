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
      <div className="fixed inset-0 bg-black/70 backdrop-blur-xs" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-lg p-6 shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-zinc-500">{question.id}</span>
            <Badge variant="difficulty" difficulty={question.difficulty} />
          </div>
          <button onClick={onClose} className="p-1 text-zinc-400 hover:text-white rounded">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div>
          <span className="text-xs uppercase tracking-wider text-amber-400 font-semibold mb-1 block">
            Revision Session
          </span>
          <h2 className="text-base font-semibold text-zinc-100 mb-2">{question.title}</h2>
          <p className="text-xs text-zinc-400 mb-4">
            Topic: <span className="text-zinc-200">{question.topicName}</span> ({question.subtopic})
          </p>

          <a
            href={question.problemUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium text-sky-400 bg-sky-950/40 border border-sky-800/40 hover:bg-sky-950/60 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Open Problem to Re-solve
          </a>
        </div>

        <div className="space-y-3 pt-2">
          <span className="text-xs text-zinc-400 font-medium block">
            How confident did you feel solving this?
          </span>

          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => onComplete('Again')}
              className="flex flex-col items-center p-3 rounded-md border border-rose-900/40 bg-rose-950/20 hover:bg-rose-950/40 text-rose-300 transition-colors text-center group cursor-pointer"
            >
              <RotateCcw className="w-4 h-4 mb-1 text-rose-400 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-semibold">Again</span>
              <span className="text-[10px] text-zinc-500 mt-0.5">Reset to 1d</span>
            </button>

            <button
              onClick={() => onComplete('Good')}
              className="flex flex-col items-center p-3 rounded-md border border-amber-900/40 bg-amber-950/20 hover:bg-amber-950/40 text-amber-300 transition-colors text-center group cursor-pointer"
            >
              <CheckCircle className="w-4 h-4 mb-1 text-amber-400 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-semibold">Good</span>
              <span className="text-[10px] text-zinc-500 mt-0.5">Next stage (+3-7d)</span>
            </button>

            <button
              onClick={() => onComplete('Easy')}
              className="flex flex-col items-center p-3 rounded-md border border-emerald-900/40 bg-emerald-950/20 hover:bg-emerald-950/40 text-emerald-300 transition-colors text-center group cursor-pointer"
            >
              <Zap className="w-4 h-4 mb-1 text-emerald-400 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-semibold">Easy</span>
              <span className="text-[10px] text-zinc-500 mt-0.5">Advance / Master</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
