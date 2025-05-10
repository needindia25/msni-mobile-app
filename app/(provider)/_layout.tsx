import React from 'react';
import { Stack } from 'expo-router';
import { View, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { images, icons } from "@/constants"; // Adjust the import path according to your project structure

const Layout = () => {
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
          className="p-5"
        >
          <Image
            source={icons.backArrow}
            resizeMode="contain"
            className={`w-6 h-6`}
          />
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