import { Alert } from "react-native";
import { router } from "expo-router";

export const fetchAPI = async (url: string, t: (key: string) => string, options?: RequestInit) => {
  try {
    const response = await fetch(url, options);
    if (response.status === 401) {
      console.log("fetchAPI: ", response)
      Alert.alert(t("sessionExpired"), t("pleaseLoginAgain"), [
        {
          text: t("ok"),
          onPress: () => router.push(`/(auth)/sign-in`),
        },
      ]);
    }
    if (!response.ok) {
      new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Fetch error:", error);
    throw error;
  }
};
