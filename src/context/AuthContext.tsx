import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
}

export interface AuthContextValue {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  isConfigured: boolean;
  error: string | null;
  demoMode: boolean;
  setDemoMode: (enabled: boolean) => void;
  signInWithGoogle: (returnPath?: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function extractProfile(user: User): UserProfile {
  const meta = user.user_metadata || {};
  return {
    id: user.id,
    email: user.email || meta.email || 'developer@codetrack.dev',
    displayName:
      meta.full_name ||
      meta.name ||
      (user.email ? user.email.split('@')[0] : 'Alex Rivers'),
    avatarUrl: meta.avatar_url || meta.picture || undefined,
  };
}

const DEMO_USER_PROFILE: UserProfile = {
  id: 'demo-user-123',
  email: 'alex.rivers@codetrack.dev',
  displayName: 'Alex Rivers',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
};

const DEMO_MODE_STORAGE_KEY = 'codetrack_demo_mode';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(() => {
    const isDemo = localStorage.getItem(DEMO_MODE_STORAGE_KEY) === 'true';
    return isDemo ? DEMO_USER_PROFILE : null;
  });
  const [loading, setLoading] = useState<boolean>(() => isSupabaseConfigured);
  const [error, setError] = useState<string | null>(null);
  const [demoMode, setDemoModeState] = useState<boolean>(() => {
    return localStorage.getItem(DEMO_MODE_STORAGE_KEY) === 'true' || !isSupabaseConfigured;
  });

  const setDemoMode = useCallback((enabled: boolean) => {
    setDemoModeState(enabled);
    if (enabled) {
      localStorage.setItem(DEMO_MODE_STORAGE_KEY, 'true');
      setProfile(DEMO_USER_PROFILE);
    } else {
      localStorage.removeItem(DEMO_MODE_STORAGE_KEY);
      if (!user) {
        setProfile(null);
      }
    }
  }, [user]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setProfile(DEMO_USER_PROFILE);
      setLoading(false);
      return;
    }

    let isMounted = true;

    supabase.auth
      .getSession()
      .then(({ data: { session: currentSession }, error: sessionError }) => {
        if (!isMounted) return;
        if (sessionError) {
          console.error('Session restoration error:', sessionError);
          setError(sessionError.message);
        } else if (currentSession?.user) {
          setSession(currentSession);
          setUser(currentSession.user);
          setProfile(extractProfile(currentSession.user));
          setDemoModeState(false);
          localStorage.removeItem(DEMO_MODE_STORAGE_KEY);
        } else {
          setProfile(DEMO_USER_PROFILE);
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : 'Unknown auth error');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, newSession) => {
      if (!isMounted) return;

      setSession(newSession);
      const currentUser = newSession?.user ?? null;
      setUser(currentUser);
      setProfile(currentUser ? extractProfile(currentUser) : DEMO_USER_PROFILE);

      if (event === 'SIGNED_IN') {
        setError(null);
        setDemoModeState(false);
        localStorage.removeItem(DEMO_MODE_STORAGE_KEY);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setSession(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signInWithGoogle = useCallback(
    async (returnPath = '/') => {
      if (!isSupabaseConfigured) {
        setDemoMode(true);
        return { error: null };
      }

      try {
        setError(null);
        if (returnPath) {
          sessionStorage.setItem('codetrack_auth_redirect', returnPath);
        }

        const callbackUrl = new URL('/auth/callback', window.location.origin).toString();
        const { error: authError } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: callbackUrl,
            queryParams: {
              access_type: 'offline',
              prompt: 'select_account',
            },
          },
        });

        if (authError) {
          setError(authError.message);
          return { error: authError };
        }
        return { error: null };
      } catch (err) {
        const authErr = err instanceof Error ? err : new Error('Failed to initiate Google OAuth flow.');
        setError(authErr.message);
        return { error: authErr };
      }
    },
    [setDemoMode]
  );

  const signOut = useCallback(async () => {
    try {
      if (isSupabaseConfigured) {
        await supabase.auth.signOut();
      }
    } catch (err) {
      console.warn('Error during Supabase signOut:', err);
    } finally {
      setUser(null);
      setSession(null);
      setProfile(null);
      setDemoModeState(false);
      localStorage.removeItem(DEMO_MODE_STORAGE_KEY);
      sessionStorage.removeItem('codetrack_auth_redirect');
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      session,
      profile,
      loading,
      isConfigured: isSupabaseConfigured,
      error,
      demoMode,
      setDemoMode,
      signInWithGoogle,
      signOut,
      clearError,
    }),
    [user, session, profile, loading, error, demoMode, setDemoMode, signInWithGoogle, signOut, clearError]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export { AuthContext };
