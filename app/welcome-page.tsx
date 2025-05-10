import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, Alert, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { constants, icons, images } from "@/constants";
import { UserInfo } from '@/types/type';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next'; // Import useTranslation
import { fetchAPI } from '@/lib/fetch';
import CustomButton from '@/components/CustomButton';

const WelcomePage = () => {
    const { t } = useTranslation(); // Initialize translation hook
    const router = useRouter();
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

    useEffect(() => {
        const getUserInfo = async () => {
            const userInfoString = await AsyncStorage.getItem('user_info');
            const parsedUserInfo = userInfoString ? JSON.parse(userInfoString) : null;
            console.log("parsedUserInfo ", parsedUserInfo)
            setUserInfo(parsedUserInfo);
        };
        getUserInfo();
    }, []);

    const handleNext = async () => {
        router.replace("/no-subscription");
        return;
        // if (userInfo) {
        //     if (userInfo.has_subscription) {
        //         router.replace(userInfo.user_type_id === 1 ? "/(seeker)/(tabs)/home" : "/(provider)/(tabs)/home");
        //     } else {
        //         router.replace("/no-subscription");
        //     }
        // } else {
        //     Alert.alert(t("sessionExpired"), t("pleaseLoginAgain"),
        //         [
        //             {
        //                 text: t("ok"),
        //                 onPress: () => {
        //                     router.replace("/(auth)/sign-in");
        //                 },
        //             },
        //         ]
        //     );
        // }
    }

    return (
        <SafeAreaView  className="flex-1 bg-white">
            <View className="flex-1">
                {/* Scrollable Content */}
                <ScrollView contentContainerStyle={{ paddingBottom: 20 }} className="flex-grow bg-white">
                    <View className="w-full justify-center items-center mt-10 mb-10">
                        <Image source={images.HorizontalLogo} className="z-0 w-[250px] h-[100px]" />
                    </View>
                    <View className="px-10 py-5 m-5">
                        <Text className="text-3xl text-gray-600 text-justify mb-10">
                            Need India is a brand name of multi solution of need India company there are easily solve your multiple basically and social requirement. App is only feber you give and take services all types of property rent and lease india's village City town & market and there is large Seekar and provider provides all work on single App with subscription.
                        </Text>
                        <Text className="text-3xl text-gray-600 text-justify mb-10">
                            नीड इंडिया, नीड इंडिया कंपनी के मल्टी सॉल्यूशन का एक ब्रांड नाम है, जो आपकी कई बुनियादी और सामाजिक आवश्यकताओं को आसानी से हल करता है। ऐप केवल फ़ेबर है, आप सभी प्रकार की संपत्ति किराए पर लेते हैं और भारत के गाँव शहर शहर और बाजार में पट्टे देते हैं और बड़ी संख्या में सीकर और प्रदाता सदस्यता के साथ एकल ऐप पर सभी काम प्रदान करते हैं।
                        </Text>
                    </View>
                </ScrollView>

                {/* Fixed Bottom Button */}
                <View className="mb-5 px-5 pb-5">
                    <CustomButton
                        title={t("next")}
                        onPress={handleNext}
                        className="w-full"
                    />
                </View>
            </View>
        </SafeAreaView>
    );
};

export default WelcomePage;