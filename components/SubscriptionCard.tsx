import React, { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { View, Text, Alert, ActivityIndicator } from 'react-native';
import { UserInfo } from '@/types/type';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeModules } from 'react-native';
import CustomButton from './CustomButton';
const { SabPaisaSDK } = NativeModules
import { useTranslation } from 'react-i18next'; // Import useTranslation
import { constants } from '@/constants';
import { fetchAPI } from '@/lib/fetch';

interface SubscriptionCardProps {
    subscriptionId: number;
    planName: string;
    price: number;
    period: number;
    descriptions: string;
    credits: number;
    isPremium?: boolean;
    used?: number;
    expiryDate?: string; // Add expiryDate prop
}

const SubscriptionCard: React.FC<SubscriptionCardProps> = ({
    subscriptionId,
    planName,
    price,
    period,
    descriptions,
    credits,
    isPremium = false,
    used = 0,
    expiryDate = "N/A", // Add expiryDate prop
}) => {
    const { t } = useTranslation(); // Initialize translation hook
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState<String | null>(null);
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

    useEffect(() => {
        const checkAuth = async () => {
            const tokenString = await AsyncStorage.getItem('token');
            if (!tokenString) {
                Alert.alert(t("sessionExpired"), t("pleaseLoginAgain"),
                    [
                        {
                            text: t("ok"),
                            onPress: () => {
                                router.replace("/(auth)/sign-in");
                            },
                        },
                    ]
                );
                return;
            }
            const userInfoString = await AsyncStorage.getItem('user_info');
            const userInfoJson = userInfoString ? JSON.parse(userInfoString) : null
            setUserInfo(userInfoJson)
            setToken(tokenString)
            setLoading(false);
        };
        checkAuth();
    }, []);

    const handleOnPress = async () => {
        setLoading(true)
        try {
            const response: any = await fetchAPI(`${constants.API_URL}/user/transaction/`, t, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    "subscription_id": subscriptionId,
                }),
            });
            if (response === null || response === undefined) {
                return;
            }

            let transaction_code = null;
            if (response.hasOwnProperty("transaction_code")) {
                transaction_code = response["transaction_code"];
            }

            if (!transaction_code) {
                Alert.alert(t("error"), t("unableToCreateTransaction"), [
                    {
                        text: t("ok"),
                        onPress: () => {
                            setLoading(false)
                        },
                    },
                ]);
                return;
            }

            // const mobile = userInfo?.email.split("@")[0];
            SabPaisaSDK.openSabpaisaSDK(
                [price.toString(), userInfo?.full_name, "", userInfo?.username, transaction_code, userInfo?.email, ],
                async (error: any, message: string, clientTxnId: string) => {
                    if (clientTxnId) {
                        try {
                            const paymentResponse: any = await fetchAPI(`${constants.API_URL}/user/payment/`, t, {
                                method: "POST",
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${token}`,
                                },
                                body: JSON.stringify({
                                    "transaction_code": transaction_code,
                                    "client_txn_id": clientTxnId,
                                }),
                            });
                            if (paymentResponse === null || response === undefined) {
                                return;
                            }
                            if (paymentResponse.status === "0000") {
                                console.log("User Info: ", userInfo)
                                if (userInfo) {
                                    console.log("INSIDE IF BLOCK: User Info: ", userInfo)
                                    userInfo.has_subscription = true;
                                    userInfo.plan_id = paymentResponse.plan_id;
                                    await AsyncStorage.setItem("userInfo", JSON.stringify(userInfo));
                                }
                                Alert.alert(t("success"), t("transactionSuccessful"), [
                                    {
                                        text: t("ok"),
                                        onPress: () => {
                                            router.push(userInfo?.user_type_id == 1 ? "/(seeker)/(tabs)/profile" : "/(provider)/(tabs)/profile")
                                        },
                                    },
                                ]);
                            } else {
                                Alert.alert(t("error"), paymentResponse.message, [
                                    {
                                        text: t("ok"),
                                    },
                                ]);
                                setLoading(false)
                                return;
                            }
                        } catch (error) {
                            Alert.alert(t("error"), t("somethingWentWrong"), [
                                {
                                    text: t("ok"),
                                    onPress: () => router.push(`/(auth)/sign-in`),
                                },
                            ]);
                            setLoading(false)
                            return;
                        }
                    }
                }
            );
        } catch (error) {
            Alert.alert(t("error"), t("unableToCreateTransaction"), [
                {
                    text: t("ok"),
                    onPress: () => {
                        setLoading(false)
                    }
                },
            ]);
            setLoading(false)
            return;
        }
    };
    return (
        <>
            {loading ? (
                <View className="flex-1 justify-center mt-[5%] items-center">
                    <ActivityIndicator size="large" color="#00ff00" />
                    <Text className="mt-2 text-base">{t("loading")}</Text>
                </View>
            ) : (
                <View className={`rounded-lg p-5 mb-5 ${isPremium ? 'bg-orange-500' : 'border border-gray-300'}`}>
                    <View className="flex-row justify-between mb-3">
                        <Text className={`text-2xl font-bold ${isPremium ? 'text-white' : 'text-black'}`}>{planName}</Text>
                        <Text className={`text-2xl ${isPremium ? 'text-white' : 'text-blue-500'} mb-1`}>
                            ₹ {price}
                            <Text className={`ml-5 text-base ${isPremium ? 'text-white' : 'text-gray-600'}`}> / {period} {t("months")}</Text>
                        </Text>
                    </View>
                    <View className="flex-row justify-between mb-3">
                        <View className="flex rounded-full px-3 mb-1 py-1 bg-blue-100">
                            <Text className="text-sm text-blue-500">{credits === -1 ? t("unlimitedSearch") : `${credits} ${t("services")}`}</Text>
                        </View>
                        {(expiryDate !== "N/A" && credits !== -1) && (
                            <View className="flex rounded-full px-3 mb-1 py-1 bg-orange-500 items-center">
                                <Text className="text-sm text-white">{used} {t("used")}</Text>
                            </View>
                        )}
                    </View>
                    <Text className={`mb-5 ${isPremium ? 'text-white' : 'text-gray-600'}`}>{descriptions}</Text>
                    {(expiryDate === "N/A" || (credits !== -1 && credits <= used)) && (
                        <CustomButton
                            title={(credits === -1 || credits > used) ? t("selectSubscription") : t("upgradeSubscription")}
                            className="my-2"
                            onPress={() => handleOnPress()}
                        />
                    )}
                    {expiryDate !== "N/A" && (
                        <View className="border border-blue-500 rounded-lg p-3 mt-5">
                            <Text className="text-center text-blue-500">Expired on : {expiryDate}</Text>
                        </View>
                    )}
                </View>
            )}
        </>
    );
};

export default SubscriptionCard;