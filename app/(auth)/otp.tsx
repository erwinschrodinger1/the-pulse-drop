
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
    View,
    Text,
    TextInput,
    Pressable,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Image,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Toast } from "toastify-react-native";

export default function OtpScreen() {
    const router = useRouter();

    const [digits, setDigits] = useState(["", "", "", "", "", ""]);
    const inputsRef = useRef<Array<TextInput | null>>([]);
    const [seconds, setSeconds] = useState(30);

    const otp = useMemo(() => digits.join(""), [digits]);
    const canVerify = useMemo(() => digits.every((d) => d !== ""), [digits]);

    const { from, email } = useLocalSearchParams<{
        from?: "forgot" | "signup";
        email?: string;
    }>();

    useEffect(() => {
        if (seconds <= 0) return;
        const t = setInterval(() => setSeconds((s) => s - 1), 1000);
        return () => clearInterval(t);
    }, [seconds]);

    const setDigit = (index: number, value: string) => {
        const v = value.replace(/\D/g, ""); // only numbers
        const next = [...digits];

        // handle paste like "123456"
        if (v.length > 1) {
            const pasted = v.slice(0, 6).split("");
            for (let i = 0; i < 6; i++) next[i] = pasted[i] ?? "";
            setDigits(next);
            const lastIndex = Math.min(pasted.length - 1, 5);
            inputsRef.current[lastIndex]?.focus();
            return;
        }

        next[index] = v;
        setDigits(next);

        if (v && index < 5) {
            inputsRef.current[index + 1]?.focus();
        }
    };

    const onKeyPress = (index: number, key: string) => {
        if (key === "Backspace" && digits[index] === "" && index > 0) {
            inputsRef.current[index - 1]?.focus();
            const next = [...digits];
            next[index - 1] = "";
            setDigits(next);
        }
    };

    const handleVerify = () => {
        if (!canVerify) {
            Toast.error("Please enter the 6-digit OTP");
            return;
        }
        // TODO: verify OTP with backend
        Toast.success("OTP verified");
        router.push("/(auth)/reset-password");
    };

    const handleResend = () => {
        if (seconds > 0) return;
        // TODO: call backend resend OTP
        Toast.success("OTP resent");
        setSeconds(30);
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 24 : 0}
            style={{ flex: 1, backgroundColor: "white" }}
        >
            <ScrollView
                className="flex-1 px-6"
                contentContainerStyle={{
                    flexGrow: 1,
                    justifyContent: "center",
                    paddingBottom: 140,
                }}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <View className="w-full max-w-md self-center">
                    {/* Illustration (replace with OTP illustration if you have) */}
                    <View className="items-center mb-6">
                        <Image
                            source={require("@/assets/logo-with-text.png")}
                            resizeMode="contain"
                            className="w-80 h-80"
                        />
                    </View>

                    <Text className="text-2xl font-semibold text-center text-gray-900">
                        Verify OTP
                    </Text>

                    <Text className="text-center text-gray-500 mt-2 mb-6 leading-5 px-2">
                        Enter the 6-digit code we sent to your email.
                    </Text>

                    {/* OTP Boxes */}
                    <View className="flex-row justify-between">
                        {digits.map((d, idx) => (
                            <TextInput
                                key={idx}
                                ref={(r) => (inputsRef.current[idx] = r)}
                                value={d}
                                onChangeText={(v) => setDigit(idx, v)}
                                onKeyPress={({ nativeEvent }) => onKeyPress(idx, nativeEvent.key)}
                                keyboardType="number-pad"
                                returnKeyType="done"
                                maxLength={1}
                                textAlign="center"
                                className={`w-12 h-12 rounded-2xl border text-lg font-semibold text-gray-900 ${d ? "border-blue-500 bg-blue-50" : "border-gray-200 bg-gray-50"
                                    }`}
                            />
                        ))}
                    </View>

                    {/* Resend */}
                    <View className="flex-row justify-center mt-5">
                        <Text className="text-gray-500">
                            Didn’t receive code?{" "}
                        </Text>
                        <Pressable onPress={handleResend} disabled={seconds > 0} hitSlop={10}>
                            <Text
                                className={`font-semibold ${seconds > 0 ? "text-gray-400" : "text-blue-600"
                                    }`}
                            >
                                {seconds > 0 ? `Resend in ${seconds}s` : "Resend OTP"}
                            </Text>
                        </Pressable>
                    </View>

                    {/* Verify button */}
                    <Pressable
                        onPress={handleVerify}
                        className={`h-12 rounded-2xl items-center justify-center mt-6 ${canVerify ? "bg-blue-600" : "bg-blue-300"
                            }`}
                        disabled={!canVerify}
                    >
                        <Text className="text-white font-semibold text-base">Verify</Text>
                    </Pressable>

                    {from === "signup" ? null :
                        < View className="flex-row justify-center mt-8">
                            <Text className="text-gray-500">Wrong email? </Text>
                            <Pressable onPress={() => router.push("/(auth)/forgot")} hitSlop={10}>
                                <Text className="text-blue-600 font-semibold">Change</Text>
                            </Pressable>
                        </View>
                    }
                </View>
            </ScrollView>
        </KeyboardAvoidingView >
    );
}
