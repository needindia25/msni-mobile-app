import { Alert } from "react-native";
import { router } from "expo-router";

export const fetchAPI = async (url: string, t: (key: string) => string, options?: RequestInit) => {
  try {
    const response = await fetch(url, options);
    console.log("fetchAPI: ", response)
    if (response.status === 401) {
      Alert.alert(t("sessionExpired"), t("pleaseLoginAgain"), [
        {
          text: t("ok"),
          onPress: () => router.push(`/(auth)/sign-in`),
        },
      ]);
    }
    if (!response.ok || response.status === 400) {
      Alert.alert(t("error"), t("somethingWentWrong"), [
        {
          text: t("ok"),
          onPress: () => router.push(`/(auth)/sign-in`),
        },
      ]);
    }
    const response_json =  await response.json();
    console.log("response_json: ", response_json)
    if (response_json.hasOwnProperty("error")) {
      Alert.alert(t("error"), response_json["error"], [
        {
          text: t("ok"),
          onPress: () => {return null},
        },
      ]);
    } else {
      return response_json
    }
  } catch (error) {
    Alert.alert(t("error"), t("somethingWentWrong"), [
      {
        text: t("ok"),
        onPress: () => router.push(`/(auth)/sign-in`),
      },
    ]);
  }
};
