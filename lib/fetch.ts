import { Alert, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
// import DeviceInfo from "react-native-device-info";

export const fetchAPI = async (url: string, t: (key: string) => string, options?: RequestInit) => {
  try {
    // const deviceId = await DeviceInfo.getUniqueId();
    const userInfoString = await AsyncStorage.getItem('user_info');
    const userInfo = userInfoString ? JSON.parse(userInfoString) : null;
    if (options) {
      options.headers = {
        ...options.headers,
        "X-Mobile-App": "true",
        "X-Device-Type": Platform.OS,
        "X-User-Id": userInfo?.user_id || "",
      };
    } else {
      options = {
        headers: {
          "X-Mobile-App": "true",
          "X-Device-Type": Platform.OS,
          "X-User-Id": userInfo?.user_id || "",
        },
      };
    }
    const response = await fetch(url, options);
    if (response.ok) {
      const response_json = await response.json();
      if (response_json.hasOwnProperty("error")) {
        Alert.alert(t("error"), t(response_json["error"]), [
          {
            text: t("ok"),
            onPress: () => { return null },
          },
        ]);
        return null;
      } else if (response_json.hasOwnProperty("warning")) {
        Alert.alert(t("warning"), t(response_json["warning"]), [
          {
            text: t("ok"),
            onPress: () => { return null },
          },
        ]);
        return null;
      } else {
        return response_json
      }
    } else {
      Alert.alert(t("error"), t("somethingWentWrong"), [
        {
          text: t("ok"),
          onPress: () => { return null },
        },
      ]);
      return;
    }
  } catch (error) {
    Alert.alert(t("error"), String(error), [
      {
        text: t("ok"),
        onPress: () => { return null },
      },
    ]);
    return null;
  }
};
