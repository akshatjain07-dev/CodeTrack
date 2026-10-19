import type {
  DailyActivityRecord,
  ExportDataPayload,
  QuestionStatus,
  RevisionItem,
  UserProgress,
  UserSettings,
} from '../types';

const STORAGE_KEYS = {
  PROGRESS: 'codetrack_user_progress',
  BOOKMARKS: 'codetrack_user_bookmarks',
  REVISIONS: 'codetrack_user_revisions',
  ACTIVITY: 'codetrack_daily_activity',
  SETTINGS: 'codetrack_user_settings',
};

// Date Helper: Always returns local date as YYYY-MM-DD
export function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function addDays(dateStr: string, days: number): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + days);
  return getLocalDateString(date);
}

// Reactive Event Bus for multi-component synchronization
type Listener = () => void;
const listeners = new Set<Listener>();

function notifyListeners() {
  listeners.forEach((listener) => {
    try {
      listener();
    } catch (e) {
      console.error('Error notifying storage listener:', e);
    }
  });
}

export function subscribeToStorage(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

// ==========================================
// 1. User Progress
// ==========================================
export function getStoredProgress(): Record<string, UserProgress> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PROGRESS);
    if (!raw) return getDefaultSeedProgress();
    return JSON.parse(raw);
  } catch {
    return getDefaultSeedProgress();
  }
}

export function updateQuestionStatus(questionId: string, newStatus: QuestionStatus): void {
  const progressMap = getStoredProgress();
  const existing = progressMap[questionId] || {
    questionId,
    status: 'Not Started',
    notes: '',
    solvedAt: null,
    updatedAt: new Date().toISOString(),
  };

  const oldStatus = existing.status;
  if (oldStatus === newStatus) return;

  const todayStr = getLocalDateString();
  const nowIso = new Date().toISOString();

  existing.status = newStatus;
  existing.updatedAt = nowIso;

  if (newStatus === 'Solved') {
    existing.solvedAt = nowIso;
    // Update daily activity
    recordDailySolving(todayStr, 1);
    // Automatically schedule revision stage 1 (due tomorrow) if not already scheduled
    autoScheduleRevisionOnSolve(questionId);
  } else {
    // If unmarked from Solved to Attempted or Not Started
    if (oldStatus === 'Solved') {
      existing.solvedAt = null;
      recordDailySolving(todayStr, -1);
    }
  }

  progressMap[questionId] = existing;
  localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(progressMap));
  notifyListeners();
}

export function saveQuestionNotes(questionId: string, notes: string): void {
  const progressMap = getStoredProgress();
  const existing = progressMap[questionId] || {
    questionId,
    status: 'Not Started',
    notes: '',
    solvedAt: null,
    updatedAt: new Date().toISOString(),
  };

  existing.notes = notes;
  existing.updatedAt = new Date().toISOString();
  progressMap[questionId] = existing;
  localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(progressMap));
  notifyListeners();
}

// ==========================================
// 2. Bookmarks
// ==========================================
export function getStoredBookmarks(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BOOKMARKS);
    if (!raw) return ['arr-09', 'arr-13', 'bs-01', 'll-09']; // Initial helpful starters
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function toggleBookmark(questionId: string): boolean {
  const bookmarks = new Set(getStoredBookmarks());
  let isBookmarked = false;
  if (bookmarks.has(questionId)) {
    bookmarks.delete(questionId);
    isBookmarked = false;
  } else {
    bookmarks.add(questionId);
    isBookmarked = true;
  }
  localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(Array.from(bookmarks)));
  notifyListeners();
  return isBookmarked;
}

export function isQuestionBookmarked(questionId: string): boolean {
  const bookmarks = new Set(getStoredBookmarks());
  return bookmarks.has(questionId);
}

