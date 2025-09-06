import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, Alert, Linking, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { constants, images } from "@/constants";
import { UserInfo } from '@/types/type';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import CustomButton from '@/components/CustomButton';
import VersionCheck from 'react-native-version-check';
import { fetchAPI } from '@/lib/fetch';
import { getItemWithExpiration, setItemWithExpiration } from '@/lib/utils';

const WelcomePage = () => {
    const { t } = useTranslation();
    const router = useRouter();
    const update_remainder_key = "update_remainder"
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
    const [isMandatory, setIsMandatory] = useState<boolean | null>(null);
    const [storeUrl, setStoreUrl] = useState<string>("");
    const [latestVersion, setLatestVersion] = useState<string | null>(null);
    const checkAppVersion = async () => {
        try {
            setIsMandatory(null);
            setStoreUrl("");
            setLatestVersion(null);
            const response = await fetch(`${constants.API_URL}/latest-version/${Platform.OS}/`);
            if (response.ok) {
                const response_json = await response.json();
                if (response_json.hasOwnProperty("error")) {
                } else if (response_json.hasOwnProperty("warning")) {
                } else {
                    setIsMandatory(response_json.is_mandatory);
                    setStoreUrl(response_json.store_url);
                    setLatestVersion(response_json.version_name);
                }
            }
        } catch (error) {
            console.error('Error checking for app updates:', error);
        }
    };
    const getUserInfo = async () => {
        const userInfoString = await AsyncStorage.getItem('user_info');
        const parsedUserInfo = userInfoString ? JSON.parse(userInfoString) : null;
        setUserInfo(parsedUserInfo);
    };
    useEffect(() => {
        getUserInfo();
        const checkForUpdateApp = async () => {
            await checkAppVersion();
            // await AsyncStorage.removeItem(update_remainder_key);
            const updateRemainder = await getItemWithExpiration(update_remainder_key)
            const currentVersion = VersionCheck.getCurrentVersion();
            if (updateRemainder !== "1" && latestVersion !== null && currentVersion < latestVersion) {
                alertBox();
            }
        }
        checkForUpdateApp();
    }, []);

    const alertBox = () => {
        if (isMandatory) {
            Alert.alert(
                t("updateRequired"),
                t("newVersionAvailable", { version: latestVersion }),
                [
                    {
                        text: t("updateNow"),
                        onPress: async () => {
                            await AsyncStorage.removeItem(update_remainder_key);
                            Linking.openURL(storeUrl);
                        }
                    },
                ],
                { cancelable: false }
            );
        } else {
            Alert.alert(
                t('updateAvailable'),
                t("newVersionAvailable", { version: latestVersion }),
                [

                    {
                        text: t('later'),
                        style: 'cancel',
                        onPress: () => {
                            setItemWithExpiration("update_remainder", "1");
                        },
                    },
                    {
                        text: t('updateNow'),
                        onPress: async () => {
                            await AsyncStorage.removeItem(update_remainder_key);
                            Linking.openURL(storeUrl);
                        }
                    }
                ]
            );
        }
    }

    const handleNext = async (role = 1) => {
        await checkAppVersion();
        const updateRemainder = await getItemWithExpiration(update_remainder_key)
        const currentVersion = VersionCheck.getCurrentVersion();
        if (updateRemainder !== "1" && latestVersion !== null && currentVersion < latestVersion) {
            alertBox();
        } else {
            if (role == 0) {
                console.log("userInfo ", userInfo);
                if (userInfo) {
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
            } else {
                let userInfo = await AsyncStorage.getItem('user_info');
                const parsedUserInfo = userInfo ? JSON.parse(userInfo) : null;
                if (parsedUserInfo) {
                    parsedUserInfo.user_type_id = role;
                    await AsyncStorage.setItem('user_info', JSON.stringify(parsedUserInfo));
                    setUserInfo(parsedUserInfo);
                    router.replace(parsedUserInfo.user_type_id === 1 ? "/(seeker)/(tabs)/home" : "/(provider)/(tabs)/services");
                }
                return;
            }
        }
    }

    return (
        <>
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
                        <Text className="text-lg text-gray-600 text-justify">
                            <Text className="font-bold">नीड इंडिया</Text>, <Text className="font-bold">मल्टी सॉल्यूशन ऑफ नीड इंडिया</Text> कंपनी का <Text className="font-bold">ब्रांड</Text> नाम है, जो आपकी कई मूलभूत और सामाजिक आवश्यकताओं को आसानी से पूरा करने में मदद करता है। यह ऐप सेवाओं के आदान-प्रदान को सरल बनाता है, जिससे उपयोगकर्ता आसानी से मदद दे और ले सकते हैं। यह <Text className="font-bold">भारत के गांवों, शहरों, कस्बों और बाजारों में सभी प्रकार की संपत्तियों के किराये और लीज की सुविधा प्रदान करता है।</Text> एक व्यापक नेटवर्क के माध्यम से, ऐप एकल सब्सक्रिप्शन के तहत सेवाओं के सीकर (खोजकर्ता) और प्रोवाइडर (प्रदाता) को एक साथ जोड़ता है
                        </Text>
                    </View>
                    <View className="my-2 px-5 pb-5 flex-row justify-between">
                        {/* <CustomButton
                            title={t("seeker")}
                            className="w-[45%]"
                            onPress={() => handleNext(1)}
                        >
                        </CustomButton>

                        <CustomButton
                            title={t("provider")}
                            className="w-[45%]"
                            onPress={() => handleNext(2)}
                        >
                        </CustomButton> */}
                        <CustomButton
                            title={t("next")}
                            onPress={() => handleNext(0)}
                            className="w-full"
                        />
                    </View>
                </ScrollView>

                {/* Fixed Bottom Button */}
                {/* <View className="mb-5 px-5 pb-5">
                    <CustomButton
                        title={t("next")}
                        onPress={handleNext}
                        className="w-full"
                    />

                    <CustomButton
                        title={t("next")}
                        onPress={handleNext}
                        className="w-full"
                    />
                </View> */}
            </View>
        </>
    );
};

export default WelcomePage;