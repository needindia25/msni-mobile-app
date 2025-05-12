import React, { useCallback, useState } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { constants, icons, images } from "@/constants";
import { UserInfo } from '@/types/type';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next'; // Import useTranslation
import { fetchAPI } from '@/lib/fetch';
import { getUserInfo } from '@/lib/utils';

const NoSubscription = () => {
    const { t } = useTranslation(); // Initialize translation hook
    const router = useRouter();
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

    const checkAuth = async () => {
        const _userInfo = await getUserInfo(t)
        setUserInfo(_userInfo)
        await AsyncStorage.setItem('user_info', JSON.stringify(_userInfo));
        if (_userInfo && _userInfo.userInfo.has_subscription || _userInfo.plan_id) {
            router.replace(_userInfo.user_type_id === 1 ? "/(seeker)/(tabs)/home" : "/(provider)/(tabs)/services");
        }
    };

    useFocusEffect(
        useCallback(() => {
            checkAuth(); // Run checkAuth every time the screen comes into focus
        }, [])
    );

    return (
        <ScrollView className="flex-1 bg-white">
            <View className="flex-1 bg-white">
                <View className="w-full justify-center items-center mt-10">
                    <Image source={images.HorizontalLogo} className="z-0 w-[250px] h-[100px]" />
                </View>

                <View className="flex-1 items-center justify-center bg-white p-5">
                    <View className="flex-row items-center w-full px-5 mt-5">
                        {/* Back Button */}
                        <TouchableOpacity
                            onPress={() => {
                                if (router.canGoBack()) {
                                    router.back();
                                } else {
                                    router.replace("/welcome-page");
                                }
                            }}
                            className="p-2"
                        >
                            <Image
                                source={icons.backArrow}
                                resizeMode="contain"
                                className="w-6 h-6"
                            />
                        </TouchableOpacity>

                        {/* Lock Icon */}
                        <View className="flex-1 items-center ml-[-30px]">
                            <View className="bg-gray-200 rounded-full p-5 mb-5">
                                <Image
                                    source={icons.lock} // Replace with your icon URL or local image
                                    className="w-12 h-12"
                                />
                            </View>
                        </View>
                    </View>
                    {/* <View className="bg-gray-200 rounded-full p-5 mb-5">
                        <Image
                            source={icons.lock} // Replace with your icon URL or local image
                            className="w-12 h-12"
                        />
                    </View> */}
                    <Text className="text-xl font-bold text-black mb-2">{t("noActiveSubscription")}</Text>
                    <Text className="text-base text-gray-600 text-center mb-10">
                        {t("noSubscriptionMessage")}
                    </Text>
                    <TouchableOpacity
                        className="bg-green-500 py-3 px-10 rounded-full mb-5"
                        onPress={() => router.push("../choose-subscription")}
                    >
                        <Text className="text-white text-lg font-bold">{t("subscribeNow")}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => userInfo?.user_type_id === 1 ? router.push('/(seeker)/(tabs)/home') : router.push('/(provider)/(tabs)/services')}
                    >
                        <Text className="text-lg text-black">{t("subscribeLater")}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
};

export default NoSubscription;