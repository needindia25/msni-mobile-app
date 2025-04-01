import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, Alert, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import SubscriptionCard from '@/components/SubscriptionCard';
import { StripeProvider } from "@stripe/stripe-react-native";
import { Subscription, UserInfo } from '@/types/type';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchAPI } from '@/lib/fetch';
import { constants, icons, images } from "@/constants";
import { useTranslation } from 'react-i18next'; // Import useTranslation

const ChooseSubscription = () => {
    const { t } = useTranslation(); // Initialize translation hook
    const router = useRouter();
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [subscriptions, setSubscription] = useState<Subscription[]>([]);

    useEffect(() => {
        const getUserInfo = async () => {
            const userInfo = await AsyncStorage.getItem('user_info');
            console.log(`userInfo: ${userInfo}`);
            setUserInfo(userInfo ? JSON.parse(userInfo) : null);
        };
        getUserInfo();
    }, []);

    useEffect(() => {
        const fetchSubscriptions = async () => {
            try {
                if (userInfo === null) return;

                const token = await AsyncStorage.getItem('token');
                const refresh = await AsyncStorage.getItem('refresh');
                if (!token || !refresh) {
                    Alert.alert("Error", t("noTokenError")); // Use translation key
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
                );
                console.log(response);
                setSubscription(response);
            } catch (error) {
                setSubscription([]);
                Alert.alert("Error", t("subscriptionError")); // Use translation key
                console.error('Error fetching subscriptions:', error);
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
                        <Text className="mt-2 text-xl">{t("loading")}</Text> {/* Use translation key */}
                    </View>
                ) : (
                    <>
                        <View className="flex-1 bg-white p-5">
                            <View className="flex-row items-center mb-5">
                                <TouchableOpacity
                                    onPress={() => userInfo?.user_type_id === 1 ? router.push('/(seeker)/(tabs)/profile') : router.push('/(provider)/(tabs)/profile')}
                                    className="p-5"
                                >
                                    <Image
                                        source={icons.backArrow}
                                        resizeMode="contain"
                                        className={`w-6 h-6`}
                                    />
                                </TouchableOpacity>
                                <Text className="text-2xl font-bold text-center flex-1">
                                    {t("choosePlan")} {/* Use translation key */}
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