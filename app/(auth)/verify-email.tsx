import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Toast } from 'toastify-react-native';
import { resendVerificationEmail } from '@/lib/supabase-auth';
import { useTranslation } from 'react-i18next';

export default function VerifyEmailScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  const { type, email } = useLocalSearchParams<{
    type: string;
    email: string;
  }>();

  const [seconds, setSeconds] = useState(60);
  const [isResending, setIsResending] = useState(false);

  const isCooldownActive = seconds > 0;
  const resendDisabled = isCooldownActive || isResending;

  useEffect(() => {
    if (seconds <= 0) return;

    const timer = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [seconds]);

  const countdownLabel = useMemo(
    () =>
      t('auth.verifyEmail.resendIn', { seconds: seconds.toString().padStart(2, '0') }),
    [seconds],
  );

  const handleOpenMail = () => {
    Toast.info(t('auth.verifyEmail.success.openInbox'));
  };

  const handleResend = async () => {
    if (resendDisabled) return;

    if (!email) {
      Toast.error(t('auth.verifyEmail.errors.missingEmail'));
      router.replace('/(auth)/register');
      return;
    }

    try {
      setIsResending(true);
      await resendVerificationEmail(email, type as 'signup' | 'recovery');
      Toast.success(t('auth.verifyEmail.success.resendSent'));
      setSeconds(60);
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : t('auth.verifyEmail.errors.resendFailed');
      Toast.error(message);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 24 : 0}
      style={{ flex: 1, backgroundColor: 'white' }}
    >
      <ScrollView
        className="flex-1 px-6"
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center',
          paddingBottom: 80,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View className="w-full max-w-md items-center self-center">
          <View className="mb-6 h-36 w-36 items-center justify-center rounded-3xl border border-blue-100 bg-blue-50">
            <View className="h-24 w-24 items-center justify-center rounded-full bg-white shadow-sm">
              <MaterialCommunityIcons
                name="email-check-outline"
                size={46}
                color="#2563EB"
              />
            </View>
          </View>

          <Text className="text-center text-3xl font-semibold text-gray-900">
            {t('auth.verifyEmail.title')}
          </Text>

          <Text className="mt-3 px-4 text-center leading-6 text-gray-500">
            {t('auth.verifyEmail.descriptionPrefix', { email })}{' '}
            <Text className="font-semibold text-blue-600">
              {t('auth.verifyEmail.confirmEmailLabel')}
            </Text>{' '}
            {t('auth.verifyEmail.descriptionSuffix')}
          </Text>

          {!!email && (
            <Text className="mt-3 text-center text-sm text-gray-400">
              {t('auth.verifyEmail.sentTo', { email })}
            </Text>
          )}

          <View className="mt-6 w-full rounded-3xl border border-gray-100 bg-gray-50 p-4">
            <View className="flex-row items-start">
              <Ionicons name="information-circle-outline" size={22} color="#2563EB" />
              <View className="ml-3 flex-1">
                <Text className="font-semibold text-gray-800">
                  {t('auth.verifyEmail.didNotReceive')}
                </Text>
                <Text className="mt-1 leading-5 text-gray-500">
                  {t('auth.verifyEmail.didNotReceiveHint')}
                </Text>
              </View>
            </View>
          </View>

          <Pressable
            onPress={handleOpenMail}
            className="mt-6 h-12 w-full items-center justify-center rounded-2xl bg-blue-600"
          >
            <View className="flex-row items-center">
              <Ionicons name="mail-open-outline" size={18} color="#fff" />
              <Text className="ml-2 text-base font-semibold text-white">
                {t('auth.verifyEmail.checkedEmail')}
              </Text>
            </View>
          </Pressable>

          <Pressable
            disabled={resendDisabled}
            onPress={handleResend}
            className={`mt-3 h-12 w-full items-center justify-center rounded-2xl ${
              resendDisabled
                ? 'border border-gray-200 bg-gray-100'
                : 'border border-blue-200 bg-blue-50'
            }`}
          >
            <View className="flex-row items-center">
              <Ionicons
                name="refresh-outline"
                size={18}
                color={resendDisabled ? '#9CA3AF' : '#2563EB'}
              />
              <Text
                className={`ml-2 text-base font-semibold ${
                  resendDisabled ? 'text-gray-400' : 'text-blue-600'
                }`}
              >
                {isResending
                  ? t('auth.verifyEmail.sending')
                  : isCooldownActive
                    ? countdownLabel
                    : t('auth.verifyEmail.resendEmail')}
              </Text>
            </View>
          </Pressable>

          <View className="mt-6 flex-row justify-center">
            <Text className="text-gray-500">
              {t('auth.verifyEmail.alreadyVerified')}{' '}
            </Text>
            <Pressable onPress={() => router.replace('/(auth)/login')} hitSlop={10}>
              <Text className="font-semibold text-blue-600">
                {t('common.actions.signIn')}
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
