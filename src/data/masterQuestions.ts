import masterQuestionsRaw from './dsaQuestions.json';
import { NEETCODE_PROBLEMS, type NeetCodeProblem } from './neetcodeData';
import type { DSAQuestion } from './mockData';

function extractSlug(url: string): string | null {
  const match = (url || '').match(/problems\/([^/]+)/);
  return match ? match[1].toLowerCase().replace(/\/$/, '') : null;
}

function normalizeTitle(title: string): string {
  return (title || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

function normalizeTopic(topic: string): string {
  if (topic === 'Linked Lists') return 'Linked List';
  if (topic === 'Stack & Queue') return 'Stacks & Queues';
  if (topic === 'Binary Search Trees (BST)') return 'Binary Search Trees';
  return topic;
}

/**
 * Merges the canonical Striver & Love Babbar master catalog with the verified
 * NeetCode 150 & NeetCode All curriculum catalog from neetcodeData.ts.
 *
 * Matching questions across sheets are unified with synchronized sheet tags,
 * while unique NeetCode questions are appended with normalized topic taxonomy.
 */
export function compileMasterQuestions(): DSAQuestion[] {
  // 1. Seed with base master questions (Striver A2Z & Love Babbar 450)
  const result: DSAQuestion[] = (masterQuestionsRaw as any[]).map((q) => ({
    ...q,
    sheets: Array.isArray(q.sheets) ? [...q.sheets] : [],
  }));

  const slugMap = new Map<string, DSAQuestion>();
  const titleMap = new Map<string, DSAQuestion>();

  result.forEach((q) => {
    const slug = extractSlug(q.problemUrl);
    if (slug) slugMap.set(slug, q);
    const norm = normalizeTitle(q.title);
    if (norm) titleMap.set(norm, q);
  });

  let maxNumber = result.reduce((max, q) => Math.max(max, q.number || 0), 0);

  // 2. Merge verified NeetCode problems
  NEETCODE_PROBLEMS.forEach((nc: NeetCodeProblem, idx: number) => {
    const slug = extractSlug(nc.problemUrl);
    const norm = normalizeTitle(nc.title);
    const match = (slug ? slugMap.get(slug) : undefined) || titleMap.get(norm);

    const targetSheets: string[] = ['NeetCode All'];
    if (nc.isNeetCode150) {
      targetSheets.push('NeetCode 150');
    }

    if (match) {
      // Problem exists in Striver or Love Babbar! Merge NeetCode sheet tags
      targetSheets.forEach((sheet) => {
        if (!match.sheets.includes(sheet)) {
          match.sheets.push(sheet);
        }
      });
      if (nc.isNeetCode150) {
        match.isMustDo = true;
      }
    } else {
      // Unique NeetCode question
      maxNumber++;
      const newQuestion: DSAQuestion = {
        id: `nc-${String(idx + 1).padStart(3, '0')}`,
        number: maxNumber,
        title: nc.title,
        topic: normalizeTopic(nc.topicName),
        difficulty: nc.difficulty,
        status: 'Unsolved',
        platform: (nc.platform as any) || 'LeetCode',
        problemUrl: nc.problemUrl,
        bookmarked: false,
        sheets: targetSheets,
        isMustDo: nc.isNeetCode150,
        acceptanceRate: '50.0%',
      };

      result.push(newQuestion);
      if (slug) slugMap.set(slug, newQuestion);
      titleMap.set(norm, newQuestion);
    }
  });

  return result;
}

export const COMPILED_MASTER_QUESTIONS: DSAQuestion[] = compileMasterQuestions();
export default COMPILED_MASTER_QUESTIONS;

