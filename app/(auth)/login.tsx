import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Image,
  ScrollView,
} from 'react-native';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Toast } from 'toastify-react-native';

export default function SigninScreen() {
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [secure, setSecure] = useState(true);
  const [focus, setFocus] = useState<'username' | 'password' | null>(null);

    const handleLogin = () => {
        if (!username.trim() || !password.trim()) {
            Toast.error("Please enter both username and password");
            return;
        }
        router.push("/(app)/(tabs)");
    };

    const inputBase = "flex-row items-center bg-gray-50 border rounded-2xl px-4 h-12";
    const inputNormal = "border-gray-200";
    const inputFocused = "border-blue-500";

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 24 : 0}
      className="flex-1 bg-white"
    >
      <ScrollView
        className="flex-1 px-6"
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="mb-6 items-center">
          <Image
            source={require('@/assets/logo-with-text.png')}
            resizeMode="contain"
            className="h-80 w-80"
          />
        </View>

        <Text className="text-center text-3xl font-semibold text-gray-900">Sign In</Text>

        <Text className="mb-6 mt-2 text-center leading-5 text-gray-500">
          Enter valid user name & password to continue
        </Text>

        {/* Username */}
        <View
          className={`${inputBase} ${focus === 'username' ? inputFocused : inputNormal}`}
        >
          <Ionicons name="person-outline" size={20} color="#9CA3AF" />
          <TextInput
            value={username}
            onChangeText={setUsername}
            placeholder="User name"
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
            placeholder="Password"
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
          <Text className="text-sm font-semibold text-blue-600">Forgot password</Text>
        </Pressable>

        {/* Login button */}
        <Pressable
          onPress={handleLogin}
          className="mt-5 h-12 items-center justify-center rounded-2xl bg-blue-600"
        >
          <Text className="text-base font-semibold text-white">Login</Text>
        </Pressable>

        {/* Divider */}
        <View className="my-6 w-full flex-row items-center">
          <View className="h-px flex-1 bg-gray-200" />
          <Text className="mx-3 text-sm text-gray-400">Or continue with</Text>
          <View className="h-px flex-1 bg-gray-200" />
        </View>

        {/* Social buttons */}
        <View className="flex-row gap-3">
          <Pressable className="flex-1 flex-row items-center justify-center rounded-2xl border border-gray-200 px-4 py-3">
            <FontAwesome name="google" size={18} color="#DB4437" />
            <Text className="ml-2 font-medium text-gray-700">Google</Text>
          </Pressable>

          <Pressable className="flex-1 flex-row items-center justify-center rounded-2xl border border-gray-200 px-4 py-3">
            <Ionicons name="logo-facebook" size={18} color="#1877F2" />
            <Text className="ml-2 font-medium text-gray-700">Facebook</Text>
          </Pressable>
        </View>

                {/* Divider */}
                <View className="flex-row items-center my-6 w-full">
                    <View className="flex-1 h-px bg-gray-200" />
                    <Text className="mx-3 text-gray-400 text-sm">Or continue with</Text>
                    <View className="flex-1 h-px bg-gray-200" />
                </View>

                {/* Social buttons */}
                <View className="flex-row gap-3">
                    <Pressable className="flex-1 flex-row items-center justify-center border border-gray-200 rounded-2xl px-4 py-3">
                        <FontAwesome name="google" size={18} color="#DB4437" />
                        <Text className="ml-2 text-gray-700 font-medium">Google</Text>
                    </Pressable>

                    <Pressable className="flex-1 flex-row items-center justify-center border border-gray-200 rounded-2xl px-4 py-3">
                        <Ionicons name="logo-facebook" size={18} color="#1877F2" />
                        <Text className="ml-2 text-gray-700 font-medium">Facebook</Text>
                    </Pressable>
                </View>

                {/* Signup link */}
                <View className="flex-row justify-center mt-6">
                    <Text className="text-gray-500">Don’t have an account? </Text>
                    <Pressable onPress={() => router.push("/(auth)/register")} hitSlop={10}>
                        <Text className="text-blue-600 font-semibold">Sign up</Text>
                    </Pressable>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

