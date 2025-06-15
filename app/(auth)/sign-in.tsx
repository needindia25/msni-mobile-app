import { Link, router } from "expo-router";
import { ActivityIndicator, Alert, Image, ScrollView, Text, View } from "react-native";
import React, { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

import CustomButton from "@/components/CustomButton";
import InputField from "@/components/InputField";
import { icons, images, constants } from "@/constants";
import VerificationUsingOTP from "@/components/VerificationUsingOTP";
import { useTranslation } from "react-i18next"; // Import useTranslation
import { fetchAPI } from "@/lib/fetch";
import { generateOTP } from "@/lib/utils";

const SignIn = () => {
  const { t } = useTranslation(); // Initialize translation hook

  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [showVerificationModal, setVerificationModal] = useState(false);

  useEffect(() => {
    const clearAsyncStorage = async () => {
      await AsyncStorage.clear();
    };
    clearAsyncStorage();
  }, []);

  const validateForm = () => {
    if (!username) {
      Alert.alert(t("error"), t("errorPhoneRequired"),
        [
          {
            text: t("ok"),
          },
        ]
      ); // Use translation key
      return false;
    }
    if (!/^\d{10}$/.test(username)) {
      Alert.alert(t("error"), t("errorPhoneInvalid"),
        [
          {
            text: t("ok"),
          },
        ]
      ); // Use translation key
      return false;
    }
    return true;
  };

  const onVerficationPress = async () => {
    if (!validateForm()) {
      return;
    }
    setLoading(true);
    const isValidMobile = await checkMobile(username);
    if (!isValidMobile) {
      setLoading(false);
      return;
    }
    const otpGenerated = await generateOTP(t, username, "signin");
    console.log(otpGenerated)
    setLoading(false);
    if (otpGenerated) {
      setVerificationModal(true);
    }
  };

  const handleLogin = async (enterdOTP: string) => {
    setLoading(true);
    setVerificationModal(false);
    try {
      const response = await fetchAPI(`${constants.API_URL}/otp/verify/`, t, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: username, otp_for: "signin", otp: enterdOTP }),
      });

      if (response === null || response === undefined) {
        setVerificationModal(true);
        setLoading(false);
        return;
      }
      console.log("Data:", response); // Log the parsed data
      const { refresh, access, user_info } = response;

      if (!refresh || !access || !user_info) {
        Alert.alert(t("error"), t("unexpectedResponse"),
          [
            {
              text: t("ok"),
            },
          ]
        );
        setLoading(false);
        return;
      }

      // Store tokens and user info
      await AsyncStorage.multiSet([
        ["token", access],
        ["refresh", refresh],
        ["user_info", JSON.stringify(user_info)],
      ]);
      router.replace("/welcome-page");
    } catch (err) {
      Alert.alert(t("error"), t("loginFailed"),
        [
          {
            text: t("ok"),
          },
        ]
      );
      setLoading(false);
    }
  };

  const checkMobile = async (value: any) => {
    if (value.length === 10) {
      try {
        const response = await fetchAPI(
          `${constants.API_URL}/check_user/`, t,
          {
            method: "POST",
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(
              {
                "username": value
              }
            )
          }
        );
        console.log(response);
        if (response === null || response === undefined) {
          return true;
        }
        let success = false;
        if (response.hasOwnProperty("success")) {
          success = response["success"];
        }
        setUsername(value);
        if (success) {
          Alert.alert(t("error"), t("mobileNumberDoesNotRegistered"),
            [
              {
                text: t("ok"),
                onPress: () => {
                  router.push({
                    pathname: "/sign-up",
                    params: {
                      mobileNumber: value.toString()
                    },
                  });
                },
              },
            ]
          );
          return false;
        }
      } catch (error) {
        Alert.alert(t("error"), t("mobileNumberDoesNotRegistered"),
          [
            {
              text: t("ok"),
              onPress: () => {
                router.push({
                  pathname: "/sign-up",
                  params: {
                    mobileNumber: value.toString()
                  },
                });
              },
            },
          ]
        );
        return false;
      }
    }
    return true;
  }

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="flex-1 bg-white">
        <View className="w-full justify-center items-center mt-10">
          <Image source={images.HorizontalLogo} className="z-0 w-[250px] h-[100px]" />
        </View>
        {loading ? (
          <View className="flex-1 justify-center mt-[60%] items-center">
            <ActivityIndicator size="large" color="#00ff00" />
            <Text className="mt-2 text-xl">{t("loading")}</Text>
          </View>
        ) : (
          <>
            {showVerificationModal ? (
              <VerificationUsingOTP
                onPress={(enteredOtp) => handleLogin(enteredOtp)}
                onBack={() => setVerificationModal(false)}
                optFor="signin"
                number={username}
              />
            ) : (
              <>
                <View className="w-full mt-5">
                  <Text className="text-2xl text-black font-JakartaSemiBold bottom-2 left-5">
                    {t("welcome")}
                  </Text>
                </View>

                <View className="p-5">
                  <InputField
                    label={t("phoneRegisteredLabel")} // Use translation key
                    placeholder={t("phoneRegisteredPlaceholder")} // Use translation key
                    icon={icons.phone}
                    keyboardType="phone-pad"
                    textContentType="none"
                    value={username}
                    onChangeText={(value) => setUsername(value)}
                  />
                  <CustomButton
                    title={t("verify")} // Use translation key
                    onPress={onVerficationPress}
                    className="mt-6"
                  />
                  <Link
                    href="/sign-up"
                    className="text-lg text-center text-general-200 mt-10"
                  >
                    {t("noAccount")}{" "}
                    <Text className="text-blue-500">{t("signUp")}</Text>
                  </Link>
                </View>
              </>
            )}
          </>
        )}
      </View>
    </ScrollView>
  );
};

export default SignIn;