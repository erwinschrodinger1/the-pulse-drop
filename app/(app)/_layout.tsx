import { Stack } from 'expo-router';
import { Image, ImageBackground, View } from 'react-native';

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
          className="absolute left-0 right-0 top-20 w-full"
          resizeMode="contain"
        />

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
      </ImageBackground>
    </View>
  );
}
