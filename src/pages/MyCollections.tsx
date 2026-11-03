import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Layers,
  Sparkles,
  ExternalLink,
  Check,
  Search,
  Bookmark,
  ChevronRight,
} from 'lucide-react';
import { useProblems } from '../context/ProblemContext';
import type { Difficulty, Status } from '../data/mockData';

export const MyCollections: React.FC = () => {
  const { sheets, activeSheetId, setActiveSheetId, questions, toggleStatus, toggleBookmark } =
    useProblems();
  const navigate = useNavigate();

  // Selected sheet to view questions in detail
  const [selectedSheetId, setSelectedSheetId] = useState<string>(activeSheetId || 'striver-a2z');
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  const currentSheet = sheets.find((s) => s.id === selectedSheetId) || sheets[0];

  // Questions belonging to this sheet
  const sheetQuestions = useMemo(() => {
    if (!currentSheet) return [];
    const sheetTitleLower = currentSheet.title.toLowerCase();

    return questions.filter((q) => {
      // Check membership
      const belongs = q.sheets.some((s) => {
        const sLower = s.toLowerCase();
        if (currentSheet.id === 'striver-a2z') return sLower.includes('striver');
        if (currentSheet.id === 'love-babbar-450') return sLower.includes('babbar');
        if (currentSheet.id === 'neetcode-150') return sLower.includes('neetcode 150');
        if (currentSheet.id === 'neetcode-250') return sLower.includes('neetcode 250') || sLower.includes('neetcode');
        if (currentSheet.id === 'apna-college') return sLower.includes('apna');
        return sLower.includes(sheetTitleLower);
      });

      if (!belongs) return false;

      // Filter by search
      if (searchFilter.trim()) {
        const query = searchFilter.toLowerCase().trim();
        const matchTitle = q.title.toLowerCase().includes(query);
        const matchTopic = q.topic.toLowerCase().includes(query);
        if (!matchTitle && !matchTopic) return false;
      }

      // Filter by difficulty
      if (difficultyFilter !== 'All' && q.difficulty !== difficultyFilter) {
        return false;
      }

      // Filter by status
      if (statusFilter !== 'All' && q.status !== statusFilter) {
        return false;
      }

      return true;
    });
  }, [questions, currentSheet, searchFilter, difficultyFilter, statusFilter]);

  const solvedInSheet = sheetQuestions.filter((q) => q.status === 'Solved').length;

  const getDifficultyBadge = (difficulty: Difficulty) => {
    switch (difficulty) {
      case 'Easy':
        return 'text-[#10B981] bg-[#10B981]/10 border-[#10B981]/25';
      case 'Medium':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/25';
      case 'Hard':
        return 'text-rose-400 bg-rose-500/10 border-rose-500/25';
    }
  };

  const getStatusBadge = (status: Status) => {
    switch (status) {
      case 'Solved':
        return 'bg-emerald-500/10 text-[#10B981] border-emerald-500/30';
      case 'Attempted':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'Unsolved':
        return 'bg-[#27272A]/50 text-[#71717A] border-[#27272A]';
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-[#18181B] border border-[#27272A]">
        <div>
          <h1 className="text-2xl font-black text-[#FAFAFA] flex items-center gap-2.5">
            <Layers className="w-6 h-6 text-[#6366F1]" />
            DSA Collections & Supported Sheets
          </h1>
          <p className="text-xs text-[#A1A1AA] mt-1">
            Top tier industry roadmaps with progress bars, unified tracking, and full problem checklists.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#6366F1]/10 border border-[#6366F1]/20 text-[#6366F1] text-xs font-semibold">
          <Sparkles className="w-4 h-4" />
          <span>Active Focus: {sheets.find((s) => s.id === activeSheetId)?.title || 'Striver A2Z'}</span>
        </div>
      </div>

      {/* 5 Sheet Cards Grid */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-[#A1A1AA]">
          Available DSA Sheets (5 Curated Roadmaps)
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {sheets.map((sheet) => {
            const isActive = sheet.id === activeSheetId;
            const isViewing = sheet.id === selectedSheetId;

            return (
              <div
                key={sheet.id}
                onClick={() => setSelectedSheetId(sheet.id)}
                className={`p-6 rounded-2xl bg-[#18181B] border transition-all duration-200 flex flex-col justify-between space-y-5 cursor-pointer ${
                  isViewing
                    ? 'border-[#6366F1] ring-1 ring-[#6366F1]/60 shadow-lg shadow-indigo-500/10'
                    : 'border-[#27272A] hover:border-[#3F3F46]'
                }`}
              >
                {/* Card Top */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#09090B] text-[#A1A1AA] border border-[#27272A]">
                      {sheet.category}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {isActive && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#6366F1] text-white flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          ACTIVE
                        </span>
                      )}
                      <span className="text-xs font-bold text-[#10B981]">{sheet.progress}%</span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-[#FAFAFA] flex items-center gap-2">
                      {sheet.title}
                    </h3>
                    <p className="text-xs text-[#A1A1AA] font-medium">{sheet.author}</p>
                  </div>

                  <p className="text-xs text-[#71717A] leading-relaxed line-clamp-2">
                    {sheet.tagline}
                  </p>

                  {/* Topics Pills */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {sheet.popularTopics.map((top, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-medium px-2 py-0.5 rounded bg-[#09090B] text-[#A1A1AA] border border-[#27272A]"
                      >
                        {top}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Card Bottom: Progress Bar & Actions */}
                <div className="space-y-3 border-t border-[#27272A] pt-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#A1A1AA]">Completion Progress</span>
                    <span className="font-semibold text-[#FAFAFA]">
                      {sheet.solvedQuestions} / {sheet.totalQuestions}
                    </span>
                  </div>

                  <div className="w-full h-2 bg-[#09090B] border border-[#27272A] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#6366F1] to-[#10B981] rounded-full transition-all duration-500"
                      style={{ width: `${sheet.progress}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveSheetId(sheet.id);
                      }}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-[#18181B] text-[#71717A] border border-[#27272A]'
                          : 'bg-[#27272A] hover:bg-[#3F3F46] text-[#FAFAFA]'
                      }`}
                    >
                      {isActive ? 'Current Focus' : 'Set as Focus'}
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedSheetId(sheet.id);
                      }}
                      className="text-xs font-bold text-[#6366F1] hover:text-[#818CF8] flex items-center gap-1 cursor-pointer"
                    >
                      <span>{isViewing ? 'Viewing Below' : 'View Checklist'}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SELECTED SHEET CHECKLIST & PROBLEM EXPLORER */}
      <div className="p-6 rounded-2xl bg-[#18181B] border border-[#27272A] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#27272A]">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#6366F1] px-2 py-0.5 rounded bg-[#6366F1]/10 border border-[#6366F1]/20">
                Checklist View
              </span>
              <h2 className="text-xl font-black text-[#FAFAFA]">{currentSheet.title} Section</h2>
            </div>
            <p className="text-xs text-[#A1A1AA] mt-1">
              Curated questions mapped directly from this sheet roadmap. Track your completed problems,
              confidence ratings, and revision items.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-[#10B981] bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
              {solvedInSheet} of {sheetQuestions.length} Filtered Solved
            </span>
            <button
              onClick={() => navigate('/library')}
              className="text-xs font-semibold text-[#FAFAFA] bg-[#27272A] hover:bg-[#3F3F46] px-3 py-1.5 rounded-lg transition-colors"
            >
              Open Full Library ↗
            </button>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#71717A]" />
            <input
              type="text"
              placeholder={`Search in ${currentSheet.title}...`}
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full bg-[#09090B] border border-[#27272A] rounded-lg pl-9 pr-3 py-2 text-xs text-[#FAFAFA] placeholder-[#71717A] focus:outline-none focus:border-[#6366F1]"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[#71717A]">Difficulty:</span>
            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="flex-1 bg-[#09090B] border border-[#27272A] rounded-lg px-3 py-2 text-xs text-[#FAFAFA] focus:outline-none focus:border-[#6366F1]"
            >
              <option value="All">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[#71717A]">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="flex-1 bg-[#09090B] border border-[#27272A] rounded-lg px-3 py-2 text-xs text-[#FAFAFA] focus:outline-none focus:border-[#6366F1]"
            >
              <option value="All">All Statuses</option>
              <option value="Solved">Solved</option>
              <option value="Attempted">Attempted</option>
              <option value="Unsolved">Unsolved</option>
            </select>
          </div>
        </div>

        {/* Questions Table */}
        <div className="overflow-x-auto rounded-xl border border-[#27272A]">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#09090B] text-[#71717A] uppercase font-semibold border-b border-[#27272A]">
              <tr>
                <th className="py-3 px-4 w-28">Status</th>
                <th className="py-3 px-4">Problem Name</th>
                <th className="py-3 px-4">Topic</th>
                <th className="py-3 px-4 w-24">Difficulty</th>
                <th className="py-3 px-4 w-24">Platform</th>
                <th className="py-3 px-4 w-16 text-center">Save</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#27272A] bg-[#18181B]">
              {sheetQuestions.length > 0 ? (
                sheetQuestions.map((q) => (
                  <tr key={q.id} className="hover:bg-[#27272A]/30 transition-colors">
                    <td className="py-3 px-4">
                      <button
                        onClick={() => toggleStatus(q.id)}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border cursor-pointer transition-all ${getStatusBadge(
                          q.status
                        )}`}
                      >
                        {q.status}
                      </button>
                    </td>

                    <td className="py-3 px-4 font-medium text-[#FAFAFA]">
                      <div className="flex items-center gap-2">
                        <span className="text-[#71717A] font-mono text-[11px]">#{q.number}</span>
                        <a
                          href={q.problemUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:text-[#6366F1] flex items-center gap-1.5 transition-colors"
                        >
                          {q.title}
                          <ExternalLink className="w-3 h-3 text-[#71717A]" />
                        </a>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-[#A1A1AA]">{q.topic}</td>

                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getDifficultyBadge(
                          q.difficulty
                        )}`}
                      >
                        {q.difficulty}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-[#A1A1AA] font-mono">{q.platform}</td>

                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => toggleBookmark(q.id)}
                        className={`p-1 rounded hover:bg-[#27272A] transition-colors cursor-pointer ${
                          q.bookmarked ? 'text-[#6366F1]' : 'text-[#71717A]'
                        }`}
                        title={q.bookmarked ? 'Bookmarked' : 'Add to Revision'}
                      >
                        <Bookmark
                          className={`w-4 h-4 ${q.bookmarked ? 'fill-[#6366F1]' : ''}`}
                        />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-[#71717A]">
                    No problems match your current search/filters in {currentSheet.title}.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MyCollections;
