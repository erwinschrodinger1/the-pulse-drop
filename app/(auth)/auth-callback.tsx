import React, { useEffect, useRef } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import * as Linking from 'expo-linking';
import { supabase } from '@/lib/supabase';
import { Toast } from 'toastify-react-native';

function getParamFromUrl(url: string, key: string) {
  const hash = url.includes('#') ? (url.split('#')[1] ?? '') : '';
  const query = url.includes('?') ? ((url.split('?')[1] ?? '').split('#')[0] ?? '') : '';

  const fromHash = new URLSearchParams(hash).get(key);
  if (fromHash) return fromHash;

  return new URLSearchParams(query).get(key);
}

export default function AuthCallbackScreen() {
  const router = useRouter();
  const handledRef = useRef(false);

  useEffect(() => {
    const handle = async () => {
      if (handledRef.current) return;
      handledRef.current = true;

      try {
        const initialUrl = await Linking.getInitialURL();
        console.log('Callback URL:', initialUrl);

        if (!initialUrl) {
          router.replace('/(auth)/login');
          return;
        }

        const type = getParamFromUrl(initialUrl, 'type');
        const code = getParamFromUrl(initialUrl, 'code');
        const accessToken = getParamFromUrl(initialUrl, 'access_token');
        const refreshToken = getParamFromUrl(initialUrl, 'refresh_token');

        console.log('Callback params:', {
          type,
          hasCode: !!code,
          hasAccessToken: !!accessToken,
          hasRefreshToken: !!refreshToken,
        });

        // 1. PKCE/code flow
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);

          if (error) {
            console.error('exchangeCodeForSession failed:', error);
            Toast.error('Authentication link is invalid or expired.');
            router.replace('/(auth)/login');
            return;
          }
        }
        // 2. Token/hash flow
        else if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) {
            console.error('setSession failed:', error);
            Toast.error('Authentication link is invalid or expired.');
            router.replace('/(auth)/login');
            return;
          }
        } else {
          // No usable session payload in URL
          if (type === 'recovery') {
            Toast.error('Recovery link is invalid or incomplete.');
            router.replace('/(auth)/forgot');
            return;
          }

          Toast.success('Email confirmed. Please sign in.');
          router.replace('/(auth)/login');
          return;
        }

        const {
          data: { session },
        } = await supabase.auth.getSession();

        console.log('Session after callback:', !!session);

        if (type === 'recovery') {
          if (session) {
            Toast.success('Link verified. Set your new password.');
            router.replace('/(auth)/update-password');
          } else {
            Toast.error('Recovery session missing. Please use the reset link again.');
            router.replace('/(auth)/forgot');
          }
          return;
        }

        if (session) {
          Toast.success('Email verified successfully!');
          router.replace('/(tabs)');
        } else {
          Toast.success('Email verified successfully. Please sign in.');
          router.replace('/(auth)/login');
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        Toast.error('Something went wrong while completing authentication.');
        router.replace('/(auth)/login');
      }
    };

    void handle();
  }, [router]);

  return (
    <View className="flex-1 items-center justify-center bg-white px-6">
      <ActivityIndicator size="large" color="#2563EB" />
      <Text className="mt-4 text-base text-gray-600">Completing sign in…</Text>
    </View>
  );
}
