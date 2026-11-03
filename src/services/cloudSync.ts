import { supabase, isSupabaseConfigured } from './supabase';
import type {
  DailyActivityRecord,
  QuestionStatus,
  RevisionItem,
  UserProgress,
  UserSettings,
} from '../types';

export interface CloudUserData {
  progress: Record<string, UserProgress>;
  bookmarks: string[];
  revisions: Record<string, RevisionItem>;
  dailyActivity: Record<string, DailyActivityRecord>;
  settings: Partial<UserSettings> | null;
}

// ==========================================
// 1. Fetch complete cloud data for user
// ==========================================
export async function fetchCloudUserData(userId: string): Promise<CloudUserData | null> {
  if (!isSupabaseConfigured || !supabase || !userId) {
    return null;
  }

  try {
    const [progressRes, bookmarksRes, revisionsRes, activityRes, settingsRes] = await Promise.all([
      supabase.from('user_progress').select('*').eq('user_id', userId),
      supabase.from('user_bookmarks').select('question_id').eq('user_id', userId),
      supabase.from('revision_schedule').select('*').eq('user_id', userId),
      supabase.from('daily_activity').select('*').eq('user_id', userId),
      supabase.from('user_settings').select('*').eq('user_id', userId).maybeSingle(),
    ]);

    // Transform user_progress
    const progress: Record<string, UserProgress> = {};
    if (progressRes.data) {
      progressRes.data.forEach((row: any) => {
        progress[row.question_id] = {
          questionId: row.question_id,
          status: row.status as QuestionStatus,
          notes: row.notes || '',
          solvedAt: row.solved_at || null,
          updatedAt: row.updated_at || new Date().toISOString(),
        };
      });
    }

    // Transform bookmarks
    const bookmarks: string[] = bookmarksRes.data
      ? bookmarksRes.data.map((row: any) => row.question_id)
      : [];

    // Transform revisions
    const revisions: Record<string, RevisionItem> = {};
    if (revisionsRes.data) {
      revisionsRes.data.forEach((row: any) => {
        revisions[row.question_id] = {
          questionId: row.question_id,
          stage: row.stage || 1,
          nextReviewDate: row.next_review_date,
          lastReviewedAt: row.last_reviewed_at || null,
          reviewCount: row.review_count || 0,
          isCompleted: Boolean(row.is_completed),
        };
      });
    }

    // Transform daily_activity
    const dailyActivity: Record<string, DailyActivityRecord> = {};
    if (activityRes.data) {
      activityRes.data.forEach((row: any) => {
        dailyActivity[row.activity_date] = {
          activityDate: row.activity_date,
          questionsSolved: row.questions_solved || 0,
          revisionsCompleted: row.revisions_completed || 0,
        };
      });
    }

    // Transform user_settings
    let settings: Partial<UserSettings> | null = null;
    if (settingsRes.data) {
      settings = {
        dailyGoal: settingsRes.data.daily_goal,
        preferredLanguage: settingsRes.data.preferred_language,
        theme: settingsRes.data.theme,
        leetcodeUsername: settingsRes.data.leetcode_username,
        codeforcesUsername: settingsRes.data.codeforces_username,
      };
    }

    return {
      progress,
      bookmarks,
      revisions,
      dailyActivity,
      settings,
    };
  } catch (err) {
    console.error('Error fetching user data from Supabase:', err);
    return null;
  }
}

// ==========================================
// 2. Incremental Sync Actions (Row-Level Security)
// ==========================================

export async function syncQuestionProgressToCloud(
  userId: string,
  progress: UserProgress
): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase || !userId) return false;

  try {
    const { error } = await supabase.from('user_progress').upsert(
      {
        user_id: userId,
        question_id: progress.questionId,
        status: progress.status,
        notes: progress.notes,
        solved_at: progress.solvedAt,
        updated_at: progress.updatedAt,
      },
      { onConflict: 'user_id,question_id' }
    );

    if (error) {
      console.warn('Failed to sync question progress to cloud:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Network error syncing progress:', err);
    return false;
  }
}

export async function syncBookmarkToCloud(
  userId: string,
  questionId: string,
  isBookmarked: boolean
): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase || !userId) return false;

  try {
    if (isBookmarked) {
      const { error } = await supabase
        .from('user_bookmarks')
        .upsert({ user_id: userId, question_id: questionId }, { onConflict: 'user_id,question_id' });
      return !error;
    } else {
      const { error } = await supabase
        .from('user_bookmarks')
        .delete()
        .match({ user_id: userId, question_id: questionId });
      return !error;
    }
  } catch (err) {
    console.warn('Error syncing bookmark to cloud:', err);
    return false;
  }
}

