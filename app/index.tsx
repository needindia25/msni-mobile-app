import React, { useEffect, useState } from "react";
import { Redirect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ActivityIndicator, View } from "react-native";
import { UserInfo } from "@/types/type";

const Page = () => {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const [token, userInfo] = await Promise.all([
          AsyncStorage.getItem("token"),
          AsyncStorage.getItem("user_info"),
        ]);

        console.log(`token: ${token}`);
        setIsSignedIn(!!token);

        if (!!token) {
          console.log(`userInfo: ${userInfo}`);
          setUserInfo(userInfo ? JSON.parse(userInfo) : null);
        }
      } catch (error) {
        console.error("Error checking authentication:", error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) {
    // Show a loading spinner while checking authentication
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (isSignedIn) {
    if (userInfo && userInfo.has_subscription) {
      console.log(userInfo.user_type_id, typeof userInfo.user_type_id);
      if (userInfo.user_type_id === 1) {
        return <Redirect href="/(seeker)/(tabs)/home" />;
      } else {
        return <Redirect href="/(provider)/(tabs)/home" />;
      }
    } else {
      return <Redirect href="/no-subscription" />;
    }
  }

  return <Redirect href="/(auth)/language" />;
};

export default Page;