// components/RequestCard.tsx
import React from "react";
import { View, Text, Alert, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ElevatedContainer from "./ElevatedContainer";
import { Button } from "./Button";

type Urgency = "High" | "Medium" | "Low";

export type RequestInfo = {
    id: number;
    title: string;          // hospital name
    description: string;    // address / extra info
    requestedAmount?: string;
    date?: string;
    time?: string;
    bloodGroup?: string;
    urgency?: Urgency;
    distanceKm?: number;
    documents?: {           // 👈 optional docs for detail drawer
        id: string;
        title?: string;
        uri: string;          // remote url or local file://
    }[];
};

type Props = {
    className?: string;
    request: RequestInfo;
    onConfirm?: () => void;
    onPress?: () => void;   // 👈 new: open bottom drawer
};

export default function RequestCard({
    className,
    request,
    onConfirm,
    onPress,
}: Props) {
    const handleConfirmPress = () => {
        if (!onConfirm) return;

        Alert.alert(
            "Confirm request",
            "Are you sure you want to confirm this blood donation request?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Confirm",
                    style: "default",
                    onPress: () => onConfirm(),
                },
            ]
        );
    };

    return (
        <Pressable onPress={onPress}>
            <ElevatedContainer className={`${className} p-4 rounded-2xl bg-white`}>
                {/* Header: hospital + distance */}
                <View className="mb-2">
                    <View className="flex-row justify-between items-start">
                        <View className="flex-1 pr-3">
                            <Text className="text-lg font-semibold text-gray-900">
                                {request.title}
                            </Text>
                            <View className="flex-row items-center mt-1">
                                <Ionicons name="location-outline" size={16} color="#6B7280" />
                                <Text className="text-gray-600 ml-1" numberOfLines={1}>
                                    {request.description}
                                </Text>
                            </View>
                        </View>

                        {typeof request.distanceKm === "number" && (
                            <View className="items-end">
                                <Text className="text-xs text-gray-400">Distance</Text>
                                <Text className="text-sm font-semibold text-gray-800">
                                    {request.distanceKm.toFixed(1)} km
                                </Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Divider */}
                <View className="h-px bg-gray-200 my-3" />

                {/* Details – simple column layout */}
                <View className="space-y-2">
                    {request.requestedAmount && (
                        <View>
                            <Text className="text-xs text-gray-400">Requested amount</Text>
                            <Text className="text-base font-semibold text-gray-800">
                                {request.requestedAmount}
                            </Text>
                        </View>
                    )}

                    {request.bloodGroup && (
                        <View>
                            <Text className="text-xs text-gray-400">Blood group</Text>
                            <Text className="text-base font-semibold text-red-600">
                                {request.bloodGroup}
                            </Text>
                        </View>
                    )}

                    {request.date && (
                        <View>
                            <Text className="text-xs text-gray-400">Date</Text>
                            <Text className="text-base font-semibold text-gray-800">
                                {request.date}
                            </Text>
                        </View>
                    )}

                    {request.time && (
                        <View>
                            <Text className="text-xs text-gray-400">Time</Text>
                            <Text className="text-base font-semibold text-gray-800">
                                {request.time}
                            </Text>
                        </View>
                    )}

                    {request.urgency && (
                        <View className="mt-1">
                            <Text className="text-xs text-gray-400">Urgency</Text>
                            <Text
                                className={`text-sm font-semibold ${request.urgency === "High"
                                    ? "text-orange-700"
                                    : request.urgency === "Medium"
                                        ? "text-yellow-700"
                                        : "text-green-700"
                                    }`}
                            >
                                {request.urgency} urgency
                            </Text>
                        </View>
                    )}
                </View>

                {/* Confirm button */}
                {onConfirm && (
                    <View className="mt-4">
                        <Button
                            className="bg-blue-600 py-3 rounded-full"
                            onPress={handleConfirmPress}
                            title="Confirm request"
                        >
                        </Button>
                    </View>
                )}
            </ElevatedContainer>
        </Pressable>
    );
}
