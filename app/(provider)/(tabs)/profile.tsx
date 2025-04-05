import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, Alert, FlatList, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Subscription, UserInfo } from '@/types/type';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { constants } from '@/constants';
import { fetchAPI } from '@/lib/fetch';
import SubscriptionCard from '@/components/SubscriptionCard';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next'; // Import useTranslation

const Profile = () => {
    const { t, i18n } = useTranslation(); // Initialize translation hook
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
    const [subscriptions, setSubscription] = useState<Subscription[]>([]);
    const [selectedLanguage, setSelectedLanguage] = useState<string>(i18n.language); // Track selected language

    useEffect(() => {
        const checkAuth = async () => {
            const token = await AsyncStorage.getItem('token');
            if (!!token) {
                const userInfo = await AsyncStorage.getItem('user_info');
                setUserInfo(userInfo ? JSON.parse(userInfo) : null);
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
                    Alert.alert(t("error"), t("noTokenError")); // Use translation key
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
                );
                setSubscription(response);
            } catch (error) {
                setSubscription([]);
                Alert.alert(t("error"), t("subscriptionError")); // Use translation key
                console.error('Error fetching subscriptions:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchSubscriptions();
    }, [userInfo]);

    const getInitialURL = (name: string) => {
        const names = name.split(' ');
        return names.length > 1 ? names[0][0] + names[1][0] : names[0][0];
    };

    const subscriptionPlans = subscriptions.map(subscription => ({
        id: subscription.id,
        planName: subscription.title,
        price: subscription.amount,
        duration: `/ ${subscription.period / 28} months`,
        services: `${subscription.credits} Services`,
        isPremium: false,
        used: 4,
        expiryDate: subscription.expired_on ? format(new Date(subscription.expired_on), 'dd-MMM-yyyy') : 'N/A',
    })) || [];

    const changeLanguage = async (language: string) => {
        try {
            await AsyncStorage.setItem('language', language); // Save selected language
            i18n.changeLanguage(language); // Change app language
            setSelectedLanguage(language); // Update state
        } catch (error) {
            console.error('Error changing language:', error);
        }
    };

    return (
        <SafeAreaView className="flex h-full items-center justify-between bg-white">
            {loading ? (
                <ActivityIndicator size="large" color="#0000ff" />
            ) : (
                <View className="flex-1 w-full bg-white p-5">
                    <Text className="text-2xl font-bold text-center mb-5">{t("profile")}</Text> {/* Use translation key */}

                    <View className="items-center mb-5">
                        <View className="bg-gray-300 rounded-full w-20 h-20 items-center justify-center mb-3">
                            <Text className="text-2xl text-white">{userInfo?.full_name ? getInitialURL(userInfo.full_name) : 'NI'}</Text>
                        </View>
                        <Text className="text-lg font-semibold">{userInfo?.full_name}</Text>
                        <Text className="text-gray-500">+91 {userInfo?.email.split('@')[0]}</Text>
                        <Text className="text-gray-500">{userInfo?.code}</Text>
                        <Text className="text-gray-500">{userInfo?.user_type_id === 1 ? "Seeker":"Provider"}</Text>
                    </View>

                    {/* Language Selector Heading */}
                    <Text className="text-lg font-bold text-center mb-3">{t("selectLanguage")}</Text> {/* Use translation key */}

                    {/* Language Selector */}
                    <View className="flex-row justify-center mb-5">
                        {[
                            { code: "en", name: "English" },
                            { code: "hi", name: "हिंदी" },
                        ].map((lang) => (
                            <TouchableOpacity
                                key={lang.code}
                                className={`rounded-lg p-3 mx-2 ${
                                    selectedLanguage === lang.code ? "bg-green-500" : "bg-gray-300"
                                }`}
                                onPress={() => changeLanguage(lang.code)}
                            >
                                <Text className="text-white font-bold">{lang.name}</Text>
                            </TouchableOpacity>
                        ))}
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
                            <Text className="text-xl font-bold text-black mb-2">{t("noActiveSubscription")}</Text> {/* Use translation key */}
                            <TouchableOpacity
                                className="bg-green-500 py-3 px-10 rounded-full mb-5"
                                onPress={() => router.push('/choose-subscription')}
                            >
                                <Text className="text-white text-lg font-bold">{t("subscribeNow")}</Text> {/* Use translation key */}
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            )}
        </SafeAreaView>
    );
};

export default Profile;