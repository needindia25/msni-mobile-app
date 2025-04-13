import React from 'react';
import { Stack } from 'expo-router';
import { View, Image, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { images, constants, icons } from "@/constants"; // Adjust the import path according to your project structure
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchAPI } from '@/lib/fetch';
import { useTranslation } from 'react-i18next'; // Import useTranslation

const Layout = () => {
  const router = useRouter();
  const { t } = useTranslation(); // Initialize translation hook

  const handleLogout = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const refresh = await AsyncStorage.getItem('refresh');
      if (!token || !refresh) {
        Alert.alert(t("sessionExpired"), t("pleaseLoginAgain"),
          [
            {
              text: t("ok"),
              onPress: () => {
                // Perform the action when "OK" is pressed
                router.replace("/(auth)/sign-in");
              },
            },
          ]
        );
      }

      const response = await fetchAPI(`${constants.API_URL}/auth/logout/`, t, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ refresh: refresh }),
      });

      console.log(response);
      await AsyncStorage.clear();
      Alert.alert(
        t("success"),
        t("logoutSuccess"),
        [
          {
            text: t("ok"),
            onPress: () => {
              // Perform the action when "OK" is pressed
              router.replace("/(auth)/sign-in");
            },
          },
        ]
      ); // Use translation keys      
    } catch (err) {
      Alert.alert(
        t("error"),
        t("logoutFailed"),
        [
          {
            text: t("ok"),
          },
        ]
      ); // Use translation keys
    }
  };

  return (
    <>
      <View className="w-full flex-row justify-between items-center mt-5 px-5 bg-white pt-2 border-b-2 border-gray-200">
        <Image source={images.HorizontalLogo} className="w-[125px] h-[50px]" />
        <TouchableOpacity
          onPress={handleLogout}
          className="p-5"
        >
          <Image
            source={icons.out}
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
      </Stack>
    </>
  );
};

export default Layout;