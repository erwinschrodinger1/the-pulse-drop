import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Toast } from 'toastify-react-native';
import { supabase } from '@/lib/supabase';

export default function UpdatePasswordScreen() {
  const router = useRouter();

  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [hasValidSession, setHasValidSession] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [securePassword, setSecurePassword] = useState(true);
  const [secureConfirm, setSecureConfirm] = useState(true);

  const [focus, setFocus] = useState<'password' | 'confirmPassword' | null>(null);

  // Check for valid recovery session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error || !session) {
          console.error('No valid session for password reset:', error);
          Toast.error('Password reset session expired. Please request a new link.');
          router.replace('/(auth)/forgot');
          return;
        }

        setHasValidSession(true);
        setUserEmail(session.user.email || '');
      } catch (err) {
        console.error('Session check error:', err);
        Toast.error('Unable to verify reset session.');
        router.replace('/(auth)/forgot');
      } finally {
        setIsCheckingSession(false);
      }
    };

    checkSession();
  }, [router]);

  const canSubmit = useMemo(() => {
    return password.trim().length >= 6 && confirmPassword.trim().length >= 6;
  }, [password, confirmPassword]);

  const handleUpdatePassword = async () => {
    if (!password.trim() || !confirmPassword.trim()) {
      Toast.error('Please fill in both password fields');
      return;
    }

    if (password.length < 6) {
      Toast.error('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      Toast.error('Passwords do not match');
      return;
    }

    try {
      const { data, error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) throw error;

      console.log('Password updated for user:', data);

      Toast.success('Password updated successfully! Please sign in.');
      router.replace('/(auth)/login');
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to update password';
      Toast.error(message);
    }
  };

  if (isCheckingSession) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#2563EB" />
        <Text className="mt-4 text-base text-gray-600">Verifying reset link…</Text>
      </View>
    );
  }

  if (!hasValidSession) {
    return null;
  }

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
          paddingBottom: 120,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="w-full max-w-md self-center">
          <View className="mb-6 items-center">
            <Image
              source={require('@/assets/logo-with-text.png')}
              resizeMode="contain"
              className="h-56 w-56"
            />
          </View>

          <Text className="text-center text-3xl font-semibold text-gray-900">
            Update Password
          </Text>

          <Text className="mb-6 mt-2 text-center leading-5 text-gray-500">
            Enter your new password for {userEmail}
          </Text>

          {/* New Password */}
          <View
            className={`${inputBase} mt-4 ${
              focus === 'password' ? inputFocused : inputNormal
            }`}
          >
            <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" />
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="New password"
              placeholderTextColor="#9CA3AF"
              secureTextEntry={securePassword}
              className="ml-3 flex-1 text-gray-900"
              onFocus={() => setFocus('password')}
              onBlur={() => setFocus(null)}
              returnKeyType="next"
            />
            <Pressable
              onPress={() => setSecurePassword((v) => !v)}
              hitSlop={12}
              className="pl-2"
            >
              <Ionicons
                name={securePassword ? 'eye-outline' : 'eye-off-outline'}
                size={20}
                color="#9CA3AF"
              />
            </Pressable>
          </View>

          {/* Confirm Password */}
          <View
            className={`${inputBase} mt-4 ${
              focus === 'confirmPassword' ? inputFocused : inputNormal
            }`}
          >
            <Ionicons name="shield-checkmark-outline" size={20} color="#9CA3AF" />
            <TextInput
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm password"
              placeholderTextColor="#9CA3AF"
              secureTextEntry={secureConfirm}
              className="ml-3 flex-1 text-gray-900"
              onFocus={() => setFocus('confirmPassword')}
              onBlur={() => setFocus(null)}
              returnKeyType="done"
            />
            <Pressable
              onPress={() => setSecureConfirm((v) => !v)}
              hitSlop={12}
              className="pl-2"
            >
              <Ionicons
                name={secureConfirm ? 'eye-outline' : 'eye-off-outline'}
                size={20}
                color="#9CA3AF"
              />
            </Pressable>
          </View>

          <Pressable
            disabled={!canSubmit}
            onPress={handleUpdatePassword}
            className={`mt-6 h-12 items-center justify-center rounded-2xl ${
              canSubmit ? 'bg-blue-600' : 'bg-blue-300'
            }`}
          >
            <Text className="text-base font-semibold text-white">Update Password</Text>
          </Pressable>

          <View className="mt-6 flex-row justify-center">
            <Text className="text-gray-500">Remember your password? </Text>
            <Pressable onPress={() => router.replace('/(auth)/login')} hitSlop={10}>
              <Text className="font-semibold text-blue-600">Sign in</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
