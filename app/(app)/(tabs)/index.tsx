import React, { useEffect, useMemo, useState } from 'react';
import { View, Image, Text, ActivityIndicator, Pressable, Modal } from 'react-native';
import Entypo from '@expo/vector-icons/Entypo';
import ElevatedContainer from '@/components/ElevatedContainer';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { Link } from 'expo-router';
import { ProgressChart } from 'react-native-chart-kit';

export default function Home() {
  const chartConfig = {
    backgroundColor: 'transparent',
    backgroundGradientFromOpacity: 0,
    backgroundGradientToOpacity: 0,
    backgroundGradientFrom: 'transparent',
    backgroundGradientTo: 'transparent',
    fillShadowGradientFrom: 'rgba(234, 8, 8, 1)', // red fill
    color: (opacity = 1) => `rgba(234, 8, 8, ${opacity})`, // red ring
    fillShadowGradientTo: 'rgba(234, 8, 8, 0.2)',
    strokeWidth: 16,
  };

  const screenWidth = Dimensions.get('window').width;
  const [showCreditInfo, setShowCreditInfo] = useState(false);

  let daysSinceLast = 24;
  let progress = Math.min(daysSinceLast / 90, 1); // assuming 56 days is the max for full ring

  return (
    <View className="flex-1">
      <View className="mt-[-42] items-center">
        <View className="relative aspect-square h-auto w-5/6">
          {/* Scribble / profile background */}
          <Image
            source={require('@/assets/images/profile-background.png')}
            className="absolute inset-0 h-full w-full"
            resizeMode="contain"
          />

          {/* Centered circular profile image */}
          <View className="absolute inset-0 items-center justify-center">
            <Image
              source={require('@/assets/images/profile.jpg')}
              className="h-48 w-48 rounded-full border-[10px] border-white"
              resizeMode="cover"
            />
          </View>
        </View>
      </View>

      <ElevatedContainer className="mx-8 mt-6 flex">
        <Link href={'/credit-detail'} className="mb-2 self-end">
          <FontAwesome5 name="info-circle" size={14} color="black" />
        </Link>

        <View className="w-full flex-row items-center justify-between">
          <Text className="text-4xl font-bold text-red-600">A+ve</Text>
          <Text className="text-xl font-semibold">32 donations</Text>
        </View>

        <View className="w-full flex-row items-center justify-between">
          <Text className="text-4xl font-bold">John Doe</Text>
          <View className="flex-row align-bottom">
            <Entypo name="drop" size={24} color="red" />
            <Text className="text-xl font-semibold text-red-600">1200 credits</Text>
          </View>
        </View>
      </ElevatedContainer>

      <ElevatedContainer className="mx-8 mt-6 flex items-center justify-center">
        <Text className="text-2xl font-bold">Donation Progress</Text>
        <View className="relative">
          <ProgressChart
            data={{ data: [progress] }}
            width={130}
            height={130}
            radius={40}
            strokeWidth={12}
            chartConfig={chartConfig}
            hideLegend={true}
          />

          <View className="absolute inset-0 items-center justify-center">
            <Text className="text-3xl font-semibold text-yellow-600">
              {daysSinceLast}
            </Text>
          </View>
        </View>

        <Text className="text-xl font-semibold">Since last donation</Text>

        <Text className="mt-2 text-center text-gray-700">
          {profile.lastBloodDonated
            ? `Keep up the great work! You're just ${Math.max(
                90 - daysSinceLast,
                0,
              )} days away from being eligible to donate again.`
            : 'You have not added a donation date yet.'}
        </Text>
      </ElevatedContainer>

      <Modal
        visible={showCreditInfo}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCreditInfo(false)}
      >
        <Pressable
          className="flex-1 items-center justify-center bg-black/40 px-6"
          onPress={() => setShowCreditInfo(false)}
        >
          <Pressable onPress={() => {}} className="w-full">
            <ElevatedContainer className="w-full rounded-2xl px-5 py-6">
              <Pressable
                onPress={() => setShowCreditInfo(false)}
                className="absolute right-4 top-4 z-10"
              >
                <FontAwesome5 name="times" size={18} color="black" />
              </Pressable>

              <Text className="mb-2 text-2xl font-bold">Credit Score</Text>

              <Text className="leading-6 text-gray-700">
                Your Pulse Drop Credit Score represents your trust, reliability, and
                health readiness inside the community.
                {'\n\n'}
                It increases when you:
              </Text>

              <View className="ml-3 mt-2">
                <Text className="text-gray-700">
                  • Donate blood on time at verified centers
                </Text>
                <Text className="text-gray-700">• Maintain a healthy donor profile</Text>
                <Text className="text-gray-700">
                  • Respond quickly to donation requests
                </Text>
                <Text className="text-gray-700">
                  • Complete identity & health verification
                </Text>
              </View>

              <Text className="mt-4 leading-6 text-gray-700">
                A higher score unlocks:
              </Text>

              <View className="ml-3 mt-2">
                <Text className="text-gray-700">
                  • Lower-cost health & life insurance
                </Text>
                <Text className="text-gray-700">
                  • Faster approval for emergency blood requests
                </Text>
                <Text className="text-gray-700">
                  • Access to exclusive donor benefits
                </Text>
              </View>

              <Text className="mt-4 leading-6 text-gray-700">
                The more consistent and reliable you are, the stronger your score becomes
                — helping you, your family, and the entire Pulse Drop network stay
                protected.
              </Text>
            </ElevatedContainer>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
