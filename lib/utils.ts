import { constants } from "@/constants";
import { fetchAPI } from "./fetch";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { format } from "date-fns";


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

export async function formatDescription(item: any) {
  let descriptions: { [key: string]: any } = {
    "en": item.descriptions,
    "hi": item.descriptions
  };
  try {
    descriptions = JSON.parse(item.descriptions);
  } catch (error) {
    // If parsing fails, just ignore it
  }
  return descriptions;
};

export async function generateOTP(t: any, number: string, optFor: string, type: string = "generate", full_name: string = "") {
  let payload: any = {
    "username": number,
    "otp_for": optFor,
    "full_name": full_name
  };
  if (optFor !== "signup" || full_name === "" || full_name === null || full_name === undefined) {
    delete payload.full_name;
  }
  return await fetchAPI(
    `${constants.API_URL}/otp/${type}/`, t,
    {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    }
  );
}

export const formatDate = (dateString: string, t: any) => {
    if (!dateString) return t("notAvailable");
    const date = new Date(dateString);
    return format(date, "do MMMM yyyy");
};

export const getYearOptions = () => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let i = 0; i < 10; i++) {
    years.push({
      label: `${currentYear - i}`,
      value: currentYear - i,
    });
  }
  return years;
};

export const formatData = (serviceResponse: any) => {
  const options = serviceResponse?.options ?? {};

  return {
    date_updated: serviceResponse["date_updated"] ?? "",
    date_created: serviceResponse["date_created"] ?? "",
    status: serviceResponse["is_active"] ?? false,
    owner_contact: serviceResponse["owner_contact"] ?? "",
    owner_name: serviceResponse["owner_name"] ?? "",
    images:
      (Array.isArray(options.images) && options.images.length > 0) ||
      (Array.isArray(options.projectMap) && options.projectMap.length > 0)
        ? [...(options.images ?? []), ...(options.projectMap ?? [])].filter((image: string) => image !== "")
        : ["/media/no-image-found.png"],

    basicAmenities: Array.isArray(options.basicAmenities)
      ? options.basicAmenities.filter((amenity: string) => amenity !== "None")
      : [],

    additionalAmenities: Array.isArray(options.additionalAmenities)
      ? options.additionalAmenities.filter((amenity: string) => amenity !== "None")
      : [],

    sourceOfWater: options.sourceOfWater
      ? typeof options.sourceOfWater === "string"
        ? [options.sourceOfWater]
        : options.sourceOfWater
      : [],

    housingType: options.housingType
      ? typeof options.housingType === "string"
        ? [options.housingType]
        : options.housingType
      : [],

    numberOfBathRooms: options.numberOfBathRooms
      ? typeof options.numberOfBathRooms === "string" || typeof options.numberOfBathRooms === "number"
        ? [`${options.numberOfBathRooms} Bath Room${options.numberOfBathRooms > 1 ? "s" : ""}`]
        : options.numberOfBathRooms
      : [],

    otherRoomAvailable: options.otherRoomAvailable && Array.isArray(options.otherRoomAvailable)
      ? options.otherRoomAvailable
      : [],

    isOtherRoomAvailable: options.otherRoomAvailable && Array.isArray(options.otherRoomAvailable) && options.otherRoomAvailable.length > 0,

    distanceForMainRoad: options.distanceForMainRoad ?? 0,
    widthOfTheRoadInFrontOfAProperty: options.widthOfTheRoadInFrontOfAProperty ?? 0,
    municipleBillYear: options.municipleBillYear ?? "",
    tehsilBillYear: options.tehsilBillYear ?? "",
  };
};


export const setItemWithExpiration = async (key: string, value: string) => {
  try {
    const expirationTimestamp = new Date().getTime() + (24 * 60 * 60 * 1000); // 24 hours in milliseconds
    const itemToStore = {
      value: value,
      expiration: expirationTimestamp,
    };
    const jsonValue = JSON.stringify(itemToStore);
    await AsyncStorage.setItem(key, jsonValue);
    console.log(`Item '${key}' set with a 24-hour expiration. : ${jsonValue}`);
  } catch (error) {
    console.error(`Error setting item '${key}':`, error);
  }
};

export const getItemWithExpiration = async (key: string) => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    console.log(`Getting item '${key}' with expiration. ${jsonValue}`);
    if (jsonValue === null) {
      return null;
    }

    const item = JSON.parse(jsonValue);
    const now = new Date().getTime();

    if (now > item.expiration) {
      await AsyncStorage.removeItem(key);
      console.log(`Item '${key}' has expired and was removed.`);
      return null;
    }

    // Item is not expired, return the value
    return item.value;
  } catch (error) {
    console.error(`Error getting item '${key}':`, error);
    return null;
  }
};