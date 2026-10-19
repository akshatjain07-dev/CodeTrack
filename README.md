# CodeTrack — DSA Progress Tracker & Revision Center

A minimal, high-performance Data Structures & Algorithms progress tracker and spaced repetition workspace designed for engineering students preparing for technical interviews.

Inspired by the visual restraint, high information density, and intentionality of developer tools like Linear and GitHub.

---

## 1. Project Overview & Features

- **Master DSA Problem Bank:** 229 canonical problems mapped across 16 core topics, extracted directly from Striver's TakeUForward A2Z DSA checklist (`DSA CHECKLIST TUF.pdf`).
- **Interactive Question Bank:** Fast, debounced search, multi-criteria filtering (Topic, Difficulty, Status, Platform), Linear-style tabular navigation, and external deep-links (LeetCode, GFG, CodingNinjas, TakeUForward articles & video solutions).
- **Idempotent Status Management:** Instant 1-click cycle between `Not Started`, `Attempted`, and `Solved`. Progress counters and daily activity logs are updated without double counting.
- **Spaced Repetition Revision Center:** Automatic interval scheduling on solve (`Stage 1: 1d` → `Stage 2: 3d` → `Stage 3: 7d` → `Stage 4: 14d` → `Stage 5: 30d / Mastered`). Built-in self-testing modal with confidence rating (*Again*, *Good*, *Easy*).
- **Personal Notes & Snippet Drawer:** Contextual slide-over drawer allowing students to record problem intuitions, time/space complexities, and edge cases.
- **Real-Data Telemetry & Analytics:** Live analytics powered by Recharts (Solving velocity over time, difficulty distribution ratios, topic completion progress, and consistency streaks).
- **Data Portability:** 1-click JSON backup export, spreadsheet-friendly CSV export, and complete state restoration from JSON files.
- **Dual-Engine Architecture:** Runs offline immediately out of the box in **Local Demo Mode** (powered by `localStorage`), with optional one-step upgrade to **Supabase Cloud Sync** and Google OAuth.

---

## 2. Technology Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, React Router v6, Lucide React icons
- **Data Visualizations:** Recharts
- **Backend / Database:** Supabase PostgreSQL, Supabase Row-Level Security (RLS)
- **Authentication:** Supabase Google OAuth
- **Source Dataset:** TakeUForward Striver's A2Z DSA Sheet (`DSA CHECKLIST TUF.pdf`)

---

## 3. Getting Started (Local Development)

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn

### 1. Installation
Clone or navigate to the project directory:
```bash
cd "C:\Users\Akshat Jain\.gemini\antigravity\scratch\codetrack"
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```
Open `http://localhost:5173` in your browser. The application will start in **Local Demo Mode** with sample questions and pre-seeded progress.

### 3. Run Automated Tests
```bash
node scripts/test-business-logic.js
```

### 4. Build for Production
```bash
npm run build
```

---

## 4. Connecting Supabase & Google Authentication

CodeTrack uses an autonomous data adapter. When you are ready to persist data in the cloud:

