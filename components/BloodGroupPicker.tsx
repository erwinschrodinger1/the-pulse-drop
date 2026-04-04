import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';

const GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function BloodGroupPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const { t } = useTranslation();

  return (
    <View className="mb-3">
      <Text className="mb-2 text-xs text-gray-500">
        {t('bloodGroupPicker.bloodGroup')}
      </Text>
      <View className="flex-row flex-wrap">
        {GROUPS.map((g) => {
          const active = value === g;
          return (
            <Pressable
              key={g}
              onPress={() => onChange(g)}
              className={`mb-2 mr-2 rounded-full border px-3 py-2 ${
                active ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white'
              }`}
            >
              <Text
                className={`${active ? 'text-red-600' : 'text-gray-700'} font-semibold`}
              >
                {g}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
