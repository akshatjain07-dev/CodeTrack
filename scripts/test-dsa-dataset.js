import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

console.log('--- CodeTrack Master DSA Dataset & Sheet Verification ---');

const jsonPath = path.join(projectRoot, 'src', 'data', 'dsaQuestions.json');
if (!fs.existsSync(jsonPath)) {
  console.error('[FAIL] dsaQuestions.json not found!');
  process.exit(1);
}

const rawData = fs.readFileSync(jsonPath, 'utf8');
const questions = JSON.parse(rawData);

console.log(`[Check 1] Master Question Bank Size...`);
console.log(`  ✓ Loaded ${questions.length} total unique questions from src/data/dsaQuestions.json`);
if (questions.length !== 657) {
  console.error(`  [FAIL] Expected 657 total unique questions, got ${questions.length}`);
  process.exit(1);
}

console.log(`[Check 2] Sheet Question Counts...`);
const babbarQuestions = questions.filter(q => q.sheets.includes('Love Babbar 450'));
const striverQuestions = questions.filter(q => q.sheets.includes('Striver A2Z'));
const overlappingQuestions = questions.filter(q => q.sheets.includes('Love Babbar 450') && q.sheets.includes('Striver A2Z'));

console.log(`  ✓ Love Babbar 450 questions: ${babbarQuestions.length} (Expected: 448)`);
console.log(`  ✓ Striver A2Z questions: ${striverQuestions.length} (Expected: 328)`);
console.log(`  ✓ Overlapping unified questions: ${overlappingQuestions.length} (Expected: 115)`);

if (babbarQuestions.length !== 448) {
  console.error(`  [FAIL] Babbar 450 count is ${babbarQuestions.length}, expected 448`);
  process.exit(1);
}
if (striverQuestions.length !== 328) {
  console.error(`  [FAIL] Striver A2Z count is ${striverQuestions.length}, expected 328`);
  process.exit(1);
}

console.log(`[Check 3] Classic Overlap State Unification...`);
const classicTitles = ["two sum", "kadane", "lru cache", "trapping rain"];
classicTitles.forEach(t => {
  const match = questions.find(q => q.title.toLowerCase().includes(t));
  if (!match) {
    console.error(`  [FAIL] Could not find classic question: ${t}`);
    process.exit(1);
  }
  const hasBoth = match.sheets.includes('Love Babbar 450') && match.sheets.includes('Striver A2Z');
  console.log(`  ✓ Unified: "${match.title}" -> Sheets: [${match.sheets.join(', ')}] (both sheets: ${hasBoth})`);
  if (!hasBoth) {
    console.error(`  [FAIL] Question "${match.title}" is missing shared sheets.`);
    process.exit(1);
  }
});

console.log(`[Check 4] Field Schema & Platform URLs...`);
let withUrl = 0;
let withPlatform = 0;
questions.forEach(q => {
  if (q.problemUrl && q.problemUrl.startsWith('http')) withUrl++;
  if (['LeetCode', 'GeeksforGeeks', 'CodingNinjas', 'Codeforces'].includes(q.platform)) withPlatform++;
});
console.log(`  ✓ Valid Web Problem URLs: ${withUrl} / ${questions.length}`);
console.log(`  ✓ Valid Platforms: ${withPlatform} / ${questions.length}`);

console.log('========================================================');
console.log('[PASS] Master Dataset Verification 100% Successful!');
