import "../global.css";
import React, { useEffect } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import ToastManager from "toastify-react-native";
import { AppStateProvider, useAppState } from "@/providers/AppStateProvider";

function Gate() {
    const router = useRouter();
    const segments = useSegments();
    const { ready, hasOnboarded, isLoggedIn } = useAppState();

    useEffect(() => {
        if (!ready) return;

        const group = segments[0];

        if (!hasOnboarded) {
            if (group !== "(onboarding)") router.replace("/(onboarding)");
            return;
        }

        if (!isLoggedIn) {
            if (group !== "(auth)") router.replace("/(auth)/login");
            return;
        }

        if (group !== "(app)") router.replace("/(app)/(tabs)");
    }, [ready, hasOnboarded, isLoggedIn, segments, router]);

    return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <AppStateProvider>
                <Gate />
                <ToastManager position="top" duration={2500} />
            </AppStateProvider>
        </GestureHandlerRootView>
    );
}

