import { Link, router } from "expo-router";
import { ActivityIndicator, Alert, Image, ScrollView, Text, View } from "react-native";
import React, { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import CustomButton from "@/components/CustomButton";
import InputField from "@/components/InputField";
import { icons, images, constants } from "@/constants";
import VerificationUsingOTP from "@/components/VerificationUsingOTP";

const SignIn = () => {

  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [showVerificationModal, setVerificationModal] = useState(false);

  const validateForm = () => {
    if (!username) {
      Alert.alert("Error", "Phone number is required");
      return false;
    }
    if (!/^\d{10}$/.test(username)) {
      Alert.alert("Error", "Phone number must be 10 digits");
      return false;
    }
    return true;
  };

  const onVerficationPress = async () => {
    if (!validateForm()) {
      return;
    }
    setVerificationModal(true);
  };

  const handleLogin = async () => {
    setLoading(true);
    setVerificationModal(false);
    try {
      const response = await fetch(`${constants.API_URL}/auth/login/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password: constants.DEFAULT_PASSWORD }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null); // Handle JSON parsing errors
        const errorMessage = errorData?.detail || "Invalid credentials. Please try again.";
        Alert.alert("Error", errorMessage);
        return;
      }

      const data = await response.json(); // Parse response once confirmed it's valid
      const { refresh, access, user_info } = data;

      if (!refresh || !access || !user_info) {
        Alert.alert("Error", "Unexpected response from server.");
        return;
      }

      // Store tokens and user info
      await AsyncStorage.multiSet([
        ["token", access],
        ["refresh", refresh],
        ["user_info", JSON.stringify(user_info)],
      ]);

      // Navigate based on user type and subscription
      if (user_info.has_subscription) {
        router.replace(user_info.user_type_id === 1 ? "/(seeker)/(tabs)/home" : "/(provider)/(tabs)/home");
      } else {
        router.replace("/no-subscription");
      }
    } catch (err) {
      console.error("Login error:", err);
      Alert.alert("Error", "Log in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="flex-1 bg-white">
        {/* <View className="w-full justify-center items-center mt-10"> */}
        {/* <Image source={images.VerticalLogo} className="z-0 w-[200px] h-[120px]" /> */}
        {/* <Image source={require("../../assets/images/vertical-logo-02.png")} className="z-0 w-[300px] h-[250px]" /> */}
        {/* </View> */}
        <View className="w-full justify-center items-center mt-10">
          <Image source={images.HorizontalLogo} className="z-0 w-[250px] h-[100px]" />
        </View>
        {loading ? (
          <View className="flex-1 justify-center mt-[60%] items-center">
            <ActivityIndicator size="large" color="#00ff00" />
            <Text className="mt-2 text-xl">Loading...</Text>
          </View>
        ) : (
          <>
            {
              showVerificationModal ? (
                <VerificationUsingOTP
                  onPress={handleLogin}
                  onBack={() => setVerificationModal(false)}
                  number={username} />
              ) :
                (
                  <>
                    <View className="w-full mt-5">
                      <Text className="text-2xl text-black font-JakartaSemiBold bottom-2 left-5">
                        Welcome to Need India
                      </Text>
                    </View>

                    <View className="p-5">
                      <InputField
                        label="Mobile Number (without +91)"
                        placeholder="Enter Mobile Number"
                        icon={icons.phone}
                        keyboardType="phone-pad"
                        textContentType="none"
                        value={username}
                        onChangeText={(value) => setUsername(value)}
                      />
                      <CustomButton
                        title="Verify"
                        onPress={onVerficationPress}
                        className="mt-6"
                      />
                      <Link
                        href="/sign-up"
                        className="text-lg text-center text-general-200 mt-10"
                      >
                        Don't have an account?{" "}
                        <Text className="text-blue-500">Sign Up</Text>
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
