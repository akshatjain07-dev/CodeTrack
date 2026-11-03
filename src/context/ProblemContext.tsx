import React, { createContext, useContext, useMemo, useCallback, useState, useEffect } from 'react';
import type {
  DSAQuestion,
  DSASheet,
  UserStats,
  Status,
  Confidence,
} from '../data/mockData';
import {
  MOCK_SHEETS,
  MOCK_USER_STATS,
} from '../data/mockData';
import { useAuth } from './AuthContext';
import { useProgress } from './ProgressContext';
import { isSupabaseConfigured, upsertQuestionProgress, fetchUserProgress } from '../lib/supabase';
import masterQuestionsRaw from '../data/dsaQuestions.json';

interface ProblemContextType {
  questions: DSAQuestion[];
  sheets: DSASheet[];
  stats: UserStats;
  activeSheetId: string;
  setActiveSheetId: (id: string) => void;
  toggleStatus: (id: string, newStatus?: Status) => void;
  toggleBookmark: (id: string) => void;
  toggleRevisit: (id: string) => void;
  incrementRevision: (id: string) => void;
  decrementRevision: (id: string) => void;
  setRevisionCount: (id: string, count: number) => void;
  updateConfidence: (id: string, confidence: Confidence) => void;
  updateNotes: (id: string, notes: string) => void;
  resetProgress: () => void;
}

const STORAGE_KEY_ACTIVE_SHEET = 'codetrack_active_sheet';

const ProblemContext = createContext<ProblemContextType | undefined>(undefined);

