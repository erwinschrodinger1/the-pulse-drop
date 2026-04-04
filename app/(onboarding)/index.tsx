import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  Dimensions,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthContext } from '@/hooks/use-auth-context';
import { useTranslation } from 'react-i18next';

const { width } = Dimensions.get('window');

type Slide = {
  key: string;
  image: any;
};

const slides: Slide[] = [
  {
    key: 's1',
    image: require('@/assets/images/onboarding/screen1-img.png'),
  },
  {
    key: 's2',
    image: require('@/assets/images/onboarding/screen2-img.png'),
  },
  {
    key: 's3',
    image: require('@/assets/images/onboarding/screen3-img.png'),
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const listRef = useRef<FlatList<Slide>>(null);
  const [index, setIndex] = useState(0);

  const { completeOnboarding } = useAuthContext();
  const goToLogin = async () => {
    await completeOnboarding(); // updates RootLayout state
    router.replace('/(auth)/login');
  };

  const goNext = () => {
    if (index < slides.length - 1) {
      listRef.current?.scrollToIndex({ index: index + 1, animated: true });
    } else {
      goToLogin();
    }
  };

  const goBack = () => {
    if (index > 0) {
      listRef.current?.scrollToIndex({ index: index - 1, animated: true });
    }
  };

  const onScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const i = Math.round(e.nativeEvent.contentOffset.x / width);
    setIndex(i);
  };

  const isLast = index === slides.length - 1;

  return (
    <View className="flex-1 bg-white">
      {/* Top bar */}
      <View
        className={`flex-row items-center justify-between px-6 ${Platform.OS === 'ios' ? 'pt-14' : 'pt-10'}`}
      >
        <Pressable onPress={goBack} hitSlop={12} disabled={index === 0}>
          <View
            className={`h-10 w-10 items-center justify-center rounded-full ${index === 0 ? 'opacity-0' : 'bg-gray-100'}`}
          >
            <Ionicons name="chevron-back" size={22} color="#111827" />
          </View>
        </Pressable>

        <Pressable onPress={goToLogin} hitSlop={12}>
          <Text className="font-semibold text-gray-500">{t('onboarding.skip')}</Text>
        </Pressable>
      </View>

      {/* Slides */}
      <FlatList
        ref={listRef}
        data={slides}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.key}
        onMomentumScrollEnd={onScrollEnd}
        renderItem={({ item }) => (
          <View style={{ width }} className="flex-1 items-center justify-center px-6">
            {/* Image card */}
            <View className="w-full items-center justify-center py-8">
              <Image source={item.image} resizeMode="contain" className="h-72 w-72" />
            </View>

            <Text className="mt-8 text-center text-3xl font-semibold text-gray-900">
              {t(`onboarding.slides.${item.key}.title`)}
            </Text>

            <Text className="mt-3 px-4 text-center leading-6 text-gray-500">
              {t(`onboarding.slides.${item.key}.desc`)}
            </Text>
          </View>
        )}
      />

      {/* Bottom controls */}
      <View className="px-6 pb-10">
        {/* Dots */}
        <View className="mb-6 flex-row justify-center">
          {slides.map((_, i) => {
            const active = i === index;
            return (
              <View
                key={i}
                className={`${active ? 'w-7 bg-blue-600' : 'w-2 bg-gray-300'} mx-1 h-2 rounded-full`}
              />
            );
          })}
        </View>

        {/* Primary button */}
        <Pressable
          onPress={goNext}
          className="h-12 items-center justify-center rounded-2xl bg-blue-600 active:opacity-90"
        >
          <View className="flex-row items-center">
            <Text className="text-base font-semibold text-white">
              {isLast ? t('onboarding.getStarted') : t('onboarding.next')}
            </Text>
            <Ionicons
              name="arrow-forward"
              size={18}
              color="#fff"
              style={{ marginLeft: 8 }}
            />
          </View>
        </Pressable>

        {/* Bottom link */}
        <View className="mt-5 flex-row justify-center">
          <Text className="text-gray-500">{t('onboarding.alreadyHaveAccount')} </Text>
          <Pressable onPress={goToLogin} hitSlop={10}>
            <Text className="font-semibold text-blue-600">
              {t('common.actions.signIn')}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
