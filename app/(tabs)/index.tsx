import React, { useEffect, useMemo, useState } from 'react';
import { View, Image, Text, ActivityIndicator, Pressable, Modal } from 'react-native';
import Entypo from '@expo/vector-icons/Entypo';
import ElevatedContainer from '@/components/ElevatedContainer';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { ProgressChart } from 'react-native-chart-kit';
import { useAuthContext } from '@/hooks/use-auth-context';
import { useTranslation } from 'react-i18next';

type UserProfile = {
  fullName: string;
  picture: string;
  bloodGroup: string;
  credits: number;
  donations: number;
  lastBloodDonated: string | null;
};

function getDaysSince(dateString: string | null) {
  if (!dateString) return 0;

  const donatedDate = new Date(dateString);
  if (Number.isNaN(donatedDate.getTime())) return 0;

  const now = new Date();
  const diffMs = now.getTime() - donatedDate.getTime();
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
}

export default function Home() {
  const { t } = useTranslation();
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

  const [showCreditInfo, setShowCreditInfo] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile>({
    fullName: 'John Doe',
    picture: '',
    bloodGroup: '--',
    credits: 0,
    donations: 0,
    lastBloodDonated: null,
  });

  const { user } = useAuthContext();

  useEffect(() => {
    const loadUser = async () => {
      try {
        if (!user) {
          return;
        }

        const metadata = user.user.user_metadata ?? {};

        const fullName =
          metadata.full_name || metadata.name || user.email?.split('@')[0] || 'User';

        setProfile({
          fullName,
          picture: metadata.picture || '',
          bloodGroup: metadata.blood_group || '--',
          credits: Number(metadata.credits ?? 0),
          donations: Number(metadata.donations ?? 0),
          lastBloodDonated: metadata.last_blood_donated ?? null,
        });
      } catch (error) {
        console.error('Failed to load user:', error);
      } finally {
        setLoading(false);
      }
    };

    void loadUser();
  }, [user]);

  const daysSinceLast = useMemo(
    () => getDaysSince(profile.lastBloodDonated),
    [profile.lastBloodDonated],
  );

  const progress = Math.min(daysSinceLast / 90, 1);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#dc2626" />
        <Text className="mt-3 text-gray-500">{t('home.loading')}</Text>
      </View>
    );
  }

  return (
    <View className="flex-1">
      <View className="items-center">
        <View className="relative aspect-square h-auto w-4/5">
          {/* Scribble / profile background */}
          <Image
            source={require('@/assets/images/profile-background.png')}
            className="absolute inset-0 h-full w-full"
            resizeMode="contain"
          />

          <View className="absolute inset-0 items-center justify-center">
            <Image
              source={
                profile.picture
                  ? { uri: profile.picture }
                  : require('@/assets/images/profile.jpg')
              }
              className="h-48 w-48 rounded-full border-[10px] border-white"
              resizeMode="cover"
            />
          </View>
        </View>
      </View>

      <ElevatedContainer className="mx-8 mt-6 flex">
        <Pressable
          onPress={() => {
            console.log('Modal triggered');

            setShowCreditInfo(true);
          }}
          className="mb-2 self-end"
        >
          <FontAwesome5 name="info-circle" size={15} color="black" />
        </Pressable>

        <View className="w-full flex-row items-center justify-between">
          <Text className="text-2xl font-bold text-red-600">{profile.bloodGroup}</Text>
          <Text className="text-xl font-semibold">{profile.donations} donations</Text>
        </View>

        <View className="w-full flex-row items-center justify-between">
          <Text className="text-2xl font-bold">{profile.fullName}</Text>
          <View className="flex-row items-end">
            {/* <Entypo name="drop" size={20} color="red" /> */}
            <Text className="text-xl font-semibold text-red-600">
              {profile.credits} {t('home.credits')}
            </Text>
          </View>
        </View>
      </ElevatedContainer>

      <ElevatedContainer className="mx-8 mt-6 flex items-center justify-center">
        <Text className="text-2xl font-bold">{t('home.donationProgress')}</Text>
        <View className="relative">
          <ProgressChart
            data={{ data: [progress] }}
            width={130}
            height={100}
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

        <Text className="text-xl font-semibold">{t('home.sinceLastDonation')}</Text>

        <Text className="mt-2 text-center text-gray-700">
          {profile.lastBloodDonated
            ? t('home.daysToEligible', { days: Math.max(90 - daysSinceLast, 0) })
            : t('home.noDonationDate')}
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

              <Text className="mb-2 text-2xl font-bold">{t('home.creditScore')}</Text>

              <Text className="leading-6 text-gray-700">
                {t('home.creditInfo.intro')}
              </Text>

              <View className="ml-3 mt-2">
                <Text className="text-gray-700">{t('home.creditInfo.increase1')}</Text>
                <Text className="text-gray-700">{t('home.creditInfo.increase2')}</Text>
                <Text className="text-gray-700">{t('home.creditInfo.increase3')}</Text>
                <Text className="text-gray-700">{t('home.creditInfo.increase4')}</Text>
              </View>

              <Text className="mt-4 leading-6 text-gray-700">
                {t('home.creditInfo.unlocks')}
              </Text>

              <View className="ml-3 mt-2">
                <Text className="text-gray-700">{t('home.creditInfo.unlock1')}</Text>
                <Text className="text-gray-700">{t('home.creditInfo.unlock2')}</Text>
                <Text className="text-gray-700">{t('home.creditInfo.unlock3')}</Text>
              </View>

              <Text className="mt-4 leading-6 text-gray-700">
                {t('home.creditInfo.outro')}
              </Text>
            </ElevatedContainer>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
