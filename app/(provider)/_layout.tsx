import React from 'react';
import { Stack } from 'expo-router';
import { View, Image, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from "react-i18next";
import { images, icons } from "@/constants"; // Adjust the import path according to your project structure

const Layout = () => {
  const { t } = useTranslation();
  const router = useRouter();
  return (
    <>
      <View className="w-full flex-row justify-between items-center mt-5 px-5 bg-white pt-2 border-b-2 border-gray-200">
        <Image source={images.HorizontalLogo} className="w-[125px] h-[50px]" />
        <TouchableOpacity
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace("/welcome-page");
            }
          }}
          className="p-5 flex-row items-center"
        >
          <Image
            source={icons.backArrow}
            resizeMode="contain"
            className={`w-6 h-6 mr-1`}
          /> <Text >{t("back")}</Text>
        </TouchableOpacity>
      </View>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="add-property" options={{ headerShown: false }} />
        <Stack.Screen name="property-details" options={{ headerShown: false }} />
        <Stack.Screen name="service-requests" options={{ headerShown: false }} />
        <Stack.Screen name="transactions" options={{ headerShown: false }} />
      </Stack>
    </>
  );
};

export default Layout;