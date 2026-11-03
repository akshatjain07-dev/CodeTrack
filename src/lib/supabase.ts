import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder-project.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key';

export const isSupabaseConfigured = Boolean(
  import.meta.env.VITE_SUPABASE_URL &&
  import.meta.env.VITE_SUPABASE_ANON_KEY &&
  import.meta.env.VITE_SUPABASE_URL.startsWith('https://') &&
  import.meta.env.VITE_SUPABASE_ANON_KEY.length > 20
);

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
  },
});

/*
 * Supabase Schema Guidance & Helper Queries:
 * 
 * -- Table: profiles
 * create table profiles (
 *   id uuid references auth.users not null primary key,
 *   email text,
 *   display_name text,
 *   avatar_url text,
 *   streak int default 0,
 *   created_at timestamptz default now()
 * );
 * 
 * -- Table: user_progress
 * create table user_progress (
 *   id uuid default gen_random_uuid() primary key,
 *   user_id uuid references auth.users not null,
 *   question_id text not null,
 *   status text check (status in ('Solved', 'Attempted', 'Unsolved')),
 *   bookmarked boolean default false,
 *   confidence text check (confidence in ('Low', 'Medium', 'High')),
 *   notes text,
 *   last_attempted timestamptz,
 *   unique(user_id, question_id)
 * );
 */

export async function fetchUserProgress(userId: string) {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await supabase
    .from('user_progress')
    .select('*')
    .eq('user_id', userId);
  if (error) {
    console.error('Error fetching progress from Supabase:', error);
    return null;
  }
  return data;
}

export async function upsertQuestionProgress(
  userId: string,
  questionId: string,
  updates: {
    status?: 'Solved' | 'Attempted' | 'Unsolved';
    bookmarked?: boolean;
    confidence?: 'Low' | 'Medium' | 'High';
    notes?: string;
    last_attempted?: string;
  }
) {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await supabase
    .from('user_progress')
    .upsert({
      user_id: userId,
      question_id: questionId,
      ...updates,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,question_id' });
  if (error) {
    console.error('Error saving progress to Supabase:', error);
    return null;
  }
  return data;
}
