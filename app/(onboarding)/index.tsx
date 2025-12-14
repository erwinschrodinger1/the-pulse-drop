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
        title: "Find donors fast",
        desc: "Request blood and notify nearby verified donors instantly.",
        image: require("@/assets/cover.png"),
    },
    {
        key: "s2",
        title: "Donate with confidence",
        desc: "See verified requests, hospital details, and required units.",
        image: require("@/assets/cover.png"),
    },
    {
        key: "s3",
        title: "Build your Pulse Score",
        desc: "Track donations and unlock benefits like health & insurance perks.",
        image: require("@/assets/cover.png"),
    },
];

export default function OnboardingScreen() {
    const router = useRouter();
    const listRef = useRef<FlatList<Slide>>(null);
    const [index, setIndex] = useState(0);

    const { completeOnboarding } = useAppState();
    const goToLogin = async () => {
        await completeOnboarding();     // updates RootLayout state
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
            <View className={`px-6 flex-row items-center justify-between ${Platform.OS === "ios" ? "pt-14" : "pt-10"}`}>
                <Pressable onPress={goBack} hitSlop={12} disabled={index === 0}>
                    <View className={`w-10 h-10 rounded-full items-center justify-center ${index === 0 ? "opacity-0" : "bg-gray-100"}`}>
                        <Ionicons name="chevron-back" size={22} color="#111827" />
                    </View>
                </Pressable>

                <Pressable onPress={goToLogin} hitSlop={12}>
                    <Text className="text-gray-500 font-semibold">Skip</Text>
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
                    <View style={{ width }} className="flex-1 px-6 items-center justify-center">
                        {/* Image card */}
                        <View className="w-full rounded-3xl bg-blue-50 border border-blue-100 overflow-hidden items-center justify-center py-8">
                            <Image source={item.image} resizeMode="contain" className="w-72 h-72" />
                        </View>

                        <Text className="text-3xl font-semibold text-gray-900 mt-8 text-center">
                            {item.title}
                        </Text>

                        <Text className="text-gray-500 text-center mt-3 leading-6 px-4">
                            {item.desc}
                        </Text>
                    </View>
                )}
            />

            {/* Bottom controls */}
            <View className="px-6 pb-10">
                {/* Dots */}
                <View className="flex-row justify-center mb-6">
                    {slides.map((_, i) => {
                        const active = i === index;
                        return (
                            <View
                                key={i}
                                className={`${active ? "w-7 bg-blue-600" : "w-2 bg-gray-300"} h-2 rounded-full mx-1`}
                            />
                        );
                    })}
                </View>

                {/* Primary button */}
                <Pressable
                    onPress={goNext}
                    className="h-12 rounded-2xl bg-blue-600 items-center justify-center active:opacity-90"
                >
                    <View className="flex-row items-center">
                        <Text className="text-white font-semibold text-base">
                            {isLast ? "Get Started" : "Next"}
                        </Text>
                        <Ionicons name="arrow-forward" size={18} color="#fff" style={{ marginLeft: 8 }} />
                    </View>
                </Pressable>

                {/* Bottom link */}
                <View className="mt-5 flex-row justify-center">
                    <Text className="text-gray-500">Already have an account? </Text>
                    <Pressable onPress={goToLogin} hitSlop={10}>
                        <Text className="text-blue-600 font-semibold">Sign in</Text>
                    </Pressable>
                </View>
            </View>
        </View>
    );
}

