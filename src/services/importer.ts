import type { Difficulty, Platform, Question, ImportSummary } from '../types';
import { QUESTIONS as BASE_QUESTIONS } from '../data/questionsData';

export interface RawImportRecord {
  title: string;
  topicId?: string;
  topicName?: string;
  subtopic?: string;
  difficulty?: string;
  platform?: string;
  problemUrl?: string;
  articleUrl?: string;
  youtubeUrl?: string;
}

const CUSTOM_QUESTIONS_STORAGE_KEY = 'codetrack_custom_questions';

/**
 * Extracts a normalized problem slug from LeetCode, GFG, or CodingNinjas URLs.
 */
export function extractProblemSlug(url?: string): string | null {
  if (!url) return null;
  const lcMatch = url.match(/leetcode\.com\/problems\/([^/?#]+)/i);
  if (lcMatch) return lcMatch[1].toLowerCase().trim();

  const gfgMatch = url.match(/geeksforgeeks\.org\/problems\/([^/?#]+)/i);
  if (gfgMatch) return gfgMatch[1].toLowerCase().trim();

  const cnMatch =
    url.match(/naukri\.com\/.*\/problems\/([^/?#]+)/i) ||
    url.match(/codingninjas\.com\/.*\/problems\/([^/?#]+)/i);
  if (cnMatch) return cnMatch[1].toLowerCase().trim();

  return null;
}

/**
 * Normalizes title string for robust deduplication.
 */
export function normalizeTitle(title?: string): string {
  if (!title) return '';
  return title.toLowerCase().replace(/[^a-z0-9]/g, '').trim();
}

/**
 * Normalizes difficulty input into 'Easy' | 'Medium' | 'Hard'
 */
export function normalizeDifficulty(diff?: string): Difficulty {
  const d = (diff || '').toLowerCase().trim();
  if (d.startsWith('e') || d === 'basic' || d === 'school') return 'Easy';
  if (d.startsWith('h')) return 'Hard';
  return 'Medium';
}

/**
 * Normalizes platform input
 */
export function normalizePlatform(platform?: string, url?: string): Platform {
  const p = (platform || '').toLowerCase().trim();
  const u = (url || '').toLowerCase();
  if (p.includes('leetcode') || u.includes('leetcode.com')) return 'LeetCode';
  if (p.includes('geek') || p.includes('gfg') || u.includes('geeksforgeeks.org')) return 'GeeksforGeeks';
  if (p.includes('ninja') || p.includes('codingninja') || u.includes('naukri.com') || u.includes('codingninjas.com')) return 'CodingNinjas';
  if (p.includes('codeforces') || u.includes('codeforces.com')) return 'Codeforces';
  if (p.includes('takeuforward') || p.includes('striver') || u.includes('takeuforward.org')) return 'TakeUForward';
  return 'Other';
}

/**
 * Loads custom imported questions from localStorage.
 */
export function getCustomImportedQuestions(): Question[] {
  try {
    const raw = localStorage.getItem(CUSTOM_QUESTIONS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Error reading custom questions from localStorage:', err);
    return [];
  }
}

/**
 * Persists custom imported questions to localStorage and triggers storage event.
 */
export function saveCustomImportedQuestions(questions: Question[]): void {
  try {
    localStorage.setItem(CUSTOM_QUESTIONS_STORAGE_KEY, JSON.stringify(questions));
    window.dispatchEvent(new Event('storage'));
  } catch (err) {
    console.error('Error saving custom questions to localStorage:', err);
  }
}

/**
 * Parse CSV text into raw records.
 * Supports headers: title, topic, difficulty, url/problemUrl, platform, subtopic
 */
export function parseQuestionCSV(csvText: string): { records: RawImportRecord[]; errors: string[] } {
  const records: RawImportRecord[] = [];
  const errors: string[] = [];

  const lines = csvText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length < 2) {
    errors.push('CSV must have at least one header row and one data row.');
    return { records, errors };
  }

  // Parse header
  const headerLine = lines[0];
  const headers = parseCSVLine(headerLine).map((h) => h.toLowerCase().replace(/[\s_-]/g, ''));

  const titleIdx = headers.findIndex((h) => h === 'title' || h === 'problem' || h === 'question' || h === 'problemname');
  const topicIdx = headers.findIndex((h) => h === 'topic' || h === 'topicid' || h === 'topicname' || h === 'category');
  const diffIdx = headers.findIndex((h) => h === 'difficulty' || h === 'diff' || h === 'level');
  const urlIdx = headers.findIndex((h) => h === 'url' || h === 'problemurl' || h === 'link' || h === 'problemlink');
  const platIdx = headers.findIndex((h) => h === 'platform' || h === 'site');
  const subtopicIdx = headers.findIndex((h) => h === 'subtopic' || h === 'pattern' || h === 'tag');

  if (titleIdx === -1) {
    errors.push('CSV is missing a "title" or "problem" column.');
    return { records, errors };
  }

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;
    const values = parseCSVLine(line);
    const title = values[titleIdx]?.trim();
    if (!title) {
      errors.push(`Row ${i + 1}: Skipped row with empty title.`);
      continue;
    }

    records.push({
      title,
      topicId: topicIdx !== -1 ? values[topicIdx]?.trim() : undefined,
      topicName: topicIdx !== -1 ? values[topicIdx]?.trim() : undefined,
      difficulty: diffIdx !== -1 ? values[diffIdx]?.trim() : undefined,
      problemUrl: urlIdx !== -1 ? values[urlIdx]?.trim() : undefined,
      platform: platIdx !== -1 ? values[platIdx]?.trim() : undefined,
      subtopic: subtopicIdx !== -1 ? values[subtopicIdx]?.trim() : undefined,
    });
  }

  return { records, errors };
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

/**
 * Parse JSON text into raw records.
 * Can be an array of objects or an object containing an array.
 */
export function parseQuestionJSON(jsonText: string): { records: RawImportRecord[]; errors: string[] } {
  const records: RawImportRecord[] = [];
  const errors: string[] = [];

  try {
    const parsed = JSON.parse(jsonText);
    const list: unknown[] = Array.isArray(parsed)
      ? parsed
      : Array.isArray((parsed as Record<string, unknown>).questions)
      ? (parsed as Record<string, unknown>).questions as unknown[]
      : Array.isArray((parsed as Record<string, unknown>).data)
      ? (parsed as Record<string, unknown>).data as unknown[]
      : [];

    if (!list || list.length === 0) {
      errors.push('No question records found in JSON. Expected an array of questions or { "questions": [...] }.');
      return { records, errors };
    }

    list.forEach((item, idx) => {
      if (!item || typeof item !== 'object') {
        errors.push(`Item ${idx + 1}: Invalid question record.`);
        return;
      }
      const raw = item as Record<string, unknown>;
      const title = (raw.title || raw.problem || raw.name || raw.problemName || '') as string;
      if (!title || typeof title !== 'string' || !title.trim()) {
        errors.push(`Item ${idx + 1}: Missing question title.`);
        return;
      }

      records.push({
        title: title.trim(),
        topicId: (raw.topicId || raw.topic || raw.category || '') as string,
        topicName: (raw.topicName || raw.topic || raw.category || '') as string,
        difficulty: (raw.difficulty || raw.diff || raw.level || '') as string,
        problemUrl: (raw.problemUrl || raw.url || raw.link || '') as string,
        platform: (raw.platform || raw.site || '') as string,
        subtopic: (raw.subtopic || raw.pattern || raw.tag || '') as string,
        articleUrl: (raw.articleUrl || raw.article || '') as string,
        youtubeUrl: (raw.youtubeUrl || raw.youtube || raw.video || '') as string,
      });
    });
  } catch (err) {
    errors.push(`JSON parse error: ${(err as Error).message}`);
  }

  return { records, errors };
}

/**
 * Map topic text to canonical topicId
 */
export function mapTopicToId(topicStr?: string): { topicId: string; topicName: string } {
  const t = (topicStr || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  if (t.includes('basic') || t.includes('learn')) return { topicId: 'learn-basics', topicName: 'Learn the Basics' };
  if (t.includes('sort')) return { topicId: 'sorting', topicName: 'Sorting' };
  if (t.includes('array') || t.includes('matrix')) return { topicId: 'arrays', topicName: 'Arrays' };
  if (t.includes('binarysearch') || t.includes('bs')) return { topicId: 'binary-search', topicName: 'Binary Search' };
  if (t.includes('advstring') || t.includes('kmp') || t.includes('rabin')) return { topicId: 'strings-advance', topicName: 'Advanced Strings' };
  if (t.includes('string')) return { topicId: 'strings', topicName: 'Strings' };
  if (t.includes('linkedlist') || t.includes('ll')) return { topicId: 'linked-list', topicName: 'Linked Lists' };
  if (t.includes('recurs') || t.includes('backtrack')) return { topicId: 'recursion', topicName: 'Recursion' };
  if (t.includes('bit') || t.includes('xor')) return { topicId: 'bit-manipulation', topicName: 'Bit Manipulation' };
  if (t.includes('stack') || t.includes('queue')) return { topicId: 'stacks-queues', topicName: 'Stack & Queue' };
  if (t.includes('window') || t.includes('twopointer')) return { topicId: 'sliding-window', topicName: 'Sliding Window & Two Pointers' };
  if (t.includes('heap') || t.includes('priority')) return { topicId: 'heaps', topicName: 'Heaps' };
  if (t.includes('greedy')) return { topicId: 'greedy', topicName: 'Greedy' };
  if (t.includes('bst') || t.includes('binarysearchtree')) return { topicId: 'bst', topicName: 'Binary Search Trees (BST)' };
  if (t.includes('tree')) return { topicId: 'binary-trees', topicName: 'Binary Trees' };
  if (t.includes('graph')) return { topicId: 'graphs', topicName: 'Graphs' };
  if (t.includes('dp') || t.includes('dynamic')) return { topicId: 'dp', topicName: 'Dynamic Programming' };
  if (t.includes('trie')) return { topicId: 'tries', topicName: 'Tries' };
  if (t.includes('math')) return { topicId: 'maths', topicName: 'Maths' };

  return { topicId: 'arrays', topicName: 'Arrays' };
}

/**
 * Bulk import questions into a target sheet collection.
 * Confidently deduplicates against BASE_QUESTIONS and existing custom questions.
 */
export function importSheetData(
  sheetId: string,
  sheetName: string,
  records: RawImportRecord[]
): ImportSummary {
  const summary: ImportSummary = {
    sheetId,
    sheetName,
    totalProcessed: records.length,
    newlyImported: 0,
    matchedExisting: 0,
    skipped: 0,
    rejected: 0,
    errors: [],
  };

  if (records.length === 0) {
    summary.errors.push('No records provided for import.');
    return summary;
  }

  const existingCustom = getCustomImportedQuestions();
  const allCurrentQuestions = [...BASE_QUESTIONS, ...existingCustom];

  // Build lookup index
  const slugMap = new Map<string, Question>();
  const titleMap = new Map<string, Question>();

  allCurrentQuestions.forEach((q) => {
    const slug = extractProblemSlug(q.problemUrl);
    if (slug) slugMap.set(slug, q);
    const norm = normalizeTitle(q.title);
    if (norm) titleMap.set(norm, q);
  });

  const customToAdd: Question[] = [];
  const updatedCustomQuestions = [...existingCustom];

  records.forEach((rec, idx) => {
    if (!rec.title || !rec.title.trim()) {
      summary.rejected++;
      summary.errors.push(`Row ${idx + 1}: Missing question title.`);
      return;
    }

    const slug = extractProblemSlug(rec.problemUrl);
    const normTitle = normalizeTitle(rec.title);

    const match = (slug && slugMap.get(slug)) || titleMap.get(normTitle);

    if (match) {
      // Problem already exists in catalog!
      const currentSheets = match.sheets || ['striver-a2z'];
      if (!currentSheets.includes(sheetId)) {
        match.sheets = [...currentSheets, sheetId];
        summary.matchedExisting++;
        // If this matched a custom question, persist its update
        const customIdx = updatedCustomQuestions.findIndex((q) => q.id === match.id);
        if (customIdx !== -1) {
          updatedCustomQuestions[customIdx] = { ...match };
        }
      } else {
        summary.skipped++; // Already in this sheet
      }
    } else {
      // New question!
      const { topicId, topicName } = mapTopicToId(rec.topicName || rec.topicId);
      const difficulty = normalizeDifficulty(rec.difficulty);
      const platform = normalizePlatform(rec.platform, rec.problemUrl);
      const cleanSlug = slug || normTitle.slice(0, 30);
      const cleanPrefix = sheetId.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8);
      const uniqueId = `${cleanPrefix}-${cleanSlug}-${Date.now().toString(36).slice(-4)}`;

      const newQ: Question = {
        id: uniqueId,
        title: rec.title.trim(),
        topicId,
        topicName,
        subtopic: rec.subtopic || `${topicName} Practice`,
        difficulty,
        platform,
        problemUrl: rec.problemUrl || '',
        articleUrl: rec.articleUrl,
        youtubeUrl: rec.youtubeUrl,
        sheets: [sheetId],
      };

      customToAdd.push(newQ);
      summary.newlyImported++;

      // Add to index so future records in this same batch don't duplicate
      if (slug) slugMap.set(slug, newQ);
      titleMap.set(normTitle, newQ);
    }
  });

  const finalCustom = [...updatedCustomQuestions, ...customToAdd];
  saveCustomImportedQuestions(finalCustom);

  return summary;
}

/**
 * Remove a specific custom sheet collection
 */
export function clearSheetQuestions(sheetId: string): void {
  const current = getCustomImportedQuestions();
  const filtered = current
    .map((q) => {
      const sheets = (q.sheets || []).filter((s) => s !== sheetId);
      return { ...q, sheets };
    })
    .filter((q) => (q.sheets || []).length > 0);

  saveCustomImportedQuestions(filtered);
}

/**
 * Returns formatted sample CSV or JSON template for users
 */
export function getSampleTemplate(format: 'csv' | 'json', sheetName = 'Love Babbar 450'): string {
  if (format === 'csv') {
    return `Title,Topic,Difficulty,Platform,ProblemUrl,Subtopic
Reverse the array,Arrays,Easy,GeeksforGeeks,https://www.geeksforgeeks.org/problems/reverse-an-array/0,Array Basics
Find the maximum and minimum element in an array,Arrays,Easy,GeeksforGeeks,https://www.geeksforgeeks.org/problems/find-minimum-and-maximum-element-in-an-array4428/1,Array Basics
Kth smallest element,Heaps,Medium,GeeksforGeeks,https://www.geeksforgeeks.org/problems/kth-smallest-element5635/1,Heaps Medium
Sort an array of 0s 1s and 2s,Arrays,Easy,LeetCode,https://leetcode.com/problems/sort-colors/,Dutch National Flag
Move all negative numbers to beginning,Arrays,Easy,GeeksforGeeks,https://www.geeksforgeeks.org/problems/move-all-negative-elements-to-end1813/1,Two Pointers`;
  }

  return JSON.stringify(
    {
      sheet: sheetName,
      questions: [
        {
          title: 'Reverse the array',
          topic: 'Arrays',
          difficulty: 'Easy',
          platform: 'GeeksforGeeks',
          problemUrl: 'https://www.geeksforgeeks.org/problems/reverse-an-array/0',
          subtopic: 'Array Basics',
        },
        {
          title: 'Find the maximum and minimum element in an array',
          topic: 'Arrays',
          difficulty: 'Easy',
          platform: 'GeeksforGeeks',
          problemUrl: 'https://www.geeksforgeeks.org/problems/find-minimum-and-maximum-element-in-an-array4428/1',
          subtopic: 'Array Basics',
        },
        {
          title: 'Kth smallest element',
          topic: 'Heaps',
          difficulty: 'Medium',
          platform: 'GeeksforGeeks',
          problemUrl: 'https://www.geeksforgeeks.org/problems/kth-smallest-element5635/1',
          subtopic: 'Heaps Medium',
        },
      ],
    },
    null,
    2
  );
}
