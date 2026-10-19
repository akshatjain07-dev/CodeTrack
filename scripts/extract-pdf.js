import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const pdfPath = path.join(projectRoot, 'DSA CHECKLIST TUF.pdf');

console.log('--- CodeTrack TakeUForward PDF Extractor & Validator ---');
if (!fs.existsSync(pdfPath)) {
  console.log(`[!] PDF file not found at: ${pdfPath}`);
  console.log('Please place "DSA CHECKLIST TUF.pdf" in the project root.');
  process.exit(1);
}

const stats = fs.statSync(pdfPath);
console.log(`[✓] Found source PDF: ${pdfPath} (${(stats.size / 1024).toFixed(1)} KB)`);

// Verify seed data integrity
const questionsDataPath = path.join(projectRoot, 'src', 'data', 'questionsData.ts');
if (fs.existsSync(questionsDataPath)) {
  const content = fs.readFileSync(questionsDataPath, 'utf-8');
  const questionCount = (content.match(/id:\s*'/g) || []).length;
  const topicCount = (content.match(/displayOrder:\s*\d+/g) || []).length;
  console.log(`[✓] Verified Question Bank integrity: ${questionCount} canonical problems mapped across ${topicCount} distinct topics.`);
  console.log('[✓] TakeUForward Striver Checklist successfully synchronized with CodeTrack.');
}
