import React, { useState, useMemo } from 'react';
import { useOutletContext, NavLink } from 'react-router-dom';
import {
  Bookmark,
  Search,
  Star,
  CheckCircle2,
  Clock,
  Circle,
  ExternalLink,
  ArrowRight,
} from 'lucide-react';
import { useCodeTrack } from '../hooks/useCodeTrack';
import { QUESTIONS, TOPICS } from '../data/questionsData';
import type { Question } from '../types';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { EmptyState } from '../components/ui/EmptyState';

export const BookmarksPage: React.FC = () => {
  const { openDrawer } = useOutletContext<{ openDrawer: (q: Question) => void }>();
  const { bookmarks, progress, updateStatus, toggleBookmark } = useCodeTrack();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const bookmarkedQuestions = useMemo(() => {
    return bookmarks
      .map((id) => QUESTIONS.find((q) => q.id === id))
      .filter(Boolean) as Question[];
  }, [bookmarks]);

  const filteredBookmarks = useMemo(() => {
    return bookmarkedQuestions.filter((q) => {
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        if (
          !q.title.toLowerCase().includes(query) &&
          !q.topicName.toLowerCase().includes(query) &&
          !q.subtopic.toLowerCase().includes(query)
        ) {
          return false;
        }
      }

      if (selectedTopic !== 'all' && q.topicId !== selectedTopic) {
        return false;
      }

      if (selectedStatus !== 'all') {
        const status = progress[q.id]?.status || 'Not Started';
        if (status !== selectedStatus) return false;
      }

      return true;
    });
  }, [bookmarkedQuestions, searchQuery, selectedTopic, selectedStatus, progress]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-800/60">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono uppercase tracking-wider text-amber-400 font-semibold">
              Saved Collection
            </span>
            <span className="text-zinc-600">·</span>
            <span className="text-xs text-zinc-500 font-mono">
              {bookmarkedQuestions.length} Questions Starred
            </span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">Bookmarked Questions</h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Quickly revisit tricky interview questions and essential algorithmic patterns you've flagged.
          </p>
        </div>

        <NavLink to="/questions">
          <Button size="sm" variant="secondary" icon={<ArrowRight className="w-3.5 h-3.5" />}>
            Browse More Questions
          </Button>
        </NavLink>
      </div>

      {bookmarkedQuestions.length === 0 ? (
        <EmptyState
          icon={<Bookmark className="w-6 h-6" />}
          title="No bookmarked questions yet"
          description="Click the star icon next to any problem in the All Questions list or Dashboard to save it here for fast revision."
          actionText="Browse Questions"
          onAction={() => (window.location.href = '/questions')}
        />
      ) : (
        <div className="space-y-4">
          {/* Filters */}
          <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800 flex flex-col md:flex-row gap-3">
            <div className="flex-1">
              <Input
                icon={<Search className="w-4 h-4" />}
                placeholder="Search your saved bookmarks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              <select
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                className="bg-zinc-900 text-zinc-200 border border-zinc-700/60 rounded-md px-3 py-1.5 text-xs focus:outline-none focus:border-sky-500"
              >
                <option value="all">All Topics</option>
                {TOPICS.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bg-zinc-900 text-zinc-200 border border-zinc-700/60 rounded-md px-3 py-1.5 text-xs focus:outline-none focus:border-sky-500"
              >
                <option value="all">All Statuses</option>
                <option value="Not Started">Not Started</option>
                <option value="Attempted">Attempted</option>
                <option value="Solved">Solved</option>
              </select>
            </div>
          </div>

          {/* Bookmarks List */}
          {filteredBookmarks.length === 0 ? (
            <div className="p-8 text-center text-xs text-zinc-500 bg-zinc-900/30 border border-zinc-800 rounded-lg">
              No bookmarked questions matched the chosen filters.
            </div>
          ) : (
            <div className="divide-y divide-zinc-800/70 border border-zinc-800 rounded-lg overflow-hidden bg-zinc-900/40">
              {filteredBookmarks.map((q) => {
                const currentStatus = progress[q.id]?.status || 'Not Started';

                return (
                  <div
                    key={q.id}
                    className="flex items-center justify-between p-4 hover:bg-zinc-800/30 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Status Toggle */}
                      <button
                        onClick={() => {
                          const next =
                            currentStatus === 'Not Started'
                              ? 'Attempted'
                              : currentStatus === 'Attempted'
                              ? 'Solved'
                              : 'Not Started';
                          updateStatus(q.id, next);
                        }}
                        className="p-1 hover:bg-zinc-800 rounded transition-colors shrink-0"
                        title="Click to cycle status"
                      >
                        {currentStatus === 'Solved' ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : currentStatus === 'Attempted' ? (
                          <Clock className="w-4 h-4 text-amber-400" />
                        ) : (
                          <Circle className="w-4 h-4 text-zinc-600" />
                        )}
                      </button>

                      <div className="min-w-0">
                        <button
                          onClick={() => openDrawer(q)}
                          className="text-sm font-medium text-zinc-200 hover:text-white transition-colors truncate block text-left"
                        >
                          {q.title}
                        </button>
                        <div className="flex items-center gap-2 text-xs text-zinc-500 mt-0.5">
                          <span className="font-mono text-zinc-400">{q.topicName}</span>
                          <span>·</span>
                          <Badge variant="difficulty" difficulty={q.difficulty} />
                          <span>·</span>
                          <Badge variant="platform" platform={q.platform} />
                        </div>
                        {progress[q.id]?.notes && (
                          <p className="text-xs text-zinc-500 italic mt-1 font-mono truncate max-w-lg">
                            Note: {progress[q.id].notes}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <a
                        href={q.problemUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 text-zinc-500 hover:text-sky-400 rounded hover:bg-zinc-800 transition-colors"
                        title="Solve on external platform"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>

                      <button
                        onClick={() => toggleBookmark(q.id)}
                        className="p-1.5 text-amber-400 hover:text-rose-400 rounded hover:bg-zinc-800 transition-colors"
                        title="Remove bookmark"
                      >
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                      </button>

                      <Button size="sm" variant="ghost" onClick={() => openDrawer(q)}>
                        Notes
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
