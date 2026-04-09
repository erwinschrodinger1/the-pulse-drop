import { View, Text } from 'react-native';
import { t } from 'i18next';

export default function DonateScreen() {
  return (
    <View className="flex-1 items-center justify-center">
      <Text className="text-xl font-semibold text-gray-900">{t('donate.title')}</Text>
    </View>
  );
}
