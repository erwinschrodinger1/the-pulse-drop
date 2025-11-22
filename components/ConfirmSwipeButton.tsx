// components/SwipeConfirmButton.tsx
import React from "react";
import { Text, View } from "react-native";
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { runOnJS } from "react-native-worklets";


export default function SwipeConfirmButton({ onConfirm }: { onConfirm: () => void }) {
    const translateX = useSharedValue(0);

    const TRACK_WIDTH = 280;        // full track
    const THUMB_SIZE = 56;          // circle button
    const MAX = TRACK_WIDTH - THUMB_SIZE;  // allowed drag
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
                className="bg-blue-100 rounded-full justify-center"
            >
                {/* Center Text */}
                <Text className="absolute self-center text-blue-700 font-semibold">
                    Swipe to Confirm
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
                        className="bg-blue-600 rounded-full items-center justify-center"
                    >
                        <Text className="text-white font-extrabold">{">>"}</Text>
                    </Animated.View>
                </GestureDetector>
            </View>
        </View>
    );
}
