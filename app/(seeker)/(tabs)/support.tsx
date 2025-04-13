import { icons } from '@/constants';
import React from 'react';
import { View, Text, SafeAreaView, Image } from 'react-native';
import { useTranslation } from 'react-i18next'; // Import useTranslation

const Support = () => {
  const { t } = useTranslation(); // Initialize translation hook

  return (
    <SafeAreaView className="flex h-full items-center justify-between bg-white">
      <View className="flex-1 bg-white p-5">
        <Text className="text-2xl font-bold text-center mb-5">{t("support")}</Text> {/* Use translation key */}
        <View className="items-center border-gray-500 border rounded-[5px] mb-5 p-5">
          <Text className="text-lg font-semibold text-center mb-3">{t("contactUs")}</Text> {/* Use translation key */}
          <View className="flex-row items-center justify-center mb-2">
            <Image source={icons.email} className="w-6 h-6 ml-4" />
            <Text className="text-base font-semibold text-center ml-2">
              customercare@multisolutionofneedindia.com
            </Text>
          </View>
          <View className="flex-row items-center justify-center mb-2">
            <Image source={icons.phone} className="w-6 h-6 ml-4" />
            <Text className="text-base font-semibold text-center ml-2">+91 91227 52713</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Support;