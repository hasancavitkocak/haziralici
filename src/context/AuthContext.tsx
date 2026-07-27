'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/client';
import { Profile } from '@/types';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profile: null,
  loading: true,
  signOut: async () => {},
  refreshProfile: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string, userEmail?: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (!error && data) {
        const emailToMatch = (userEmail || data.email || '').toLowerCase();
        const isAdminUser = emailToMatch === 'hasancavitkocak@gmail.com';

        const profileObj: Profile = {
          ...data,
          role: isAdminUser ? 'admin' : (data.role || 'user'),
        };

        setProfile(profileObj);

        // Sync role to database if not set yet
        if (isAdminUser && data.role !== 'admin') {
          supabase.from('profiles').update({ role: 'admin' }).eq('id', userId).then(() => {});
        }
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
    }
  };

  const refreshProfile = async () => {
    if (user?.id) {
      await fetchProfile(user.id, user.email);
    }
  };

  useEffect(() => {
    let isMounted = true;

    if (typeof window !== 'undefined' && window.location.hash.includes('type=recovery') && !window.location.pathname.startsWith('/sifre-sifirla')) {
      window.location.href = '/sifre-sifirla' + window.location.hash;
      return;
    }

    const initSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!isMounted) return;

        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user?.id) {
          await fetchProfile(session.user.id, session.user.email);
        } else {
          setProfile(null);
        }
      } catch (err) {
        console.error('Error initializing auth session:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    initSession();

    // Listen to Auth State Changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return;

        if (event === 'PASSWORD_RECOVERY' && typeof window !== 'undefined' && !window.location.pathname.startsWith('/sifre-sifirla')) {
          window.location.href = '/sifre-sifirla' + window.location.hash;
          return;
        }

        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user?.id) {
          await fetchProfile(session.user.id, session.user.email);
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        loading,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
