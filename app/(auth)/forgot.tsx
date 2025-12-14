import React, { useState } from "react";
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
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Toast } from "toastify-react-native";

export default function ForgotPasswordScreen() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [focus, setFocus] = useState<"email" | null>(null);

    const handleSendOtp = () => {
        if (!email.trim()) {
            Toast.error("Please enter your email address");
            return;
        }
        // TODO: call backend to send OTP
        Toast.success("OTP sent to your email");

        router.push({
            pathname: "/(auth)/otp",
            params: { from: "forgot", email },
        });
    };

    const inputBase =
        "flex-row items-center bg-gray-50 border rounded-2xl px-4 h-12";
    const inputNormal = "border-gray-200";
    const inputFocused = "border-blue-500";

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
                    <View className="items-center mb-6">
                        <Image
                            source={require("@/assets/logo-with-text.png")}
                            resizeMode="contain"
                            className="w-80 h-80"
                        />
                    </View>

                    <Text className="text-2xl font-semibold text-center text-gray-900">
                        Forget Password
                    </Text>

                    <Text className="text-center text-gray-500 mt-2 mb-6 leading-5 px-2">
                        Don’t worry it happens. Please enter the address associated with your
                        account
                    </Text>

                    {/* Email input */}
                    <View
                        className={`${inputBase} ${focus === "email" ? inputFocused : inputNormal
                            }`}
                    >
                        <Ionicons name="mail-outline" size={20} color="#9CA3AF" />
                        <TextInput
                            value={email}
                            onChangeText={setEmail}
                            placeholder="Email address"
                            placeholderTextColor="#9CA3AF"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            className="flex-1 ml-3 text-gray-900"
                            onFocus={() => setFocus("email")}
                            onBlur={() => setFocus(null)}
                            returnKeyType="done"
                        />
                    </View>

                    {/* Send OTP button */}
                    <Pressable
                        onPress={handleSendOtp}
                        className="h-12 rounded-2xl items-center justify-center mt-6 bg-blue-600"
                    >
                        <Text className="text-white font-semibold text-base">
                            Send OTP
                        </Text>
                    </Pressable>

                    <View className="flex-row justify-center mt-8">
                        <Text className="text-gray-500">You remember your password? </Text>
                        <Pressable onPress={() => router.push("/(auth)/login")} hitSlop={10}>
                            <Text className="text-blue-600 font-semibold">Sign in</Text>
                        </Pressable>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