// ==========================================
// 3. Spaced Repetition Revision Center
// ==========================================
export function getStoredRevisions(): Record<string, RevisionItem> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.REVISIONS);
    if (!raw) return getDefaultRevisions();
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function autoScheduleRevisionOnSolve(questionId: string) {
  const revisions = getStoredRevisions();
  if (revisions[questionId]) return; // already in schedule

  const todayStr = getLocalDateString();
  const tomorrowStr = addDays(todayStr, 1);

  revisions[questionId] = {
    questionId,
    stage: 1,
    nextReviewDate: tomorrowStr,
    lastReviewedAt: null,
    reviewCount: 0,
    isCompleted: false,
    confidenceHistory: [],
  };
  localStorage.setItem(STORAGE_KEYS.REVISIONS, JSON.stringify(revisions));
}

export function scheduleManualRevision(questionId: string, customDate?: string) {
  const revisions = getStoredRevisions();
  const todayStr = getLocalDateString();
  const targetDate = customDate || addDays(todayStr, 1);

  revisions[questionId] = {
    questionId,
    stage: 1,
    nextReviewDate: targetDate,
    lastReviewedAt: null,
    reviewCount: 0,
    isCompleted: false,
    confidenceHistory: [],
  };
  localStorage.setItem(STORAGE_KEYS.REVISIONS, JSON.stringify(revisions));
  notifyListeners();
}

export function completeRevision(
  questionId: string,
  confidence: 'Again' | 'Good' | 'Easy'
): void {
  const revisions = getStoredRevisions();
  const todayStr = getLocalDateString();
  const existing = revisions[questionId] || {
    questionId,
    stage: 1,
    nextReviewDate: todayStr,
    lastReviewedAt: null,
    reviewCount: 0,
    isCompleted: false,
    confidenceHistory: [],
  };

  existing.lastReviewedAt = new Date().toISOString();
  existing.reviewCount += 1;
  existing.confidenceHistory = [...(existing.confidenceHistory || []), confidence];

  // Spaced repetition progression
  if (confidence === 'Again') {
    // Reset back to stage 1, review tomorrow
    existing.stage = 1;
    existing.nextReviewDate = addDays(todayStr, 1);
    existing.isCompleted = false;
  } else if (confidence === 'Good') {
    // Progress to next stage: 1 (1d) -> 2 (3d) -> 3 (7d) -> 4 (14d) -> 5 (30d)
    const stageDays: Record<number, number> = { 1: 3, 2: 7, 3: 14, 4: 30 };
    if (existing.stage >= 5) {
      existing.isCompleted = true;
      existing.nextReviewDate = addDays(todayStr, 60);
    } else {
      const daysToAdd = stageDays[existing.stage] || 7;
      existing.stage += 1;
      existing.nextReviewDate = addDays(todayStr, daysToAdd);
    }
  } else if (confidence === 'Easy') {
    // Mastered / Advance 2 stages
    if (existing.stage >= 3) {
      existing.stage = 5;
      existing.isCompleted = true;
      existing.nextReviewDate = addDays(todayStr, 60);
    } else {
      existing.stage += 2;
      existing.nextReviewDate = addDays(todayStr, 14);
    }
  }

  revisions[questionId] = existing;
  localStorage.setItem(STORAGE_KEYS.REVISIONS, JSON.stringify(revisions));

  // Record revision completion in daily activity
  recordDailyRevision(todayStr);
  notifyListeners();
}

// ==========================================
// 4. Daily Activity & Streaks
// ==========================================
export function getDailyActivityMap(): Record<string, DailyActivityRecord> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ACTIVITY);
    if (!raw) return getDefaultActivity();
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function recordDailySolving(dateStr: string, delta: number) {
  const map = getDailyActivityMap();
  const record = map[dateStr] || {
    activityDate: dateStr,
    questionsSolved: 0,
    revisionsCompleted: 0,
  };
  record.questionsSolved = Math.max(0, record.questionsSolved + delta);
  map[dateStr] = record;
  localStorage.setItem(STORAGE_KEYS.ACTIVITY, JSON.stringify(map));
}

function recordDailyRevision(dateStr: string) {
  const map = getDailyActivityMap();
  const record = map[dateStr] || {
    activityDate: dateStr,
    questionsSolved: 0,
    revisionsCompleted: 0,
  };
  record.revisionsCompleted += 1;
  map[dateStr] = record;
  localStorage.setItem(STORAGE_KEYS.ACTIVITY, JSON.stringify(map));
}

