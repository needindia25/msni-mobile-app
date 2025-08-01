import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, Alert, Image, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import SubscriptionCard from '@/components/SubscriptionCard';
import { Subscription, UserInfo } from '@/types/type';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchAPI } from '@/lib/fetch';
import { constants, icons, images } from "@/constants";
import { useTranslation } from 'react-i18next'; // Import useTranslation
import { formatDescription } from '@/lib/utils';


const ChooseSubscription = () => {
    const { t, i18n } = useTranslation(); // Initialize translation hook
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [subscriptions, setSubscription] = useState<Subscription[]>([]);
    const { userType } = useLocalSearchParams();

    useEffect(() => {
        const fetchSubscriptions = async () => {
            try {
                const userInfoString = await AsyncStorage.getItem('user_info');
                const userInfo: UserInfo | null = userInfoString ? JSON.parse(userInfoString) : null;
                const token = await AsyncStorage.getItem('token');
                let user_type_id = userInfo?.user_type_id;
                console.log("user_type_id", user_type_id);
                if (userType == "3") {
                    user_type_id = 3;
                }
                const response = await fetchAPI(
                    `${constants.API_URL}/master/subscriotion/${user_type_id}/list`,
                    t,
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`,
                        },
                    }
                );
                if (response) {
                    setSubscription(response);
                }
            } catch (error) {
                setSubscription([]);
                Alert.alert(t("error"), t("subscriptionError"),
                    [
                        {
                            text: t("ok"),
                        },
                    ]
                );
            } finally {
                setLoading(false);
            }
        };
        fetchSubscriptions();
    }, []);

    const [subscriptionPlans, setSubscriptionPlans] = useState<any[]>([]);

    useEffect(() => {
        const prepareSubscriptionPlans = async () => {
            const plans = await Promise.all(
                subscriptions.map(async (subscription) => {
                    const descObj = await formatDescription(subscription);
                    return {
                        id: subscription.id,
                        planName: subscription.title,
                        price: subscription.amount,
                        descriptions: descObj[i18n.language],
                        period: subscription.period,
                        credits: subscription.credits,
                        isPremium: subscription.title.indexOf("Basic") === -1,
                    };
                })
            );
            setSubscriptionPlans(plans);
        };
        if (subscriptions.length > 0) {
            prepareSubscriptionPlans();
        }
    }, [subscriptions, i18n.language]);

    return (
        <View className="flex-1 bg-white">
            <View className="w-full justify-center items-center mt-10">
                <Image source={images.HorizontalLogo} className="z-0 w-[250px] h-[100px]" />
            </View>
            {loading ? (
                <View className="flex-1 justify-center mt-[60%] items-center">
                    <ActivityIndicator size="large" color="#00ff00" />
                    <Text className="mt-2 text-xl">{t("loading")}</Text>
                </View>
            ) : (
                <>
                    <View className="flex-1 bg-white p-5">
                        <View className="flex-row items-center mb-5">
                            <TouchableOpacity
                                onPress={() => router.back()}
                                className="p-5 flex-row items-center"
                            >
                                <Image
                                    source={icons.backArrow}
                                    resizeMode="contain"
                                    className={`w-6 h-6 mr-1`}
                                /> <Text >{t("back")}</Text>
                            </TouchableOpacity>
                            <Text className="text-2xl font-bold text-center flex-1">
                                {t("choosePlan")}
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
                                    period={item.period}
                                    descriptions={item.descriptions}
                                    credits={item.credits}
                                    isPremium={item.isPremium}
                                />
                            )}
                        />
                    </View>
                </>
            )}
        </View>
    );
};

export default ChooseSubscription;