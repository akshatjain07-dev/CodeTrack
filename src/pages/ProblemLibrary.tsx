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
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useProblems } from '../context/ProblemContext';
import { NEETCODE_PROBLEMS } from '../data/neetcodeData';
import type { Difficulty, DSAQuestion } from '../data/mockData';

export const ProblemLibrary: React.FC = () => {
  const {
    questions,
    sheets,
    toggleStatus,
    toggleBookmark,
    incrementRevision,
    decrementRevision,
  } = useProblems();

  const [searchParams] = useSearchParams();
  const urlSearch = searchParams.get('search') || '';

  // 1. Available sheet tabs (strictly separate sheets; NO "All Questions" tab)
  const availableSheets = useMemo(() => {
    const sheetSet = new Set<string>();
    // Prioritize Love Babbar 450 first, then Striver A2Z
    sheetSet.add('Love Babbar 450');
    sheetSet.add('Striver A2Z');

    // Add any other sheets present on loaded questions
    questions.forEach((q) => {
      (q.sheets || []).forEach((s) => sheetSet.add(s));
    });

    // Also merge any sheets defined in context
    sheets?.forEach((s) => {
      if (s.title) sheetSet.add(s.title);
    });

    const list = Array.from(sheetSet);
    const priority = ['Love Babbar 450', 'Striver A2Z', 'NeetCode 150', 'NeetCode All'];
    return list.sort((a, b) => {
      const idxA = priority.indexOf(a);
      const idxB = priority.indexOf(b);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return a.localeCompare(b);
    });
  }, [questions, sheets]);

  // 2. Default active tab state strictly set to "Love Babbar 450" (or the first available sheet)
  const defaultSheet = useMemo(() => {
    const urlSheet = searchParams.get('sheet');
    if (urlSheet) {
      const matched = availableSheets.find(
        (s) => s.toLowerCase() === urlSheet.toLowerCase()
      );
      if (matched) return matched;
    }
    return availableSheets.includes('Love Babbar 450')
      ? 'Love Babbar 450'
      : (availableSheets[0] || 'Love Babbar 450');
  }, [availableSheets, searchParams]);

  const [activeSheetTab, setActiveSheetTab] = useState<string>(defaultSheet);
  const [searchQuery, setSearchQuery] = useState(urlSearch);
  const [selectedTopic, setSelectedTopic] = useState<string>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [mustDoOnly, setMustDoOnly] = useState<boolean>(false);

  // 3. Strict Sheet Scoping: ONLY return questions that include the activeTab sheet
  const sheetScopedQuestions = useMemo(() => {
    return questions.filter(
      (q) => Array.isArray(q.sheets) && q.sheets.includes(activeSheetTab)
    );
  }, [questions, activeSheetTab]);

  // Unique topics from the active sheet view
  const topics = useMemo(() => {
    const list = Array.from(new Set(sheetScopedQuestions.map((q) => q.topic))).sort();
    return ['All', ...list];
  }, [sheetScopedQuestions]);

  // Filtered Questions with all active search/dropdown criteria applied to the active sheet
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

  // 4. Group by Topic (Accordion/Section Layout)
  const groupedByTopic = useMemo(() => {
    const map: Record<string, DSAQuestion[]> = {};
    filteredQuestions.forEach((q) => {
      if (!map[q.topic]) {
        map[q.topic] = [];
      }
      map[q.topic].push(q);
    });
    return map;
  }, [filteredQuestions]);

  // Preserve natural curriculum topic order from sheetScopedQuestions
  const orderedTopics = useMemo(() => {
    const seen = new Set<string>();
    const order: string[] = [];
    sheetScopedQuestions.forEach((q) => {
      if (!seen.has(q.topic)) {
        seen.add(q.topic);
        order.push(q.topic);
      }
    });
    // Only return topics with at least one matching question
    return order.filter((topic) => (groupedByTopic[topic]?.length || 0) > 0);
  }, [sheetScopedQuestions, groupedByTopic]);

  // Accordion collapsed state: all topics open by default
  const [collapsedTopics, setCollapsedTopics] = useState<Record<string, boolean>>({});

  const toggleTopic = (topic: string) => {
    setCollapsedTopics((prev) => ({
      ...prev,
      [topic]: !prev[topic],
    }));
  };

  const isTopicExpanded = (topic: string) => {
    // When searching, auto-expand to reveal results immediately
    if (searchQuery.trim()) return true;
    return !collapsedTopics[topic];
  };

  const areAllExpanded = useMemo(() => {
    if (orderedTopics.length === 0) return true;
    return orderedTopics.every((topic) => !collapsedTopics[topic]);
  }, [orderedTopics, collapsedTopics]);

  const toggleAllTopics = () => {
    if (areAllExpanded) {
      // Collapse all
      const next: Record<string, boolean> = {};
      orderedTopics.forEach((t) => (next[t] = true));
      setCollapsedTopics(next);
    } else {
      // Expand all
      setCollapsedTopics({});
    }
  };

  // Switching sheet tab resets topic filter and expands all topics
  const handleSheetTabChange = (tab: string) => {
    setActiveSheetTab(tab);
    setSelectedTopic('All');
    setCollapsedTopics({});
  };

  // Metrics for the active sheet
  const totalInTab = sheetScopedQuestions.length;
  const solvedCount = sheetScopedQuestions.filter((q) => q.status === 'Solved').length;
  const attemptedCount = sheetScopedQuestions.filter((q) => q.status === 'Attempted').length;
  const unsolvedCount = sheetScopedQuestions.filter((q) => q.status === 'Unsolved').length;
  const revisitCount = sheetScopedQuestions.filter((q) => q.isRevisit || q.bookmarked).length;
  const activeSheetProgress = totalInTab > 0 ? Math.round((solvedCount / totalInTab) * 100) : 0;

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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 p-6 rounded-2xl bg-[#18181B] border border-[#27272A] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-40 bg-gradient-to-bl from-[#10B981]/10 via-[#6366F1]/5 to-transparent pointer-events-none rounded-2xl" />

        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#10B981]/20 to-[#6366F1]/20 border border-[#10B981]/30 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-[#10B981]" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl font-black text-[#FAFAFA] tracking-tight">Problem Library</h1>
                {/* 5. Clear Indicator of the Currently Active Sheet */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/35 text-xs font-bold shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
                  <span>Viewing: <strong className="text-[#FAFAFA]">{activeSheetTab}</strong></span>
                </div>
              </div>
              <p className="text-xs text-[#A1A1AA] pt-0.5">
                Strict sheet separation with synchronized progress • {NEETCODE_PROBLEMS.length} NeetCode problems integrated into structured curriculum sections
              </p>
            </div>
          </div>

          {/* Active Sheet Progress Bar */}
          <div className="pt-2 max-w-md">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-[#A1A1AA] font-medium">{activeSheetTab} Completion</span>
              <span className="text-[#10B981] font-bold font-mono">{activeSheetProgress}% ({solvedCount}/{totalInTab} Solved)</span>
            </div>
            <div className="w-full h-2 bg-[#09090B] border border-[#27272A] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#10B981] to-[#34D399] rounded-full transition-all duration-500"
                style={{ width: `${activeSheetProgress}%` }}
              />
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

      {/* 1, 2, 5. Main Sheet Navigation Tabs (Highlighted in Emerald Green #10B981, Dimmed Others, No "All Questions") */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-2 rounded-xl bg-[#18181B] border border-[#27272A]">
        <div className="flex items-center gap-2 overflow-x-auto p-1">
          {availableSheets.map((sheetTitle) => {
            const count = questions.filter((q) => q.sheets?.includes(sheetTitle)).length;
            const sheetSolved = questions.filter(
              (q) => q.sheets?.includes(sheetTitle) && q.status === 'Solved'
            ).length;
            const isActive = activeSheetTab === sheetTitle;
            return (
              <button
                key={sheetTitle}
                onClick={() => handleSheetTabChange(sheetTitle)}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-[#10B981] text-white shadow-lg shadow-emerald-500/25 ring-2 ring-emerald-400 ring-offset-1 ring-offset-[#18181B]'
                    : 'bg-[#09090B] text-[#71717A] hover:text-[#FAFAFA] hover:bg-[#27272A]/70 border border-[#27272A] opacity-75 hover:opacity-100'
                }`}
              >
                <span>{sheetTitle}</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                    isActive
                      ? 'bg-black/25 text-white'
                      : 'bg-[#18181B] text-[#A1A1AA] border border-[#27272A]'
                  }`}
                >
                  {count} Qs
                </span>
                {count > 0 && (
                  <span
                    className={`text-[10px] font-medium hidden md:inline ${
                      isActive ? 'text-emerald-100' : 'text-[#71717A]'
                    }`}
                  >
                    ({Math.round((sheetSolved / count) * 100)}%)
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Global Controls: Expand/Collapse All & Must-Do Toggle */}
        <div className="flex items-center gap-2 px-2 flex-wrap">
          <button
            onClick={toggleAllTopics}
            className="px-3.5 py-2 rounded-lg bg-[#09090B] hover:bg-[#27272A] border border-[#27272A] text-xs font-semibold text-[#A1A1AA] hover:text-[#FAFAFA] transition-colors cursor-pointer flex items-center gap-1.5"
            title="Expand or collapse all topic accordions"
          >
            {areAllExpanded ? (
              <>
                <ChevronUp className="w-3.5 h-3.5" />
                <span>Collapse All</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5" />
                <span>Expand All</span>
              </>
            )}
          </button>

          <button
            onClick={() => setMustDoOnly(!mustDoOnly)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
              mustDoOnly
                ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border-amber-500/50 shadow-md shadow-amber-500/10'
                : 'bg-[#09090B] text-[#A1A1AA] hover:text-[#FAFAFA] border-[#27272A] hover:border-amber-500/40'
            }`}
            title="Filter high-yield FAANG & Tier-1 must-solve questions"
          >
            <Flame
              className={`w-3.5 h-3.5 ${
                mustDoOnly ? 'text-amber-400 fill-amber-400 animate-pulse' : 'text-[#71717A]'
              }`}
            />
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
              placeholder={`Search in ${activeSheetTab} (by title, topic, platform)...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#09090B] border border-[#27272A] rounded-lg pl-9 pr-4 py-2 text-xs text-[#FAFAFA] placeholder-[#71717A] focus:outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981] transition-all"
            />
          </div>

          {/* Topic Dropdown */}
          <div>
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="w-full bg-[#09090B] border border-[#27272A] rounded-lg px-3 py-2 text-xs text-[#FAFAFA] focus:outline-none focus:border-[#10B981] transition-all cursor-pointer"
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
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="w-full bg-[#09090B] border border-[#27272A] rounded-lg px-3 py-2 text-xs text-[#FAFAFA] focus:outline-none focus:border-[#10B981] transition-all cursor-pointer"
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
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full bg-[#09090B] border border-[#27272A] rounded-lg px-3 py-2 text-xs text-[#FAFAFA] focus:outline-none focus:border-[#10B981] transition-all cursor-pointer"
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
              Showing {filteredQuestions.length} matching questions across {orderedTopics.length} topics in <strong className="text-[#FAFAFA]">{activeSheetTab}</strong>
            </span>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedTopic('All');
                setSelectedDifficulty('All');
                setSelectedStatus('All');
                setMustDoOnly(false);
              }}
              className="text-[#10B981] hover:underline text-xs font-semibold flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* 4. Grouped by Topic Accordion/Section Layout */}
      {orderedTopics.length === 0 ? (
        <div className="p-16 rounded-2xl bg-[#18181B] border border-[#27272A] text-center text-[#A1A1AA] shadow-xl">
          <div className="flex flex-col items-center justify-center space-y-3">
            <HelpCircle className="w-10 h-10 text-[#71717A]" />
            <p className="font-semibold text-base text-[#FAFAFA]">No questions found in {activeSheetTab}</p>
            <p className="text-xs text-[#71717A] max-w-md">
              No problems match the current filter criteria for this sheet. Try adjusting search keywords, topic selection, or difficulty filters.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedTopic('All');
                setSelectedDifficulty('All');
                setSelectedStatus('All');
                setMustDoOnly(false);
              }}
              className="mt-2 px-4 py-2 rounded-lg bg-[#27272A] hover:bg-[#3F3F46] text-[#FAFAFA] text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset All Filters
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {orderedTopics.map((topic) => {
            const topicQuestions = groupedByTopic[topic] || [];
            const topicTotal = topicQuestions.length;
            const topicSolved = topicQuestions.filter((q) => q.status === 'Solved').length;
            const topicProgress = topicTotal > 0 ? Math.round((topicSolved / topicTotal) * 100) : 0;
            const easyCount = topicQuestions.filter((q) => q.difficulty === 'Easy').length;
            const mediumCount = topicQuestions.filter((q) => q.difficulty === 'Medium').length;
            const hardCount = topicQuestions.filter((q) => q.difficulty === 'Hard').length;
            const isExpanded = isTopicExpanded(topic);

            return (
              <div
                key={topic}
                className="rounded-2xl bg-[#18181B] border border-[#27272A] overflow-hidden shadow-lg transition-all duration-200 hover:border-[#3F3F46]"
              >
                {/* Topic Section Header / Accordion Trigger */}
                <button
                  type="button"
                  onClick={() => toggleTopic(topic)}
                  className="w-full p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-3 text-left bg-gradient-to-r from-[#18181B] via-[#1c1c20] to-[#18181B] hover:bg-[#202024] cursor-pointer transition-colors select-none"
                >
                  {/* Left: Chevron + Topic Name + Total Count */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 ${
                        isExpanded
                          ? 'bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30'
                          : 'bg-[#27272A] text-[#A1A1AA] border border-[#3F3F46]'
                      }`}
                    >
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-200 ${
                          isExpanded ? 'rotate-0' : '-rotate-90'
                        }`}
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h3 className="text-base sm:text-lg font-bold text-[#FAFAFA] tracking-tight">
                          {topic}
                        </h3>
                        <span className="px-2 py-0.5 rounded-full bg-[#27272A] border border-[#3F3F46] text-xs font-mono font-medium text-[#A1A1AA]">
                          {topicTotal} {topicTotal === 1 ? 'Problem' : 'Problems'}
                        </span>
                        {topicSolved === topicTotal && topicTotal > 0 && (
                          <span className="px-2 py-0.5 rounded-full bg-[#10B981]/20 border border-[#10B981]/30 text-[11px] font-bold text-[#10B981] flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Completed
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Progress Bar & Difficulty Stats */}
                  <div className="flex items-center gap-4 flex-wrap self-end md:self-auto">
                    {/* Difficulty breakdown */}
                    <div className="flex items-center gap-1.5 text-[11px] font-mono">
                      {easyCount > 0 && (
                        <span className="px-1.5 py-0.5 rounded bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/25">
                          {easyCount} Easy
                        </span>
                      )}
                      {mediumCount > 0 && (
                        <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/25">
                          {mediumCount} Med
                        </span>
                      )}
                      {hardCount > 0 && (
                        <span className="px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/25">
                          {hardCount} Hard
                        </span>
                      )}
                    </div>

                    {/* Progress visualizer */}
                    <div className="flex items-center gap-2.5">
                      <div className="w-24 sm:w-32 h-2 bg-[#09090B] border border-[#27272A] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#10B981] to-[#34D399] rounded-full transition-all duration-300"
                          style={{ width: `${topicProgress}%` }}
                        />
                      </div>
                      <span className="text-xs font-mono font-bold text-[#10B981] min-w-14 text-right">
                        {topicSolved}/{topicTotal} ({topicProgress}%)
                      </span>
                    </div>
                  </div>
                </button>

                {/* Topic Accordion Body: Structured Questions Table */}
                {isExpanded && (
                  <div className="border-t border-[#27272A]">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-[#09090B] border-b border-[#27272A] text-[11px] font-semibold text-[#71717A] uppercase tracking-wider">
                            <th className="py-3 px-4 w-32">Status</th>
                            <th className="py-3 px-4">Problem Name</th>
                            <th className="py-3 px-4 w-28">Difficulty</th>
                            <th className="py-3 px-4 w-36 text-center">Revisions</th>
                            <th className="py-3 px-4 w-36">Platform Link</th>
                            <th className="py-3 px-4 text-center w-20">Revisit</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#27272A] text-xs">
                          {topicQuestions.map((q) => (
                            <tr
                              key={q.id}
                              className="hover:bg-[#27272A]/40 transition-colors group"
                            >
                              {/* One-Click Status Cycle */}
                              <td className="py-3.5 px-4 whitespace-nowrap">
                                <button
                                  onClick={() => toggleStatus(q.id)}
                                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all border cursor-pointer ${
                                    q.status === 'Solved'
                                      ? 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/30 hover:bg-[#10B981]/20'
                                      : q.status === 'Attempted'
                                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20'
                                      : 'bg-[#27272A] text-[#A1A1AA] border-[#3F3F46] hover:border-[#10B981] hover:text-[#FAFAFA]'
                                  }`}
                                  title="Click to cycle: Unsolved -> Attempted -> Solved"
                                >
                                  <CheckCircle2
                                    className={`w-3.5 h-3.5 ${
                                      q.status === 'Solved' ? 'text-[#10B981]' : ''
                                    }`}
                                  />
                                  <span>{q.status}</span>
                                </button>
                              </td>

                              {/* Problem Name & Tags */}
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
                                      className="hover:text-[#10B981] font-semibold text-sm transition-colors"
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
                                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                                            : s === 'Striver A2Z'
                                            ? 'bg-[#6366F1]/10 text-[#818CF8] border-[#6366F1]/30'
                                            : s === 'NeetCode 150'
                                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                            : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                                        }`}
                                      >
                                        {s === 'Love Babbar 450' ? 'Babbar 450' : s}
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

                              {/* Interactive Revision Counter */}
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

                              {/* External Platform Link */}
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
                                  title={
                                    q.isRevisit || q.bookmarked
                                      ? 'Saved in Revision Deck'
                                      : 'Bookmark for revision'
                                  }
                                >
                                  <Bookmark
                                    className={`w-4 h-4 ${
                                      q.isRevisit || q.bookmarked
                                        ? 'fill-amber-400 text-amber-400'
                                        : ''
                                    }`}
                                  />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Summary Footer */}
      <div className="p-4 rounded-xl bg-[#18181B] border border-[#27272A] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#A1A1AA]">
        <div>
          Showing <span className="font-semibold text-[#FAFAFA]">{filteredQuestions.length}</span> matching problems across{' '}
          <span className="font-semibold text-[#FAFAFA]">{orderedTopics.length}</span> topics strictly from{' '}
          <span className="font-semibold text-[#10B981]">{activeSheetTab}</span>
          {filteredQuestions.length !== sheetScopedQuestions.length && (
            <span> (filtered from total of {sheetScopedQuestions.length})</span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={toggleAllTopics}
            className="text-xs text-[#A1A1AA] hover:text-[#10B981] transition-colors cursor-pointer font-medium"
          >
            {areAllExpanded ? 'Collapse All Topics' : 'Expand All Topics'}
          </button>
        </div>
      </div>
    </div>
  );
};
