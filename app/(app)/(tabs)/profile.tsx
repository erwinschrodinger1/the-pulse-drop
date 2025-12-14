import { View, Image, Text } from 'react-native';

import { Stack, useLocalSearchParams } from 'expo-router';


export default function Profile() {
    return (
        <View className="flex flex-1">
            {/* Profile Picture */}

            <View className="flex-1 h-50 w-full">
                <Text className="text-center text-white text-2xl font-bold">User Profile</Text>
            </View>
        </View>
    );
}
