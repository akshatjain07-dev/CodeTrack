import React, { useState, useMemo } from 'react';
import { useOutletContext, useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Circle,
  Star,
  ExternalLink,
  RotateCcw,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useCodeTrack } from '../hooks/useCodeTrack';
import { QUESTIONS, TOPICS } from '../data/questionsData';
import type { Difficulty, Question } from '../types';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { EmptyState } from '../components/ui/EmptyState';

const ITEMS_PER_PAGE = 25;

export const AllQuestionsPage: React.FC = () => {
  const { openDrawer } = useOutletContext<{ openDrawer: (q: Question) => void }>();
  const { progress, bookmarks, updateStatus, toggleBookmark } = useCodeTrack();

  const [searchParams, setSearchParams] = useSearchParams();

  // Search & Filter state synced with URL params where convenient
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedTopic, setSelectedTopic] = useState(searchParams.get('topic') || 'all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>(searchParams.get('diff') || 'all');
  const [selectedStatus, setSelectedStatus] = useState<string>(searchParams.get('status') || 'all');
  const [selectedPlatform, setSelectedPlatform] = useState<string>(searchParams.get('platform') || 'all');
  const [sortBy, setSortBy] = useState<'default' | 'title' | 'difficulty'>('default');
  const [currentPage, setCurrentPage] = useState(1);

  // Filter questions
  const filteredQuestions = useMemo(() => {
    return QUESTIONS.filter((q) => {
      // Search
      if (searchQuery.trim()) {
        const qText = searchQuery.toLowerCase();
        const matches =
          q.title.toLowerCase().includes(qText) ||
          q.topicName.toLowerCase().includes(qText) ||
          q.subtopic.toLowerCase().includes(qText);
        if (!matches) return false;
      }

      // Topic
      if (selectedTopic !== 'all' && q.topicId !== selectedTopic) {
        return false;
      }

      // Difficulty
      if (selectedDifficulty !== 'all' && q.difficulty !== selectedDifficulty) {
        return false;
      }

      // Platform
      if (selectedPlatform !== 'all' && q.platform !== selectedPlatform) {
        return false;
      }

      // Status
      if (selectedStatus !== 'all') {
        const curStatus = progress[q.id]?.status || 'Not Started';
        if (curStatus !== selectedStatus) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      if (sortBy === 'difficulty') {
        const order: Record<Difficulty, number> = { Easy: 1, Medium: 2, Hard: 3 };
        return order[a.difficulty] - order[b.difficulty];
      }
      return 0; // Default TakeUForward sheet ordering
    });
  }, [searchQuery, selectedTopic, selectedDifficulty, selectedStatus, selectedPlatform, sortBy, progress]);

  // Pagination
  const totalPages = Math.ceil(filteredQuestions.length / ITEMS_PER_PAGE);
  const paginatedQuestions = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredQuestions.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredQuestions, currentPage]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedTopic('all');
    setSelectedDifficulty('all');
    setSelectedStatus('all');
    setSelectedPlatform('all');
    setSortBy('default');
    setCurrentPage(1);
    setSearchParams({});
  };

  const hasActiveFilters =
    searchQuery ||
    selectedTopic !== 'all' ||
    selectedDifficulty !== 'all' ||
    selectedStatus !== 'all' ||
    selectedPlatform !== 'all';

  return (
    <div className="space-y-5">
      {/* ================= PAGE HEADER ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-zinc-800/60">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono uppercase tracking-wider text-sky-400 font-semibold">
              Master Problem Catalog
            </span>
            <span className="text-zinc-600">·</span>
            <span className="text-xs text-zinc-500 font-mono">
              TakeUForward Checklist ({QUESTIONS.length} Problems)
            </span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">All DSA Questions</h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Browse, filter, and track questions from the TakeUForward Striver A2Z sheet.
          </p>
        </div>

        {hasActiveFilters && (
          <Button size="sm" variant="outline" onClick={handleResetFilters} icon={<RotateCcw className="w-3.5 h-3.5" />}>
            Reset Filters
          </Button>
        )}
      </div>

      {/* ================= FILTER & SEARCH BAR ================= */}
      <div className="p-3.5 rounded-lg bg-zinc-900/60 border border-zinc-800 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search Input */}
          <div className="md:col-span-4">
            <Input
              icon={<Search className="w-4 h-4" />}
              placeholder="Filter by question, topic, or subtopic..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          {/* Topic Select */}
          <div className="md:col-span-2">
            <select
              value={selectedTopic}
              onChange={(e) => {
                setSelectedTopic(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-zinc-900 text-zinc-200 border border-zinc-700/60 rounded-md px-3 py-1.5 text-xs focus:outline-none focus:border-sky-500"
            >
              <option value="all">All Topics ({TOPICS.length})</option>
              {TOPICS.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          {/* Difficulty Select */}
          <div className="md:col-span-2">
            <select
              value={selectedDifficulty}
              onChange={(e) => {
                setSelectedDifficulty(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-zinc-900 text-zinc-200 border border-zinc-700/60 rounded-md px-3 py-1.5 text-xs focus:outline-none focus:border-sky-500"
            >
              <option value="all">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>

          {/* Status Select */}
          <div className="md:col-span-2">
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-zinc-900 text-zinc-200 border border-zinc-700/60 rounded-md px-3 py-1.5 text-xs focus:outline-none focus:border-sky-500"
            >
              <option value="all">All Statuses</option>
              <option value="Not Started">Not Started</option>
              <option value="Attempted">Attempted</option>
              <option value="Solved">Solved</option>
            </select>
          </div>

          {/* Platform Select */}
          <div className="md:col-span-2">
            <select
              value={selectedPlatform}
              onChange={(e) => {
                setSelectedPlatform(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-zinc-900 text-zinc-200 border border-zinc-700/60 rounded-md px-3 py-1.5 text-xs focus:outline-none focus:border-sky-500"
            >
              <option value="all">All Platforms</option>
              <option value="LeetCode">LeetCode</option>
              <option value="GeeksforGeeks">GeeksforGeeks</option>
              <option value="CodingNinjas">CodingNinjas</option>
              <option value="TakeUForward">TakeUForward</option>
            </select>
          </div>
        </div>

        {/* Results Count & Sort info */}
        <div className="flex items-center justify-between text-xs text-zinc-400 pt-1 border-t border-zinc-800/40">
          <span className="font-mono">
            Showing {filteredQuestions.length} of {QUESTIONS.length} questions
          </span>

          <div className="flex items-center gap-3">
            <span className="text-zinc-500">Sort by:</span>
            <button
              onClick={() => setSortBy(sortBy === 'default' ? 'title' : sortBy === 'title' ? 'difficulty' : 'default')}
              className="text-zinc-300 hover:text-white flex items-center gap-1 font-mono hover:underline"
            >
              <ArrowUpDown className="w-3 h-3 text-sky-400" />
              {sortBy === 'default' ? 'Curriculum Order' : sortBy === 'title' ? 'Title (A-Z)' : 'Difficulty'}
            </button>
          </div>
        </div>
      </div>

      {/* ================= TABLE LIST VIEW ================= */}
      {filteredQuestions.length === 0 ? (
        <EmptyState
          icon={<Filter className="w-6 h-6" />}
          title="No questions match the current filters"
          description="Try broadening your search term or clearing one of the topic, difficulty, or status dropdowns."
          actionText="Clear All Filters"
          onAction={handleResetFilters}
        />
      ) : (
        <div className="rounded-lg border border-zinc-800 overflow-hidden bg-zinc-900/40">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-900/80 text-zinc-400 border-b border-zinc-800 font-mono uppercase text-[11px] tracking-wider select-none">
                <tr>
                  <th className="py-3 px-4 w-12 text-center">Status</th>
                  <th className="py-3 px-4">Problem Title</th>
                  <th className="py-3 px-4 hidden md:table-cell">Topic & Subtopic</th>
                  <th className="py-3 px-4 w-28">Difficulty</th>
                  <th className="py-3 px-4 w-28 hidden lg:table-cell">Platform</th>
                  <th className="py-3 px-4 w-24 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 font-sans">
                {paginatedQuestions.map((q) => {
                  const currentStatus = progress[q.id]?.status || 'Not Started';
                  const isBookmarked = bookmarks.includes(q.id);

                  return (
                    <tr
                      key={q.id}
                      className="hover:bg-zinc-800/30 transition-colors group"
                    >
                      {/* Status Checkbox / Cycler */}
                      <td className="py-3 px-4 text-center">
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
                          className="p-1 hover:bg-zinc-800 rounded transition-colors"
                          title={`Current: ${currentStatus}. Click to cycle.`}
                        >
                          {currentStatus === 'Solved' ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          ) : currentStatus === 'Attempted' ? (
                            <Clock className="w-4 h-4 text-amber-400" />
                          ) : (
                            <Circle className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400" />
                          )}
                        </button>
                      </td>

                      {/* Title */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openDrawer(q)}
                            className="font-medium text-zinc-200 hover:text-white transition-colors text-left"
                          >
                            {q.title}
                          </button>
                          <a
                            href={q.problemUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-zinc-600 hover:text-sky-400 p-0.5 rounded transition-colors"
                            title="Open external problem link"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                        {progress[q.id]?.notes && (
                          <span className="text-[11px] text-zinc-500 font-mono block truncate max-w-md mt-0.5">
                            Note: {progress[q.id].notes}
                          </span>
                        )}
                      </td>

                      {/* Topic & Subtopic */}
                      <td className="py-3 px-4 hidden md:table-cell text-zinc-400">
                        <span className="px-2 py-0.5 rounded bg-zinc-800/60 border border-zinc-700/40 text-[11px] font-mono text-zinc-300 mr-1.5">
                          {q.topicName}
                        </span>
                        <span className="text-zinc-500 font-mono text-[11px]">
                          {q.subtopic}
                        </span>
                      </td>

                      {/* Difficulty */}
                      <td className="py-3 px-4">
                        <Badge variant="difficulty" difficulty={q.difficulty} />
                      </td>

                      {/* Platform */}
                      <td className="py-3 px-4 hidden lg:table-cell">
                        <Badge variant="platform" platform={q.platform} />
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => toggleBookmark(q.id)}
                            className={`p-1.5 rounded hover:bg-zinc-800 transition-colors ${
                              isBookmarked ? 'text-amber-400' : 'text-zinc-600 hover:text-zinc-400'
                            }`}
                            title={isBookmarked ? 'Bookmarked' : 'Add bookmark'}
                          >
                            <Star className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-amber-400' : ''}`} />
                          </button>
                          <Button size="sm" variant="ghost" onClick={() => openDrawer(q)}>
                            Notes
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="p-3 border-t border-zinc-800 bg-zinc-900/60 flex items-center justify-between text-xs text-zinc-400">
              <span className="font-mono">
                Page {currentPage} of {totalPages}
              </span>
              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  icon={<ChevronLeft className="w-3.5 h-3.5" />}
                >
                  Prev
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  icon={<ChevronRight className="w-3.5 h-3.5" />}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
