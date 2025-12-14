import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_HAS_ONBOARDED = "pulseDrop.hasOnboarded";
const STORAGE_TOKEN = "pulseDrop.token";

type AppState = {
    ready: boolean;
    hasOnboarded: boolean;
    isLoggedIn: boolean;
    completeOnboarding: () => Promise<void>;
    setLoggedIn: (v: boolean) => Promise<void>;
};

const Ctx = createContext<AppState | null>(null);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
    const [ready, setReady] = useState(false);
    const [hasOnboarded, setHasOnboarded] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const boot = async () => {
            const onboarded = await AsyncStorage.getItem(STORAGE_HAS_ONBOARDED);
            setHasOnboarded(onboarded === "true");

            const token = await AsyncStorage.getItem(STORAGE_TOKEN);
            setIsLoggedIn(Boolean(token));

            setReady(true);
        };
        boot();
    }, []);

    const completeOnboarding = async () => {
        await AsyncStorage.setItem(STORAGE_HAS_ONBOARDED, "true");
        setHasOnboarded(true); // ✅ updates RootLayout instantly
    };

    const setLoggedIn = async (v: boolean) => {
        if (v) {
            await AsyncStorage.setItem(STORAGE_TOKEN, "dummy"); // replace later
        } else {
            await AsyncStorage.removeItem(STORAGE_TOKEN);
        }
        setIsLoggedIn(v);
    };

    return (
        <Ctx.Provider
            value={{ ready, hasOnboarded, isLoggedIn, completeOnboarding, setLoggedIn }}
        >
            {children}
        </Ctx.Provider>
    );
}

export function useAppState() {
    const ctx = useContext(Ctx);
    if (!ctx) throw new Error("useAppState must be used inside AppStateProvider");
    return ctx;
}
