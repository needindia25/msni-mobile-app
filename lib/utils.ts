import { constants } from "@/constants";
import { fetchAPI } from "./fetch";
import AsyncStorage from "@react-native-async-storage/async-storage";


export async function getUserInfo(t: any) {
  const token = await AsyncStorage.getItem('token');
  return await fetchAPI(
    `${constants.API_URL}/auth/user_info/`,
    t,
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    }
  );
}

export async function getUserPlan(t: any) {
  const token = await AsyncStorage.getItem('token');
  return await fetchAPI(
    `${constants.API_URL}/user/plan/`,
    t,
    {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    }
  );
}

export async function formatDescription(item: any)  {
    let descriptions: { [key: string]: any } = {
        "en": item.descriptions
    };
    try {
        descriptions = JSON.parse(item.descriptions);
    } catch (error) {
        // If parsing fails, just ignore it
    }
    return descriptions;
};

export async function generateOTP(t: any, number: string, optFor: string, type: string = "generate") {
  return await fetchAPI(
    `${constants.API_URL}/otp/${type}/`, t,
    {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(
        {
          "username": number,
          "otp_for": optFor
        }
      )
    }
  );
}