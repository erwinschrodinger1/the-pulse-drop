import React, { useRef, useState } from "react";
import {
    View,
    Text,
    Image,
    Pressable,
    Dimensions,
    FlatList,
    NativeScrollEvent,
    NativeSyntheticEvent,
    Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAppState } from "@/providers/AppStateProvider";

const { width } = Dimensions.get("window");

type Slide = {
    key: string;
    title: string;
    desc: string;
    image: any;
};

const slides: Slide[] = [
    {
        key: "s1",
        title: "Fresh Blood, Real Impact",
        desc: "See verified requests, hospital details, and required units. Every drop counts, every donor saves a life.",
        image: require("@/assets/images/onboarding/screen1-img.png"),
    },
    {
        key: "s2",
        title: "Blood When You Need It",
        desc: "Find blood quickly through real-time availability and nearby donors. No delays, no panic, just fast and reliable help.",
        image: require("@/assets/images/onboarding/screen2-img.png"),
    },
    {
        key: "s3",
        title: "Donate Blood, Get Rewarded",
        desc: "Build Pulse Score. Track donations and unlock benefits like health & insurance perks",
        image: require("@/assets/images/onboarding/screen3-img.png"),
    },
];

export default function OnboardingScreen() {
    const router = useRouter();
    const listRef = useRef<FlatList<Slide>>(null);
    const [index, setIndex] = useState(0);

    const { completeOnboarding } = useAppState();
    const goToLogin = async () => {
        await completeOnboarding(); // updates RootLayout state
        router.replace("/(auth)/login");
    };

    const goNext = () => {
        if (index < slides.length - 1) {
            listRef.current?.scrollToIndex({ index: index + 1, animated: true });
        } else {
            goToLogin();
        }
    };

    const goBack = () => {
        if (index > 0) {
            listRef.current?.scrollToIndex({ index: index - 1, animated: true });
        }
    };

    const onScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
        const i = Math.round(e.nativeEvent.contentOffset.x / width);
        setIndex(i);
    };

    const isLast = index === slides.length - 1;

    return (
        <View className="flex-1 bg-white">
            {/* Top bar */}
            <View
                className={`flex-row items-center justify-between px-6 ${Platform.OS === "ios" ? "pt-14" : "pt-10"}`}>
                <Pressable onPress={goBack} hitSlop={12} disabled={index === 0}>
                    <View
                        className={`h-10 w-10 items-center justify-center rounded-full ${index === 0 ? "opacity-0" : "bg-gray-100"}`}>
                        <Ionicons name="chevron-back" size={22} color="#111827" />
                    </View>
                </Pressable>

                <Pressable onPress={goToLogin} hitSlop={12}>
                    <Text className="font-semibold text-gray-500">Skip</Text>
                </Pressable>
            </View>

            {/* Slides */}
            <FlatList
                ref={listRef}
                data={slides}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                keyExtractor={(item) => item.key}
                onMomentumScrollEnd={onScrollEnd}
                renderItem={({ item }) => (
                    <View style={{ width }} className="flex-1 items-center justify-center px-6">
                        {/* Image card */}
                        <View className="w-full items-center justify-center py-8">
                            <Image source={item.image} resizeMode="contain" className="h-72 w-72" />
                        </View>

                        <Text className="mt-8 text-center text-3xl font-semibold text-gray-900">
                            {item.title}
                        </Text>

                        <Text className="mt-3 px-4 text-center leading-6 text-gray-500">
                            {item.desc}
                        </Text>
                    </View>
                )}
            />

            {/* Bottom controls */}
            <View className="px-6 pb-10">
                {/* Dots */}
                <View className="mb-6 flex-row justify-center">
                    {slides.map((_, i) => {
                        const active = i === index;
                        return (
                            <View
                                key={i}
                                className={`${active ? "w-7 bg-blue-600" : "w-2 bg-gray-300"} mx-1 h-2 rounded-full`}
                            />
                        );
                    })}
                </View>

                {/* Primary button */}
                <Pressable
                    onPress={goNext}
                    className="h-12 items-center justify-center rounded-2xl bg-blue-600 active:opacity-90">
                    <View className="flex-row items-center">
                        <Text className="text-base font-semibold text-white">
                            {isLast ? "Get Started" : "Next"}
                        </Text>
                        <Ionicons
                            name="arrow-forward"
                            size={18}
                            color="#fff"
                            style={{ marginLeft: 8 }}
                        />
                    </View>
                </Pressable>

                {/* Bottom link */}
                <View className="mt-5 flex-row justify-center">
                    <Text className="text-gray-500">Already have an account? </Text>
                    <Pressable onPress={goToLogin} hitSlop={10}>
                        <Text className="font-semibold text-blue-600">Sign in</Text>
                    </Pressable>
                </View>
            </View>
        </View>
    );
}
