import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Toast } from 'toastify-react-native';
import * as WebBrowser from 'expo-web-browser';
import { signInWithPassword, signInWithOAuth } from '@/lib/supabase-auth';
import { useTranslation } from 'react-i18next';

export default function SigninScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [secure, setSecure] = useState(true);
  const [focus, setFocus] = useState<'username' | 'password' | null>(null);

  useEffect(() => {
    void WebBrowser.warmUpAsync();
    return () => {
      void WebBrowser.coolDownAsync();
    };
  }, []);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Toast.error(t('auth.login.errors.missingCredentials'));
      return;
    }
    try {
      await signInWithPassword(username, password);
      // Gate component will handle navigation automatically after auth state changes
    } catch (error) {
      const message =
        error instanceof Error ? error.message : t('auth.login.errors.failed');
      Toast.error(message);
    }
  };

  const handleOAuth = async (provider: 'google' | 'facebook') => {
    try {
      await signInWithOAuth(provider);
      // Gate component will handle navigation automatically after auth state changes
    } catch (error) {
      console.error('OAuth login error:', error);
      Toast.error(t('auth.login.errors.oauthFailed'));
    }
  };

  const inputBase = 'flex-row items-center bg-gray-50 border rounded-2xl px-4 h-12';
  const inputNormal = 'border-gray-200';
  const inputFocused = 'border-blue-500';

  return (
    <KeyboardAvoidingView
      behavior="padding"
      keyboardVerticalOffset={Platform.OS === 'ios' ? 24 : 0}
      className="flex-1 bg-white"
    >
      <View className="flex-1 justify-center px-6">
        <View className="mb-6 items-center">
          <Image
            source={require('@/assets/logo-with-text.png')}
            resizeMode="contain"
            className="h-80 w-80"
          />
        </View>

        <Text className="text-center text-3xl font-semibold text-gray-900">
          {t('auth.login.title')}
        </Text>

        <Text className="mb-6 mt-2 text-center leading-5 text-gray-500">
          {t('auth.login.subtitle')}
        </Text>

        {/* Username */}
        <View
          className={`${inputBase} ${focus === 'username' ? inputFocused : inputNormal}`}
        >
          <Ionicons name="person-outline" size={20} color="#9CA3AF" />
          <TextInput
            value={username}
            onChangeText={setUsername}
            placeholder={t('auth.login.usernamePlaceholder')}
            placeholderTextColor="#9CA3AF"
            className="ml-3 flex-1 text-gray-900"
            autoCapitalize="none"
            onFocus={() => setFocus('username')}
            onBlur={() => setFocus(null)}
            returnKeyType="next"
          />
        </View>

        {/* Password */}
        <View
          className={`${inputBase} mt-4 ${focus === 'password' ? inputFocused : inputNormal}`}
        >
          <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" />
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder={t('auth.login.passwordPlaceholder')}
            placeholderTextColor="#9CA3AF"
            secureTextEntry={secure}
            className="ml-3 flex-1 text-gray-900"
            onFocus={() => setFocus('password')}
            onBlur={() => setFocus(null)}
            returnKeyType="done"
          />
          <Pressable onPress={() => setSecure((v) => !v)} hitSlop={12} className="pl-2">
            <Ionicons
              name={secure ? 'eye-outline' : 'eye-off-outline'}
              size={20}
              color="#9CA3AF"
            />
          </Pressable>
        </View>

        {/* Forgot password */}
        <Pressable
          onPress={() => router.push('/(auth)/forgot')}
          className="mt-3 self-end"
          hitSlop={10}
        >
          <Text className="text-sm font-semibold text-blue-600">
            {t('auth.login.forgotPassword')}
          </Text>
        </Pressable>

        {/* Login button */}
        <Pressable
          onPress={handleLogin}
          className="mt-5 h-12 items-center justify-center rounded-2xl bg-blue-600"
        >
          <Text className="text-base font-semibold text-white">
            {t('auth.login.loginButton')}
          </Text>
        </Pressable>

        {/* Divider */}
        <View className="my-6 w-full flex-row items-center">
          <View className="h-px flex-1 bg-gray-200" />
          <Text className="mx-3 text-sm text-gray-400">
            {t('common.oauth.orContinueWith')}
          </Text>
          <View className="h-px flex-1 bg-gray-200" />
        </View>

        {/* OAuth buttons */}
        <View className="flex-row gap-3">
          <Pressable
            className="flex-1 flex-row items-center justify-center rounded-2xl border border-gray-200 py-3"
            onPress={() => handleOAuth('google')}
          >
            <FontAwesome name="google" size={18} color="#DB4437" />
            <Text className="ml-2 font-medium text-gray-700">
              {t('common.oauth.google')}
            </Text>
          </Pressable>

          <Pressable
            className="flex-1 flex-row items-center justify-center rounded-2xl border border-gray-200 py-3"
            onPress={() => handleOAuth('facebook')}
          >
            <Ionicons name="logo-facebook" size={18} color="#1877F2" />
            <Text className="ml-2 font-medium text-gray-700">
              {t('common.oauth.facebook')}
            </Text>
          </Pressable>
        </View>

        {/* Signup link */}
        <View className="mt-6 flex-row justify-center">
          <Text className="text-gray-500">{t('auth.login.noAccount')} </Text>
          <Pressable onPress={() => router.push('/(auth)/register')} hitSlop={10}>
            <Text className="font-semibold text-blue-600">
              {t('common.actions.signUp')}
            </Text>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
