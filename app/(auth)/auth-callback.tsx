import React, { useEffect, useRef } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import * as Linking from 'expo-linking';
import { supabase } from '@/lib/supabase';
import { Toast } from 'toastify-react-native';
import { useTranslation } from 'react-i18next';

function getParamFromUrl(url: string, key: string) {
  const hash = url.includes('#') ? (url.split('#')[1] ?? '') : '';
  const query = url.includes('?') ? ((url.split('?')[1] ?? '').split('#')[0] ?? '') : '';

  const fromHash = new URLSearchParams(hash).get(key);
  if (fromHash) return fromHash;

  return new URLSearchParams(query).get(key);
}

export default function AuthCallbackScreen() {
  const router = useRouter();
  const { t } = useTranslation();
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
            Toast.error(t('auth.callback.errors.invalidLink'));
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
            Toast.error(t('auth.callback.errors.invalidLink'));
            router.replace('/(auth)/login');
            return;
          }
        } else {
          // No usable session payload in URL
          if (type === 'recovery') {
            Toast.error(t('auth.callback.errors.recoveryInvalid'));
            router.replace('/(auth)/forgot');
            return;
          }

          Toast.success(t('auth.callback.success.emailConfirmedSignIn'));
          router.replace('/(auth)/login');
          return;
        }

        const {
          data: { session },
        } = await supabase.auth.getSession();

        console.log('Session after callback:', !!session);

        if (type === 'recovery') {
          if (session) {
            Toast.success(t('auth.callback.success.recoveryReady'));
            router.replace('/(auth)/update-password');
          } else {
            Toast.error(t('auth.callback.errors.recoveryMissingSession'));
            router.replace('/(auth)/forgot');
          }
          return;
        }

        if (session) {
          Toast.success(t('auth.callback.success.emailVerified'));
          router.replace('/(app)/(tabs)');
        } else {
          Toast.success(t('auth.callback.success.emailVerifiedSignIn'));
          router.replace('/(auth)/login');
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        Toast.error(t('auth.callback.errors.generic'));
        router.replace('/(auth)/login');
      }
    };

    void handle();
  }, [router]);

  return (
    <View className="flex-1 items-center justify-center bg-white px-6">
      <ActivityIndicator size="large" color="#2563EB" />
      <Text className="mt-4 text-base text-gray-600">{t('auth.callback.loading')}</Text>
    </View>
  );
}
