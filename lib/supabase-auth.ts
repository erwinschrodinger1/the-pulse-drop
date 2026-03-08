import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import Constants from 'expo-constants';
import { supabase } from '@/lib/supabase';

WebBrowser.maybeCompleteAuthSession();

export type OAuthProvider = 'google' | 'facebook';

function getRedirectUrl() {
  const scheme = Constants.expoConfig?.scheme;
  const resolvedScheme = Array.isArray(scheme) ? scheme[0] : scheme;

  return AuthSession.makeRedirectUri({
    scheme: resolvedScheme,
    path: 'auth-callback',
  });
}

function parseOAuthUrl(url: string) {
  const parsed = new URL(url);
  const params = new URLSearchParams(parsed.hash.replace('#', ''));

  return {
    access_token: params.get('access_token'),
    refresh_token: params.get('refresh_token'),
  };
}

export async function signInWithOAuth(provider: OAuthProvider) {
  const redirectTo = getRedirectUrl();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo,
      queryParams: { prompt: 'consent' },
      skipBrowserRedirect: true,
    },
  });

  if (error) throw error;

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);

  if (result.type !== 'success') {
    throw new Error('OAuth flow cancelled');
  }

  const { access_token, refresh_token } = parseOAuthUrl(result.url);

  if (!access_token || !refresh_token) {
    throw new Error('OAuth tokens not returned');
  }

  const { error: sessionError } = await supabase.auth.setSession({
    access_token,
    refresh_token,
  });

  if (sessionError) throw sessionError;
}

export async function signInWithPassword(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

export async function signUp(name: string, email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { display_name: name },
      emailRedirectTo: 'pulsedrop://validated-email',
    },
  });

  if (error) throw error;
  return data;
}
