import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { Subscription, UserInfo } from '@/types/type';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { constants, icons } from '@/constants';
import { fetchAPI } from '@/lib/fetch';
import SubscriptionCard from '@/components/SubscriptionCard';
import { format } from 'date-fns';

const Profile = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

    const [subscriptions, setSubscription] = useState<Subscription[]>([]);

    useEffect(() => {
        const checkAuth = async () => {
            const token = await AsyncStorage.getItem('token');
            console.log(`token: ${token}`)
            if (!!token) {
                const userInfo = await AsyncStorage.getItem('user_info');
                console.log(`userInfo: ${userInfo}`)
                setUserInfo(userInfo ? JSON.parse(userInfo) : null)
            }
            setLoading(false);
        };
        checkAuth();
    }, []);

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
                    `${constants.API_URL}/user/plan`,
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

    const getInitialURL = (name: string) => {
        const names = name.split(' ');
        return names.length > 1 ? names[0][0] + names[1][0] : names[0][0];
    }

    const subscriptionPlans = subscriptions.map(subscription => ({
        id: subscription.id,
        planName: subscription.title,
        price: subscription.amount,
        duration: `/ ${subscription.period / 28} months`,
        services: `${subscription.credits} Services`,
        isPremium: false, // subscription.title.indexOf("Basic") === -1,
        used: 4, // subscription.used,
        expiryDate: subscription.expired_on ? format(new Date(subscription.expired_on), 'dd-MMM-yyyy') : 'N/A',
    })) || [];

    console.log("subscriptionPlans", subscriptionPlans);
    return (
        <SafeAreaView className="flex h-full items-center justify-between bg-white">
            {loading ? (
                <ActivityIndicator size="large" color="#0000ff" />
            ) : (
                <>
                    <View className="flex-1 w-full bg-white p-5">
                        <Text className="text-2xl font-bold text-center mb-5">Profile</Text>
                        <View className="items-center mb-5">
                            <View className="bg-gray-300 rounded-full w-20 h-20 items-center justify-center mb-3">
                                <Text className="text-2xl text-white">{userInfo?.full_name ? getInitialURL(userInfo.full_name) : 'NI'}</Text>
                            </View>
                            <Text className="text-lg font-semibold">{userInfo?.full_name}</Text>
                            <Text className="text-gray-500">+91 {userInfo?.email.split('@')[0]}</Text>
                            <Text className="text-gray-500">{userInfo?.code}</Text>
                        </View>
                        {subscriptionPlans.length > 0 ? (
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
                                        used={item.used}
                                        expiryDate={item.expiryDate}
                                    />
                                )}
                            />
                        ) : (
                            <View className="flex-1 items-center justify-center bg-white p-5">
                                <Text className="text-xl font-bold text-black mb-2">No Active Subscription</Text>
                                <TouchableOpacity
                                    className="bg-green-500 py-3 px-10 rounded-full mb-5"
                                    onPress={() => router.push('/choose-subscription')}
                                >
                                    <Text className="text-white text-lg font-bold">Subscribe Now</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </>
            )}
        </SafeAreaView>
    );
};

export default Profile;