### Step 1: Create a Supabase Project
1. Go to [supabase.com](https://supabase.com) and create a free project.
2. In the Supabase Dashboard, open the **SQL Editor**.
3. Run the complete migration script located in:
   `supabase/migrations/20261019_initial_schema.sql`
   *(This creates the 8 required tables, indexes, triggers, and Row Level Security policies).*

### Step 2: Configure Google Cloud OAuth
1. Go to the [Google Cloud Console](https://console.cloud.google.com/apis/credentials).
2. Create an **OAuth 2.0 Client ID** (Web application).
3. Under **Authorized redirect URIs**, add your Supabase project callback URL:
   `https://<YOUR-PROJECT-REF>.supabase.co/auth/v1/callback`
4. Copy your **Client ID** and **Client Secret**.
5. In Supabase Dashboard, go to **Authentication > Providers > Google**, enable it, and paste your Google Client ID and Secret.

### Step 3: Set Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Add your credentials:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```
Restart your development server (`npm run dev`). CodeTrack will automatically detect Supabase and switch to Cloud Sync mode!

---

## 5. TakeUForward PDF Ingestion Workflow

The TakeUForward checklist has already been extracted and validated from `DSA CHECKLIST TUF.pdf` in the workspace root.

To re-run the verification script:
```bash
node scripts/extract-pdf.js
```
Output:
```
--- CodeTrack TakeUForward PDF Extractor & Validator ---
[✓] Found source PDF: DSA CHECKLIST TUF.pdf (424.4 KB)
[✓] Verified Question Bank integrity: 229 canonical problems mapped across 16 distinct topics.
[✓] TakeUForward Striver Checklist successfully synchronized with CodeTrack.
```

---

## 6. Project Architecture & File Organization

```
codetrack/
├── scripts/
│   ├── extract-pdf.js              # PDF inspection & verification utility
│   └── test-business-logic.js      # Automated unit tests for spaced repetition & streaks
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   └── AppShell.tsx        # Persistent sidebar, command palette, and header
│   │   └── ui/
│   │       ├── Badge.tsx           # Difficulty, status, and platform tags
│   │       ├── Button.tsx          # Minimalist developer button variants
│   │       ├── CommandPalette.tsx  # Global Ctrl+K quick search
│   │       ├── Drawer.tsx          # Slide-over problem details and notes editor
│   │       ├── EmptyState.tsx      # High-density clean empty states
│   │       ├── Input.tsx           # Filter input primitives
│   │       ├── Kbd.tsx             # Keyboard shortcut pill
│   │       ├── ProgressBar.tsx     # Custom progress gauges
│   │       ├── QuestionDrawer.tsx  # Details drawer with notes autosave
│   │       ├── RevisionModal.tsx   # Spaced repetition confidence rating modal
│   │       └── Select.tsx          # Clean select component
│   ├── data/
│   │   └── questionsData.ts        # 229 authentic TUF questions & topic taxonomy
│   ├── hooks/
│   │   └── useCodeTrack.ts         # Real-time state synchronization hook
│   ├── pages/
│   │   ├── AllQuestionsPage.tsx    # Central question bank with filters & sort
│   │   ├── AnalyticsPage.tsx       # Recharts telemetry & velocity insights
│   │   ├── BookmarksPage.tsx       # Starred problems collection
│   │   ├── DashboardPage.tsx       # Workspace overview & 12-week heatmap
│   │   ├── LoginPage.tsx           # Google OAuth sign-in view
│   │   ├── PlatformsPage.tsx       # Host platforms & public profile links
│   │   ├── RevisionCenterPage.tsx  # Spaced repetition scheduler
│   │   ├── SettingsPage.tsx        # Preferences, goal settings, JSON/CSV export
│   │   └── TopicsPage.tsx          # 16-module curriculum breakdown
│   ├── services/
│   │   ├── storage.ts              # Reactive storage engine & streak calculations
│   │   └── supabase.ts             # Supabase client wrapper & connectivity check
│   ├── types/
│   │   └── index.ts                # TypeScript interfaces
│   ├── App.tsx                     # React Router definition
│   ├── index.css                   # Tailwind v4 theme & developer styling
│   └── main.tsx                    # React DOM root
├── supabase/
│   └── migrations/
│       └── 20261019_initial_schema.sql # Complete PostgreSQL DDL with RLS
├── .env.example                    # Template environment variables
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 7. Deployment Guide

### Deploying to Vercel
1. Push your repository to GitHub.
2. Go to [vercel.com](https://vercel.com) and import the project.
3. Framework Preset: **Vite**.
4. Add environment variables `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` under project settings.
5. Deploy.

### Deploying to Netlify
1. Create a `netlify.toml` or connect via Netlify Dashboard.
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Add the environment variables in Netlify site settings.
