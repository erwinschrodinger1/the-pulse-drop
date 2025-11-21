// components/AppHeader.tsx

import React from "react";
import { View, Pressable, Text } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

const AppHeader = () => {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    return (
        <View
            className="absolute left-0 right-0 z-50 px-4 flex-row items-center justify-between"
            style={{ paddingTop: insets.top + 8 }}
        >
            <Pressable
                onPress={() => {
                    if (router.canGoBack()) {
                        router.back()
                    }
                }}
                className="w-10 h-10 items-center justify-center"
            >
                <Ionicons name="chevron-back" size={22} color="white" />
            </Pressable>

            <Pressable
                onPress={() => router.push("/profile")}
                className="w-10 h-10 items-center justify-center"
            >
                <Ionicons name="person" size={22} color="white" />
            </Pressable>
        </View>
    );
};

export default AppHeader;
