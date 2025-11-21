import AppHeader from '@/components/AppHeader';
import '../global.css';

import { Stack } from 'expo-router';
import { Image, ImageBackground, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Layout() {
  return (
    <View className="flex-1 bg-white">
      <ImageBackground
        source={require('@/assets/images/background.png')}
        className="flex-1"
        resizeMode="none"
      >
        {/* Bottom illustration */}
        <Image
          source={require('@/assets/images/background-1.png')}
          className="absolute top-20 left-0 right-0 w-full"
          resizeMode="contain"
        />

        {/* Content on top */}
        <AppHeader />
        <SafeAreaView className='flex-1'>
          <Stack screenOptions={{
            contentStyle: { backgroundColor: 'transparent' },
            headerTransparent: true,
            headerTitle: "",
            headerShadowVisible: false,
            headerBackVisible: false
          }} />
        </SafeAreaView>

      </ImageBackground>
    </View>
  );
}


