// components/BottomNav.tsx
import React from "react";
import { View, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, usePathname } from "expo-router";
import { Colors } from "@/constants/colors";
import { SafeAreaView } from "react-native-safe-area-context";

const TABS = [
    { name: "home", icon: "home", route: "/" },
    { name: "request", icon: "heart-outline", route: "/request" },
    { name: "menu", icon: "grid-outline", route: "/credit-detail" },
    { name: "settings", icon: "settings-outline", route: "/settings" },
];

export default function BottomNav() {
    const router = useRouter();
    const pathname = usePathname();

    return (
        <SafeAreaView className="absolute bottom-2 left-0 right-0 items-center">
            <View className="flex-row items-center">
                {TABS.map((tab, index) => {
                    const isActive = pathname == tab.route;

                    return (
                        <Pressable
                            key={tab.name}
                            onPress={() => router.push(tab.route as any)}
                            className={`mx-1 w-14 h-14 rounded-full items-center justify-center shadow-lg
                ${isActive ? "bg-blue-500" : "bg-white"}`}
                        >
                            <Ionicons
                                name={tab.icon as any}
                                size={22}
                                color={isActive ? "#fff" : Colors.darkTheme.primary}
                            />
                        </Pressable>
                    );
                })}
            </View>
        </SafeAreaView>
    );
}
