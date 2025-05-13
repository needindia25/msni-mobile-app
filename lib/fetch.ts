import { Alert } from "react-native";
import { router } from "expo-router";

export const fetchAPI = async (url: string, t: (key: string) => string, options?: RequestInit) => {
  try {
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
      Alert.alert(t("error"), t("somethingWentWrong") + ": " + response.text, [
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
