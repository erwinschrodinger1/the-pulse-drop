// components/RequestCard.tsx
import React from 'react';
import { View, Text, Alert, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ElevatedContainer from './ElevatedContainer';
import { Button } from './Button';
import { useTranslation } from 'react-i18next';

type Urgency = 'High' | 'Medium' | 'Low';

export type RequestInfo = {
  id: number;
  title: string; // hospital name
  description: string; // address / extra info
  requestedAmount?: string;
  date?: string;
  time?: string;
  bloodGroup?: string;
  urgency?: Urgency;
  distanceKm?: number;
  documents?: {
    // 👈 optional docs for detail drawer
    id: string;
    title?: string;
    uri: string; // remote url or local file://
  }[];
};

type Props = {
  className?: string;
  request: RequestInfo;
  onConfirm?: () => void;
  onPress?: () => void; // 👈 new: open bottom drawer
};

export default function RequestCard({ className, request, onConfirm, onPress }: Props) {
  const { t } = useTranslation();

  const handleConfirmPress = () => {
    if (!onConfirm) return;

    Alert.alert(
      t('requestCard.confirmDialog.title'),
      t('requestCard.confirmDialog.message'),
      [
        { text: t('common.actions.cancel'), style: 'cancel' },
        {
          text: t('requestCard.confirmDialog.confirm'),
          style: 'default',
          onPress: () => onConfirm(),
        },
      ],
    );
  };

  return (
    <Pressable onPress={onPress}>
      <ElevatedContainer className={`${className} rounded-2xl bg-white p-4`}>
        {/* Header: hospital + distance */}
        <View className="mb-2">
          <View className="flex-row items-start justify-between">
            <View className="flex-1 pr-3">
              <Text className="text-lg font-semibold text-gray-900">{request.title}</Text>
              <View className="mt-1 flex-row items-center">
                <Ionicons name="location-outline" size={16} color="#6B7280" />
                <Text className="ml-1 text-gray-600" numberOfLines={1}>
                  {request.description}
                </Text>
              </View>
            </View>

            {typeof request.distanceKm === 'number' && (
              <View className="items-end">
                <Text className="text-xs text-gray-400">
                  {t('requestCard.fields.distance')}
                </Text>
                <Text className="text-sm font-semibold text-gray-800">
                  {t('requestCard.distanceValue', {
                    distance: request.distanceKm.toFixed(1),
                  })}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Divider */}
        <View className="my-3 h-px bg-gray-200" />

        {/* Details – simple column layout */}
        <View className="space-y-2">
          {request.requestedAmount && (
            <View>
              <Text className="text-xs text-gray-400">
                {t('requestCard.fields.requestedAmount')}
              </Text>
              <Text className="text-base font-semibold text-gray-800">
                {request.requestedAmount}
              </Text>
            </View>
          )}

          {request.bloodGroup && (
            <View>
              <Text className="text-xs text-gray-400">
                {t('requestCard.fields.bloodGroup')}
              </Text>
              <Text className="text-base font-semibold text-red-600">
                {request.bloodGroup}
              </Text>
            </View>
          )}

          {request.date && (
            <View>
              <Text className="text-xs text-gray-400">
                {t('requestCard.fields.date')}
              </Text>
              <Text className="text-base font-semibold text-gray-800">
                {request.date}
              </Text>
            </View>
          )}

          {request.time && (
            <View>
              <Text className="text-xs text-gray-400">
                {t('requestCard.fields.time')}
              </Text>
              <Text className="text-base font-semibold text-gray-800">
                {request.time}
              </Text>
            </View>
          )}

          {request.urgency && (
            <View className="mt-1">
              <Text className="text-xs text-gray-400">
                {t('requestCard.fields.urgency')}
              </Text>
              <Text
                className={`text-sm font-semibold ${
                  request.urgency === 'High'
                    ? 'text-orange-700'
                    : request.urgency === 'Medium'
                      ? 'text-yellow-700'
                      : 'text-green-700'
                }`}
              >
                {t('requestCard.urgencyValue', { urgency: request.urgency })}
              </Text>
            </View>
          )}
        </View>

        {/* Confirm button */}
        {onConfirm && (
          <View className="mt-4">
            <Button
              className="rounded-full bg-blue-600 py-3"
              onPress={handleConfirmPress}
              title={t('requestCard.confirmButton')}
            ></Button>
          </View>
        )}
      </ElevatedContainer>
    </Pressable>
  );
}