export const ProblemProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const {
    progress,
    toggleStatus: progressToggleStatus,
    toggleRevisit: progressToggleRevisit,
    incrementRevision: progressIncrementRevision,
    decrementRevision: progressDecrementRevision,
    setRevisionCount: progressSetRevisionCount,
    updateNotes: progressUpdateNotes,
    resetAllProgress,
  } = useProgress();

  const [activeSheetId, setActiveSheetIdState] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEY_ACTIVE_SHEET) || 'striver-a2z';
  });

  const [confidences, setConfidences] = useState<Record<string, Confidence>>({});

  // Sync with Supabase if configured and user is logged in
  useEffect(() => {
    if (!user || !isSupabaseConfigured) return;

    let isMounted = true;
    fetchUserProgress(user.id).then((cloudData) => {
      if (!isMounted || !cloudData || cloudData.length === 0) return;
      cloudData.forEach((item: any) => {
        if (item.status) {
          progressToggleStatus(item.question_id, item.status);
        }
        if (item.confidence) {
          setConfidences((prev) => ({ ...prev, [item.question_id]: item.confidence }));
        }
        if (item.notes) {
          progressUpdateNotes(item.question_id, item.notes);
        }
      });
    });

    return () => {
      isMounted = false;
    };
  }, [user, progressToggleStatus, progressUpdateNotes]);

  const setActiveSheetId = useCallback((id: string) => {
    setActiveSheetIdState(id);
    localStorage.setItem(STORAGE_KEY_ACTIVE_SHEET, id);
  }, []);

  // Merge the master questions array with dynamic user progress from ProgressContext
  const questions = useMemo<DSAQuestion[]>(() => {
    return (masterQuestionsRaw as any[]).map((rawQ) => {
      const qProg = progress[rawQ.id] || {
        status: 'Unsolved',
        revisionCount: 0,
        isRevisit: false,
      };

      return {
        id: rawQ.id,
        number: rawQ.number,
        title: rawQ.title,
        topic: rawQ.topic,
        difficulty: rawQ.difficulty,
        platform: rawQ.platform,
        problemUrl: rawQ.problemUrl,
        sheets: rawQ.sheets || [],
        isMustDo: rawQ.isMustDo || false,
        acceptanceRate: rawQ.acceptanceRate || '50.0%',
        status: qProg.status,
        revisionCount: qProg.revisionCount,
        isRevisit: qProg.isRevisit,
        bookmarked: qProg.isRevisit,
        confidence: confidences[rawQ.id] || 'Medium',
        notes: qProg.notes || '',
        lastAttempted: qProg.lastAttempted || undefined,
      };
    });
  }, [progress, confidences]);

  const toggleStatus = useCallback(
    (id: string, explicitStatus?: Status) => {
      progressToggleStatus(id, explicitStatus);
      if (user && isSupabaseConfigured) {
        const cur = progress[id];
        let nextStatus: Status;
        if (explicitStatus) {
          nextStatus = explicitStatus;
        } else {
          if (!cur || cur.status === 'Unsolved') nextStatus = 'Attempted';
          else if (cur.status === 'Attempted') nextStatus = 'Solved';
          else nextStatus = 'Unsolved';
        }
        upsertQuestionProgress(user.id, id, { status: nextStatus });
      }
    },
    [progressToggleStatus, progress, user]
  );

  const toggleBookmark = useCallback(
    (id: string) => {
      progressToggleRevisit(id);
      if (user && isSupabaseConfigured) {
        const cur = progress[id];
        upsertQuestionProgress(user.id, id, { bookmarked: !cur?.isRevisit });
      }
    },
    [progressToggleRevisit, progress, user]
  );

  const toggleRevisit = useCallback(
    (id: string) => {
      progressToggleRevisit(id);
    },
    [progressToggleRevisit]
  );

  const incrementRevision = useCallback(
    (id: string) => {
      progressIncrementRevision(id);
    },
    [progressIncrementRevision]
  );

  const decrementRevision = useCallback(
    (id: string) => {
      progressDecrementRevision(id);
    },
    [progressDecrementRevision]
  );

  const setRevisionCount = useCallback(
    (id: string, count: number) => {
      progressSetRevisionCount(id, count);
    },
    [progressSetRevisionCount]
  );

  const updateConfidence = useCallback(
    (id: string, confidence: Confidence) => {
      setConfidences((prev) => ({ ...prev, [id]: confidence }));
      if (user && isSupabaseConfigured) {
        upsertQuestionProgress(user.id, id, { confidence });
      }
    },
    [user]
  );

  const updateNotes = useCallback(
    (id: string, notes: string) => {
      progressUpdateNotes(id, notes);
      if (user && isSupabaseConfigured) {
        upsertQuestionProgress(user.id, id, { notes });
      }
    },
    [progressUpdateNotes, user]
  );

  const resetProgress = useCallback(() => {
    resetAllProgress();
    setConfidences({});
  }, [resetAllProgress]);

  // Compute live sheet statistics dynamically from the questions array
  const sheets = useMemo<DSASheet[]>(() => {
    return MOCK_SHEETS.map((sheet) => {
      let sheetQuestions: DSAQuestion[] = [];
      if (sheet.id === 'striver-a2z') {
        sheetQuestions = questions.filter((q) => q.sheets.includes('Striver A2Z'));
      } else if (sheet.id === 'love-babbar-450') {
        sheetQuestions = questions.filter((q) => q.sheets.includes('Love Babbar 450'));
      } else {
        sheetQuestions = questions.filter((q) =>
          q.sheets.some((s) => s.toLowerCase().includes(sheet.title.toLowerCase().slice(0, 5)))
        );
      }

      const totalCount = sheetQuestions.length || sheet.totalQuestions;
      const solvedCount = sheetQuestions.filter((q) => q.status === 'Solved').length;
      const progressPct = totalCount > 0 ? Math.min(100, Math.round((solvedCount / totalCount) * 100)) : 0;

      return {
        ...sheet,
        totalQuestions: totalCount,
        solvedQuestions: solvedCount,
        progress: progressPct,
      };
    });
  }, [questions]);

  // Compute real user statistics
  const stats = useMemo<UserStats>(() => {
    const solvedCount = questions.filter((q) => q.status === 'Solved').length;
    const easyTotal = questions.filter((q) => q.difficulty === 'Easy').length;
    const easySolved = questions.filter((q) => q.status === 'Solved' && q.difficulty === 'Easy').length;
    
    const mediumTotal = questions.filter((q) => q.difficulty === 'Medium').length;
    const mediumSolved = questions.filter((q) => q.status === 'Solved' && q.difficulty === 'Medium').length;
    
    const hardTotal = questions.filter((q) => q.difficulty === 'Hard').length;
    const hardSolved = questions.filter((q) => q.status === 'Solved' && q.difficulty === 'Hard').length;

    const activeSheet = sheets.find((s) => s.id === activeSheetId) || sheets[0];

    return {
      ...MOCK_USER_STATS,
      totalSolved: solvedCount,
      totalQuestions: questions.length,
      easySolved,
      easyTotal,
      mediumSolved,
      mediumTotal,
      hardSolved,
      hardTotal,
      currentStreak: 18,
      bestStreak: 42,
      activeSheetTitle: activeSheet.title,
      activeSheetProgress: activeSheet.progress,
      activeSheetSolved: activeSheet.solvedQuestions,
      activeSheetTotal: activeSheet.totalQuestions,
      dailyGoal: 5,
      solvedToday: Math.min(5, solvedCount % 6 + 1),
    };
  }, [questions, sheets, activeSheetId]);

  const value = useMemo(
    () => ({
      questions,
      sheets,
      stats,
      activeSheetId,
      setActiveSheetId,
      toggleStatus,
      toggleBookmark,
      toggleRevisit,
      incrementRevision,
      decrementRevision,
      setRevisionCount,
      updateConfidence,
      updateNotes,
      resetProgress,
    }),
    [
      questions,
      sheets,
      stats,
      activeSheetId,
      setActiveSheetId,
      toggleStatus,
      toggleBookmark,
      toggleRevisit,
      incrementRevision,
      decrementRevision,
      setRevisionCount,
      updateConfidence,
      updateNotes,
      resetProgress,
    ]
  );

  return <ProblemContext.Provider value={value}>{children}</ProblemContext.Provider>;
};

export const useProblems = () => {
  const context = useContext(ProblemContext);
  if (!context) {
    throw new Error('useProblems must be used within a ProblemProvider');
  }
  return context;
};
