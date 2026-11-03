import React, { useState, useMemo } from 'react';
import {
  RotateCcw,
  Bookmark,
  CheckCircle2,
  ExternalLink,
  AlertTriangle,
  Clock,
  Edit3,
  Check,
  Plus,
  Minus,
} from 'lucide-react';
import { useProblems } from '../context/ProblemContext';
import type { Confidence, DSAQuestion } from '../data/mockData';

export const RevisionDeck: React.FC = () => {
  const {
    questions,
    toggleBookmark,
    updateConfidence,
    updateNotes,
    toggleStatus,
    incrementRevision,
    decrementRevision,
  } = useProblems();

  const [activeTab, setActiveTab] = useState<'all' | 'revisit' | 'low' | 'due'>('all');
  const [sortBy, setSortBy] = useState<'needs_revision' | 'confidence' | 'recent' | 'number'>('needs_revision');
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [tempNotes, setTempNotes] = useState<string>('');

  // Items eligible for revision: bookmarked/revisit OR revisionCount > 0 OR confidence !== 'High' OR status === 'Attempted'
  const revisionQuestions = useMemo(() => {
    return questions.filter((q) => {
      const isMarkedRevisit = q.isRevisit || q.bookmarked;
      if (activeTab === 'revisit') return isMarkedRevisit;
      if (activeTab === 'low') return q.confidence === 'Low';
      if (activeTab === 'due') return q.revisionDueDays !== undefined && q.revisionDueDays <= 2;
      return (
        isMarkedRevisit ||
        (q.revisionCount || 0) > 0 ||
        q.confidence === 'Low' ||
        q.confidence === 'Medium' ||
        q.status === 'Attempted'
      );
    });
  }, [questions, activeTab]);

  // Sorted items by Needs Revision status
  const sortedQuestions = useMemo(() => {
    const list = [...revisionQuestions];
    if (sortBy === 'needs_revision') {
      list.sort((a, b) => {
        // Lower due days or Low confidence = highest urgency
        const aUrgency = (a.confidence === 'Low' ? 10 : a.confidence === 'Medium' ? 5 : 1) + 
          ((a.revisionDueDays !== undefined && a.revisionDueDays <= 1) ? 20 : 0);
        const bUrgency = (b.confidence === 'Low' ? 10 : b.confidence === 'Medium' ? 5 : 1) + 
          ((b.revisionDueDays !== undefined && b.revisionDueDays <= 1) ? 20 : 0);
        return bUrgency - aUrgency;
      });
    } else if (sortBy === 'confidence') {
      const weight: Record<Confidence, number> = { Low: 1, Medium: 2, High: 3 };
      list.sort((a, b) => weight[a.confidence || 'Medium'] - weight[b.confidence || 'Medium']);
    } else if (sortBy === 'number') {
      list.sort((a, b) => a.number - b.number);
    } else if (sortBy === 'recent') {
      list.sort((a, b) => {
        if (a.lastAttempted && !b.lastAttempted) return -1;
        if (!a.lastAttempted && b.lastAttempted) return 1;
        return 0;
      });
    }
    return list;
  }, [revisionQuestions, sortBy]);

  const handleStartEditNotes = (q: DSAQuestion) => {
    setEditingNotesId(q.id);
    setTempNotes(q.notes || '');
  };

  const handleSaveNotes = (id: string) => {
    updateNotes(id, tempNotes);
    setEditingNotesId(null);
  };

  const getConfidenceBadge = (confidence: Confidence) => {
    switch (confidence) {
      case 'Low':
        return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
      case 'Medium':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'High':
        return 'text-[#10B981] bg-[#10B981]/10 border-[#10B981]/20';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-[#18181B] border border-[#27272A]">
        <div>
          <h1 className="text-2xl font-black text-[#FAFAFA] flex items-center gap-2.5">
            <RotateCcw className="w-6 h-6 text-[#6366F1]" />
            Spaced Revision Deck
          </h1>
          <p className="text-xs text-[#A1A1AA] mt-1">
            Prioritize low-confidence algorithms and bookmarked patterns using spaced repetition.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4" />
            <span>
              {questions.filter((q) => q.confidence === 'Low').length} Urgent Reviews
            </span>
          </div>
        </div>
      </div>

      {/* Filter Tabs and Sort Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-[#18181B] border border-[#27272A]">
        <div className="flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'all'
                ? 'bg-[#6366F1] text-white'
                : 'bg-[#09090B] text-[#A1A1AA] hover:text-[#FAFAFA] border border-[#27272A]'
            }`}
          >
            All Deck ({questions.filter((q) => q.bookmarked || q.confidence !== 'High').length})
          </button>
          <button
            onClick={() => setActiveTab('low')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'low'
                ? 'bg-[#6366F1] text-white'
                : 'bg-[#09090B] text-[#A1A1AA] hover:text-[#FAFAFA] border border-[#27272A]'
            }`}
          >
            Low Confidence ({questions.filter((q) => q.confidence === 'Low').length})
          </button>
          <button
            onClick={() => setActiveTab('due')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'due'
                ? 'bg-[#6366F1] text-white'
                : 'bg-[#09090B] text-[#A1A1AA] hover:text-[#FAFAFA] border border-[#27272A]'
            }`}
          >
            Due Today / Overdue
          </button>
          <button
            onClick={() => setActiveTab('revisit')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'revisit'
                ? 'bg-[#6366F1] text-white'
                : 'bg-[#09090B] text-[#A1A1AA] hover:text-[#FAFAFA] border border-[#27272A]'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>Revisit Bookmarks ({questions.filter((q) => q.isRevisit || q.bookmarked).length})</span>
          </button>
        </div>

        {/* Sort Select */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-[#71717A] uppercase font-semibold">
            Sort by:
          </span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-[#09090B] border border-[#27272A] rounded-lg px-2.5 py-1.5 text-xs text-[#FAFAFA] focus:outline-none focus:border-[#6366F1] cursor-pointer"
          >
            <option value="needs_revision">Needs Revision (Priority First)</option>
            <option value="confidence">Confidence (Lowest First)</option>
            <option value="recent">Recently Attempted</option>
            <option value="number">Problem Number</option>
          </select>
        </div>
      </div>

      {/* Cards List */}
      <div className="space-y-4">
        {sortedQuestions.length === 0 ? (
          <div className="p-12 text-center rounded-xl bg-[#18181B] border border-[#27272A]">
            <CheckCircle2 className="w-10 h-10 text-[#10B981] mx-auto mb-2" />
            <h3 className="text-base font-bold text-[#FAFAFA]">Deck is All Clear!</h3>
            <p className="text-xs text-[#A1A1AA] mt-1 max-w-sm mx-auto">
              No questions match your current revision filters. Bookmark problems or mark confidence as Low while solving in the Problem Library.
            </p>
          </div>
        ) : (
          sortedQuestions.map((q) => (
            <div
              key={q.id}
              className="p-5 rounded-xl bg-[#18181B] border border-[#27272A] hover:border-[#3F3F46] transition-all space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                {/* Title & Metadata */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[#71717A] font-mono text-xs">#{q.number}</span>
                    <a
                      href={q.problemUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-base font-bold text-[#FAFAFA] hover:text-[#6366F1] transition-colors"
                    >
                      {q.title}
                    </a>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                        q.difficulty === 'Easy'
                          ? 'text-[#10B981] bg-[#10B981]/10 border-[#10B981]/25'
                          : q.difficulty === 'Medium'
                          ? 'text-amber-400 bg-amber-500/10 border-amber-500/25'
                          : 'text-rose-400 bg-rose-500/10 border-rose-500/25'
                      }`}
                    >
                      {q.difficulty}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-[#27272A] text-[#FAFAFA]">
                      {q.topic}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-[#A1A1AA]">
                    <span>
                      Status:{' '}
                      <button
                        onClick={() => toggleStatus(q.id)}
                        className="font-semibold text-[#FAFAFA] hover:underline"
                      >
                        {q.status}
                      </button>
                    </span>
                    {q.lastAttempted && (
                      <span className="flex items-center gap-1 text-[11px]">
                        <Clock className="w-3 h-3 text-[#71717A]" />
                        Last active: {q.lastAttempted}
                      </span>
                    )}
                  </div>
                </div>

                {/* Revision Counter & Quick Confidence Pill Toggle */}
                <div className="flex flex-wrap items-center gap-3 flex-shrink-0">
                  <div className="flex items-center gap-1.5 bg-[#09090B] border border-[#27272A] rounded-lg px-2.5 py-1">
                    <span className="text-[11px] text-[#71717A] mr-1">Revisions:</span>
                    <button
                      onClick={() => decrementRevision(q.id)}
                      disabled={(q.revisionCount || 0) <= 0}
                      className="w-4 h-4 rounded flex items-center justify-center text-[#71717A] hover:text-[#FAFAFA] disabled:opacity-30 cursor-pointer"
                      title="Decrease revision count"
                    >
                      <Minus className="w-2.5 h-2.5" />
                    </button>
                    <span className="font-mono font-bold text-xs text-[#FAFAFA] px-1">
                      {q.revisionCount || 0}
                    </span>
                    <button
                      onClick={() => incrementRevision(q.id)}
                      className="w-4 h-4 rounded flex items-center justify-center text-[#71717A] hover:text-[#10B981] cursor-pointer"
                      title="Increase revision count"
                    >
                      <Plus className="w-2.5 h-2.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-[#71717A]">Confidence:</span>
                    {(['Low', 'Medium', 'High'] as Confidence[]).map((level) => (
                      <button
                        key={level}
                        onClick={() => updateConfidence(q.id, level)}
                        className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all border ${
                          q.confidence === level
                            ? getConfidenceBadge(level)
                            : 'bg-[#09090B] text-[#71717A] border-[#27272A] hover:text-[#FAFAFA]'
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Personal Notes / Algorithm Summary */}
              <div className="p-3 rounded-lg bg-[#09090B] border border-[#27272A]">
                {editingNotesId === q.id ? (
                  <div className="space-y-2">
                    <textarea
                      value={tempNotes}
                      onChange={(e) => setTempNotes(e.target.value)}
                      placeholder="Add key insights, time complexity, and edge cases to remember..."
                      className="w-full bg-[#18181B] border border-[#3F3F46] rounded-md p-2 text-xs text-[#FAFAFA] focus:outline-none focus:border-[#6366F1]"
                      rows={2}
                    />
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setEditingNotesId(null)}
                        className="px-2.5 py-1 rounded text-xs text-[#A1A1AA] hover:text-[#FAFAFA]"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleSaveNotes(q.id)}
                        className="px-3 py-1 rounded bg-[#6366F1] text-white text-xs font-semibold flex items-center gap-1"
                      >
                        <Check className="w-3 h-3" />
                        <span>Save Note</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-xs text-[#A1A1AA] leading-relaxed">
                      <span className="text-[#FAFAFA] font-semibold">Key takeaway: </span>
                      {q.notes || 'No revision notes added yet.'}
                    </p>
                    <button
                      onClick={() => handleStartEditNotes(q)}
                      className="p-1 text-[#71717A] hover:text-[#FAFAFA] rounded transition-colors flex-shrink-0"
                      title="Edit note"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Card Bottom Actions */}
              <div className="flex items-center justify-between text-xs pt-1">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleBookmark(q.id)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-colors ${
                      q.bookmarked
                        ? 'text-amber-400 bg-amber-500/10 border border-amber-500/20'
                        : 'text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-[#27272A]'
                    }`}
                  >
                    <Bookmark className={`w-3.5 h-3.5 ${q.bookmarked ? 'fill-amber-400' : ''}`} />
                    <span>{q.bookmarked ? 'Bookmarked' : 'Bookmark'}</span>
                  </button>

                  <button
                    onClick={() => {
                      updateConfidence(q.id, 'High');
                      toggleStatus(q.id, 'Solved');
                    }}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[#10B981] hover:bg-[#10B981]/10 transition-colors"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Mark as Mastered</span>
                  </button>
                </div>

                <a
                  href={q.problemUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-[#6366F1] hover:underline font-semibold"
                >
                  <span>Open on {q.platform}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
