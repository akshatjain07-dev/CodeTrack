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
- **Google OAuth 2.0 & Supabase Cloud Sync:** Real OAuth authentication with persistent sessions, PKCE security flow, and PostgreSQL Row-Level Security (RLS) guaranteeing isolated user data.
- **Graceful Fallback / Local Demo Mode:** Runs immediately out of the box in Local Demo Mode if cloud credentials are not yet configured, allowing friction-free development.

---

## 2. Technology Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, React Router v7, Lucide React icons
- **Data Visualizations:** Recharts
- **Backend / Database:** Supabase PostgreSQL with Row-Level Security (RLS) policies
- **Authentication:** Supabase Auth with Google OAuth (PKCE Flow)
- **Source Dataset:** TakeUForward Striver's A2Z DSA Sheet (`DSA CHECKLIST TUF.pdf`)

---

## 3. Quick Start (Local Development)

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn

### 1. Installation
```bash
cd "C:\Users\Akshat Jain\.gemini\antigravity\scratch\codetrack"
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```
Open `http://localhost:5173` in your browser. The application will start in **Local Demo Mode** if `.env` is not yet configured, allowing instant exploration.

### 3. Run Automated Tests
```bash
npm test
```
Runs both the business logic test suite and the authentication & security audit script.

### 4. Build for Production
```bash
npm run build
```

---

## 4. Google Cloud & Supabase Setup Guide (Real Google Sign-In)

Follow these exact steps to connect real Google Sign-In to your CodeTrack application.

### Part A: Google Cloud Console Setup

