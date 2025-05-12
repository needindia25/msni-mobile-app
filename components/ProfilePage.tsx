import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, Image, Alert, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { UserInfo } from '@/types/type';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { constants, icons, images } from '@/constants';
import { fetchAPI } from '@/lib/fetch';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { getUserPlan } from '@/lib/utils';

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
    useEffect(() => {
        const checkAuth = async () => {
            const userInfo = await AsyncStorage.getItem('user_info');
            console.log("userInfo::::: ", userInfo)
            const parsedUserInfo = userInfo ? JSON.parse(userInfo) : null;
            if (parsedUserInfo) {
                setUserInfo(parsedUserInfo);
                setSelectedRole(parsedUserInfo.user_type_id == 1 ? 1 : 2);
            }
        };
        const fetchSubscriptions = async () => {
            try {
                const response = await getUserPlan(t);
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
    const handleSelectedRole = async (role: number) => {
        if (role === selectedRole) return;
        const userPlan = await getUserPlan(t);
        let isUpgradePlan = true
        if (userPlan.length > 0) {
            isUpgradePlan = userPlan[0].user_type_code !== "B"
        }
        console.log(userPlan, isUpgradePlan)
        Alert.alert(
            t("switchUser"),
            (
                !isUpgradePlan
                    ? (role == 1 ? t("seekerSwitchConfirmation") : t("providerSwitchConfirmation"))
                    : t("switchConfirmation")
            ),
            [
                { text: (!isUpgradePlan ? t("cancel") : t("no")), style: "cancel" },
                {
                    text: (!isUpgradePlan ? t("ok") : t("yes")),
                    style: "destructive",
                    onPress: async () => {
                        if (isUpgradePlan) {
                            router.push({
                                pathname: '/choose-subscription',
                                params: {
                                    userType: 3
                                },
                            });
                            return;
                        }
                        let userInfo = await AsyncStorage.getItem('user_info');
                        const parsedUserInfo = userInfo ? JSON.parse(userInfo) : null;
                        if (parsedUserInfo) {
                            parsedUserInfo.user_type_id = role;
                            await AsyncStorage.setItem('user_info', JSON.stringify(parsedUserInfo));
                            router.push('/welcome-page');
                            setUserInfo(parsedUserInfo);
                        }
                    },
                },
            ]
        );
    }

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

    const handleLogout = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            const refresh = await AsyncStorage.getItem('refresh');
            if (!token || !refresh) {
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
                return;
            }

            Alert.alert(
                t("logout"), // Use translation key
                t("logoutMessage"), // Use translation key
                [
                    { text: t("no"), style: "cancel" }, // Use translation key
                    {
                        text: t("yes"), // Use translation key
                        onPress: async () => {
                            const response = await fetchAPI(`${constants.API_URL}/auth/logout/`, t, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${token}`,
                                },
                                body: JSON.stringify({ refresh: refresh }),
                            });
                            await AsyncStorage.clear();
                            Alert.alert(
                                t("success"),
                                t("logoutSuccess"),
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
                        },
                    },
                ]
            );
        } catch (err) {
            Alert.alert(
                t("error"),
                t("logoutFailed"),
                [
                    {
                        text: t("ok"),
                    },
                ]
            ); // Use translation keys
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
                    <View className="w-full flex-row justify-between items-center mt-2 px-5 bg-white pt-2 mb-5">
                        <Text className="text-2xl font-extrabold text-gray-800">
                            {/* {userInfo?.user_type_id === 1 ? t("seekerProfile") : t("providerProfile")} */}
                            {t("profile")}
                        </Text>

                        <TouchableOpacity
                            onPress={handleLogout}
                            className="flex-row items-center space-x-1"
                        >
                            <Image
                                source={icons.out}
                                resizeMode="contain"
                                className="w-5 h-5"
                            />
                            <Text className="text-lg text-gray-500 ml-2">{t("logout")}</Text>
                        </TouchableOpacity>
                    </View>

                    {/* User Info */}
                    <View className="items-center flex-row justify-center mt-1 mb-5 bg-gray-100 border border-gray-500 rounded-2xl p-5 shadow-sm">
                        <View className="flex-1 p-6 items-end">
                            <View className="bg-green-500 rounded-full w-24 h-24 items-center justify-center mb-3 shadow-md">
                                <Text className="text-3xl text-white font-bold">
                                    {userInfo?.full_name ? getInitialURL(userInfo.full_name) : 'NI'}
                                </Text>
                            </View>
                        </View>
                        <View className="flex-1 p-6 items-start">
                            <Text className="text-xl font-semibold text-gray-900">{userInfo?.full_name}</Text>
                            <Text className="text-gray-600 text-sm">+91 {userInfo?.email.split('@')[0]}</Text>
                            <Text className="text-gray-600 text-sm">{userInfo?.code}</Text>
                            <Text className="text-green-600 text-base mt-1 font-medium">
                                {userInfo?.user_type_id === 1 ? t("seeker") : t("provider")}
                            </Text>
                        </View>
                    </View>

                    {plans.length === 1 && (
                        <>
                            <View className="items-center flex justify-center mt-1 mb-5 bg-gray-100 border border-gray-500 rounded-2xl p-5 shadow-sm">
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
                                            className={`rounded-full px-3 py-3 mx-1 shadow-md ${selectedRole === role.code
                                                ? "bg-green-500"
                                                : "bg-gray-400"
                                                }`}
                                            onPress={() => handleSelectedRole(role.code)}
                                        >
                                            <Text className="text-white font-bold px-2">{role.name}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                            {/* <View className="flex-row justify-end mb-4">
                                <TouchableOpacity
                                    className="bg-transparent"
                                    onPress={() => router.push("/transactions")}
                                >
                                    <Text className="text-blue-500 text-sm font-bold underline">{t("viewTransactions")}</Text>
                                </TouchableOpacity>
                            </View> */}
                            <View className={`rounded-lg p-5 mb-5 bg-gray-100 border border-gray-500 mt-1 `}>
                                <View className="flex-row justify-between mb-3">
                                    <Text className={`text-2xl font-bold text-black`}>{plans[0].planName}</Text>
                                </View>
                                <View className="flex-row justify-between mb-3">
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
                                    <Text className="text-center text-blue-500">Expire on : {plans[0].expiryDate}</Text>
                                </View>
                            </View>
                            {/* {(plans[0].has_subscription === false || (plans[0].credits !== -1 && plans[0].used >= plans[0].credits)) && (
                                <View className="items-center bg-gray-50 border border-gray-500 rounded-xl p-6 shadow-sm mt-1 mb-5 ">
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
                            )} */}
                        </>
                    )}

                    {plans.length === 0 && (
                        <View className="items-center bg-gray-50 border border-gray-500 rounded-xl p-6 shadow-sm mt-1 mb-5 ">
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

                    <View className="items-center flex justify-center mt-1 mb-5 bg-gray-100 border border-gray-500 rounded-2xl p-5 shadow-sm">
                        {/* Language Selector Title */}
                        <Text className="flex text-xl font-bold text-center text-gray-800 mb-4">
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
                                    className={`rounded-full px-3 py-3 mx-1 shadow-md ${selectedLanguage === lang.code
                                        ? "bg-green-500"
                                        : "bg-gray-400"
                                        }`}
                                    onPress={() => changeLanguage(lang.code)}
                                >
                                    <Text className="text-white font-bold px-2">{lang.name}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    <View className="items-center bg-red-100 rounded-2xl p-5 shadow-sm border border-red-500">
                        <View className="flex-row justify-center">
                            <TouchableOpacity
                                className="bg-red-500 px-8 py-3 rounded-full shadow-md"
                                onPress={() => {
                                    Alert.alert(
                                        t("warning"),
                                        t("deleteAccountConfirmation") + " " + t("accountDeletionNote"),
                                        [
                                            {
                                                text: t("cancel"),
                                                style: "cancel",
                                            },
                                            {
                                                text: t("ok"),
                                                style: "destructive",
                                                onPress: async () => {
                                                    try {
                                                        const token = await AsyncStorage.getItem("token");
                                                        if (!token) {
                                                            Alert.alert(t("sessionExpired"), t("pleaseLoginAgain"), [
                                                                {
                                                                    text: t("ok"),
                                                                    onPress: () => router.replace("/(auth)/sign-in"),
                                                                },
                                                            ]);
                                                            return;
                                                        }

                                                        const response = await fetchAPI(
                                                            `${constants.API_URL}/user/account_delete_request/`,
                                                            t,
                                                            {
                                                                method: "get",
                                                                headers: {
                                                                    "Content-Type": "application/json",
                                                                    Authorization: `Bearer ${token}`,
                                                                },
                                                            }
                                                        );
                                                        if (response === null || response === undefined) {
                                                            return;
                                                        }

                                                        Alert.alert(
                                                            t("success"),
                                                            t("accountDeletionMessage"),
                                                            [
                                                                {
                                                                    text: t("ok"),
                                                                    onPress: () => router.replace("/(auth)/sign-in"),
                                                                },
                                                            ]
                                                        );
                                                    } catch (error) {
                                                        console.error("Error deleting account:", error);
                                                        Alert.alert(t("error"), t("somethingWentWrong"));
                                                    }
                                                },
                                            },
                                        ]
                                    );
                                }}
                            >
                                <Text className="text-white text-lg font-bold">{t("deleteAccount")}</Text>
                            </TouchableOpacity>
                        </View>
                        {/* <View className="flex-row justify-center mb-6">
                            <Text className="text-gray-600 text-center mt-3">
                                {t("accountDeletionNote")}
                            </Text>
                        </View> */}
                    </View>
                </ScrollView>
            )}
        </SafeAreaView>

    );
};

export default ProfilePage;