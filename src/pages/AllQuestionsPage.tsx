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
  Info,
  Layers,
  FileSpreadsheet,
  X,
  Upload,
} from 'lucide-react';
import { useCodeTrack } from '../hooks/useCodeTrack';
import { TOPICS } from '../data/questionsData';
import { getSheetById } from '../data/sheetsData';
import type { Difficulty, Question } from '../types';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { EmptyState } from '../components/ui/EmptyState';
import { SheetImportModal } from '../components/ui/SheetImportModal';

const ITEMS_PER_PAGE = 25;

export const AllQuestionsPage: React.FC = () => {
  const { openDrawer } = useOutletContext<{ openDrawer: (q: Question) => void }>();
  const { progress, bookmarks, updateStatus, toggleBookmark, questions, sheetStats } = useCodeTrack();

  const [searchParams, setSearchParams] = useSearchParams();
  const [isImportOpen, setIsImportOpen] = useState(false);

  // Search & Filter state derived directly from URL params
  const searchQuery = searchParams.get('search') || '';
  const selectedTopic = searchParams.get('topic') || 'all';
  const selectedSheet = searchParams.get('sheet') || 'all';
  const selectedDifficulty = searchParams.get('diff') || 'all';
  const selectedStatus = searchParams.get('status') || 'all';
  const selectedPlatform = searchParams.get('platform') || 'all';
  const [sortBy, setSortBy] = useState<'default' | 'title' | 'difficulty'>('default');
  const [currentPage, setCurrentPage] = useState(1);
  const [poppingCheckId, setPoppingCheckId] = useState<string | null>(null);
  const [poppingStarId, setPoppingStarId] = useState<string | null>(null);

  const updateFilter = (key: string, val: string) => {
    const next = new URLSearchParams(searchParams);
    if (val && val !== 'all' && val.trim() !== '') {
      next.set(key, val);
    } else {
      next.delete(key);
    }
    setSearchParams(next);
    setCurrentPage(1);
  };

  const activeSheetInfo = useMemo(() => {
    if (selectedSheet === 'all') return null;
    return sheetStats.find((s) => s.id === selectedSheet) || getSheetById(selectedSheet);
  }, [selectedSheet, sheetStats]);

  const activeTopicInfo = useMemo(() => {
    if (selectedTopic === 'all') return null;
    return TOPICS.find((t) => t.id === selectedTopic);
  }, [selectedTopic]);

  // Filter questions
  const filteredQuestions = useMemo(() => {
    // If an unimported sheet is selected, return empty list
    if (activeSheetInfo && !activeSheetInfo.isImported) {
      return [];
    }

    return questions.filter((q) => {
      // Search
      if (searchQuery.trim()) {
        const qText = searchQuery.toLowerCase();
        const matches =
          q.title.toLowerCase().includes(qText) ||
          q.topicName.toLowerCase().includes(qText) ||
          q.subtopic.toLowerCase().includes(qText);
        if (!matches) return false;
      }

      // Sheet filter
      if (selectedSheet !== 'all' && (!q.sheets || !q.sheets.includes(selectedSheet))) {
        return false;
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
  }, [questions, selectedSheet, searchQuery, selectedTopic, selectedDifficulty, selectedStatus, selectedPlatform, sortBy, progress, activeSheetInfo]);

  // Pagination
  const totalPages = Math.ceil(filteredQuestions.length / ITEMS_PER_PAGE);
  const paginatedQuestions = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredQuestions.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredQuestions, currentPage]);

  const handleResetFilters = () => {
    setSortBy('default');
    setCurrentPage(1);
    setSearchParams({});
  };

  const removeFilter = (key: string) => {
    const next = new URLSearchParams(searchParams);
    next.delete(key);
    setSearchParams(next);
    setCurrentPage(1);
  };

  const hasActiveFilters =
    searchQuery ||
    selectedTopic !== 'all' ||
    selectedSheet !== 'all' ||
    selectedDifficulty !== 'all' ||
    selectedStatus !== 'all' ||
    selectedPlatform !== 'all';

  return (
    <div className="space-y-5">
      {/* ================= PAGE HEADER ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-subtle">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono uppercase tracking-wider text-muted font-medium">
              Master Problem Catalog
            </span>
            <span className="text-muted">·</span>
            <span className="text-xs text-muted font-mono">
              {activeSheetInfo ? activeSheetInfo.name : 'All Collections'} ({activeSheetInfo ? (activeSheetInfo.totalQuestions || 0) : questions.length} Problems)
            </span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-primary">All DSA Questions</h1>
          <p className="text-xs text-secondary mt-0.5">
            {activeSheetInfo
              ? activeSheetInfo.description
              : 'Browse, filter, and track questions across verified Striver A2Z and NeetCode problem catalogs.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setIsImportOpen(true)}
            icon={<Upload className="w-3.5 h-3.5 text-accent-pink" />}
          >
            Import Sheet
          </Button>

          {hasActiveFilters && (
            <Button size="sm" variant="outline" onClick={handleResetFilters} icon={<RotateCcw className="w-3.5 h-3.5" />}>
              Reset Filters
            </Button>
          )}
        </div>
      </div>

      {/* ================= UNIMPORTED SHEET NOTICE BANNER ================= */}
      {activeSheetInfo && !activeSheetInfo.isImported && (
        <div className="p-4 rounded-lg bg-surface border border-subtle flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-md bg-surface-subtle border border-subtle text-secondary shrink-0">
              <Info className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-primary">{activeSheetInfo.name}</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-surface-subtle text-muted border border-subtle">
                  Collection Not Yet Imported
                </span>
              </div>
              <p className="text-xs text-secondary mt-0.5">
                This curriculum by {activeSheetInfo.author} is not yet imported into your workspace. Currently,{' '}
                <strong className="text-primary font-medium">Striver A2Z, NeetCode 150, and NeetCode 250</strong> are active.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              size="sm"
              variant="primary"
              onClick={() => setIsImportOpen(true)}
              icon={<Upload className="w-3.5 h-3.5" />}
            >
              Import {activeSheetInfo.name}
            </Button>
            <button
              onClick={() => {
                const newParams = new URLSearchParams(searchParams);
                newParams.set('sheet', 'striver-a2z');
                setSearchParams(newParams);
              }}
              className="px-3 py-1.5 rounded-md text-xs font-medium bg-black text-white dark:bg-white dark:text-black hover:opacity-90 transition-all cursor-pointer shadow-xs active:scale-95"
            >
              Switch to Striver A2Z
            </button>
            <button
              onClick={() => removeFilter('sheet')}
              className="px-3 py-1.5 rounded-md text-xs font-medium text-secondary hover:text-primary hover:bg-surface-subtle border border-subtle transition-all cursor-pointer active:scale-95"
            >
              Show All Questions
            </button>
          </div>
        </div>
      )}

      {/* ================= ACTIVE FILTER CHIPS ================= */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-muted text-[11px] font-mono mr-1">Active filters:</span>
          {activeSheetInfo && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-surface border border-subtle text-primary font-mono text-[11px]">
              <FileSpreadsheet className="w-3 h-3 text-secondary" />
              Sheet: {activeSheetInfo.name}
              <button
                onClick={() => removeFilter('sheet')}
                className="hover:text-primary text-muted cursor-pointer ml-0.5"
                aria-label="Remove sheet filter"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {activeTopicInfo && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-surface border border-subtle text-primary font-mono text-[11px]">
              <Layers className="w-3 h-3 text-secondary" />
              Topic: {activeTopicInfo.name}
              <button
                onClick={() => removeFilter('topic')}
                className="hover:text-primary text-muted cursor-pointer ml-0.5"
                aria-label="Remove topic filter"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {selectedDifficulty !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-surface border border-subtle text-primary font-mono text-[11px]">
              Diff: {selectedDifficulty}
              <button
                onClick={() => removeFilter('diff')}
                className="hover:text-primary text-muted cursor-pointer ml-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {selectedStatus !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-surface border border-subtle text-primary font-mono text-[11px]">
              Status: {selectedStatus}
              <button
                onClick={() => removeFilter('status')}
                className="hover:text-primary text-muted cursor-pointer ml-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {selectedPlatform !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-surface border border-subtle text-primary font-mono text-[11px]">
              Platform: {selectedPlatform}
              <button
                onClick={() => removeFilter('platform')}
                className="hover:text-primary text-muted cursor-pointer ml-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {searchQuery && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-surface border border-subtle text-primary font-mono text-[11px]">
              Search: "{searchQuery}"
              <button
                onClick={() => removeFilter('search')}
                className="hover:text-primary text-muted cursor-pointer ml-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>
      )}

      {/* ================= FILTER & SEARCH BAR ================= */}
      <div className="p-3.5 rounded-lg bg-surface-elevated border border-subtle space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search Input */}
          <div className="md:col-span-4">
            <Input
              icon={<Search className="w-4 h-4" />}
              placeholder="Filter by question, topic, or subtopic..."
              value={searchQuery}
              onChange={(e) => updateFilter('search', e.target.value)}
            />
          </div>

          {/* Topic Select */}
          <div className="md:col-span-2">
            <select
              value={selectedTopic}
              onChange={(e) => updateFilter('topic', e.target.value)}
              className="w-full bg-surface text-primary border border-subtle rounded-md px-3 py-1.5 text-xs focus:outline-none focus:border-default cursor-pointer"
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
              onChange={(e) => updateFilter('diff', e.target.value)}
              className="w-full bg-surface text-primary border border-subtle rounded-md px-3 py-1.5 text-xs focus:outline-none focus:border-default cursor-pointer"
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
              onChange={(e) => updateFilter('status', e.target.value)}
              className="w-full bg-surface text-primary border border-subtle rounded-md px-3 py-1.5 text-xs focus:outline-none focus:border-default cursor-pointer"
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
              onChange={(e) => updateFilter('platform', e.target.value)}
              className="w-full bg-surface text-primary border border-subtle rounded-md px-3 py-1.5 text-xs focus:outline-none focus:border-default cursor-pointer"
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
        <div className="flex items-center justify-between text-xs text-secondary pt-1 border-t border-subtle">
          <span className="font-mono">
            Showing {filteredQuestions.length} of {questions.length} questions
          </span>

          <div className="flex items-center gap-3">
            <span className="text-muted">Sort by:</span>
            <button
              onClick={() => setSortBy(sortBy === 'default' ? 'title' : sortBy === 'title' ? 'difficulty' : 'default')}
              className="text-primary hover:underline flex items-center gap-1 font-mono cursor-pointer"
            >
              <ArrowUpDown className="w-3 h-3 text-secondary" />
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
        <div className="rounded-lg border border-subtle overflow-hidden bg-surface-elevated">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface text-muted border-b border-subtle font-mono uppercase text-[11px] tracking-wider select-none">
                <tr>
                  <th className="py-3 px-4 w-12 text-center">Status</th>
                  <th className="py-3 px-4">Problem Title</th>
                  <th className="py-3 px-4 hidden md:table-cell">Topic & Subtopic</th>
                  <th className="py-3 px-4 w-28">Difficulty</th>
                  <th className="py-3 px-4 w-28 hidden lg:table-cell">Platform</th>
                  <th className="py-3 px-4 w-24 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-subtle font-sans">
                {paginatedQuestions.map((q, idx) => {
                  const currentStatus = progress[q.id]?.status || 'Not Started';
                  const isBookmarked = bookmarks.includes(q.id);

                  return (
                    <tr
                      key={q.id}
                      style={{ animationDelay: `${Math.min(idx * 20, 200)}ms` }}
                      className="hover:bg-surface-subtle transition-colors duration-150 group animate-fade-in"
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
                            if (next === 'Solved') {
                              setPoppingCheckId(q.id);
                              setTimeout(() => setPoppingCheckId(null), 350);
                            }
                            updateStatus(q.id, next);
                          }}
                          className="p-1 hover:bg-surface rounded transition-transform active:scale-90 cursor-pointer"
                          title={`Current: ${currentStatus}. Click to cycle.`}
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
                            <Circle className="w-4 h-4 text-muted group-hover:text-secondary" />
                          )}
                        </button>
                      </td>

                      {/* Title & Drawer trigger */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openDrawer(q)}
                            className="font-medium text-primary hover:underline text-left cursor-pointer transition-colors"
                          >
                            {q.title}
                          </button>
                        </div>
                      </td>

                      {/* Topic & Subtopic */}
                      <td className="py-3 px-4 hidden md:table-cell">
                        <span className="text-secondary font-mono text-[11px]">
                          {q.topicName}
                        </span>
                        {q.subtopic && (
                          <span className="text-muted text-[11px] block truncate">
                            {q.subtopic}
                          </span>
                        )}
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
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setPoppingStarId(q.id);
                              setTimeout(() => setPoppingStarId(null), 350);
                              toggleBookmark(q.id);
                            }}
                            className={`p-1.5 rounded hover:bg-surface transition-transform active:scale-90 cursor-pointer ${
                              isBookmarked ? 'text-primary' : 'text-muted hover:text-secondary'
                            }`}
                            title={isBookmarked ? 'Remove bookmark' : 'Bookmark question'}
                          >
                            <Star
                              className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current' : ''} ${
                                poppingStarId === q.id ? 'animate-star-pop' : ''
                              }`}
                            />
                          </button>

                          <a
                            href={q.problemUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-muted hover:text-primary rounded hover:bg-surface transition-colors"
                            title="Open problem link in new tab"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
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
            <div className="p-3 bg-surface border-t border-subtle flex items-center justify-between text-xs text-secondary">
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
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Sheet Import Modal */}
      <SheetImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        defaultSheetId={selectedSheet !== 'all' ? selectedSheet : 'love-babbar-450'}
      />
    </div>
  );
};
