// components/ViewModeToggle.tsx
import React, { useEffect, useRef } from 'react';
import { View, Pressable, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Mode = 'list' | 'map';

type Props = {
  className?: string;
  value: Mode;
  onChange: (mode: Mode) => void;
};

export default function ViewModeToggle({ className, value, onChange }: Props) {
  const isList = value === 'list';

  // Animated value for sliding
  const translateX = useRef(new Animated.Value(0)).current;

  // width of each half: 48 * 4 = 192 → half = 96
  const HALF_WIDTH = 96;

  useEffect(() => {
    Animated.timing(translateX, {
      toValue: !isList ? 0 : HALF_WIDTH,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [isList]);

  return (
    <View className={`items-center ${className}`}>
      <View className="relative h-14 w-48 flex-row items-center overflow-hidden rounded-full bg-white">
        <Animated.View
          pointerEvents="none"
          className="absolute bottom-0 top-0 w-1/2 rounded-full bg-blue-600"
          style={{
            transform: [{ translateX }],
          }}
        />

        <Pressable
          className="z-10 flex-1 items-center justify-center"
          onPress={() => onChange('map')}
        >
          <Ionicons name="map" size={24} color={!isList ? '#FFFFFF' : '#000000'} />
        </Pressable>

        <Pressable
          className="z-10 flex-1 items-center justify-center"
          onPress={() => onChange('list')}
        >
          <Ionicons name="list" size={24} color={isList ? '#FFFFFF' : '#000000'} />
        </Pressable>
      </View>
    </View>
  );
}