export async function syncRevisionToCloud(
  userId: string,
  revision: RevisionItem
): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase || !userId) return false;

  try {
    const { error } = await supabase.from('revision_schedule').upsert(
      {
        user_id: userId,
        question_id: revision.questionId,
        stage: revision.stage,
        next_review_date: revision.nextReviewDate,
        last_reviewed_at: revision.lastReviewedAt,
        review_count: revision.reviewCount,
        is_completed: revision.isCompleted,
      },
      { onConflict: 'user_id,question_id' }
    );
    return !error;
  } catch (err) {
    console.warn('Error syncing revision to cloud:', err);
    return false;
  }
}

export async function syncDailyActivityToCloud(
  userId: string,
  activity: DailyActivityRecord
): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase || !userId) return false;

  try {
    const { error } = await supabase.from('daily_activity').upsert(
      {
        user_id: userId,
        activity_date: activity.activityDate,
        questions_solved: activity.questionsSolved,
        revisions_completed: activity.revisionsCompleted,
      },
      { onConflict: 'user_id,activity_date' }
    );
    return !error;
  } catch (err) {
    console.warn('Error syncing daily activity to cloud:', err);
    return false;
  }
}

export async function syncUserSettingsToCloud(
  userId: string,
  settings: Partial<UserSettings>
): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase || !userId) return false;

  try {
    const payload: any = { user_id: userId };
    if (settings.dailyGoal !== undefined) payload.daily_goal = settings.dailyGoal;
    if (settings.preferredLanguage !== undefined) payload.preferred_language = settings.preferredLanguage;
    if (settings.theme !== undefined) payload.theme = settings.theme;
    if (settings.leetcodeUsername !== undefined) payload.leetcode_username = settings.leetcodeUsername;
    if (settings.codeforcesUsername !== undefined) payload.codeforces_username = settings.codeforcesUsername;

    const { error } = await supabase.from('user_settings').upsert(payload, { onConflict: 'user_id' });
    return !error;
  } catch (err) {
    console.warn('Error syncing user settings to cloud:', err);
    return false;
  }
}

// ==========================================
// 3. Push all local data into user's cloud account
// ==========================================
export async function pushAllLocalDataToCloud(
  userId: string,
  progress: Record<string, UserProgress>,
  bookmarks: string[],
  revisions: Record<string, RevisionItem>,
  activity: Record<string, DailyActivityRecord>,
  settings: UserSettings
): Promise<{ success: boolean; count: number }> {
  if (!isSupabaseConfigured || !supabase || !userId) {
    return { success: false, count: 0 };
  }

  let totalSynced = 0;

  try {
    // 1. Progress
    const progressRows = Object.values(progress).map((p) => ({
      user_id: userId,
      question_id: p.questionId,
      status: p.status,
      notes: p.notes,
      solved_at: p.solvedAt,
      updated_at: p.updatedAt,
    }));
    if (progressRows.length > 0) {
      await supabase.from('user_progress').upsert(progressRows, { onConflict: 'user_id,question_id' });
      totalSynced += progressRows.length;
    }

    // 2. Bookmarks
    const bookmarkRows = bookmarks.map((qId) => ({
      user_id: userId,
      question_id: qId,
    }));
    if (bookmarkRows.length > 0) {
      await supabase.from('user_bookmarks').upsert(bookmarkRows, { onConflict: 'user_id,question_id' });
      totalSynced += bookmarkRows.length;
    }

    // 3. Revisions
    const revisionRows = Object.values(revisions).map((r) => ({
      user_id: userId,
      question_id: r.questionId,
      stage: r.stage,
      next_review_date: r.nextReviewDate,
      last_reviewed_at: r.lastReviewedAt,
      review_count: r.reviewCount,
      is_completed: r.isCompleted,
    }));
    if (revisionRows.length > 0) {
      await supabase.from('revision_schedule').upsert(revisionRows, { onConflict: 'user_id,question_id' });
      totalSynced += revisionRows.length;
    }

    // 4. Daily Activity
    const activityRows = Object.values(activity).map((a) => ({
      user_id: userId,
      activity_date: a.activityDate,
      questions_solved: a.questionsSolved,
      revisions_completed: a.revisionsCompleted,
    }));
    if (activityRows.length > 0) {
      await supabase.from('daily_activity').upsert(activityRows, { onConflict: 'user_id,activity_date' });
      totalSynced += activityRows.length;
    }

    // 5. Settings
    await syncUserSettingsToCloud(userId, settings);

    return { success: true, count: totalSynced };
  } catch (err) {
    console.error('Error during bulk cloud sync:', err);
    return { success: false, count: totalSynced };
  }
}
