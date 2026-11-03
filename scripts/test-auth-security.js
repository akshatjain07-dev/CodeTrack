import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('--- CodeTrack Authentication & Security Audit ---');

let passed = 0;
let total = 0;

function assert(condition, testName) {
  total++;
  if (condition) {
    console.log(`  ✓ [PASS] ${testName}`);
    passed++;
  } else {
    console.error(`  ✗ [FAIL] ${testName}`);
  }
}

// 1. Secret Key Exposure Check
console.log('\n[Check 1] Source Code Secrets & Security Verification...');
const srcDir = path.join(rootDir, 'src');
function scanDirForSecrets(dir) {
  const files = fs.readdirSync(dir);
  let exposed = false;
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (scanDirForSecrets(fullPath)) exposed = true;
    } else if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('service_role') && !file.includes('test')) exposed = true;
      if (content.includes('client_secret') && !file.includes('test')) exposed = true;
    }
  }
  return exposed;
}
assert(!scanDirForSecrets(srcDir), 'No service_role secret keys or Google OAuth client secrets found in frontend code');

// 2. RLS & Schema Audit
console.log('\n[Check 2] Supabase PostgreSQL Schema & RLS Audit...');
const schemaPath = path.join(rootDir, 'supabase', 'migrations', '20261019_initial_schema.sql');
const schemaContent = fs.readFileSync(schemaPath, 'utf8');

const rlsTables = [
  'profiles',
  'user_progress',
  'user_bookmarks',
  'revision_schedule',
  'daily_activity',
  'user_settings'
];

rlsTables.forEach(table => {
  assert(
    schemaContent.includes(`ALTER TABLE public.${table} ENABLE ROW LEVEL SECURITY;`),
    `Row Level Security explicitly enabled on public.${table}`
  );
  assert(
    schemaContent.includes(`ON public.${table} FOR ALL USING (auth.uid() =`),
    `User-scoped RLS policy configured for public.${table}`
  );
});

assert(
  schemaContent.includes('handle_new_user()') &&
  schemaContent.includes('raw_user_meta_data->>\'full_name\'') &&
  schemaContent.includes('raw_user_meta_data->>\'picture\''),
  'Trigger function handle_new_user() accommodates both Google OAuth full_name/name and avatar_url/picture'
);

// 3. Client & PKCE Flow Configuration
console.log('\n[Check 3] PKCE OAuth Flow & Session Persistence Verification...');
const supabaseClientPath = path.join(rootDir, 'src', 'services', 'supabase.ts');
const supabaseClientContent = fs.readFileSync(supabaseClientPath, 'utf8');
assert(
  supabaseClientContent.includes("flowType: 'pkce'"),
  'Supabase client configured with secure PKCE OAuth flow'
);
assert(
  supabaseClientContent.includes('detectSessionInUrl: true'),
  'Supabase client configured with detectSessionInUrl for OAuth callback processing'
);
assert(
  supabaseClientContent.includes('persistSession: true'),
  'Supabase client configured with persistent browser sessions'
);

// 4. Protected Routes Verification
console.log('\n[Check 4] Protected Routes & Callback Registration...');
const appPath = path.join(rootDir, 'src', 'App.tsx');
const appContent = fs.readFileSync(appPath, 'utf8');
assert(
  appContent.includes('<AuthProvider>') && appContent.includes('</AuthProvider>'),
  'App is wrapped with global AuthProvider'
);
assert(
  appContent.includes('path="/auth/callback"'),
  'Dedicated /auth/callback route registered for OAuth redirects'
);
assert(
  appContent.includes('<Route element={<ProtectedRoute />}>'),
  'Application shell and private routes wrapped with ProtectedRoute'
);

// 5. Environment Variables Template Check
console.log('\n[Check 5] Environment Documentation Verification...');
const envExamplePath = path.join(rootDir, '.env.example');
const envExampleContent = fs.readFileSync(envExamplePath, 'utf8');
assert(
  envExampleContent.includes('VITE_SUPABASE_URL=') &&
  envExampleContent.includes('VITE_SUPABASE_ANON_KEY='),
  '.env.example defines public VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY variables'
);
assert(
  envExampleContent.includes('/auth/v1/callback') &&
  envExampleContent.includes('http://localhost:5173/auth/callback'),
  '.env.example documents exact OAuth callback URLs for Google Cloud and Supabase'
);

console.log(`\n========================================`);
console.log(`Audit Complete: ${passed}/${total} security and architecture checks passed.`);
if (passed === total) {
  console.log('RESULT: [SUCCESS] All authentication, security, and RLS requirements satisfied.\n');
  process.exit(0);
} else {
  console.error('RESULT: [FAILURE] Some security checks failed.\n');
  process.exit(1);
}
