import { useStripe } from "@stripe/stripe-react-native";
import React, { useState } from "react";
import { Alert, Image, Text, View } from "react-native";
import { ReactNativeModal } from "react-native-modal";

import CustomButton from "@/components/CustomButton";
import { constants, images } from "@/constants";
import { fetchAPI } from "@/lib/fetch";
import { PaymentProps } from "@/types/type";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

const Payment = ({
  fullName,
  email,
  amount,
  subscriptionId,
}: PaymentProps) => {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const router = useRouter();
  const [success, setSuccess] = useState<boolean>(false);
  const [userType, setUserType] = useState(1);

  const openPaymentSheet = async () => {
    await initializePaymentSheet();

    const { error } = await presentPaymentSheet();

    if (error) {
      Alert.alert(`Error code: ${error.code}`, error.message);
    } else {
      setSuccess(true);
    }
  };

  const initializePaymentSheet = async () => {
    const { error } = await initPaymentSheet({
      merchantDisplayName: "Example, Inc.",
      intentConfiguration: {
        mode: {
          amount: amount * 100,
          currencyCode: "usd",
        },
        confirmHandler: async (
          paymentMethod,
          shouldSavePaymentMethod,
          intentCreationCallback,
        ) => {
          const { paymentIntent, customer } = await fetchAPI(
            "/(api)/(stripe)/create",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                name: fullName || email.split("@")[0],
                email: email,
                amount: amount,
                paymentMethodId: paymentMethod.id,
              }),
            },
          );

          if (paymentIntent.client_secret) {
            const { result } = await fetchAPI("/(api)/(stripe)/pay", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                payment_method_id: paymentMethod.id,
                payment_intent_id: paymentIntent.id,
                customer_id: customer,
                client_secret: paymentIntent.client_secret,
              }),
            });
            console.log(paymentIntent);
            console.log(result);

            if (result.client_secret) {
              const token = await AsyncStorage.getItem('token');
              const refresh = await AsyncStorage.getItem('refresh');
              const userInfo = await AsyncStorage.getItem('userInfo');
              console.log(`1-userInfo: ${userInfo}`)
              let userInfoJson = userInfo ? JSON.parse(userInfo) : null
              if (!token || !refresh) {
                Alert.alert(t("error"), "No token found. Please log in again.");
                return;
              }
              const response = await fetchAPI(
                `${constants.API_URL}/user/payment`,
                {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                  },
                  body: JSON.stringify(
                    {
                      subscription_id: subscriptionId,
                      options: result
                    }),
                },
              );
              console.log(response);
              console.log("userInfoJson" , userInfoJson);
              if (userInfoJson !== null) {
                setUserType(userInfoJson.user_type_id);
                userInfoJson.has_subscription = true;
                await AsyncStorage.setItem('userInfo', JSON.stringify(userInfoJson));
              }

              intentCreationCallback({
                clientSecret: result.client_secret,
              });
            }
          }
        },
      },
      returnURL: "needindia://choose-subscription",
    });

    if (!error) {
      // setLoading(true);
    }
  };

  return (
    <>
      <CustomButton
        title="Select Subscription"
        className="my-10"
        onPress={openPaymentSheet}
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
