import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Toast } from 'toastify-react-native';
import { resetPassword } from '@/lib/supabase-auth';
import { useTranslation } from 'react-i18next';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [focus, setFocus] = useState<'email' | null>(null);

  const handleSendOtp = async () => {
    if (!email.trim()) {
      Toast.error(t('auth.forgot.errors.missingEmail'));
      return;
    }

    try {
      const data = await resetPassword(email);
      console.log('reset pass', data);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : t('auth.forgot.errors.sendOtpFailed');
      Toast.error(message);
      return;
    }

    // TODO: call backend to send OTP
    Toast.success(t('auth.forgot.success.otpSent'));

    router.push({
      pathname: '/(auth)/verify-email',
      params: { type: 'recovery', email },
    });
  };

  const inputBase = 'flex-row items-center bg-gray-50 border rounded-2xl px-4 h-12';
  const inputNormal = 'border-gray-200';
  const inputFocused = 'border-blue-500';

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
          paddingBottom: 140,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="w-full max-w-md self-center">
          <View className="mb-6 items-center">
            <Image
              source={require('@/assets/logo-with-text.png')}
              resizeMode="contain"
              className="h-80 w-80"
            />
          </View>

          <Text className="text-center text-2xl font-semibold text-gray-900">
            {t('auth.forgot.title')}
          </Text>

          <Text className="mb-6 mt-2 px-2 text-center leading-5 text-gray-500">
            {t('auth.forgot.subtitle')}
          </Text>

          {/* Email input */}
          <View
            className={`${inputBase} ${focus === 'email' ? inputFocused : inputNormal}`}
          >
            <Ionicons name="mail-outline" size={20} color="#9CA3AF" />
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder={t('auth.forgot.emailPlaceholder')}
              placeholderTextColor="#9CA3AF"
              keyboardType="email-address"
              autoCapitalize="none"
              className="ml-3 flex-1 text-gray-900"
              onFocus={() => setFocus('email')}
              onBlur={() => setFocus(null)}
              returnKeyType="done"
            />
          </View>

          {/* Send OTP button */}
          <Pressable
            onPress={handleSendOtp}
            className="mt-6 h-12 items-center justify-center rounded-2xl bg-blue-600"
          >
            <Text className="text-base font-semibold text-white">
              {t('auth.forgot.submitButton')}
            </Text>
          </Pressable>

          <View className="mt-8 flex-row justify-center">
            <Text className="text-gray-500">{t('auth.forgot.rememberPassword')} </Text>
            <Pressable onPress={() => router.push('/(auth)/login')} hitSlop={10}>
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
