import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, Alert, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { UserInfo } from '@/types/type';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { constants } from '@/constants';
import { fetchAPI } from '@/lib/fetch';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';

const ProfilePage = () => {
    const { t, i18n } = useTranslation();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
    const [plans, setPlan] = useState<any[]>([]);
    const [selectedLanguage, setSelectedLanguage] = useState<string>(i18n.language);
    const [selectedRole, setSelectedRole] = useState(1);

    useFocusEffect(
        React.useCallback(() => {
            const resetTab = async () => {
                await AsyncStorage.setItem("selectedTab", "");
            };
            resetTab();
        }, [])
    );

    const getUserPlan = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            if (!token) {
                Alert.alert(t("sessionExpired"), t("pleaseLoginAgain"), [
                    {
                        text: t("ok"),
                        onPress: () => {
                            router.replace("/(auth)/sign-in");
                        },
                    },
                ]);
                return null;
            }

            const response = await fetchAPI(
                `${constants.API_URL}/user/plan/`,
                t,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                }
            );

            if (!response) {
                console.error("Failed to fetch user plan: Response is null or undefined.");
                return null;
            }

            console.log("User Plan Response: ", response);
            return response;
        } catch (error) {
            console.error("Error fetching user plan:", error);
            Alert.alert(t("error"), t("somethingWentWrong"), [
                {
                    text: t("ok"),
                },
            ]);
            return null;
        }
    };
    const handleSelectedRole = async (role: number) => {
        if (role === selectedRole) return;
        Alert.alert(
            t("switchUser"),
            (role == 1 ? t("seekerSwitchConfirmation") : t("providerSwitchConfirmation")),
            [
                { text: t("cancel"), style: "cancel" },
                {
                    text: t("ok"),
                    style: "destructive",
                    onPress: async () => {
                        let userInfo = await AsyncStorage.getItem('user_info');
                        const parsedUserInfo = userInfo ? JSON.parse(userInfo) : null;
                        if (parsedUserInfo) {
                            parsedUserInfo.user_type_id = role;
                            console.log("parsedUserInfo ", parsedUserInfo)
                            await AsyncStorage.setItem('user_info', JSON.stringify(parsedUserInfo));
                            if (role === 1) {
                                if (parsedUserInfo.has_subscription_initial == true) {
                                    parsedUserInfo.has_subscription = true;
                                    await AsyncStorage.setItem('user_info', JSON.stringify(parsedUserInfo));
                                }
                                router.push('/(seeker)/(tabs)/home');
                            }
                            else if (role === 2) {
                                if (parsedUserInfo.has_subscription == true || parsedUserInfo.has_subscription_initial == true) {
                                    const response = await getUserPlan();
                                    console.log("response ", response)
                                    if (response === null) {
                                        return;
                                    }
                                    if (!(response.credits > response.used)) {
                                        parsedUserInfo.has_subscription = false;
                                        parsedUserInfo.has_subscription_initial = true;
                                        await AsyncStorage.setItem('user_info', JSON.stringify(parsedUserInfo));
                                    }
                                }
                                router.push('/(provider)/(tabs)/home');
                            }
                            setUserInfo(parsedUserInfo);
                        }
                    },
                },
            ]
        );
    }
    useEffect(() => {
        const checkAuth = async () => {
            const userInfo = await AsyncStorage.getItem('user_info');
            console.log("userInfo::::: ", userInfo)
            setUserInfo(userInfo ? JSON.parse(userInfo) : null);
            setSelectedRole(userInfo ? JSON.parse(userInfo).user_type_id : 1);
        };
        const fetchSubscriptions = async () => {
            try {
                const response = await getUserPlan();
                
                console.log("fetchSubscriptions response ", response)
                if (response === null) {
                    return;
                }
                const plans = response?.map((item: any) => ({
                    id: item.id,
                    subscription_id: item.subscription_id,
                    planName: item.title,
                    price: item.amount,
                    description: item.descriptions,
                    period: item.period,
                    credits: item.credits,
                    isPremium: false,
                    has_subscription: item.has_subscription,
                    used: item.used,
                    expiryDate: item.expired_on ? format(new Date(item.expired_on), 'dd-MMM-yyyy hh:mm a') : 'N/A',
                })) || [];
                setPlan(plans);

            } catch (error) {
                setPlan([]);
                Alert.alert(t("error"), t("subscriptionError"),
                    [
                        {
                            text: t("ok"),
                        },
                    ]
                );
                setLoading(false);
                return;
            } finally {
                setLoading(false);
            }
        };
        checkAuth();
        fetchSubscriptions();
    }, []);

    const getInitialURL = (name: string) => {
        let names = name.split(' ');
        names = names.filter((n) => n.length > 0); // Filter out any empty strings
        if (names.length === 0) return "NI"; // Return empty string if no names found
        return names.length > 1 ? names[0][0] + names[1][0] : names[0][0];
    };

    const changeLanguage = async (language: string) => {
        try {
            await AsyncStorage.setItem('language', language); // Save selected language
            i18n.changeLanguage(language); // Change app language
            setSelectedLanguage(language); // Update state
        } catch (error) {
            Alert.alert(t("error"), t("errorSavingLanguagePreference"),
                [
                    {
                        text: t("ok"),
                    },
                ]
            );
            return;
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

                    {/* <View className="flex-row justify-end mb-4">
                        <TouchableOpacity
                            className="bg-transparent"
                            onPress={() => router.push("/transactions")}
                        >
                            <Text className="text-blue-500 text-sm font-bold underline">{t("viewTransactions")}</Text>
                        </TouchableOpacity>
                    </View> */}
                    {plans.length === 1 && (
                        <>
                            <View className={`rounded-lg p-5 mb-5 border border-gray-300`}>
                                <View className="flex-row justify-between mb-3">
                                    <Text className={`text-2xl font-bold text-black`}>{plans[0].planName}</Text>
                                    <Text className={`text-2xl text-blue-500 mb-1`}>
                                        ₹ {plans[0].price}
                                        <Text className={`ml-5 text-base text-gray-600`}> / {plans[0].period} {t("months")}</Text>
                                    </Text>
                                </View>
                                <View className="flex-row justify-between mb-3">
                                    <View className="flex rounded-full px-3 mb-1 py-1 bg-blue-100">
                                        <Text className="text-sm text-blue-500">{plans[0].credits === -1 ? t("unlimitedSearch") : `${plans[0].credits} ${t("services")}`}</Text>
                                    </View>
                                    {(plans[0].credits !== -1) && (
                                        <View className="flex rounded-full px-3 mb-1 py-1 bg-orange-500 items-center">
                                            <Text className="text-sm text-white">{plans[0].used} {t("used")}</Text>
                                        </View>
                                    )}
                                </View>
                                <Text className={`mb-5 text-gray-600}`}>{plans[0].description}</Text>
                                <View className="border border-blue-500 rounded-lg p-3 mt-5">
                                    <Text className="text-center text-blue-500">Expired on : {plans[0].expiryDate}</Text>
                                </View>
                            </View>
                            {(plans[0].has_subscription === false || (plans[0].credits !== -1 && plans[0].used >= plans[0].credits)) && (
                                <View className="items-center bg-yellow-50 rounded-xl p-6 shadow-sm mt-1 mb-1 ">
                                    <Text className="text-xl font-bold text-gray-800 mb-3">
                                        {plans[0].has_subscription === false ? t("noActiveSubscription") : t("creditBalanceExhausted")}
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
                        </>
                    )}

                    {plans.length === 0 && (
                        <View className="items-center bg-yellow-50 rounded-xl p-6 shadow-sm mt-1 mb-1 ">
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
                    <Text className="text-xl font-bold text-center text-gray-800 mb-4 mt-4">
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

export default ProfilePage;