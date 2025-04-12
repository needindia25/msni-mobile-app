import { useState, useEffect, useCallback } from "react";
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
    if (!response.ok) {
      new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Fetch error:", error);
    throw error;
  }
};

// export const useFetch = <T>(url: string, options?: RequestInit) => {
//   const [data, setData] = useState<T | null>(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   const fetchData = useCallback(async () => {
//     setLoading(true);
//     setError(null);

//     try {
//       const result = await fetchAPI(url, options);
//       setData(result.data);
//     } catch (err) {
//       setError((err as Error).message);
//     } finally {
//       setLoading(false);
//     }
//   }, [url, options]);

//   useEffect(() => {
//     fetchData();
//   }, [fetchData]);

//   return { data, loading, error, refetch: fetchData };
// };
