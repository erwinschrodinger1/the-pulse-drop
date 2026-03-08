import { View, Image, Text } from 'react-native';

import { Stack, useLocalSearchParams } from 'expo-router';

export default function Profile() {
  return (
    <View className="flex flex-1">
      {/* Profile Picture */}

      <View className="h-50 w-full flex-1">
        <Text className="text-center text-2xl font-bold text-white">User Profile</Text>
      </View>
    </View>
  );
}
