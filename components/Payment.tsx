import React, { useState } from "react";
import { Alert, Image, Text, View } from "react-native";
import { ReactNativeModal } from "react-native-modal";

import CustomButton from "@/components/CustomButton";
import { constants, images } from "@/constants";
import { fetchAPI } from "@/lib/fetch";
import { PaymentProps } from "@/types/type";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useTranslation } from 'react-i18next'; // Import useTranslation

const Payment = ({
  fullName,
  email,
  amount,
  subscriptionId,
}: PaymentProps) => {
  const { t } = useTranslation(); // Initialize translation hook

  const router = useRouter();
  const [success, setSuccess] = useState<boolean>(false);
  const [userType, setUserType] = useState(1);

  return (
    <>
      <CustomButton
        title="Select Subscription"
        className="my-10"
      />

      <ReactNativeModal
        isVisible={success}
        onBackdropPress={() => setSuccess(false)}
      >
        <View className="flex flex-col items-center justify-center bg-white p-7 rounded-2xl">
          <Image source={images.check} className="w-28 h-28 mt-5" />

          <Text className="text-2xl text-center font-JakartaBold mt-5">
            Subscription purchased successfully
          </Text>

          <Text className="text-md text-general-200 font-JakartaRegular text-center mt-3">
            Thank you for your purchase. Your subscription has been successfully
            activated. Enjoy using our app!
          </Text>

          <CustomButton
            title="Back Home"
            onPress={() => {
              setSuccess(false);
              router.push(userType === 1 ? '/(seeker)/(tabs)/home' : '/(provider)/(tabs)/home');
            }}
            className="mt-5"
          />
        </View>
      </ReactNativeModal>
    </>
  );
};

export default Payment;
