// app/(auth)/register.tsx
import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    Pressable,
    KeyboardAvoidingView,
    Platform,
    Image,
    ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Toast } from "toastify-react-native";

export default function RegisterScreen() {
    const router = useRouter();

    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [secure, setSecure] = useState(true);

    const [focus, setFocus] = useState<"name" | "email" | "password" | null>(null);

    const handleRegister = () => {
        if (!fullName.trim() || !email.trim() || !password.trim()) {
            Toast.error("Please fill in full name, email and password");
            return;
        }
        // TODO: call backend register
        Toast.info("Please Verify Email");

        router.push({
            pathname: "/(auth)/otp",
            params: { from: "signup", email },
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
            className="flex-1 bg-white"
        >
            <ScrollView
                className="flex-1 px-6"
                contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                <View className="items-center mb-6">
                    <Image
                        source={require("@/assets/logo-with-text.png")}
                        resizeMode="contain"
                        className="w-80 h-80"
                    />
                </View>

                {/* Title */}
                <Text className="text-3xl font-semibold text-center text-gray-900">
                    Create Account
                </Text>
                <Text className="text-center text-gray-500 mt-2 mb-6 leading-5">
                    Enter your details to continue
                </Text>

                {/* Full name */}
                <View
                    className={`${inputBase} ${focus === "name" ? inputFocused : inputNormal
                        }`}
                >
                    <Ionicons name="person-outline" size={20} color="#9CA3AF" />
                    <TextInput
                        value={fullName}
                        onChangeText={setFullName}
                        placeholder="Full name"
                        placeholderTextColor="#9CA3AF"
                        className="flex-1 ml-3 text-gray-900"
                        onFocus={() => setFocus("name")}
                        onBlur={() => setFocus(null)}
                        returnKeyType="next"
                    />
                </View>

                {/* Email */}
                <View
                    className={`${inputBase} mt-4 ${focus === "email" ? inputFocused : inputNormal
                        }`}
                >
                    <Ionicons name="mail-outline" size={20} color="#9CA3AF" />
                    <TextInput
                        value={email}
                        onChangeText={setEmail}
                        placeholder="Email"
                        placeholderTextColor="#9CA3AF"
                        className="flex-1 ml-3 text-gray-900"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        onFocus={() => setFocus("email")}
                        onBlur={() => setFocus(null)}
                        returnKeyType="next"
                    />
                </View>

                {/* Password */}
                <View
                    className={`${inputBase} mt-4 ${focus === "password" ? inputFocused : inputNormal
                        }`}
                >
                    <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" />
                    <TextInput
                        value={password}
                        onChangeText={setPassword}
                        placeholder="Password"
                        placeholderTextColor="#9CA3AF"
                        secureTextEntry={secure}
                        className="flex-1 ml-3 text-gray-900"
                        onFocus={() => setFocus("password")}
                        onBlur={() => setFocus(null)}
                        returnKeyType="done"
                    />
                    <Pressable
                        onPress={() => setSecure((v) => !v)}
                        hitSlop={12}
                        className="pl-2"
                    >
                        <Ionicons
                            name={secure ? "eye-outline" : "eye-off-outline"}
                            size={20}
                            color="#9CA3AF"
                        />
                    </Pressable>
                </View>

                {/* Register button */}
                <Pressable
                    onPress={handleRegister}
                    className="h-12 rounded-2xl items-center justify-center mt-6 bg-blue-600"
                >
                    <Text className="text-white font-semibold text-base">
                        Create Account
                    </Text>
                </Pressable>

                {/* Link to login */}
                <View className="flex-row justify-center mt-6">
                    <Text className="text-gray-500">Already have an account? </Text>
                    <Pressable onPress={() => router.push("/(auth)/login")} hitSlop={10}>
                        <Text className="text-blue-600 font-semibold">Sign in</Text>
                    </Pressable>
                </View>
            </ScrollView>
        </KeyboardAvoidingView >
    );
}
