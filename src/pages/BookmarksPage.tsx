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
import { TOPICS } from '../data/questionsData';
import type { Question } from '../types';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { EmptyState } from '../components/ui/EmptyState';

export const BookmarksPage: React.FC = () => {
  const { openDrawer } = useOutletContext<{ openDrawer: (q: Question) => void }>();
  const { bookmarks, progress, updateStatus, toggleBookmark, questions } = useCodeTrack();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [poppingCheckId, setPoppingCheckId] = useState<string | null>(null);
  const [poppingStarId, setPoppingStarId] = useState<string | null>(null);

  const bookmarkedQuestions = useMemo(() => {
    return bookmarks
      .map((id) => questions.find((q) => q.id === id))
      .filter(Boolean) as Question[];
  }, [bookmarks, questions]);

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-subtle">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono uppercase tracking-wider text-muted font-medium">
              Saved Collection
            </span>
            <span className="text-muted">·</span>
            <span className="text-xs text-muted font-mono">
              {bookmarkedQuestions.length} Questions Starred
            </span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-primary">Bookmarked Questions</h1>
          <p className="text-xs text-secondary mt-0.5">
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
          <div className="p-3.5 rounded-lg bg-surface-elevated border border-subtle flex flex-col md:flex-row gap-3">
            <div className="flex-1">
              <Input
                icon={<Search className="w-4 h-4" />}
                placeholder="Search saved problems..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              <select
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                className="bg-surface text-primary border border-subtle rounded-md px-3 py-1.5 text-xs focus:outline-none focus:border-default cursor-pointer"
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
                className="bg-surface text-primary border border-subtle rounded-md px-3 py-1.5 text-xs focus:outline-none focus:border-default cursor-pointer"
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
            <div className="p-8 text-center text-xs text-muted bg-surface-elevated border border-subtle rounded-lg">
              No bookmarks match your search filters.
            </div>
          ) : (
            <div className="divide-y divide-subtle border border-subtle rounded-md overflow-hidden bg-surface-elevated">
              {filteredBookmarks.map((q, idx) => {
                const currentStatus = progress[q.id]?.status || 'Not Started';

                return (
                  <div
                    key={q.id}
                    style={{ animationDelay: `${Math.min(idx * 30, 250)}ms` }}
                    className="flex items-center justify-between p-3.5 hover:bg-surface-subtle transition-colors duration-150 animate-fade-in"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <button
                        onClick={() => {
                          const nextStatus =
                            currentStatus === 'Not Started'
                              ? 'Attempted'
                              : currentStatus === 'Attempted'
                              ? 'Solved'
                              : 'Not Started';
                          if (nextStatus === 'Solved') {
                            setPoppingCheckId(q.id);
                            setTimeout(() => setPoppingCheckId(null), 350);
                          }
                          updateStatus(q.id, nextStatus);
                        }}
                        className="p-1 hover:bg-surface rounded transition-transform active:scale-90 shrink-0 cursor-pointer"
                        title="Click to cycle status"
                      >
                        {currentStatus === 'Solved' ? (
                          <CheckCircle2
                            className={`w-4 h-4 text-primary ${
                              poppingCheckId === q.id ? 'animate-check-pop' : ''
                            }`}
                          />
                        ) : currentStatus === 'Attempted' ? (
                          <Clock className="w-4 h-4 text-secondary" />
                        ) : (
                          <Circle className="w-4 h-4 text-muted" />
                        )}
                      </button>

                      <div className="min-w-0">
                        <button
                          onClick={() => openDrawer(q)}
                          className="text-sm font-medium text-primary hover:underline transition-colors truncate block text-left cursor-pointer"
                        >
                          {q.title}
                        </button>
                        <div className="flex items-center gap-2 text-xs text-muted mt-0.5">
                          <span className="font-mono">{q.topicName}</span>
                          <span>·</span>
                          <Badge variant="difficulty" difficulty={q.difficulty} />
                          <span>·</span>
                          <Badge variant="platform" platform={q.platform} />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => {
                          setPoppingStarId(q.id);
                          setTimeout(() => setPoppingStarId(null), 350);
                          toggleBookmark(q.id);
                        }}
                        className="p-1.5 text-primary hover:text-muted rounded hover:bg-surface transition-transform active:scale-90 cursor-pointer"
                        title="Remove bookmark"
                      >
                        <Star
                          className={`w-3.5 h-3.5 fill-current ${
                            poppingStarId === q.id ? 'animate-star-pop' : ''
                          }`}
                        />
                      </button>

                      <a
                        href={q.problemUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 text-muted hover:text-primary rounded hover:bg-surface transition-colors"
                        title="Open external link"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>

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
