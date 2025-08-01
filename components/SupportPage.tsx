import { icons } from '@/constants';
import { useFocusEffect, useRouter } from 'expo-router';
import React from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, Image, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next'; // Import useTranslation
import AsyncStorage from '@react-native-async-storage/async-storage';

const SupportPage = () => {
  const { t } = useTranslation(); // Initialize translation hook


  useFocusEffect(
    React.useCallback(() => {
      const resetTab = async () => {
        await AsyncStorage.setItem("selectedTab", "");
      };
      resetTab();
    }, [])
  );

  return (
    // <SafeAreaView className="flex h-full bg-white">
      <View className="flex bg-white p-5">
        <Text className="text-2xl font-bold text-center mb-5">{t("support")}</Text>
        <View className="flex items-start border-gray-500 border rounded-[5px] mb-5 p-5">
          {/* <Text className="text-lg font-semibold text-center mb-3">{t("contactUs")}</Text> */}
          <View className="flex-row justify-center mb-2">
            <Image source={icons.email} className="w-6 h-6 ml-4" />
            <Text className="text-base font-semibold text-center ml-2">
              support@needindia.net
            </Text>
          </View>
          <View className="flex-row justify-center mb-2">
            <Image source={icons.phone} className="w-6 h-6 ml-4" />
            <Text className="text-base font-semibold text-center ml-2">+91 91227 52713</Text>
          </View>
        </View>
      </View>
    // </SafeAreaView>
  );
};

export default SupportPage;