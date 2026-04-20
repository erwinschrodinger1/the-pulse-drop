import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Image,
  Text,
  ActivityIndicator,
  Pressable,
  Modal,
  ScrollView,
  Animated,
} from 'react-native';
import ElevatedContainer from '@/components/ElevatedContainer';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { ProgressChart } from 'react-native-chart-kit';
import { useRouter } from 'expo-router';
import { useAuthContext } from '@/hooks/use-auth-context';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import HeaderText from '@/components/HeaderText';

type UserProfile = {
  fullName: string;
  picture: string;
  bloodGroup: string;
  credits: number;
  donations: number;
  requests: number;
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
  const [showBloodGroupInfo, setShowBloodGroupInfo] = useState(false);
  const [showCannotDonateInfo, setShowCannotDonateInfo] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile>({
    fullName: 'John Doe',
    picture: '',
    bloodGroup: '--',
    credits: 0,
    donations: 0,
    requests: 0,
    lastBloodDonated: null,
  });

  const { user } = useAuthContext();
  const router = useRouter();
  const scrollY = React.useRef(new Animated.Value(0)).current;
  const scrollViewRef = React.useRef<ScrollView>(null);
  const lastScrollY = React.useRef(0);
  const scrollSnapThreshold = 100;

  const profileScale = scrollY.interpolate({
    inputRange: [0, 150],
    outputRange: [1, 0.3],
    extrapolate: 'clamp',
  });

  const profileMargin = scrollY.interpolate({
    inputRange: [0, 150],
    outputRange: [0, -100],
    extrapolate: 'clamp',
  });

  const handleScrollEnd = (event: any) => {
    const currentScrollY = event.nativeEvent.contentOffset.y;
    const diff = currentScrollY - lastScrollY.current;

    // Determine direction and snap
    if (Math.abs(diff) > scrollSnapThreshold) {
      if (diff > 0) {
        // Scrolling down - snap to bottom
        scrollViewRef.current?.scrollTo({ y: 300, animated: true });
      } else {
        // Scrolling up - snap to top
        scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      }
    }

    lastScrollY.current = currentScrollY;
  };

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
          requests: Number(metadata.requests ?? 0),
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

  function ProfileIcon() {
    return (
      <Animated.View
        style={{
          transform: [{ scale: profileScale }],
          marginBottom: profileMargin,
        }}
      >
        <View className="items-center">
          <View className="relative aspect-square h-auto w-5/6">
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
      </Animated.View>
    );
  }

  function NameCredits() {
    return (
      <View className="-mt-2">
        <View className="flex-row items-center justify-center gap-2">
          <HeaderText text={profile.fullName} />
          <Pressable onPress={() => router.push('/profile')}>
            <FontAwesome5 name="edit" size={22} />
          </Pressable>
        </View>

        <View className="mt-1 flex-row items-center justify-center gap-2">
          <Pressable onPress={() => setShowBloodGroupInfo(true)}>
            <ElevatedContainer className="w-50 flex-row items-center justify-between">
              <Ionicons name="water" size={20} color="#dc2626" solid />
              <Text className="text-xl font-bold">{profile.bloodGroup}</Text>
            </ElevatedContainer>
          </Pressable>

          <Text className="ml-2 text-xl font-semibold text-red-600">
            {profile.credits} {t('home.credits')}
          </Text>

          <Pressable onPress={() => setShowCreditInfo(true)}>
            <FontAwesome5 name="info-circle" size={15} color="black" />
          </Pressable>
        </View>
      </View>
    );
  }

  function DonationsDoneSection() {
    return (
      <>
        <ElevatedContainer className="gap-2">
          <View className="flex-row items-center justify-between">
            <Text className="text-2xl font-bold">{t('home.donationCount')}</Text>
            <Pressable
              className="flex-row items-center gap-1"
              onPress={() => router.push('/(tabs)/history')}
            >
              <Text className="text-xs font-medium text-gray-500">
                {t('home.seeFullHistory')}
              </Text>
              <FontAwesome5 name="arrow-right" size={12} color="#999" />
            </Pressable>
          </View>
          <View className="w-full flex-row items-center justify-start gap-4">
            <View className="flex-1 items-start">
              <Text className="text-5xl font-bold text-red-600">{profile.donations}</Text>
              <Text className="text-sm font-medium text-gray-700">
                {t('home.donationsDone')}
              </Text>
            </View>

            <View className="h-full w-px bg-gray-500" />

            <View className="flex-1 items-start">
              <Text className="text-5xl font-bold text-red-600">{profile.requests}</Text>
              <Text className="text-sm font-medium text-gray-700">
                {t('home.requestsMade')}
              </Text>
            </View>
          </View>
        </ElevatedContainer>
      </>
    );
  }

  function DonationProgressSection() {
    return (
      <ElevatedContainer className="flex items-center justify-center gap-2">
        <Text className="text-2xl font-bold">{t('home.donationProgress')}</Text>

        <View className="items-center">
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

          <Text className="text-sm font-medium text-gray-700">
            {t('home.sinceLastDonation')}
          </Text>
        </View>

        <Text className="mt-2 text-center text-gray-700">
          {profile.lastBloodDonated
            ? t('home.daysToEligible', { days: Math.max(90 - daysSinceLast, 0) })
            : t('home.noDonationDate')}
        </Text>
      </ElevatedContainer>
    );
  }

  function CreditInfoModal() {
    return (
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

              <Text className="leading-6 text-gray-700">
                {t('home.creditInfo.unlocks')}
              </Text>

              <View className="ml-3 mt-2">
                <Text className="text-gray-700">{t('home.creditInfo.unlock1')}</Text>
                <Text className="text-gray-700">{t('home.creditInfo.unlock2')}</Text>
                <Text className="text-gray-700">{t('home.creditInfo.unlock3')}</Text>
              </View>

              <Text className="leading-6 text-gray-700">
                {t('home.creditInfo.outro')}
              </Text>
            </ElevatedContainer>
          </Pressable>
        </Pressable>
      </Modal>
    );
  }

  function BloodGroupInfoModal() {
    return (
      <Modal
        visible={showBloodGroupInfo}
        transparent
        animationType="fade"
        onRequestClose={() => setShowBloodGroupInfo(false)}
      >
        <Pressable
          className="flex-1 items-center justify-center bg-black/40 px-6"
          onPress={() => setShowBloodGroupInfo(false)}
        >
          <Pressable onPress={() => {}} className="w-full">
            <ElevatedContainer className="w-full rounded-2xl px-5 py-6">
              <Pressable
                onPress={() => setShowBloodGroupInfo(false)}
                className="absolute right-4 top-4 z-10"
              >
                <FontAwesome5 name="times" size={18} color="black" />
              </Pressable>

              <Text className="mb-2 text-2xl font-bold">{t('home.bloodGroup')}</Text>
              <Text className="leading-6 text-gray-700">
                {t('home.bloodGroupInfoWip', { defaultValue: 'WIP blood group info' })}
              </Text>
            </ElevatedContainer>
          </Pressable>
        </Pressable>
      </Modal>
    );
  }

  function DonationActionSection() {
    const canDonate = daysSinceLast >= 90 || !profile.lastBloodDonated;

    if (canDonate) {
      return (
        <Pressable onPress={() => router.push('/(tabs)/request')}>
          <ElevatedContainer className="w-full flex-row items-center justify-between px-5 py-4">
            <Text className="text-xl font-semibold text-gray-800">
              {t('home.findDonationCenters')}
            </Text>
            <FontAwesome5 name="arrow-right" size={18} color="#dc2626" />
          </ElevatedContainer>
        </Pressable>
      );
    }

    return (
      <Pressable onPress={() => setShowCannotDonateInfo(true)}>
        <ElevatedContainer className="flex-row items-center justify-between px-5 py-4">
          <Text className="text-lg font-semibold text-gray-800">
            {t('home.whyCannotDonate')}
          </Text>
          <FontAwesome5 name="info-circle" size={18} color="#666" />
        </ElevatedContainer>
      </Pressable>
    );
  }

  function CannotDonateInfoModal() {
    return (
      <Modal
        visible={showCannotDonateInfo}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCannotDonateInfo(false)}
      >
        <Pressable
          className="flex-1 items-center justify-center bg-black/40 px-6"
          onPress={() => setShowCannotDonateInfo(false)}
        >
          <Pressable onPress={() => {}} className="w-full">
            <ElevatedContainer className="w-full rounded-2xl px-5 py-6">
              <Pressable
                onPress={() => setShowCannotDonateInfo(false)}
                className="absolute right-4 top-4 z-10"
              >
                <FontAwesome5 name="times" size={18} color="black" />
              </Pressable>

              <Text className="mb-2 text-2xl font-bold">
                {t('home.cannotDonateTitle', { defaultValue: 'Why You Cannot Donate' })}
              </Text>
              <Text className="leading-6 text-gray-700">
                {t('home.cannotDonateWip', { defaultValue: 'WIP cannot donate info' })}
              </Text>
            </ElevatedContainer>
          </Pressable>
        </Pressable>
      </Modal>
    );
  }

  return (
    <ScrollView
      ref={scrollViewRef}
      className="flex-1 px-8"
      contentContainerClassName="gap-4 py-8 items-center justify-start"
      scrollEventThrottle={16}
      onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
        useNativeDriver: false,
      })}
      onScrollEndDrag={handleScrollEnd}
    >
      <ProfileIcon />
      <NameCredits />
      <DonationsDoneSection />
      <DonationProgressSection />
      <DonationActionSection />
      <CreditInfoModal />
      <BloodGroupInfoModal />
      <CannotDonateInfoModal />
    </ScrollView>
  );
}
