// components/AppHeader.tsx

import React from 'react';
import { View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const AppHeader = () => {
  const router = useRouter();

  return (
    <SafeAreaView edges={['top']} className="px-4">
      <View className="h-12 flex-row items-center justify-end">
        <Pressable
          onPress={() => router.push('/profile')}
          className="h-10 w-10 items-center justify-center"
        >
          <Ionicons name="person" size={22} color="white" />
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

export default AppHeader;
