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
import { signUp } from '@/lib/supabase-auth';

export default function VerifyEmailScreen() {
  const router = useRouter();

  const params = useLocalSearchParams<{
    fullName?: string;
    email?: string;
    password?: string;
  }>();

  const fullName = Array.isArray(params.fullName)
    ? params.fullName[0]
    : (params.fullName ?? '');
  const email = Array.isArray(params.email) ? params.email[0] : (params.email ?? '');
  const password = Array.isArray(params.password)
    ? params.password[0]
    : (params.password ?? '');

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
    () => `Resend in 00:${seconds.toString().padStart(2, '0')}`,
    [seconds],
  );

  const handleOpenMail = () => {
    Toast.info('Open your email inbox and click the confirmation link');
  };

  const handleResend = async () => {
    if (resendDisabled) return;

    if (!fullName || !email || !password) {
      Toast.error('Missing signup details. Please sign up again.');
      router.replace('/(auth)/signup');
      return;
    }

    try {
      setIsResending(true);
      await signUp(fullName, email, password);
      Toast.success('Confirmation email sent again');
      setSeconds(60);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to resend confirmation email';
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
            Verify your email
          </Text>

          <Text className="mt-3 px-4 text-center leading-6 text-gray-500">
            We sent a confirmation link to your email address. Please open your inbox and
            click the <Text className="font-semibold text-blue-600">Confirm Email</Text>{' '}
            link to activate your Pulse Drop account.
          </Text>

          {!!email && (
            <Text className="mt-3 text-center text-sm text-gray-400">
              Sent to {email}
            </Text>
          )}

          <View className="mt-6 w-full rounded-3xl border border-gray-100 bg-gray-50 p-4">
            <View className="flex-row items-start">
              <Ionicons name="information-circle-outline" size={22} color="#2563EB" />
              <View className="ml-3 flex-1">
                <Text className="font-semibold text-gray-800">
                  Didn’t receive the email?
                </Text>
                <Text className="mt-1 leading-5 text-gray-500">
                  Check your spam folder or tap resend below. The confirmation email may
                  take a minute to arrive.
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
                I’ve checked my email
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
                  ? 'Sending...'
                  : isCooldownActive
                    ? countdownLabel
                    : 'Resend email'}
              </Text>
            </View>
          </Pressable>

          <View className="mt-6 flex-row justify-center">
            <Text className="text-gray-500">Already verified? </Text>
            <Pressable onPress={() => router.replace('/(auth)/login')} hitSlop={10}>
              <Text className="font-semibold text-blue-600">Sign in</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