export function calculateStreaks(): { currentStreak: number; longestStreak: number } {
  const map = getDailyActivityMap();
  const todayStr = getLocalDateString();
  const yesterdayStr = addDays(todayStr, -1);

  // Check if today or yesterday had activity
  const hadToday = (map[todayStr]?.questionsSolved ?? 0) > 0 || (map[todayStr]?.revisionsCompleted ?? 0) > 0;
  const hadYesterday = (map[yesterdayStr]?.questionsSolved ?? 0) > 0 || (map[yesterdayStr]?.revisionsCompleted ?? 0) > 0;

  if (!hadToday && !hadYesterday) {
    // Streak is 0
    return { currentStreak: 0, longestStreak: computeLongestStreak(map) };
  }

  let streak = 0;
  let checkDate = hadToday ? todayStr : yesterdayStr;

  while (true) {
    const dayRecord = map[checkDate];
    const hasActivity = (dayRecord?.questionsSolved ?? 0) > 0 || (dayRecord?.revisionsCompleted ?? 0) > 0;
    if (hasActivity) {
      streak += 1;
      checkDate = addDays(checkDate, -1);
    } else {
      break;
    }
  }

  const longest = Math.max(streak, computeLongestStreak(map));
  return { currentStreak: streak, longestStreak: longest };
}

function computeLongestStreak(map: Record<string, DailyActivityRecord>): number {
  const activeDates = Object.keys(map)
    .filter((d) => (map[d].questionsSolved > 0 || map[d].revisionsCompleted > 0))
    .sort();

  if (activeDates.length === 0) return 0;

  let maxStreak = 1;
  let currentStreak = 1;

  for (let i = 1; i < activeDates.length; i++) {
    const prev = activeDates[i - 1];
    const curr = activeDates[i];
    if (addDays(prev, 1) === curr) {
      currentStreak++;
      if (currentStreak > maxStreak) {
        maxStreak = currentStreak;
      }
    } else if (prev !== curr) {
      currentStreak = 1;
    }
  }

  return maxStreak;
}

// ==========================================
// 5. User Settings
// ==========================================
export function getUserSettings(): UserSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) {
      return {
        dailyGoal: 3,
        preferredLanguage: 'C++',
        theme: 'dark',
        profileName: 'Engineering Student',
      };
    }
    return JSON.parse(raw);
  } catch {
    return {
      dailyGoal: 3,
      preferredLanguage: 'C++',
      theme: 'dark',
      profileName: 'Engineering Student',
    };
  }
}

export function updateUserSettings(partial: Partial<UserSettings>): UserSettings {
  const current = getUserSettings();
  const updated = { ...current, ...partial };
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
  notifyListeners();
  return updated;
}

// ==========================================
// 6. Data Import & Export
// ==========================================
export function exportUserDataJSON(): string {
  const payload: ExportDataPayload = {
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    progress: getStoredProgress(),
    bookmarks: getStoredBookmarks(),
    revisions: getStoredRevisions(),
    dailyActivity: getDailyActivityMap(),
    settings: getUserSettings(),
  };
  return JSON.stringify(payload, null, 2);
}

export function importUserDataJSON(jsonContent: string): { success: boolean; message: string } {
  try {
    const parsed = JSON.parse(jsonContent);
    if (!parsed || typeof parsed !== 'object') {
      return { success: false, message: 'Invalid JSON format. Expected an object.' };
    }

    if (parsed.progress) {
      localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(parsed.progress));
    }
    if (parsed.bookmarks && Array.isArray(parsed.bookmarks)) {
      localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(parsed.bookmarks));
    }
    if (parsed.revisions) {
      localStorage.setItem(STORAGE_KEYS.REVISIONS, JSON.stringify(parsed.revisions));
    }
    if (parsed.dailyActivity) {
      localStorage.setItem(STORAGE_KEYS.ACTIVITY, JSON.stringify(parsed.dailyActivity));
    }
    if (parsed.settings) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(parsed.settings));
    }

    notifyListeners();
    return { success: true, message: 'Successfully imported progress, bookmarks, and revision data.' };
  } catch (err: any) {
    return { success: false, message: `Import error: ${err.message || 'Malformed JSON'}` };
  }
}

