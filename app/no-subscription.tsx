import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { icons, images } from "@/constants";
import { UserInfo } from '@/types/type';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next'; // Import useTranslation

const NoSubscription = () => {
    const { t } = useTranslation(); // Initialize translation hook
    const router = useRouter();
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

    useEffect(() => {
        const checkAuth = async () => {
            const token = await AsyncStorage.getItem('token');
            console.log(`token: ${token}`);

            if (!token) {
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
            }
            if (!!token) {
                const userInfo = await AsyncStorage.getItem('user_info');
                console.log(`userInfo: ${userInfo}`);
                setUserInfo(userInfo ? JSON.parse(userInfo) : null);
            }
        };
        checkAuth();
    }, []);

    return (
        <ScrollView className="flex-1 bg-white">
            <View className="flex-1 bg-white">
                <View className="w-full justify-center items-center mt-10">
                    <Image source={images.HorizontalLogo} className="z-0 w-[250px] h-[100px]" />
                </View>
                <View className="flex-1 items-center justify-center bg-white p-5">
                    <View className="bg-gray-200 rounded-full p-5 mb-5">
                        <Image
                            source={icons.lock} // Replace with your icon URL or local image
                            className="w-12 h-12"
                        />
                    </View>
                    <Text className="text-xl font-bold text-black mb-2">{t("noActiveSubscription")}</Text> {/* Use translation key */}
                    <Text className="text-base text-gray-600 text-center mb-10">
                        {t("noSubscriptionMessage")} {/* Use translation key */}
                    </Text>
                    <TouchableOpacity
                        className="bg-green-500 py-3 px-10 rounded-full mb-5"
                        onPress={() => router.push("../choose-subscription")}
                    >
                        <Text className="text-white text-lg font-bold">{t("subscribeNow")}</Text> {/* Use translation key */}
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => userInfo?.user_type_id === 1 ? router.push('/(seeker)/(tabs)/home') : router.push('/(provider)/(tabs)/home')}
                    >
                        <Text className="text-lg text-black">{t("subscribeLater")}</Text> {/* Use translation key */}
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
};

export default NoSubscription;