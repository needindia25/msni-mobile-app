import { icons } from '@/constants';
import { useRouter } from 'expo-router';
import React from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, Image, ScrollView } from 'react-native';

const Support = () => {

  const router = useRouter();

  return (
    <SafeAreaView className="flex h-full items-center justify-between bg-white">
      <View className="flex-1 bg-white p-5">
        <Text className="text-2xl font-bold text-center mb-5">Support</Text>
        <View className="items-center border-gray-500 border rounded-[5px] mb-5 p-5">
          <Text className="text-lg font-semibold text-center mb-3">Please contact</Text>
          <View className="flex-row items-center justify-center mb-2">
            <Text className="text-lg font-semibold">
              <Image source={icons.email} className="w-6 h-6 ml-4" />
            </Text>
            <Text className="text-base font-semibold text-center">
              support@multisolutionofneedindia.com
            </Text>
          </View>
          <View className="flex-row items-center justify-center mb-2">
            <Text className="text-lg font-semibold">
              <Image source={icons.phone} className="w-6 h-6 ml-4" />
            </Text>
            <Text className="text-base font-semibold text-center"> +91 91227 52713</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Support;