export function exportUserDataCSV(): string {
  const progress = getStoredProgress();
  const revisions = getStoredRevisions();
  const bookmarks = new Set(getStoredBookmarks());

  const headers = ['Question ID', 'Status', 'Bookmarked', 'Notes', 'Solved Date', 'Revision Stage', 'Next Review Date'];
  const rows = Object.keys(progress).map((qid) => {
    const p = progress[qid];
    const r = revisions[qid];
    const isBookmarked = bookmarks.has(qid) ? 'Yes' : 'No';
    const notesClean = (p.notes || '').replace(/"/g, '""');
    return [
      qid,
      p.status,
      isBookmarked,
      `"${notesClean}"`,
      p.solvedAt || '',
      r ? `Stage ${r.stage}` : '',
      r ? r.nextReviewDate : '',
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}

// ==========================================
// Initial Sample Data for Instant Exploration
// ==========================================
function getDefaultSeedProgress(): Record<string, UserProgress> {
  return {
    'arr-01': {
      questionId: 'arr-01',
      status: 'Solved',
      notes: "Moore's Voting Algorithm: maintain count and candidate. O(N) time and O(1) space.",
      solvedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    'arr-09': {
      questionId: 'arr-09',
      status: 'Solved',
      notes: 'Use a hash map storing value to index for O(N) lookup. Two pointer approach works if sorted.',
      solvedAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    'arr-13': {
      questionId: 'arr-13',
      status: 'Solved',
      notes: 'Kadane algorithm: reset sum to 0 if running sum drops below 0.',
      solvedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    'bs-01': {
      questionId: 'bs-01',
      status: 'Solved',
      notes: 'Standard binary search on sorted array: mid = low + (high - low) / 2 to avoid overflow.',
      solvedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    'rec-01': {
      questionId: 'rec-01',
      status: 'Attempted',
      notes: 'Binary exponentiation. Need to watch out for negative power edge case with Integer.MIN_VALUE.',
      solvedAt: null,
      updatedAt: new Date().toISOString(),
    },
    'll-09': {
      questionId: 'll-09',
      status: 'Solved',
      notes: 'Three pointers: prev, curr, nextNode. Iterative approach is O(1) space.',
      solvedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    'gr-01': {
      questionId: 'gr-01',
      status: 'Attempted',
      notes: 'Count connected components using DFS/BFS traversal or Disjoint Set Union.',
      solvedAt: null,
      updatedAt: new Date().toISOString(),
    },
  };
}

function getDefaultRevisions(): Record<string, RevisionItem> {
  const today = getLocalDateString();
  const yesterday = addDays(today, -1);
  const tomorrow = addDays(today, 1);

  return {
    'arr-01': {
      questionId: 'arr-01',
      stage: 2,
      nextReviewDate: today, // Due today!
      lastReviewedAt: yesterday,
      reviewCount: 1,
      isCompleted: false,
    },
    'arr-09': {
      questionId: 'arr-09',
      stage: 1,
      nextReviewDate: yesterday, // Overdue!
      lastReviewedAt: null,
      reviewCount: 0,
      isCompleted: false,
    },
    'll-09': {
      questionId: 'll-09',
      stage: 1,
      nextReviewDate: tomorrow, // Upcoming!
      lastReviewedAt: null,
      reviewCount: 0,
      isCompleted: false,
    },
  };
}

function getDefaultActivity(): Record<string, DailyActivityRecord> {
  const today = getLocalDateString();
  const yesterday = addDays(today, -1);
  const twoDaysAgo = addDays(today, -2);
  const threeDaysAgo = addDays(today, -3);

  return {
    [threeDaysAgo]: { activityDate: threeDaysAgo, questionsSolved: 2, revisionsCompleted: 1 },
    [twoDaysAgo]: { activityDate: twoDaysAgo, questionsSolved: 3, revisionsCompleted: 1 },
    [yesterday]: { activityDate: yesterday, questionsSolved: 4, revisionsCompleted: 2 },
    [today]: { activityDate: today, questionsSolved: 2, revisionsCompleted: 1 },
  };
}
