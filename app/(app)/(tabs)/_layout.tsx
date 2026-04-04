import AppHeader from '@/components/AppHeader';

import { Stack } from 'expo-router';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomNav from '@/components/NavigationBar';

export default function Layout() {
  return (
    <View className="flex-1">
      {/* Content on top */}
      <AppHeader />
      <SafeAreaView className="mt-16 flex-1">
        <Stack
          screenOptions={{
            contentStyle: { backgroundColor: 'transparent' },
            headerShown: false,
            headerTransparent: true,
            headerTitle: '',
            headerShadowVisible: false,
            headerBackVisible: false,
          }}
        />
      </SafeAreaView>
      <BottomNav />
    </View>
  );
}
