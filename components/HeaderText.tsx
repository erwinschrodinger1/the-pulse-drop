import { Text } from 'react-native';

export default function HeaderText({ text, color }: { text: string; color?: string }) {
  return (
    <Text className="text-3xl font-bold" style={{ color: color || '#111' }}>
      {text}
    </Text>
  );
}
