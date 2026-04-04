import React from 'react';
import { View, Text, Pressable, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

export default function LocationPicker({
  city,
  area,
  onCityChange,
  onAreaChange,
  onUseMyLocation,
}: {
  city: string;
  area: string;
  onCityChange: (v: string) => void;
  onAreaChange: (v: string) => void;
  onUseMyLocation?: () => void;
}) {
  const { t } = useTranslation();
  return (
    <View className="mb-3">
      <Text className="mb-2 text-xs text-gray-500">
        {t('locationPicker.locationTitle')}
      </Text>

      <View className="mb-2">
        <TextInput
          value={city}
          onChangeText={onCityChange}
          placeholder={t('locationPicker.cityPlaceholder')}
          placeholderTextColor="#9CA3AF"
          className="h-12 rounded-2xl border border-gray-200 bg-gray-50 px-4 text-gray-900"
        />
      </View>

      <View className="mb-2">
        <TextInput
          value={area}
          onChangeText={onAreaChange}
          placeholder={t('locationPicker.areaPlaceholder')}
          placeholderTextColor="#9CA3AF"
          className="h-12 rounded-2xl border border-gray-200 bg-gray-50 px-4 text-gray-900"
        />
      </View>

      {onUseMyLocation ? (
        <Pressable
          onPress={onUseMyLocation}
          className="flex-row items-center self-start rounded-full bg-blue-50 px-3 py-2"
        >
          <Ionicons name="locate-outline" size={16} color="#2563EB" />
          <Text className="ml-2 text-sm font-semibold text-blue-600">
            {t('locationPicker.useMyLocation')}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}
