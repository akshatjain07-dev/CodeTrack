-- ==========================================================
-- CodeTrack: Supabase Database Schema & Row-Level Security
-- ==========================================================

-- 1. PROFILES (Extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  preferred_language TEXT DEFAULT 'C++',
  daily_goal_target INTEGER DEFAULT 3,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TOPICS (Shared Taxonomy)
CREATE TABLE IF NOT EXISTS public.topics (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  display_order INTEGER NOT NULL,
  description TEXT,
  total_questions INTEGER DEFAULT 0
);

-- 3. QUESTIONS (Master Problem Bank)
CREATE TABLE IF NOT EXISTS public.questions (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  topic_id TEXT REFERENCES public.topics(id) ON DELETE CASCADE,
  subtopic TEXT,
  difficulty TEXT CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
  platform TEXT CHECK (platform IN ('LeetCode', 'CodingNinjas', 'GeeksforGeeks', 'Codeforces', 'Other')),
  problem_url TEXT NOT NULL,
  article_url TEXT,
  youtube_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. USER_PROGRESS (Per-user tracking with idempotency)
CREATE TABLE IF NOT EXISTS public.user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  question_id TEXT REFERENCES public.questions(id) ON DELETE CASCADE NOT NULL,
  status TEXT CHECK (status IN ('Not Started', 'Attempted', 'Solved')) DEFAULT 'Not Started',
  notes TEXT,
  language_used TEXT,
  solved_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, question_id)
);

-- 5. USER_BOOKMARKS
CREATE TABLE IF NOT EXISTS public.user_bookmarks (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  question_id TEXT REFERENCES public.questions(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, question_id)
);

-- 6. REVISION_SCHEDULE (Spaced Repetition Engine)
CREATE TABLE IF NOT EXISTS public.revision_schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  question_id TEXT REFERENCES public.questions(id) ON DELETE CASCADE NOT NULL,
  stage INTEGER DEFAULT 1, -- Stage 1 (1d), Stage 2 (3d), Stage 3 (7d), Stage 4 (14d), Stage 5 (30d / Mastered)
  next_review_date DATE NOT NULL,
  last_reviewed_at TIMESTAMPTZ,
  review_count INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, question_id)
);

-- 7. DAILY_ACTIVITY (Event-sourced activity tracking for streaks & heatmaps)
CREATE TABLE IF NOT EXISTS public.daily_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  activity_date DATE NOT NULL,
  questions_solved INTEGER DEFAULT 0,
  revisions_completed INTEGER DEFAULT 0,
  UNIQUE (user_id, activity_date)
);

-- 8. USER_SETTINGS
CREATE TABLE IF NOT EXISTS public.user_settings (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  daily_goal INTEGER DEFAULT 3,
  theme TEXT DEFAULT 'dark',
  preferred_language TEXT DEFAULT 'C++',
  leetcode_username TEXT,
  codeforces_username TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================================
-- INDEXES FOR PERFORMANCE
-- ==========================================================
CREATE INDEX IF NOT EXISTS idx_questions_topic ON public.questions(topic_id);
CREATE INDEX IF NOT EXISTS idx_progress_user ON public.user_progress(user_id, status);
CREATE INDEX IF NOT EXISTS idx_revision_user_date ON public.revision_schedule(user_id, next_review_date);
CREATE INDEX IF NOT EXISTS idx_daily_activity_user ON public.daily_activity(user_id, activity_date);

-- ==========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revision_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Shared public reads
CREATE POLICY "Public read topics" ON public.topics FOR SELECT USING (true);
CREATE POLICY "Public read questions" ON public.questions FOR SELECT USING (true);

-- User-scoped private operations
CREATE POLICY "Users can manage own profile" ON public.profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "Users can manage own progress" ON public.user_progress FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own bookmarks" ON public.user_bookmarks FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own revisions" ON public.revision_schedule FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own activity" ON public.daily_activity FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own settings" ON public.user_settings FOR ALL USING (auth.uid() = user_id);

-- Auto-create profile & settings on new user signup trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name, avatar_url)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  
  INSERT INTO public.user_settings (user_id, daily_goal, preferred_language, theme)
  VALUES (new.id, 3, 'C++', 'dark');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
