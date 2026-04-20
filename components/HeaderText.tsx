import { Text } from 'react-native';

export default function HeaderText({ text }: { text: string }) {
  return <Text className="text-center text-3xl font-bold">{text}</Text>;
}
