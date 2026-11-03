import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { Status } from '../data/mockData';

export interface QuestionUserProgress {
  status: Status;
  revisionCount: number;
  isRevisit: boolean;
  notes?: string;
  lastAttempted?: string;
}

export type ProgressMap = Record<string, QuestionUserProgress>;

export interface ProgressContextType {
  progress: ProgressMap;
  getProgress: (questionId: string) => QuestionUserProgress;
  setStatus: (questionId: string, status: Status) => void;
  toggleStatus: (questionId: string, explicitStatus?: Status) => void;
  incrementRevision: (questionId: string) => void;
  decrementRevision: (questionId: string) => void;
  setRevisionCount: (questionId: string, count: number) => void;
  toggleRevisit: (questionId: string) => void;
  updateNotes: (questionId: string, notes: string) => void;
  resetAllProgress: () => void;
}

const STORAGE_KEY_PROGRESS = 'codetrack_user_progress';

const DEFAULT_PROGRESS: QuestionUserProgress = {
  status: 'Unsolved',
  revisionCount: 0,
  isRevisit: false,
};

// Initial starter seed for foundational questions to give the user immediate visual data
const INITIAL_SEED: ProgressMap = {
  'ct-1': { status: 'Solved', revisionCount: 2, isRevisit: false, lastAttempted: '1 day ago', notes: 'Boyer-Moore Voting Algorithm in O(N) time and O(1) space.' },
  'ct-2': { status: 'Solved', revisionCount: 1, isRevisit: false, lastAttempted: '3 days ago' },
  'ct-3': { status: 'Attempted', revisionCount: 0, isRevisit: true, lastAttempted: '2 days ago', notes: 'Maintain separate positive and negative pointers.' },
  'ct-4': { status: 'Solved', revisionCount: 1, isRevisit: false, lastAttempted: '4 days ago' },
  'ct-5': { status: 'Solved', revisionCount: 3, isRevisit: false, lastAttempted: 'Yesterday' },
  'ct-9': { status: 'Solved', revisionCount: 4, isRevisit: true, lastAttempted: '2 days ago', notes: 'HashMap complement lookup in O(N) time.' },
  'ct-10': { status: 'Attempted', revisionCount: 1, isRevisit: true, lastAttempted: '3 days ago' },
  'ct-13': { status: 'Solved', revisionCount: 3, isRevisit: false, lastAttempted: 'Yesterday', notes: 'Kadane algorithm: keep running sum, reset if < 0.' },
  'ct-14': { status: 'Solved', revisionCount: 2, isRevisit: false, lastAttempted: '4 days ago' },
  'ct-148': { status: 'Solved', revisionCount: 2, isRevisit: true, lastAttempted: '1 day ago', notes: 'LRU Cache: Doubly linked list + hash map for O(1) get/put.' },
  'ct-149': { status: 'Attempted', revisionCount: 0, isRevisit: true, lastAttempted: '3 days ago' },
  'ct-145': { status: 'Solved', revisionCount: 3, isRevisit: true, lastAttempted: 'Yesterday', notes: 'Trapping Rain Water: 2 pointers leftMax and rightMax.' },
  'ct-160': { status: 'Solved', revisionCount: 2, isRevisit: false, lastAttempted: '2 days ago' },
  'ct-161': { status: 'Solved', revisionCount: 2, isRevisit: false, lastAttempted: '2 days ago' },
  'ct-231': { status: 'Solved', revisionCount: 1, isRevisit: false, lastAttempted: '4 days ago' },
  'ct-264': { status: 'Solved', revisionCount: 3, isRevisit: false, lastAttempted: 'Yesterday' },
};

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

