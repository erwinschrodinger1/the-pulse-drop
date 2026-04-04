// components/SwipeConfirmButton.tsx
import React from 'react';
import { Text, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-worklets';
import { useTranslation } from 'react-i18next';

export default function SwipeConfirmButton({ onConfirm }: { onConfirm: () => void }) {
  const { t } = useTranslation();
  const translateX = useSharedValue(0);

  const TRACK_WIDTH = 280; // full track
  const THUMB_SIZE = 56; // circle button
  const MAX = TRACK_WIDTH - THUMB_SIZE; // allowed drag
  const TRIGGER = MAX * 0.75;

  // PAN GESTURE (modern API)
  const panGesture = Gesture.Pan()
    .onChange((event) => {
      translateX.value = Math.min(Math.max(event.translationX, 0), MAX);
    })
    .onEnd(() => {
      if (translateX.value >= TRIGGER) {
        // call JS function from UI thread
        runOnJS(onConfirm)();
        translateX.value = withTiming(MAX, { duration: 200 });
      } else {
        translateX.value = withTiming(0, { duration: 200 });
      }
    });

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View className="mt-4 w-full items-center">
      <View
        style={{ width: TRACK_WIDTH, height: THUMB_SIZE }}
        className="justify-center rounded-full bg-blue-100"
      >
        {/* Center Text */}
        <Text className="absolute self-center font-semibold text-blue-700">
          {t('swipeConfirmButton.actions.swipeToConfirm')}
        </Text>

        <GestureDetector gesture={panGesture}>
          <Animated.View
            style={[
              {
                width: THUMB_SIZE,
                height: THUMB_SIZE,
              },
              thumbStyle,
            ]}
            className="items-center justify-center rounded-full bg-blue-600"
          >
            <Text className="font-extrabold text-white">{'>>'}</Text>
          </Animated.View>
        </GestureDetector>
      </View>
    </View>
  );
}
