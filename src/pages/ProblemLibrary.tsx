import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  CheckCircle2,
  Bookmark,
  ExternalLink,
  BookOpen,
  HelpCircle,
  Flame,
  Plus,
  Minus,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useProblems } from '../context/ProblemContext';
import type { Difficulty } from '../data/mockData';

type SheetTab = 'All Questions' | 'Love Babbar 450' | 'Striver A2Z';

export const ProblemLibrary: React.FC = () => {
  const {
    questions,
    toggleStatus,
    toggleBookmark,
    incrementRevision,
    decrementRevision,
  } = useProblems();

  const [searchParams] = useSearchParams();
  const urlSearch = searchParams.get('search') || '';

  const [activeSheetTab, setActiveSheetTab] = useState<SheetTab>('All Questions');
  const [searchQuery, setSearchQuery] = useState(urlSearch);
  const [selectedTopic, setSelectedTopic] = useState<string>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [mustDoOnly, setMustDoOnly] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 50;

  // Filtered by active sheet first to derive topics
  const sheetScopedQuestions = useMemo(() => {
    if (activeSheetTab === 'Love Babbar 450') {
      return questions.filter((q) => q.sheets.includes('Love Babbar 450'));
    }
    if (activeSheetTab === 'Striver A2Z') {
      return questions.filter((q) => q.sheets.includes('Striver A2Z'));
    }
    return questions;
  }, [questions, activeSheetTab]);

  // Unique topics from current sheet view
  const topics = useMemo(() => {
    const list = Array.from(new Set(sheetScopedQuestions.map((q) => q.topic))).sort();
    return ['All', ...list];
  }, [sheetScopedQuestions]);

  // Filtered Questions with all active criteria
  const filteredQuestions = useMemo(() => {
    return sheetScopedQuestions.filter((q) => {
      // Search query filter
      const query = searchQuery.toLowerCase().trim();
      if (query) {
        const matchTitle = q.title.toLowerCase().includes(query);
        const matchTopic = q.topic.toLowerCase().includes(query);
        const matchNumber = q.number.toString().includes(query);
        const matchPlatform = q.platform.toLowerCase().includes(query);
        if (!matchTitle && !matchTopic && !matchNumber && !matchPlatform) return false;
      }

      // Topic filter
      if (selectedTopic !== 'All' && q.topic !== selectedTopic) {
        return false;
      }

      // Difficulty filter
      if (selectedDifficulty !== 'All' && q.difficulty !== selectedDifficulty) {
        return false;
      }

      // Status filter
      if (selectedStatus !== 'All' && q.status !== selectedStatus) {
        return false;
      }

      // Must-Do filter
      if (mustDoOnly && !q.isMustDo) {
        return false;
      }

      return true;
    });
  }, [
    sheetScopedQuestions,
    searchQuery,
    selectedTopic,
    selectedDifficulty,
    selectedStatus,
    mustDoOnly,
  ]);

  // Reset to page 1 whenever filters change
  const handleSheetTabChange = (tab: SheetTab) => {
    setActiveSheetTab(tab);
    setSelectedTopic('All');
    setCurrentPage(1);
  };

  // Metrics for current filtered view
  const totalInTab = sheetScopedQuestions.length;
  const solvedCount = sheetScopedQuestions.filter((q) => q.status === 'Solved').length;
  const attemptedCount = sheetScopedQuestions.filter((q) => q.status === 'Attempted').length;
  const unsolvedCount = sheetScopedQuestions.filter((q) => q.status === 'Unsolved').length;
  const revisitCount = sheetScopedQuestions.filter((q) => q.isRevisit || q.bookmarked).length;

  // Pagination calculation
  const totalPages = Math.ceil(filteredQuestions.length / pageSize) || 1;
  const paginatedQuestions = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredQuestions.slice(start, start + pageSize);
  }, [filteredQuestions, currentPage]);

  const getDifficultyBadge = (difficulty: Difficulty) => {
    switch (difficulty) {
      case 'Easy':
        return 'text-[#10B981] bg-[#10B981]/10 border-[#10B981]/30';
      case 'Medium':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      case 'Hard':
        return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
    }
  };

  const getPlatformBadge = (platform: string) => {
    switch (platform) {
      case 'LeetCode':
        return 'text-amber-400 border-amber-500/30 bg-amber-500/5 hover:border-amber-400';
      case 'GeeksforGeeks':
        return 'text-[#10B981] border-[#10B981]/30 bg-[#10B981]/5 hover:border-[#10B981]';
      case 'CodingNinjas':
        return 'text-orange-400 border-orange-500/30 bg-orange-500/5 hover:border-orange-400';
      default:
        return 'text-[#6366F1] border-[#6366F1]/30 bg-[#6366F1]/5 hover:border-[#6366F1]';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Overview */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-[#18181B] border border-[#27272A] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-40 bg-gradient-to-bl from-[#6366F1]/10 via-[#10B981]/5 to-transparent pointer-events-none rounded-2xl" />

        <div className="relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6366F1]/20 to-[#10B981]/20 border border-[#6366F1]/30 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-[#6366F1]" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-[#FAFAFA] tracking-tight">Problem Library</h1>
              <p className="text-xs text-[#A1A1AA]">
                Full unified DSA catalog • Love Babbar 450 (448 Qs) & Striver A2Z (328 Qs) with synchronized state
              </p>
            </div>
          </div>
        </div>

        {/* Quick summary stats pills */}
        <div className="relative z-10 flex flex-wrap items-center gap-2">
          <div className="px-3 py-1.5 rounded-lg bg-[#09090B] border border-[#27272A] text-xs">
            <span className="text-[#A1A1AA]">Total: </span>
            <span className="font-bold text-[#FAFAFA]">{totalInTab}</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-[#10B981]/10 border border-[#10B981]/20 text-xs text-[#10B981]">
            <span>Solved: </span>
            <span className="font-bold">{solvedCount}</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-400">
            <span>Attempted: </span>
            <span className="font-bold">{attemptedCount}</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-[#27272A] border border-[#3F3F46] text-xs text-[#A1A1AA]">
            <span>Unsolved: </span>
            <span className="font-bold text-[#FAFAFA]">{unsolvedCount}</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs text-amber-400 flex items-center gap-1">
            <Bookmark className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span>Revisit: </span>
            <span className="font-bold">{revisitCount}</span>
          </div>
        </div>
      </div>

      {/* Main Sheet Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-1.5 rounded-xl bg-[#18181B] border border-[#27272A]">
        <div className="flex items-center gap-1.5 overflow-x-auto p-1">
          {(['All Questions', 'Love Babbar 450', 'Striver A2Z'] as SheetTab[]).map((tab) => {
            const count =
              tab === 'All Questions'
                ? questions.length
                : tab === 'Love Babbar 450'
                ? 448
                : 328;
            const isActive = activeSheetTab === tab;
            return (
              <button
                key={tab}
                onClick={() => handleSheetTabChange(tab)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-[#6366F1] text-white shadow-lg shadow-[#6366F1]/25 ring-1 ring-[#818CF8]'
                    : 'bg-[#09090B] text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-[#27272A] border border-[#27272A]'
                }`}
              >
                <span>{tab}</span>
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-[#27272A] text-[#A1A1AA]'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Must-Do Toggle Button */}
        <div className="flex items-center gap-2 px-2">
          <button
            onClick={() => {
              setMustDoOnly(!mustDoOnly);
              setCurrentPage(1);
            }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
              mustDoOnly
                ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border-amber-500/50 shadow-md shadow-amber-500/10'
                : 'bg-[#09090B] text-[#A1A1AA] hover:text-[#FAFAFA] border-[#27272A] hover:border-amber-500/40'
            }`}
            title="Filter high-yield FAANG & Tier-1 must-solve questions"
          >
            <Flame className={`w-3.5 h-3.5 ${mustDoOnly ? 'text-amber-400 fill-amber-400 animate-pulse' : 'text-[#71717A]'}`} />
            <span>🔥 Must-Do Only</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-[#18181B] border border-[#27272A] space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Input */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#71717A]" />
            <input
              type="text"
              placeholder="Search by title, topic, platform..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-[#09090B] border border-[#27272A] rounded-lg pl-9 pr-4 py-2 text-xs text-[#FAFAFA] placeholder-[#71717A] focus:outline-none focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1] transition-all"
            />
          </div>

          {/* Topic Dropdown */}
          <div>
            <select
              value={selectedTopic}
              onChange={(e) => {
                setSelectedTopic(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-[#09090B] border border-[#27272A] rounded-lg px-3 py-2 text-xs text-[#FAFAFA] focus:outline-none focus:border-[#6366F1] transition-all cursor-pointer"
            >
              <option value="All">All Topics ({topics.length - 1})</option>
              {topics
                .filter((t) => t !== 'All')
                .map((topic) => (
                  <option key={topic} value={topic}>
                    {topic}
                  </option>
                ))}
            </select>
          </div>

          {/* Difficulty Dropdown */}
          <div>
            <select
              value={selectedDifficulty}
              onChange={(e) => {
                setSelectedDifficulty(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-[#09090B] border border-[#27272A] rounded-lg px-3 py-2 text-xs text-[#FAFAFA] focus:outline-none focus:border-[#6366F1] transition-all cursor-pointer"
            >
              <option value="All">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>

          {/* Status Dropdown */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-[#09090B] border border-[#27272A] rounded-lg px-3 py-2 text-xs text-[#FAFAFA] focus:outline-none focus:border-[#6366F1] transition-all cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Solved">Solved</option>
              <option value="Attempted">Attempted</option>
              <option value="Unsolved">Unsolved</option>
            </select>
          </div>
        </div>

        {/* Quick Reset if filters are applied */}
        {(searchQuery || selectedTopic !== 'All' || selectedDifficulty !== 'All' || selectedStatus !== 'All' || mustDoOnly) && (
          <div className="flex items-center justify-between pt-2 border-t border-[#27272A] text-xs">
            <span className="text-xs text-[#71717A]">
              Showing {filteredQuestions.length} matching questions
            </span>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedTopic('All');
                setSelectedDifficulty('All');
                setSelectedStatus('All');
                setMustDoOnly(false);
                setCurrentPage(1);
              }}
              className="text-[#6366F1] hover:underline text-xs font-semibold flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Main Problem Data Table */}
      <div className="rounded-xl bg-[#18181B] border border-[#27272A] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#09090B] border-b border-[#27272A] text-[11px] font-semibold text-[#71717A] uppercase tracking-wider">
                <th className="py-3.5 px-4 w-32">Status</th>
                <th className="py-3.5 px-4">Problem Name & Tags</th>
                <th className="py-3.5 px-4 w-36">Topic</th>
                <th className="py-3.5 px-4 w-28">Difficulty</th>
                <th className="py-3.5 px-4 w-36 text-center">Revisions</th>
                <th className="py-3.5 px-4 w-36">Platform Link</th>
                <th className="py-3.5 px-4 text-center w-20">Revisit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#27272A] text-xs">
              {paginatedQuestions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-[#A1A1AA]">
                    <div className="flex flex-col items-center justify-center space-y-2.5">
                      <HelpCircle className="w-9 h-9 text-[#71717A]" />
                      <p className="font-semibold text-sm text-[#FAFAFA]">No questions found</p>
                      <p className="text-xs text-[#71717A] max-w-sm">
                        No problems match the current filter combination. Try adjusting search keywords or resetting filters.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedQuestions.map((q) => (
                  <tr
                    key={q.id}
                    className="hover:bg-[#27272A]/40 transition-colors group"
                  >
                    {/* Status Pill with One-Click State Cycling */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleStatus(q.id)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all border cursor-pointer ${
                          q.status === 'Solved'
                            ? 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/30 hover:bg-[#10B981]/20'
                            : q.status === 'Attempted'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20'
                            : 'bg-[#27272A] text-[#A1A1AA] border-[#3F3F46] hover:border-[#6366F1] hover:text-[#FAFAFA]'
                        }`}
                        title="Click to toggle: Unsolved -> Attempted -> Solved"
                      >
                        <CheckCircle2
                          className={`w-3.5 h-3.5 ${
                            q.status === 'Solved' ? 'text-[#10B981]' : ''
                          }`}
                        />
                        <span>{q.status}</span>
                      </button>
                    </td>

                    {/* Question Name & Sheet Tags */}
                    <td className="py-3.5 px-4 font-medium text-[#FAFAFA]">
                      <div className="flex flex-col space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[#71717A] font-mono text-[11px]">
                            #{q.number}
                          </span>
                          <a
                            href={q.problemUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="hover:text-[#6366F1] font-semibold text-sm transition-colors"
                          >
                            {q.title}
                          </a>

                          {/* Must-Do Flame Badge */}
                          {q.isMustDo && (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                              🔥 Must-Do
                            </span>
                          )}

                          {/* Sheet Tags */}
                          {q.sheets.map((s) => (
                            <span
                              key={s}
                              className={`text-[10px] px-1.5 py-0.2 rounded font-medium border ${
                                s === 'Love Babbar 450'
                                  ? 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/30'
                                  : 'bg-[#6366F1]/10 text-[#818CF8] border-[#6366F1]/30'
                              }`}
                            >
                              {s === 'Love Babbar 450' ? 'Babbar 450' : 'Striver A2Z'}
                            </span>
                          ))}
                        </div>

                        {q.notes && (
                          <p className="text-[11px] text-[#71717A] line-clamp-1 italic">
                            {q.notes}
                          </p>
                        )}
                      </div>
                    </td>

                    {/* Topic */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="px-2.5 py-0.5 rounded-md bg-[#27272A] text-[11px] font-medium text-[#FAFAFA] border border-[#3F3F46]">
                        {q.topic}
                      </span>
                    </td>

                    {/* Difficulty */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`px-2.5 py-0.5 rounded-md text-[11px] font-semibold border ${getDifficultyBadge(
                          q.difficulty
                        )}`}
                      >
                        {q.difficulty}
                      </span>
                    </td>

                    {/* Interactive Revision Counter (- / +) */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-center">
                      <div className="inline-flex items-center gap-1.5 bg-[#09090B] border border-[#27272A] rounded-lg p-1">
                        <button
                          onClick={() => decrementRevision(q.id)}
                          className="w-5 h-5 rounded flex items-center justify-center text-[#71717A] hover:text-[#FAFAFA] hover:bg-[#27272A] transition-colors cursor-pointer disabled:opacity-30"
                          disabled={(q.revisionCount || 0) <= 0}
                          title="Decrease revision count"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center font-mono font-bold text-xs text-[#FAFAFA]">
                          {q.revisionCount || 0}
                        </span>
                        <button
                          onClick={() => incrementRevision(q.id)}
                          className="w-5 h-5 rounded flex items-center justify-center text-[#71717A] hover:text-[#10B981] hover:bg-[#27272A] transition-colors cursor-pointer"
                          title="Increase revision count"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </td>

                    {/* Platform Link */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <a
                        href={q.problemUrl}
                        target="_blank"
                        rel="noreferrer"
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium border transition-all ${getPlatformBadge(
                          q.platform
                        )}`}
                      >
                        <span className="font-semibold">{q.platform}</span>
                        <ExternalLink className="w-3 h-3 opacity-70" />
                      </a>
                    </td>

                    {/* Save for Revisit Bookmark */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-center">
                      <button
                        onClick={() => toggleBookmark(q.id)}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                          q.isRevisit || q.bookmarked
                            ? 'text-amber-400 bg-amber-500/10'
                            : 'text-[#71717A] hover:text-[#FAFAFA] hover:bg-[#27272A]'
                        }`}
                        title={q.isRevisit || q.bookmarked ? 'Saved in Revision Deck' : 'Bookmark for revision'}
                      >
                        <Bookmark
                          className={`w-4 h-4 ${
                            q.isRevisit || q.bookmarked ? 'fill-amber-400 text-amber-400' : ''
                          }`}
                        />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Pagination & Footer */}
        <div className="p-4 bg-[#09090B] border-t border-[#27272A] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#A1A1AA]">
          <div className="flex items-center gap-2">
            <span>
              Showing <span className="font-semibold text-[#FAFAFA]">{paginatedQuestions.length}</span> of{' '}
              <span className="font-semibold text-[#FAFAFA]">{filteredQuestions.length}</span> matching problems
              {filteredQuestions.length !== sheetScopedQuestions.length && (
                <span> (filtered from {sheetScopedQuestions.length})</span>
              )}
            </span>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-md bg-[#18181B] border border-[#27272A] text-[#A1A1AA] hover:text-[#FAFAFA] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                title="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="px-2.5 py-1 rounded-md bg-[#18181B] border border-[#27272A] text-xs font-mono font-medium text-[#FAFAFA]">
                Page {currentPage} / {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-md bg-[#18181B] border border-[#27272A] text-[#A1A1AA] hover:text-[#FAFAFA] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                title="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