export const ProgressProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [progress, setProgress] = useState<ProgressMap>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PROGRESS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          return { ...INITIAL_SEED, ...parsed };
        }
      }
    } catch (e) {
      console.warn('Failed to parse progress from localStorage:', e);
    }
    return INITIAL_SEED;
  });

  // Persist to localStorage whenever progress updates
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PROGRESS, JSON.stringify(progress));
    } catch (e) {
      console.warn('Failed to persist progress to localStorage:', e);
    }
  }, [progress]);

  const getProgress = useCallback(
    (questionId: string): QuestionUserProgress => {
      return progress[questionId] || DEFAULT_PROGRESS;
    },
    [progress]
  );

  const setStatus = useCallback((questionId: string, status: Status) => {
    setProgress((prev) => {
      const cur = prev[questionId] || { ...DEFAULT_PROGRESS };
      return {
        ...prev,
        [questionId]: {
          ...cur,
          status,
          lastAttempted: status !== 'Unsolved' ? 'Just now' : cur.lastAttempted,
        },
      };
    });
  }, []);

  const toggleStatus = useCallback((questionId: string, explicitStatus?: Status) => {
    setProgress((prev) => {
      const cur = prev[questionId] || { ...DEFAULT_PROGRESS };
      let nextStatus: Status;
      if (explicitStatus) {
        nextStatus = explicitStatus;
      } else {
        if (cur.status === 'Unsolved') nextStatus = 'Attempted';
        else if (cur.status === 'Attempted') nextStatus = 'Solved';
        else nextStatus = 'Unsolved';
      }

      return {
        ...prev,
        [questionId]: {
          ...cur,
          status: nextStatus,
          lastAttempted: nextStatus !== 'Unsolved' ? 'Just now' : cur.lastAttempted,
        },
      };
    });
  }, []);

  const incrementRevision = useCallback((questionId: string) => {
    setProgress((prev) => {
      const cur = prev[questionId] || { ...DEFAULT_PROGRESS };
      return {
        ...prev,
        [questionId]: {
          ...cur,
          revisionCount: Math.max(0, cur.revisionCount + 1),
        },
      };
    });
  }, []);

  const decrementRevision = useCallback((questionId: string) => {
    setProgress((prev) => {
      const cur = prev[questionId] || { ...DEFAULT_PROGRESS };
      return {
        ...prev,
        [questionId]: {
          ...cur,
          revisionCount: Math.max(0, cur.revisionCount - 1),
        },
      };
    });
  }, []);

  const setRevisionCount = useCallback((questionId: string, count: number) => {
    setProgress((prev) => {
      const cur = prev[questionId] || { ...DEFAULT_PROGRESS };
      return {
        ...prev,
        [questionId]: {
          ...cur,
          revisionCount: Math.max(0, count),
        },
      };
    });
  }, []);

  const toggleRevisit = useCallback((questionId: string) => {
    setProgress((prev) => {
      const cur = prev[questionId] || { ...DEFAULT_PROGRESS };
      return {
        ...prev,
        [questionId]: {
          ...cur,
          isRevisit: !cur.isRevisit,
        },
      };
    });
  }, []);

  const updateNotes = useCallback((questionId: string, notes: string) => {
    setProgress((prev) => {
      const cur = prev[questionId] || { ...DEFAULT_PROGRESS };
      return {
        ...prev,
        [questionId]: {
          ...cur,
          notes,
        },
      };
    });
  }, []);

  const resetAllProgress = useCallback(() => {
    setProgress({});
    try {
      localStorage.removeItem(STORAGE_KEY_PROGRESS);
    } catch (e) {
      console.warn('Failed to clear progress localStorage:', e);
    }
  }, []);

  const value = useMemo(
    () => ({
      progress,
      getProgress,
      setStatus,
      toggleStatus,
      incrementRevision,
      decrementRevision,
      setRevisionCount,
      toggleRevisit,
      updateNotes,
      resetAllProgress,
    }),
    [
      progress,
      getProgress,
      setStatus,
      toggleStatus,
      incrementRevision,
      decrementRevision,
      setRevisionCount,
      toggleRevisit,
      updateNotes,
      resetAllProgress,
    ]
  );

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
};

export const useProgress = () => {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return context;
};
