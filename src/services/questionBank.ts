import { QUESTIONS as STRIVER_QUESTIONS, TOPICS } from '../data/questionsData';
import { NEETCODE_PROBLEMS } from '../data/neetcodeData';
import { extractProblemSlug, getCustomImportedQuestions, normalizeTitle } from './importer';
import type { Question, UserProgress } from '../types';
import { QUESTION_SHEETS, type QuestionSheet } from '../data/sheetsData';

/**
 * Precomputes the canonical merged question bank combining Striver A2Z and NeetCode 150/250.
 * Preserves every existing Striver question ID and canonical problem metadata.
 */
function buildBaseCatalog(): Question[] {
  const result: Question[] = [];
  const slugMap = new Map<string, Question>();
  const titleMap = new Map<string, Question>();

  // 1. Seed with Striver A2Z questions
  STRIVER_QUESTIONS.forEach((q) => {
    const cloned: Question = {
      ...q,
      sheets: q.sheets ? [...q.sheets] : ['striver-a2z'],
    };
    result.push(cloned);

    const slug = extractProblemSlug(cloned.problemUrl);
    if (slug) slugMap.set(slug, cloned);
    const norm = normalizeTitle(cloned.title);
    if (norm) titleMap.set(norm, cloned);
  });

  // 2. Merge verified NeetCode problems
  NEETCODE_PROBLEMS.forEach((nc, idx) => {
    const slug = extractProblemSlug(nc.problemUrl);
    const norm = normalizeTitle(nc.title);
    const match = (slug && slugMap.get(slug)) || titleMap.get(norm);

    const targetSheets = nc.isNeetCode150
      ? ['neetcode-150', 'neetcode-250']
      : ['neetcode-250'];

    if (match) {
      // Question exists in Striver! Attach NeetCode sheet tags
      const current = match.sheets || ['striver-a2z'];
      targetSheets.forEach((s) => {
        if (!current.includes(s)) current.push(s);
      });
      match.sheets = current;
    } else {
      // Unique NeetCode question
      const newQ: Question = {
        id: `nc-${String(idx + 1).padStart(3, '0')}`,
        title: nc.title,
        topicId: nc.topicId,
        topicName: nc.topicName,
        subtopic: nc.subtopic,
        difficulty: nc.difficulty,
        platform: nc.platform,
        problemUrl: nc.problemUrl,
        sheets: targetSheets,
      };
      result.push(newQ);
      if (slug) slugMap.set(slug, newQ);
      titleMap.set(norm, newQ);
    }
  });

  return result;
}

export const BASE_CATALOG: Question[] = buildBaseCatalog();

/**
 * Returns all active questions (Base Striver & NeetCode + any user custom imports)
 */
export function getAllQuestions(): Question[] {
  const custom = getCustomImportedQuestions();
  if (custom.length === 0) return BASE_CATALOG;

  // Merge custom questions
  const catalog = BASE_CATALOG.map((q) => ({ ...q, sheets: [...(q.sheets || [])] }));
  const slugMap = new Map<string, Question>();
  const titleMap = new Map<string, Question>();

  catalog.forEach((q) => {
    const slug = extractProblemSlug(q.problemUrl);
    if (slug) slugMap.set(slug, q);
    const norm = normalizeTitle(q.title);
    if (norm) titleMap.set(norm, q);
  });

  const additional: Question[] = [];

  custom.forEach((c) => {
    const slug = extractProblemSlug(c.problemUrl);
    const norm = normalizeTitle(c.title);
    const match = (slug && slugMap.get(slug)) || titleMap.get(norm);

    if (match) {
      const current = match.sheets || [];
      (c.sheets || []).forEach((s) => {
        if (!current.includes(s)) current.push(s);
      });
      match.sheets = current;
    } else {
      additional.push(c);
      if (slug) slugMap.set(slug, c);
      titleMap.set(norm, c);
    }
  });

  return [...catalog, ...additional];
}

/**
 * Returns sheet statistics and live metadata for all 5 DSA collections
 */
export function getLiveSheets(
  allQuestions: Question[] = getAllQuestions(),
  progress: Record<string, UserProgress> = {}
): (QuestionSheet & { total: number; solved: number; attempted: number; percentage: number })[] {
  return QUESTION_SHEETS.map((sheet) => {
    const sheetQuestions = allQuestions.filter((q) => (q.sheets || []).includes(sheet.id));
    const total = sheetQuestions.length;

    let solved = 0;
    let attempted = 0;
    sheetQuestions.forEach((q) => {
      const status = progress[q.id]?.status;
      if (status === 'Solved') solved++;
      else if (status === 'Attempted') attempted++;
    });

    const isImported = total > 0;
    const percentage = total > 0 ? Math.round((solved / total) * 100) : 0;

    return {
      ...sheet,
      isImported,
      totalQuestions: total,
      total,
      solved,
      attempted,
      percentage,
    };
  });
}

/**
 * Filter questions by sheet ID
 */
export function getQuestionsBySheet(sheetId: string, questions = getAllQuestions()): Question[] {
  return questions.filter((q) => (q.sheets || []).includes(sheetId));
}

/**
 * Filter questions by topic ID
 */
export function getQuestionsByTopic(topicId: string, questions = getAllQuestions()): Question[] {
  return questions.filter((q) => q.topicId === topicId);
}

export { TOPICS };
