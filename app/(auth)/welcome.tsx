import { router } from "expo-router";
import { useRef, useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Swiper from "react-native-swiper";
import { useTranslation } from "react-i18next"; // Import useTranslation

import CustomButton from "@/components/CustomButton";
import { images } from "@/constants";

const Home = () => {
    const { t } = useTranslation(); // Initialize translation hook
    const swiperRef = useRef<Swiper>(null);
    const [activeIndex, setActiveIndex] = useState(0);

    const onboarding = [
        {
            id: 1,
            title: t("onboarding1Title"), // Use translation key
            description: t("onboarding1Description"), // Use translation key
            image: images.niOnBoarding4,
        },
        {
            id: 2,
            title: t("onboarding2Title"), // Use translation key
            description: t("onboarding2Description"), // Use translation key
            image: images.niOnBoarding3,
        },
    ];

    const isLastSlide = activeIndex === onboarding.length - 1;

    return (
        // <SafeAreaView className="flex h-full items-center justify-between bg-white">
        <>
            <View className="flex-1 bg-white">
                <View className="w-full flex-row justify-between items-center mt-5 px-5">
                    <Image source={images.HorizontalLogo} className="w-[120px] h-[45px]" />
                    <TouchableOpacity
                        onPress={() => {
                            router.replace("/(auth)/sign-in");
                        }}
                        className="p-5"
                    >
                        <Text className="text-black text-md font-JakartaBold">{t("skip")}</Text>
                    </TouchableOpacity>
                </View>
                <Swiper
                    ref={swiperRef}
                    loop={false}
                    dot={
                        <View className="w-[32px] h-[4px] mx-1 bg-[#E2E8F0] rounded-full" />
                    }
                    activeDot={
                        <View className="w-[32px] h-[4px] mx-1 bg-[#0286FF] rounded-full" />
                    }
                    onIndexChanged={(index) => setActiveIndex(index)}
                >
                    {onboarding.map((item) => (
                        <View key={item.id} className="flex items-center justify-center p-5">
                            <Image
                                source={item.image}
                                className="w-full h-[300px]"
                                resizeMode="contain"
                            />
                            <View className="flex flex-row items-center justify-center w-full mt-10">
                                <Text className="text-black text-2xl font-bold mx-10 text-center">
                                    {item.title}
                                </Text>
                            </View>
                            <Text className="text-2xl font-JakartaSemiBold text-center text-[#858585] mx-10 mt-3">
                                {item.description}
                            </Text>
                        </View>
                    ))}
                </Swiper>
            </View>

            <CustomButton
                title={isLastSlide ? t("getStarted") : t("next")} // Use translation keys
                onPress={() =>
                    isLastSlide
                        ? router.replace("/(auth)/sign-in")
                        : swiperRef.current?.scrollBy(1)
                }
                className="w-11/12 mt-10 mb-5"
            />
        </>
        // </SafeAreaView>
    );
};

export default Home;