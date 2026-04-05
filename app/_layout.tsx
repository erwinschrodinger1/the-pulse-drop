import '../global.css';
import React, { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import ToastManager from 'toastify-react-native';
import AuthProvider from '@/providers/AuthProvider';
import { useAuthContext } from '@/hooks/use-auth-context';

function Gate() {
  const router = useRouter();
  const segments = useSegments();
  const { user, ready, hasOnboarded, isLoggedIn } = useAuthContext();

  useEffect(() => {
    if (!ready) return;

    const inAuthGroup = segments[0] === '(auth)';
    //    const inAppGroup = segments[0] === '(app)';
    const inOnboardingGroup = segments[0] === '(onboarding)';

    // Not onboarded → onboarding
    if (!hasOnboarded) {
      if (!inOnboardingGroup) {
        router.replace('/(onboarding)');
      }
      return;
    }

    // Onboarded but not logged in → login
    if (!isLoggedIn) {
      if (!inAuthGroup) {
        router.replace('/(auth)/login');
      }
      return;
    }

    // Logged in → app
    console.log('Already in app group user: ', user);

    if (!user?.user?.user_metadata?.blood_group) {
      console.log('Profile is missing blood group, redirecting to complete-profile');

      router.replace('/(app)/complete-profile');
      return;
    }
    router.replace('/(tabs)');
  }, [user, ready, hasOnboarded, isLoggedIn]);

  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <Gate />
        <ToastManager position="top" duration={2500} />
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
