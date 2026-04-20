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
    <View
      className={`rounded-lg border border-gray-200 bg-white/80 px-4 py-2 shadow-sm ${className}`}
      {...rest}
    >
      {children}
    </View>
  );
}
