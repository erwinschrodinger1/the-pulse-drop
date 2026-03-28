import { AuthContext } from '@/hooks/use-auth-context';
import { supabase } from '@/lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PropsWithChildren, useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';

const STORAGE_HAS_ONBOARDED = 'pulseDrop.hasOnboarded';

export default function AuthProvider({ children }: PropsWithChildren) {
  const [claims, setClaims] = useState<Record<string, any> | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [ready, setReady] = useState<boolean>(false);
  const [hasOnboarded, setHasOnboarded] = useState<boolean>(false);

  // Boot: load onboarding state and initialize auth
  useEffect(() => {
    const syncClaims = async () => {
      const { data, error } = await supabase.auth.getClaims();
      if (error) {
        console.error('Error fetching claims:', error);
        return;
      }
      setClaims(data?.claims ?? null);
    };

    const boot = async () => {
      setIsLoading(true);

      // Load onboarding state
      const onboarded = await AsyncStorage.getItem(STORAGE_HAS_ONBOARDED);
      setHasOnboarded(onboarded === 'true');

      const {
        data: { session: currentSession },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        console.error('Error fetching session:', error);
      }

      setSession(currentSession ?? null);

      if (currentSession) {
        void syncClaims();
      } else {
        setClaims(null);
      }

      setIsLoading(false);
      setReady(true);
    };

    boot();

    // Subscribe to auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      console.log('Auth state changed event:', _event, 'session: ', nextSession);

      setSession(nextSession ?? null);

      if (!nextSession) {
        setClaims(null);
        setProfile(null);
        return;
      }

      void syncClaims();
    });

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Fetch the profile when user identity changes
  useEffect(() => {
    const fetchProfile = async () => {
      const userId = session?.user?.id ?? claims?.sub;

      if (userId) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        setProfile(data);
      } else {
        setProfile(null);
      }
    };

    fetchProfile();
  }, [session?.user?.id, claims?.sub]);

  const completeOnboarding = async () => {
    await AsyncStorage.setItem(STORAGE_HAS_ONBOARDED, 'true');
    setHasOnboarded(true);
  };

  const logout = async () => {
    setSession(null);
    setClaims(null);
    setProfile(null);

    const { error } = await supabase.auth.signOut({ scope: 'local' });
    if (error) {
      console.error('Error during logout:', error);
    }
  };

  const isLoggedIn = !!session;

  return (
    <AuthContext.Provider
      value={{
        claims,
        isLoading,
        profile,
        isLoggedIn,
        ready,
        hasOnboarded,
        completeOnboarding,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
