import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import Constants from 'expo-constants';
import { supabase } from '@/lib/supabase';
import { EmailOtpType } from '@supabase/supabase-js';

WebBrowser.maybeCompleteAuthSession();

export type OAuthProvider = 'google' | 'facebook';

function getRedirectUrl(params?: { type: EmailOtpType }) {
  const scheme = Constants.expoConfig?.scheme;
  const resolvedScheme = Array.isArray(scheme) ? scheme[0] : scheme;

  return AuthSession.makeRedirectUri({
    scheme: resolvedScheme,
    path: 'auth-callback',
    queryParams: params ? { type: params.type } : undefined,
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
  const emailRedirectTo = getRedirectUrl({ type: 'signup' });

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { display_name: name },
      emailRedirectTo,
    },
  });

  if (error) throw error;

  if (data.user?.role !== 'authenticated') {
    throw new Error('Registration failed: email already exist');
  }

  return data;
}

// export async function resendVerificationEmail(email: string, type: "signup"|"recovery") {
//   const emailRedirectTo = getRedirectUrl();

//   const { data, error } = await supabase.auth.resend({
//     type: type,
//     email,
//     options: {
//       emailRedirectTo,
//     },
//   });

//   if (error) throw error;
//   return data;
// }

export async function resetPassword(email: string) {
  const emailRedirectTo = getRedirectUrl({ type: 'recovery' });
  console.log('Reset password redirect URL:', emailRedirectTo);

  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: emailRedirectTo,
  });

  if (error) throw error;

  return data;
}