1. **Open Google Cloud Console**:
   Navigate to [Google Cloud Console](https://console.cloud.google.com/).
2. **Create or Select a Project**:
   Create a new project (e.g. `codetrack-dsa`) or select an existing one.
3. **Configure OAuth Consent Screen**:
   - Go to **APIs & Services > OAuth consent screen**.
   - Choose **User Type**:
     - Select **External** (unless you are using Google Workspace internal accounts).
     - Click **Create**.
   - **App Information**:
     - App name: `CodeTrack`
     - User support email: Select your email.
     - Developer contact email: Enter your email.
   - **Scopes**:
     - Click **Add or Remove Scopes**.
     - Select: `.../auth/userinfo.email`, `.../auth/userinfo.profile`, and `openid`.
     - Click **Update** and save.
   - **Test Users** (*Crucial while in Testing status*):
     - While your OAuth app is in "Testing" mode, Google will only allow accounts explicitly added as Test Users to sign in!
     - Add your personal Google account email (and any tester emails) under **Test users**.
     - *(To allow any Google user worldwide to sign in, you must later click "Publish App" on the OAuth consent screen)*.
4. **Create OAuth 2.0 Web Client Credentials**:
   - Go to **APIs & Services > Credentials**.
   - Click **+ Create Credentials > OAuth client ID**.
   - Application type: **Web application**.
   - Name: `CodeTrack Web Client`.
   - **Authorized JavaScript origins**:
     - `http://localhost:5173` (for local development)
     - `https://your-app.vercel.app` (add your production domain after deploying)
   - **Authorized redirect URIs**:
     - Add your Supabase project OAuth callback URI:
       `https://<YOUR-SUPABASE-PROJECT-REF>.supabase.co/auth/v1/callback`
   - Click **Create**.
   - Copy the generated **Client ID** and **Client Secret**.

---

### Part B: Supabase Project Setup

1. **Create Project**:
   Sign in to [supabase.com](https://supabase.com) and create a new project.
2. **Execute Database Migration & RLS**:
   - In your Supabase Dashboard, open the **SQL Editor**.
   - Copy and paste the entire script from:
     [`supabase/migrations/20261019_initial_schema.sql`](file:///supabase/migrations/20261019_initial_schema.sql)
   - Click **Run**. This establishes:
     - `profiles` table (with automated trigger on new Google sign-ups).
     - `user_progress`, `user_bookmarks`, `revision_schedule`, `daily_activity`, and `user_settings` tables.
     - Row Level Security (RLS) policies ensuring each authenticated user (`auth.uid() = user_id`) can only access their own private data.
3. **Enable Google Provider in Supabase**:
   - In the Supabase Dashboard, navigate to **Authentication > Providers**.
   - Find **Google** and toggle it **Enabled**.
   - Paste your **Client ID** and **Client Secret** obtained from Google Cloud Console in Part A.
   - Click **Save**.
4. **Configure URL Redirects in Supabase**:
   - In the Supabase Dashboard, navigate to **Authentication > URL Configuration**.
   - **Site URL**:
     - Set to `http://localhost:5173` (for local development) or `https://your-app.vercel.app` (in production).
   - **Redirect URLs** (Add both):
     - `http://localhost:5173/**`
     - `http://localhost:5173/auth/callback`
     - `https://your-app.vercel.app/**` (for production)
     - `https://your-app.vercel.app/auth/callback` (for production)
   - Click **Save**.

---

### Part C: Configure Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Open `.env` and fill in your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
   > **Security Notice:**
   > - `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are safe for frontend code.
   > - **NEVER** expose your Supabase `service_role` key or Google `client_secret` in `.env` or frontend files.

3. Restart your dev server:
   ```bash
   npm run dev
   ```
4. Click **Continue with Google** on the login page to test live authentication!

---

## 5. Deployment Guide (Vercel)

1. **Push to GitHub**:
   Commit and push your project to a GitHub repository.
2. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com) and click **Add New > Project**.
   - Import your GitHub repository.
   - Framework Preset: **Vite**.
   - Build Command: `npm run build`
   - Output Directory: `dist`
3. **Add Environment Variables**:
   Under **Environment Variables**, add:
   - `VITE_SUPABASE_URL` = `https://your-project-ref.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `your-supabase-anon-key`
4. **Deploy**:
   Click **Deploy**.
5. **Update Production URLs in Google Cloud & Supabase**:
   Once Vercel assigns your production domain (e.g. `https://codetrack.vercel.app`):
   - In **Google Cloud Console > Credentials > Web Client**:
     - Add `https://codetrack.vercel.app` to **Authorized JavaScript origins**.
   - In **Supabase Dashboard > Authentication > URL Configuration**:
     - Add `https://codetrack.vercel.app` to **Site URL**.
     - Add `https://codetrack.vercel.app/auth/callback` to **Redirect URLs**.

---

## 6. Architecture & File Reference

```
codetrack/
├── scripts/
│   ├── extract-pdf.js              # TakeUForward PDF validator
│   ├── test-business-logic.js      # Spaced repetition & streak unit tests
│   └── test-auth-security.js       # RLS, secret leakage, and PKCE audit script
├── src/
│   ├── components/
│   │   ├── auth/
│   │   │   └── ProtectedRoute.tsx  # Route guard with session restoration
│   │   ├── layout/
│   │   │   └── AppShell.tsx        # User profile, Google avatar, cloud status
│   │   └── ui/                     # Modular component primitives
│   ├── context/
│   │   └── AuthContext.tsx         # Supabase Google OAuth state & session management
│   ├── hooks/
│   │   ├── useAuth.ts              # Authentication hook
│   │   └── useCodeTrack.ts         # User-scoped cloud synchronization hook
│   ├── pages/
│   │   ├── AuthCallbackPage.tsx    # PKCE authorization code exchange & error handler
│   │   ├── LoginPage.tsx           # Real Google OAuth sign-in / demo fallback
│   │   └── SettingsPage.tsx        # Google account details & manual cloud sync
│   ├── services/
│   │   ├── cloudSync.ts            # Supabase PostgreSQL RLS sync adapter
│   │   ├── storage.ts              # Local cache engine & reactive event bus
│   │   └── supabase.ts             # PKCE-enabled Supabase client
│   ├── App.tsx                     # Global AuthProvider, callback, and routes
│   └── types/index.ts              # TypeScript definitions
├── supabase/
│   └── migrations/
│       └── 20261019_initial_schema.sql # PostgreSQL DDL with airtight RLS
└── .env.example                    # Environment template with documentation
```
