import ElevatedContainer from '@/components/ElevatedContainer';
import { Text, View } from 'react-native';

export default function CreditDetail() {
  return (
    <ElevatedContainer className="h-100 mx-6 my-16">
      <Text className="mb-2 text-2xl font-bold">Credit Score</Text>

      <Text className="leading-6 text-gray-700">
        Your Pulse Drop Credit Score represents your trust, reliability, and health
        readiness inside the community.{'\n\n'}
        It increases when you:
      </Text>

      <View className="ml-3 mt-2">
        <Text className="text-gray-700">• Donate blood on time at verified centers</Text>
        <Text className="text-gray-700">• Maintain a healthy donor profile</Text>
        <Text className="text-gray-700">• Respond quickly to donation requests</Text>
        <Text className="text-gray-700">• Complete identity & health verification</Text>
      </View>

      <Text className="mt-4 leading-6 text-gray-700">A higher score unlocks:</Text>

      <View className="ml-3 mt-2">
        <Text className="text-gray-700">• Lower-cost health & life insurance</Text>
        <Text className="text-gray-700">
          • Faster approval for emergency blood requests
        </Text>
        <Text className="text-gray-700">• Access to exclusive donor benefits</Text>
      </View>

      <Text className="mt-4 leading-6 text-gray-700">
        The more consistent and reliable you are, the stronger your score becomes —
        helping you, your family, and the entire Pulse Drop network stay protected.
      </Text>
    </ElevatedContainer>
  );
}
