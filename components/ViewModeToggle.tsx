// components/ViewModeToggle.tsx
import React, { useEffect, useMemo, useRef } from 'react';
import { View, Pressable, Animated } from 'react-native';

type ToggleOption<T extends string> = {
  key: T;
  render: (active: boolean) => React.ReactNode;
};

type Props<T extends string> = {
  className?: string;
  value: T;
  onChange: (value: T) => void;
  options: ToggleOption<T>[];
  width?: number;
  height?: number;
  activeColor?: string;
  backgroundColor?: string;
};

export default function ViewModeToggle<T extends string>({
  className = '',
  value,
  onChange,
  options,
  width = 192,
  height = 56,
  activeColor = '#2563EB',
  backgroundColor = '#FFFFFF',
}: Props<T>) {
  const translateX = useRef(new Animated.Value(0)).current;

  const segmentWidth = useMemo(
    () => width / (options.length ?? 1),
    [width, options.length],
  );

  const selectedIndex = useMemo(
    () =>
      Math.max(
        0,
        options.findIndex((option) => option.key === value),
      ),
    [options, value],
  );

  useEffect(() => {
    Animated.timing(translateX, {
      toValue: selectedIndex * segmentWidth,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [selectedIndex, segmentWidth, translateX]);

  return (
    <View className={`items-center ${className}`}>
      <View
        className="relative flex-row items-center overflow-hidden rounded-full"
        style={{
          width,
          height,
          backgroundColor,
        }}
      >
        <Animated.View
          pointerEvents="none"
          className="absolute rounded-full"
          style={{
            width: segmentWidth,
            height,
            backgroundColor: activeColor,
            transform: [{ translateX }],
          }}
        />

        {options.map((option) => {
          const isActive = option.key === value;

          return (
            <Pressable
              key={option.key}
              onPress={() => onChange(option.key)}
              className="z-10 items-center justify-center"
              style={{
                width: segmentWidth,
                height,
              }}
            >
              {option.render(isActive)}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
