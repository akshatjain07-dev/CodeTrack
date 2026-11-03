export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export type QuestionStatus = 'Not Started' | 'Attempted' | 'Solved';

export type Platform = 'LeetCode' | 'CodingNinjas' | 'GeeksforGeeks' | 'Codeforces' | 'TakeUForward' | 'Other';

export interface Question {
  id: string;
  title: string;
  topicId: string;
  topicName: string;
  subtopic: string;
  difficulty: Difficulty;
  platform: Platform;
  problemUrl: string;
  articleUrl?: string;
  youtubeUrl?: string;
  sheets?: string[]; // Collection membership e.g. ['striver-a2z', 'neetcode-150', 'neetcode-250']
}

export interface ImportSummary {
  sheetId: string;
  sheetName: string;
  totalProcessed: number;
  newlyImported: number;
  matchedExisting: number;
  skipped: number;
  rejected: number;
  errors: string[];
}

export interface Topic {
  id: string;
  name: string;
  displayOrder: number;
  description: string;
  totalQuestions?: number;
}

export interface UserProgress {
  questionId: string;
  status: QuestionStatus;
  notes: string;
  solvedAt: string | null;
  updatedAt: string;
}

export interface UserBookmark {
  questionId: string;
  bookmarkedAt: string;
}

export interface RevisionItem {
  questionId: string;
  stage: number; // 1 (1d), 2 (3d), 3 (7d), 4 (14d), 5 (30d / Mastered)
  nextReviewDate: string; // YYYY-MM-DD
  lastReviewedAt: string | null;
  reviewCount: number;
  isCompleted: boolean;
  confidenceHistory?: ('Again' | 'Good' | 'Easy')[];
}

export interface DailyActivityRecord {
  activityDate: string; // YYYY-MM-DD
  questionsSolved: number;
  revisionsCompleted: number;
}

export interface UserSettings {
  dailyGoal: number;
  preferredLanguage: string;
  theme: 'dark' | 'light' | 'system';
  profileName?: string;

  leetcodeUsername?: string;
  codeforcesUsername?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
}

export interface ExportDataPayload {
  version: string;
  exportedAt: string;
  progress: Record<string, UserProgress>;
  bookmarks: string[];
  revisions: Record<string, RevisionItem>;
  dailyActivity: Record<string, DailyActivityRecord>;
  settings: UserSettings;
}
