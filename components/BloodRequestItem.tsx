import { Pressable, View, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { t } from 'i18next';
import { BloodRequest } from '../constants/types';

export const BloodRequestItem = ({ item }: { item: BloodRequest }) => {
  const formattedDate = new Date(item.date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <Pressable
      className={`overflow-hidden border-b ${item.urgency === 'high' ? 'border-gray-300 bg-red-50' : 'border-gray-300 bg-white'}`}
    >
      {/* Emergency Tag */}
      {item.urgency === 'high' && (
        <View className="bg-red-600 px-4 py-2">
          <Text className="text-sm font-bold text-white">
            {t('donate.bloodRequestItem.emergency')}
          </Text>
        </View>
      )}

      {/* Main Content */}
      <View className="flex-row items-center justify-between p-4">
        {/* Details - Middle */}
        <View className="flex-1 gap-2">
          {/* Blood Type and Amount Header */}
          <View className="flex-row justify-start gap-12">
            <View>
              <Text className="text-s font-semibold ">
                {t('donate.bloodRequestItem.bloodRequired')}
              </Text>
              <Text className="text-2xl font-bold  text-red-600">{item.bloodType}</Text>
            </View>
            <View>
              <Text className="text-s font-semibold">
                {t('donate.bloodRequestItem.amount')}
              </Text>
              <Text className="text-2xl font-bold text-red-600">
                {item.amount} {t('donate.bloodRequestItem.ml')}
              </Text>
            </View>
          </View>
          {/* Location */}
          <View className="flex-row items-center gap-2">
            <Feather name="map-pin" size={14} color="#1F2937" />
            <Text className="text-lg font-semibold text-gray-900">{item.location}</Text>
          </View>

          {/* Contact Information */}
          <Text className="text-base text-gray-600">
            {t('donate.bloodRequestItem.contact')}:{' '}
            {item.contactName
              ? item.contactName
              : t('donate.bloodRequestItem.notAvailable')}{' '}
            | {t('donate.bloodRequestItem.phone')}:{' '}
            {item.phoneNumbers
              ? item.phoneNumbers.join(', ')
              : t('donate.bloodRequestItem.notAvailable')}
          </Text>

          {/* Date */}
          <Text className="text-sm text-gray-500">{formattedDate}</Text>
        </View>

        {/* Chevron Right - Far Right */}
        <Feather name="chevron-right" size={32} color="#9CA3AF" className="ml-2" />
      </View>
    </Pressable>
  );
};
