import { View, ViewProps } from 'react-native';

type ElevatedContainerProps = ViewProps & {
  children: React.ReactNode;
  className?: string; // optional for NativeWind
};

export default function ElevatedContainer({
  children,
  className = '',
  ...rest
}: ElevatedContainerProps) {
  return (
    <View className={`rounded-lg bg-white p-4 shadow-md ${className}`} {...rest}>
      {children}
    </View>
  );
}
