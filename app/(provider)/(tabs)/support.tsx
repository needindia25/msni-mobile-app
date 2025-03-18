import ComingSoon from '@/components/ComingSoon';
import { images } from '@/constants';
import { useRouter } from 'expo-router';
import React from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, Image, ScrollView } from 'react-native';

const Support = () => {

  const router = useRouter();

  return (
    <SafeAreaView className="flex h-full bg-white">
      <ScrollView className="flex-1 bg-white p-5">
        <ComingSoon />
      </ScrollView>
    </SafeAreaView>
  )
  return (
    <SafeAreaView className="flex h-full items-center justify-between bg-white">
      <View className="flex-1 bg-white p-5">
        <Text className="text-2xl font-bold text-center mb-5">Support</Text>
        <View className="items-center border-gray-500 border rounded-[5px] mb-5 p-5">
          <Text className="text-lg text-center mb-3">Please contact</Text>
          <View className="flex-row justify-center mb-2">
            <Text className="text-lg font-semibold">Email :</Text>
            <Text className="text-lg ml-2">support@multisolutionofneedindia.com</Text>
          </View>
          <View className="flex-row justify-center">
            <Text className="text-lg font-semibold">Phone :</Text>
            <Text className="text-lg ml-2">+91 0987654321</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Support;