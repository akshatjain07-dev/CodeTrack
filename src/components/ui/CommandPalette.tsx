import React, { useState, useEffect } from 'react';
import { Search, X, ArrowRight } from 'lucide-react';
import { getAllQuestions } from '../../services/questionBank';
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
  const allQuestions = getAllQuestions();

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
    ? allQuestions.filter(
        (q) =>
          q.title.toLowerCase().includes(query.toLowerCase()) ||
          q.topicName.toLowerCase().includes(query.toLowerCase()) ||
          q.subtopic.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 8)
    : allQuestions.slice(0, 8);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={onClose} />

      <div className="relative w-full max-w-xl bg-surface-elevated border border-subtle rounded-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3 border-b border-subtle gap-3">
          <Search className="w-4 h-4 text-muted shrink-0" />
          <input
            autoFocus
            type="text"
            placeholder="Search any DSA problem, topic, or subtopic... (e.g. Kadane, Binary Search, Trees)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-primary placeholder-muted focus:outline-none"
          />
          <Kbd>ESC</Kbd>
          <button onClick={onClose} className="text-muted hover:text-primary cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto divide-y divide-subtle p-1">
          {filtered.length === 0 ? (
            <div className="p-6 text-center text-xs text-muted">
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
                className="flex items-center justify-between p-3 rounded-md hover:bg-surface-subtle transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-xs font-mono text-muted shrink-0">{q.id}</span>
                  <div className="truncate">
                    <span className="text-sm font-medium text-primary group-hover:underline block truncate">
                      {q.title}
                    </span>
                    <span className="text-xs text-muted">
                      {q.topicName} · {q.subtopic}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 ml-3">
                  <Badge variant="difficulty" difficulty={q.difficulty} />
                  <ArrowRight className="w-3.5 h-3.5 text-muted group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
