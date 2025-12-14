import ElevatedContainer from "@/components/ElevatedContainer"
import { Text, View } from "react-native"

export default function CreditDetail() {
    return <ElevatedContainer className="my-16 mx-6 h-100">

        <Text className="text-2xl font-bold mb-2">Credit Score</Text>

        <Text className="text-gray-700 leading-6">
            Your Pulse Drop Credit Score represents your trust, reliability, and health
            readiness inside the community.{"\n\n"}
            It increases when you:
        </Text>

        <View className="mt-2 ml-3">
            <Text className="text-gray-700">• Donate blood on time at verified centers</Text>
            <Text className="text-gray-700">• Maintain a healthy donor profile</Text>
            <Text className="text-gray-700">• Respond quickly to donation requests</Text>
            <Text className="text-gray-700">• Complete identity & health verification</Text>
        </View>

        <Text className="text-gray-700 leading-6 mt-4">
            A higher score unlocks:
        </Text>

        <View className="mt-2 ml-3">
            <Text className="text-gray-700">• Lower-cost health & life insurance</Text>
            <Text className="text-gray-700">• Faster approval for emergency blood requests</Text>
            <Text className="text-gray-700">• Access to exclusive donor benefits</Text>
        </View>

        <Text className="text-gray-700 leading-6 mt-4">
            The more consistent and reliable you are, the stronger your score becomes —
            helping you, your family, and the entire Pulse Drop network stay protected.
        </Text>
    </ElevatedContainer>
}