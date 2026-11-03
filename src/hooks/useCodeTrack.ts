import { useEffect, useState, useMemo, useCallback } from 'react';
import { getAllQuestions, getLiveSheets, TOPICS } from '../services/questionBank';
import {
  calculateStreaks,
  completeRevision as storageCompleteRevision,
  exportUserDataCSV,
  exportUserDataJSON,
  forcePushToCloud,
  getDailyActivityMap,
  getLocalDateString,
  getStoredBookmarks,
  getStoredProgress,
  getStoredRevisions,
  getUserSettings,
  importUserDataJSON,
  isCloudSyncInProgress,
  refreshFromCloud,
  saveQuestionNotes as storageSaveNotes,
  scheduleManualRevision,
  setCurrentUser,
  subscribeToStorage,
  toggleBookmark as storageToggleBookmark,
  updateQuestionStatus as storageUpdateStatus,
  updateUserSettings as storageUpdateSettings,
} from '../services/storage';
import { useAuth } from './useAuth';
import type { QuestionStatus, UserSettings } from '../types';

export function useCodeTrack() {
  const [progress, setProgress] = useState(getStoredProgress);
  const [bookmarks, setBookmarks] = useState(getStoredBookmarks);
  const [revisions, setRevisions] = useState(getStoredRevisions);
  const [activityMap, setActivityMap] = useState(getDailyActivityMap);
  const [settings, setSettings] = useState(getUserSettings);
  const [questions, setQuestions] = useState(getAllQuestions);

  const { user } = useAuth();

  const refreshState = useCallback(() => {
    setProgress(getStoredProgress());
    setBookmarks(getStoredBookmarks());
    setRevisions(getStoredRevisions());
    setActivityMap(getDailyActivityMap());
    setSettings(getUserSettings());
    setQuestions(getAllQuestions());
  }, []);

  useEffect(() => {
    setCurrentUser(user?.id ?? null);
  }, [user?.id]);

  useEffect(() => {
    const unsubscribe = subscribeToStorage(refreshState);
    return () => unsubscribe();
  }, [refreshState]);

  // Derived Analytics and Statistics
  const stats = useMemo(() => {
    const totalQuestions = questions.length;
    let solvedCount = 0;
    let attemptedCount = 0;

    Object.values(progress).forEach((p) => {
      if (p.status === 'Solved') solvedCount++;
      else if (p.status === 'Attempted') attemptedCount++;
    });

    const unsolvedCount = Math.max(0, totalQuestions - solvedCount - attemptedCount);
    const completionPercentage =
      totalQuestions > 0 ? Math.round((solvedCount / totalQuestions) * 100) : 0;

    const todayStr = getLocalDateString();
    const todayActivity = activityMap[todayStr];
    const todaySolvedCount = todayActivity?.questionsSolved || 0;

    const { currentStreak, longestStreak } = calculateStreaks();

    // Revisions calculation
    let dueTodayRevisionsCount = 0;
    let overdueRevisionsCount = 0;

    Object.values(revisions).forEach((r) => {
      if (r.isCompleted) return;
      if (r.nextReviewDate === todayStr) {
        dueTodayRevisionsCount++;
      } else if (r.nextReviewDate < todayStr) {
        overdueRevisionsCount++;
      }
    });

    return {
      totalQuestions,
      solvedCount,
      attemptedCount,
      unsolvedCount,
      completionPercentage,
      todaySolvedCount,
      dailyGoal: settings.dailyGoal || 3,
      currentStreak,
      longestStreak,
      dueTodayRevisionsCount,
      overdueRevisionsCount,
    };
  }, [questions, progress, activityMap, settings.dailyGoal, revisions]);

  // Topic-wise progress breakdown
  const topicStats = useMemo(() => {
    return TOPICS.map((topic) => {
      const topicQuestions = questions.filter((q) => q.topicId === topic.id);
      const total = topicQuestions.length;
      let solved = 0;
      let attempted = 0;

      topicQuestions.forEach((q) => {
        const status = progress[q.id]?.status;
        if (status === 'Solved') solved++;
        else if (status === 'Attempted') attempted++;
      });

      const remaining = Math.max(0, total - solved - attempted);
      const percentage = total > 0 ? Math.round((solved / total) * 100) : 0;

      return {
        topic,
        total,
        solved,
        attempted,
        remaining,
        percentage,
      };
    });
  }, [questions, progress]);

  // Live Sheet breakdown with real counts and percentages
  const sheetStats = useMemo(() => {
    return getLiveSheets(questions, progress);
  }, [questions, progress]);

  // User Actions
  const updateStatus = useCallback((questionId: string, status: QuestionStatus) => {
    storageUpdateStatus(questionId, status);
  }, []);

  const saveNotes = useCallback((questionId: string, notes: string) => {
    storageSaveNotes(questionId, notes);
  }, []);

  const toggleBookmark = useCallback((questionId: string) => {
    return storageToggleBookmark(questionId);
  }, []);

  const scheduleRevision = useCallback((questionId: string, customDate?: string) => {
    scheduleManualRevision(questionId, customDate);
  }, []);

  const completeRevision = useCallback((questionId: string, confidence: 'Again' | 'Good' | 'Easy') => {
    storageCompleteRevision(questionId, confidence);
  }, []);

  const updateSettings = useCallback((partial: Partial<UserSettings>) => {
    const updated = storageUpdateSettings(partial);
    setSettings(updated);
  }, []);

  const updateDailyGoal = useCallback(
    (newGoal: number) => {
      const valid = Math.max(1, Math.min(100, Math.round(newGoal)));
      updateSettings({ dailyGoal: valid });
    },
    [updateSettings]
  );

  return {
    progress,
    bookmarks,
    revisions,
    activityMap,
    settings,
    questions,
    stats,
    topicStats,
    sheetStats,
    updateStatus,
    saveNotes,
    toggleBookmark,
    scheduleRevision,
    completeRevision,
    updateSettings,
    updateDailyGoal,
    exportJSON: exportUserDataJSON,
    exportCSV: exportUserDataCSV,
    importJSON: importUserDataJSON,
    isSyncing: isCloudSyncInProgress(),
    forceSync: () =>
      user?.id ? forcePushToCloud(user.id) : Promise.resolve({ success: false, count: 0 }),
    refreshFromCloud: () => (user?.id ? refreshFromCloud(user.id) : Promise.resolve(false)),
  };
}
