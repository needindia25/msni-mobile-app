import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, Alert, FlatList, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
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
    const [selectedRole, setSelectedRole] = useState(1); // Track selected language

    useEffect(() => {
        const checkAuth = async () => {
            const userInfo = await AsyncStorage.getItem('user_info');
            setUserInfo(userInfo ? JSON.parse(userInfo) : null);
            setSelectedRole(userInfo ? JSON.parse(userInfo).user_type_id : 1);
            setLoading(false);
        };
        checkAuth();
    }, []);

    const handleSelectedRole = async (role: number) => {
        if (role === selectedRole) return; // No change in role
        Alert.alert(
            t("switchUser"), // Use translation key
            (role == 1 ? t("seekerSwitchConfirmation") : t("providerSwitchConfirmation")), // Use translation key
            [
                { text: t("cancel"), style: "cancel" }, // Use translation key
                {
                    text: t("ok"), // Use translation key
                    style: "destructive",
                    onPress: async () => {
                        let userInfo = await AsyncStorage.getItem('user_info');
                        console.log('user info:', userInfo);
                        const parsedUserInfo = userInfo ? JSON.parse(userInfo) : null;
                        if (parsedUserInfo) {
                            parsedUserInfo.user_type_id = role;
                            setUserInfo(parsedUserInfo);
                            console.log('Updated user info:', parsedUserInfo);
                            await AsyncStorage.setItem('user_info', JSON.stringify(parsedUserInfo));
                            if (role === 1) {
                                router.push('/(seeker)/(tabs)/home');
                            }
                            else if (role === 2) {
                                router.push('/(provider)/(tabs)/home');
                            }
                        }
                    },
                },
            ]
        );
    }
    useEffect(() => {
        const fetchSubscriptions = async () => {
            try {
                if (userInfo === null) return;

                const token = await AsyncStorage.getItem('token');
                if (!token) {
                    Alert.alert(t("sessionExpired"), t("pleaseLoginAgain"),
                        [
                            {
                                text: t("ok"),
                                onPress: () => {
                                    // Perform the action when "OK" is pressed
                                    router.replace("/(auth)/sign-in");
                                },
                            },
                        ]
                    );
                }
                const response = await fetchAPI(
                    `${constants.API_URL}/user/plan`,
                    t,
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
                Alert.alert(t("error"), t("subscriptionError"),
                    [
                        {
                            text: t("ok"),
                        },
                    ]
                ); // Use translation key
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
        <SafeAreaView className="flex-1 bg-white px-4 pt-6">
            {loading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#10b981" />
                </View>
            ) : (
                <ScrollView contentContainerStyle={{ paddingBottom: 30 }} showsVerticalScrollIndicator={false}>
                    {/* Profile Title */}
                    <Text className="text-3xl font-extrabold text-center text-gray-800 mb-6">
                        {userInfo?.user_type_id === 1 ? t("seekerProfile") : t("providerProfile")}
                    </Text>

                    {/* User Info */}
                    <View className="items-center bg-gray-100 rounded-2xl p-5 mb-6 shadow-sm">
                        <View className="bg-green-500 rounded-full w-24 h-24 items-center justify-center mb-3 shadow-md">
                            <Text className="text-3xl text-white font-bold">
                                {userInfo?.full_name ? getInitialURL(userInfo.full_name) : 'NI'}
                            </Text>
                        </View>
                        <Text className="text-xl font-semibold text-gray-900">{userInfo?.full_name}</Text>
                        <Text className="text-gray-600 text-sm">+91 {userInfo?.email.split('@')[0]}</Text>
                        <Text className="text-gray-600 text-sm">{userInfo?.code}</Text>
                        <Text className="text-green-600 text-base mt-1 font-medium">
                            {userInfo?.user_type_id === 1 ? t("seeker") : t("provider")}
                        </Text>
                    </View>
                    {userInfo?.is_both_access && (
                        <>
                            {/* Switch Role Title */}
                            <Text className="text-xl font-bold text-center text-gray-800 mb-4">
                                {t("switchUser")}
                            </Text>

                            {/* Switch Role Options */}
                            <View className="flex-row justify-center mb-6">
                                {[
                                    { code: 1, name: t("seeker") },
                                    { code: 2, name: t("provider") },
                                ].map((role) => (
                                    <TouchableOpacity
                                        key={role.code}
                                        className={`rounded-full px-5 py-3 mx-2 shadow-md ${selectedRole === role.code
                                            ? "bg-green-500"
                                            : "bg-gray-300"
                                            }`}
                                        onPress={() => handleSelectedRole(role.code)}
                                    >
                                        <Text className="text-white font-bold">{role.name}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </>
                    )}
                    {/* Subscription Section */}
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
                        <View className="items-center bg-yellow-50 rounded-xl p-6 shadow-sm mt-6 mb-6 ">
                            <Text className="text-xl font-bold text-gray-800 mb-3">
                                {t("noActiveSubscription")}
                            </Text>
                            <TouchableOpacity
                                className="bg-green-500 px-8 py-3 rounded-full shadow-md"
                                onPress={() => router.push('/choose-subscription')}
                            >
                                <Text className="text-white text-lg font-bold">
                                    {t("subscribeNow")}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Language Selector Title */}
                    <Text className="text-xl font-bold text-center text-gray-800 mb-4">
                        {t("selectLanguage")}
                    </Text>

                    {/* Language Options */}
                    <View className="flex-row justify-center mb-6">
                        {[
                            { code: "en", name: "English" },
                            { code: "hi", name: "हिंदी" },
                        ].map((lang) => (
                            <TouchableOpacity
                                key={lang.code}
                                className={`rounded-full px-5 py-3 mx-2 shadow-md ${selectedLanguage === lang.code
                                    ? "bg-green-500"
                                    : "bg-gray-300"
                                    }`}
                                onPress={() => changeLanguage(lang.code)}
                            >
                                <Text className="text-white font-bold">{lang.name}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                </ScrollView>
            )}
        </SafeAreaView>

    );
};

export default Profile;