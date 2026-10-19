import React, { useState, useEffect } from 'react';
import { Search, X, ArrowRight } from 'lucide-react';
import { QUESTIONS } from '../../data/questionsData';
import type { Question } from '../../types';
import { Badge } from './Badge';
import { Kbd } from './Kbd';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectQuestion: (question: Question) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onSelectQuestion,
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else setQuery('');
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filtered = query.trim()
    ? QUESTIONS.filter(
        (q) =>
          q.title.toLowerCase().includes(query.toLowerCase()) ||
          q.topicName.toLowerCase().includes(query.toLowerCase()) ||
          q.subtopic.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 8)
    : QUESTIONS.slice(0, 8);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/75 backdrop-blur-xs" onClick={onClose} />

      <div className="relative w-full max-w-xl bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3 border-b border-zinc-800 gap-3">
          <Search className="w-4 h-4 text-zinc-400 shrink-0" />
          <input
            autoFocus
            type="text"
            placeholder="Search any DSA problem, topic, or subtopic... (e.g. Kadane, Binary Search, Trees)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none"
          />
          <Kbd>ESC</Kbd>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto divide-y divide-zinc-800/60 p-1">
          {filtered.length === 0 ? (
            <div className="p-6 text-center text-xs text-zinc-500">
              No DSA problems found matching "{query}"
            </div>
          ) : (
            filtered.map((q) => (
              <div
                key={q.id}
                onClick={() => {
                  onSelectQuestion(q);
                  onClose();
                }}
                className="flex items-center justify-between p-3 rounded-md hover:bg-zinc-800/60 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-xs font-mono text-zinc-500 shrink-0">{q.id}</span>
                  <div className="truncate">
                    <span className="text-sm font-medium text-zinc-200 group-hover:text-white block truncate">
                      {q.title}
                    </span>
                    <span className="text-xs text-zinc-500">
                      {q.topicName} · {q.subtopic}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 ml-3">
                  <Badge variant="difficulty" difficulty={q.difficulty} />
                  <ArrowRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-sky-400 group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2 border-t border-zinc-800 bg-zinc-950/60 text-[11px] text-zinc-500 flex items-center justify-between">
          <span>Search TakeUForward Question Bank</span>
          <div className="flex items-center gap-2">
            <span>Navigation:</span>
            <Kbd>↑</Kbd>
            <Kbd>↓</Kbd>
            <Kbd>↵</Kbd>
          </div>
        </div>
      </div>
    </div>
  );
};
