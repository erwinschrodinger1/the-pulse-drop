import RequestCard from "@/components/RequestCard";
import ViewModeToggle from "@/components/ViewModeToggle";

import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, ActivityIndicator, Alert, Modal, Pressable, Image } from "react-native";
import { Asset } from "expo-asset";
import * as FileSystem from "expo-file-system/legacy";
import { LeafletView, AnimationType, MapMarker } from "react-native-leaflet-view";
import * as Location from 'expo-location';

const DEFAULT_LOCATION = {
    lat: 27.715489,
    lng: 85.216388,
};

export default function RequestPage() {
    const [status, requestPermission] = Location.useBackgroundPermissions();
    const [location, setLocation] = useState<Location.LocationObject | null>(null);

    type Urgency = "High" | "Medium" | "Low";

    type RequestInfo = {
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

    const [mode, setMode] = useState<"list" | "map">("map");

    const [selectedRequest, setSelectedRequest] = useState<RequestInfo | null>(null);

    const requestData: RequestInfo[] = [
        {
            id: 1,
            title: "Bir Hospital",
            description: "Kanti Path, Kathmandu",
            requestedAmount: "500 mL",
            date: "May 15",
            time: "14:00",
            bloodGroup: "A+",
            urgency: "High",
            distanceKm: 2.7,
            documents: [
                {
                    id: "doc1",
                    title: "Doctor's Note",
                    uri: "https://via.placeholder.com/400x250.png?text=Doctor+Note",
                },
            ],
        },
        // more...
    ];
    const closeDrawer = () => setSelectedRequest(null);



    const [webViewContent, setWebViewContent] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;

        if (!status || !status.granted) {
            requestPermission();
        }

        const loadHtml = async () => {
            try {
                const htmlFile = require("@/assets/leaflet.html");
                const asset = Asset.fromModule(htmlFile);
                await asset.downloadAsync();
                const htmlContent = await FileSystem.readAsStringAsync(asset.localUri!);

                if (mounted) setWebViewContent(htmlContent);

            } catch (err) {
                Alert.alert("Error loading map", JSON.stringify(err));
                console.error(err);
            }
        };

        loadHtml();

        async function getCurrentLocation() {

            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                // setErrorMsg('Permission to access location was denied');
                return;
            }

            let location = await Location.getCurrentPositionAsync({});
            setLocation(location);
        }

        getCurrentLocation();

        console.log("Location:", location);

        return () => {
            mounted = false;
        };
    }, []);

    if (!webViewContent) {
        return (
            <View className="flex-1 items-center justify-center">
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (
        <View className="flex-1 mx-4 pt-4">

            {/* Title & toggle */}
            <View className="flex-row justify-between items-center mb-4">
                <Text className="text-xl font-semibold">Requests</Text>
                <ViewModeToggle value={mode} onChange={setMode} />
            </View>

            {/* Switch view */}
            {mode === "map" ? (
                <View className="flex-1 rounded-2xl overflow-hidden">
                    <LeafletView
                        mapCenterPosition={DEFAULT_LOCATION}
                        source={{ html: webViewContent }}
                        mapMarkers={[

                        ]}
                        ownPositionMarker={{
                            title: "Your Location",
                            animation: { type: AnimationType.WAGGLE, duration: 999999 },
                            icon: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
                            size: {
                                x: 32,
                                y: 32,
                            },
                            position: {
                                lat: DEFAULT_LOCATION.lat,
                                lng: DEFAULT_LOCATION.lng,
                            },

                        }}
                    />
                </View>
            ) : (
                <ScrollView showsVerticalScrollIndicator={false}>

                    {requestData.map((req, index) => (
                        <RequestCard
                            key={index}
                            className="my-2"
                            request={req}
                            onPress={() => setSelectedRequest(req)}
                            onConfirm={() => {
                                console.log("Confirmed");

                            }}
                        />

                    ))}
                    {/* Bottom drawer modal */}
                    <Modal
                        visible={!!selectedRequest}
                        animationType="slide"
                        transparent
                        onRequestClose={closeDrawer}
                    >
                        <View className="flex-1 justify-end bg-black/40">
                            {/* Tap dark area to close */}
                            <Pressable className="flex-1" onPress={closeDrawer} />

                            {/* Drawer content */}
                            <View className="bg-white rounded-t-3xl p-4 max-h-[70%]">
                                {selectedRequest && (
                                    <>
                                        <View className="mb-3">
                                            <View className="flex-row justify-between items-center">
                                                <Text className="text-lg font-semibold text-gray-900">
                                                    {selectedRequest.title}
                                                </Text>
                                                <Text className="text-xs text-gray-400">
                                                    ID: {selectedRequest.id}
                                                </Text>
                                            </View>
                                            <Text className="text-gray-600 mt-1">
                                                {selectedRequest.description}
                                            </Text>
                                        </View>

                                        <View className="h-px bg-gray-200 mb-3" />

                                        {/* Extra info in columns but stacked (simple) */}
                                        <View className="space-y-2 mb-3">
                                            {selectedRequest.requestedAmount && (
                                                <Text className="text-sm text-gray-700">
                                                    <Text className="font-semibold">Requested: </Text>
                                                    {selectedRequest.requestedAmount}
                                                </Text>
                                            )}

                                            {selectedRequest.bloodGroup && (
                                                <Text className="text-sm text-gray-700">
                                                    <Text className="font-semibold">Blood group: </Text>
                                                    {selectedRequest.bloodGroup}
                                                </Text>
                                            )}

                                            {selectedRequest.date && (
                                                <Text className="text-sm text-gray-700">
                                                    <Text className="font-semibold">Requested on: </Text>
                                                    {selectedRequest.date} at {selectedRequest.time}
                                                </Text>
                                            )}

                                            {selectedRequest.urgency && (
                                                <Text className="text-sm text-gray-700">
                                                    <Text className="font-semibold">Urgency: </Text>
                                                    {selectedRequest.urgency}
                                                </Text>
                                            )}
                                        </View>

                                        {/* Documents */}
                                        {selectedRequest.documents && selectedRequest.documents.length > 0 && (
                                            <View className="mt-2">
                                                <Text className="text-sm font-semibold text-gray-900 mb-2">
                                                    Documents
                                                </Text>
                                                {selectedRequest.documents.map((doc) => (
                                                    <View key={doc.id} className="mb-3">
                                                        {doc.title && (
                                                            <Text className="text-xs text-gray-500 mb-1">
                                                                {doc.title}
                                                            </Text>
                                                        )}
                                                        <Image
                                                            source={{ uri: doc.uri }}
                                                            className="w-full h-40 rounded-xl"
                                                            resizeMode="cover"
                                                        />
                                                    </View>
                                                ))}
                                            </View>
                                        )}
                                    </>
                                )}
                            </View>
                        </View>
                    </Modal>

                </ScrollView>
            )}
        </View>
    );
}
