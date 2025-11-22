import { View, Image, Text, Dimensions } from 'react-native';
import Entypo from '@expo/vector-icons/Entypo';
import ElevatedContainer from '@/components/ElevatedContainer';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { Link } from 'expo-router';
import { ProgressChart } from 'react-native-chart-kit'

export default function Home() {
    const chartConfig = {
        backgroundColor: "transparent",
        backgroundGradientFromOpacity: 0,
        backgroundGradientToOpacity: 0,
        backgroundGradientFrom: "transparent",
        backgroundGradientTo: "transparent",
        fillShadowGradientFrom: "rgba(234, 8, 8, 1)", // red fill
        color: (opacity = 1) => `rgba(234, 8, 8, ${opacity})`, // red ring
        fillShadowGradientTo: "rgba(234, 8, 8, 0.2)",
        strokeWidth: 16,
    };

    const screenWidth = Dimensions.get('window').width;

    let daysSinceLast = 24;
    let progress = Math.min(daysSinceLast / 90, 1); // assuming 56 days is the max for full ring

    return (
        <View className="flex-1">
            <View className="mt-[-42] items-center">
                <View className="relative w-5/6 h-auto aspect-square">
                    {/* Scribble / profile background */}
                    <Image
                        source={require('@/assets/images/profile-background.png')}
                        className="absolute inset-0 w-full h-full"
                        resizeMode="contain"
                    />

                    {/* Centered circular profile image */}
                    <View className="absolute inset-0 items-center justify-center">
                        <Image
                            source={require('@/assets/images/profile.jpg')}
                            className="w-48 h-48 rounded-full border-[10px] border-white"
                            resizeMode="cover"
                        />
                    </View>

                </View>
            </View>

            <ElevatedContainer className="flex mt-6 mx-8">
                <Link href={"/credit-detail"} className="self-end mb-2">
                    <FontAwesome5 name="info-circle" size={14} color="black" />
                </Link>

                <View className="flex-row justify-between w-full items-center">
                    <Text className="text-4xl font-bold text-red-600">A+ve</Text>
                    <Text className="text-xl font-semibold">32 donations</Text>
                </View>

                <View className="flex-row justify-between w-full items-center">
                    <Text className="text-4xl font-bold">John Doe</Text>
                    <View className='flex-row align-bottom'>
                        <Entypo name="drop" size={24} color="red" />
                        <Text className="text-xl font-semibold text-red-600">1200 credits</Text>
                    </View>
                </View>
            </ElevatedContainer>

            <ElevatedContainer className="flex mt-6 mx-8 justify-center items-center">
                <Text className="text-2xl font-bold">Donation Progress</Text>
                <View className="relative">
                    <ProgressChart
                        data={{ data: [progress] }}
                        width={130}
                        height={130}
                        radius={40}
                        strokeWidth={12}
                        chartConfig={chartConfig}
                        hideLegend={true}
                    />

                    <View className="absolute inset-0 items-center justify-center">
                        <Text className="text-3xl font-semibold text-yellow-600">
                            {daysSinceLast}
                        </Text>
                    </View>
                </View>

                <Text className="text-semi-bold text-xl">
                    Since last donation
                </Text>

                <Text className="text-center text-gray-700 mt-2">
                    Keep up the great work! You're just {90 - daysSinceLast} days away from being eligible to donate again.
                </Text>

            </ElevatedContainer>
        </View >
    );
}
