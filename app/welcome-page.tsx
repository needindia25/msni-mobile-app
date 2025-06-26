import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, Alert, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { images } from "@/constants";
import { UserInfo } from '@/types/type';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import CustomButton from '@/components/CustomButton';

const WelcomePage = () => {
    const { t } = useTranslation();
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
        console.log("userInfo ", userInfo);
        if (userInfo) {
            // if (userInfo.has_subscription || userInfo.plan_id) {
            //     router.replace(userInfo.user_type_id === 1 ? "/(seeker)/(tabs)/home" : "/(provider)/(tabs)/services");
            // } else {
            //     router.replace("/no-subscription");
            // }
            router.replace(userInfo.user_type_id === 1 ? "/(seeker)/(tabs)/home" : "/(provider)/(tabs)/services");
        } else {
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
    }

    return (
        <SafeAreaView className="flex h-full bg-white">
            <View className="flex-1">
                {/* Scrollable Content */}
                <ScrollView contentContainerStyle={{ paddingBottom: 20 }} className="flex-grow bg-white mx-5">
                    <View className="w-full justify-center items-center mt-10 mb-5">
                        <Image source={images.HorizontalLogo} className="z-0 w-[250px] h-[100px]" />
                    </View>
                    <View className="py-5 mx-10">
                        <Text className="text-4xl  text-orange-400 text-center mb-5">
                            <Text className="font-bold">Description</Text>
                        </Text>
                        <Text className="text-lg text-gray-600 text-justify mb-10">
                            <Text className="font-bold">Need India</Text> is the <Text className="font-bold">brand</Text> name of <Text className="font-bold">Multi Solution of Need India</Text>, a company dedicated to simplifying multiple basic and social needs. The app facilitates a seamless exchange of services, allowing users to give and receive favors effortlessly. It covers <Text className="font-bold">all types of property rentals and leases across India's villages, cities, towns, and markets</Text>. With a vast network of seekers and providers, the platform brings various services together in a single subscription-based app.
                        </Text>
                        <Text className="text-lg text-gray-600 text-justify mb-10">
                            <Text className="font-bold">नीड इंडिया</Text>, <Text className="font-bold">मल्टी सॉल्यूशन ऑफ नीड इंडिया</Text> कंपनी का <Text className="font-bold">ब्रांड</Text> नाम है, जो आपकी कई मूलभूत और सामाजिक आवश्यकताओं को आसानी से पूरा करने में मदद करता है। यह ऐप सेवाओं के आदान-प्रदान को सरल बनाता है, जिससे उपयोगकर्ता आसानी से मदद दे और ले सकते हैं। यह <Text className="font-bold">भारत के गांवों, शहरों, कस्बों और बाजारों में सभी प्रकार की संपत्तियों के किराये और लीज की सुविधा प्रदान करता है।</Text> एक व्यापक नेटवर्क के माध्यम से, ऐप एकल सब्सक्रिप्शन के तहत सेवाओं के सीकर (खोजकर्ता) और प्रोवाइडर (प्रदाता) को एक साथ जोड़ता है
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