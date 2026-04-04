import { Link, Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { Text, View } from 'react-native';

import { Container } from '@/components/Container';

export default function NotFoundScreen() {
  const { t } = useTranslation();

  return (
    <View className={styles.container}>
      <Stack.Screen options={{ title: t('notFound.title') }} />
      <Container>
        <Text className={styles.title}>{t('notFound.message')}</Text>
        <Link href="/" className={styles.link}>
          <Text className={styles.linkText}>{t('notFound.goHome')}</Text>
        </Link>
      </Container>
    </View>
  );
}

const styles = {
  container: `flex flex-1 bg-white`,
  title: `text-xl font-bold`,
  link: `mt-4 pt-4`,
  linkText: `text-base text-[#2e78b7]`,
};
