import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, Alert, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import SubscriptionCard from '@/components/SubscriptionCard';
import { StripeProvider } from "@stripe/stripe-react-native";
import { Subscription, UserInfo } from '@/types/type';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchAPI } from '@/lib/fetch';
import { constants, icons, images } from "@/constants";

const ChooseSubscription = () => {
    const router = useRouter();
    // const API_URL = "http://192.168.0.110:8000/api"
    // console.log("API_URL", process.env.API_URL!)
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getUserInfo = async () => {
            const userInfo = await AsyncStorage.getItem('user_info');
            console.log(`userInfo: ${userInfo}`)
            setUserInfo(userInfo ? JSON.parse(userInfo) : null)
        };
        getUserInfo();
    }, []);

    const [subscriptions, setSubscription] = useState<Subscription[]>([]);

    useEffect(() => {
        const fetchSubscriptions = async () => {
            try {
                if (userInfo === null) return;

                const token = await AsyncStorage.getItem('token');
                const refresh = await AsyncStorage.getItem('refresh');
                if (!token || !refresh) {
                    Alert.alert("Error", "No token found. Please log in again.");
                    return;
                }
                const response = await fetchAPI(
                    `${constants.API_URL}/master/subscriotion/${userInfo.user_type_id}/list`,
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`,
                        },
                    }
                ); // Replace with your API endpoint
                console.log(response);
                setSubscription(response);
            } catch (error) {
                setSubscription([]);
                console.error('Error fetching states:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchSubscriptions();
    }, [userInfo]);

    const subscriptionPlans = subscriptions.map(subscription => ({
        id: subscription.id,
        planName: subscription.title,
        price: subscription.amount,
        duration: `/ ${subscription.period / 28} months`,
        services: `${subscription.credits} Services`,
        isPremium: subscription.title.indexOf("Basic") === -1,
    })) || [];

    return (

        <StripeProvider
            publishableKey={constants.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY!}
            merchantIdentifier="merchant.com.msni"
            urlScheme="myapp"
        >
            <View className="flex-1 bg-white">
                <View className="w-full justify-center items-center mt-10">
                    <Image source={images.HorizontalLogo} className="z-0 w-[250px] h-[100px]" />
                </View>
                {loading ? (
                    <View className="flex-1 justify-center mt-[60%] items-center">
                        <ActivityIndicator size="large" color="#00ff00" />
                        <Text className="mt-2 text-xl">Loading...</Text>
                    </View>
                ) : (
                    <>
                        <View className="flex-1 bg-white p-5">
                            <View className="flex-row items-center mb-5">
                                <TouchableOpacity
                                    // onPress={() => userInfo?.user_type_id === 1 ? router.push('/(seeker)/(tabs)/profile') : router.push('/(provider)/(tabs)/profile')}
                                    className="p-5"
                                >
                                    <Image
                                        source={icons.backArrow}
                                        resizeMode="contain"
                                        className={`w-6 h-6`}
                                    />
                                </TouchableOpacity>
                                <Text className="text-2xl font-bold text-center flex-1">
                                    Choose Your Plan
                                </Text>
                            </View>
                            <FlatList
                                data={subscriptionPlans}
                                keyExtractor={(item) => item.id.toString()}
                                renderItem={({ item }) => (
                                    <SubscriptionCard
                                        subscriptionId={item.id}
                                        planName={item.planName}
                                        price={item.price}
                                        duration={item.duration}
                                        services={item.services}
                                        isPremium={item.isPremium}
                                    />
                                )}
                            />
                        </View>
                    </>
                )}
            </View>
        </StripeProvider>
    );
};

export default ChooseSubscription;