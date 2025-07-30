
import React, { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert, KeyboardAvoidingView, FlatList, Platform, Image, ScrollView } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";

import { constants, icons } from "@/constants";
import { fetchAPI } from "@/lib/fetch";
import { DropdownProps, UserInfo } from "@/types/type";

import CustomDropdown from "@/components/CustomDropdown";
import CustomTextarea from "@/components/CustomTextarea";
import CustomMultiDropdown from "@/components/CustomMultiDropdown";
import ImagePickerComponent from "@/components/ImagePicker";
import GoogleTextInput from "@/components/GoogleTextInput";
import { getStaticData } from "@/constants/staticData";
import { getUserPlan } from '@/lib/utils';
import StepIndicator from "@/components/StepIndicator";

const googlePlacesApiKey = constants.EXPO_PUBLIC_PLACES_API_KEY;

const MultiStepForm = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const { passServiceId } = useLocalSearchParams();
  const totalSteps = 6;

  const [loading, setLoading] = useState(true);
  const [isMapRender, setIsMapRender] = useState(true);
  const [btnLoading, setBtnLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [token, setToken] = useState<string | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  const [formData, setFormData] = useState({
    propertyFor: "Rent",
    title: "",
    propertyType: "",
    description: "",
    latitude: 0,
    longitude: 0,
    address: "",
    location: "",
    state: 0,
    stateName: "",
    district: 0,
    districtName: "",
    city: "",
    zip: "",
    housingType: [] as string[],
    bhkType: "",
    familyPreference: "",
    foodPreference: "",
    rent: 0,
    advance: 0,
    rentNegotiable: "No",
    areaInSize: 0,
    floorNumber: 0,
    numberOfBedRooms: 1,
    numberOfBalconies: 0,
    numberOfBathRooms: [] as string[],
    ageOfProperty: 0,
    furnishing: "",
    parking: "",
    basicAmenities: [] as string[],
    additionalAmenities: [] as string[],
    sourceOfWater: [] as string[],
    video: [] as string[],
    images: [] as string[],
    contactPersonNumber: "",
    contactPersonName: "",
  });

  const [serviceId, setServiceId] = useState<number | null>(null);
  const [states, setStates] = useState<{ id: number; name: string; code: string }[]>([]);
  const [districts, setDistricts] = useState<{ id: number; name: string }[]>([]);
  const staticData = getStaticData(t);
  const stateOptions = states.map((state) => ({
    label: state.name,
    value: state.id,
  }));
  let districtOptions = districts.map((district: any) => ({
    label: district.name,
    value: district.id,
  }));

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          Alert.alert(t("sessionExpired"), t("pleaseLoginAgain"),
            [
              {
                text: t("ok"),
                onPress: () => {
                  router.replace("/(auth)/sign-in");
                },
              },
            ]
          );
          return;
        }
        if (token) {
          setToken(token);
        }
        const userInfoString = await AsyncStorage.getItem('user_info');
        const userInfoJson = userInfoString ? JSON.parse(userInfoString) : null
        setUserInfo(userInfoJson)

        const response = await fetchAPI(`${constants.API_URL}/master/states`, t);
        if (response) {
          setStates(response);
        } else {
          return;
        }

        if (passServiceId) {
          if (typeof passServiceId === "string") {
            setServiceId(parseInt(passServiceId, 10));
          }
          const serviceResponse = await fetchAPI(`${constants.API_URL}/user-services/${passServiceId}/`, t, {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          });
          if (response === null || response === undefined) {
            return;
          }

          setFormData((prevFormData: any) => ({
            ...prevFormData,
            ...serviceResponse["options"],
            ...{
              images: serviceResponse["options"].images && serviceResponse["options"].images.length > 0
                ? serviceResponse["options"].images
                : [],
              sourceOfWater: serviceResponse["options"].sourceOfWater
                ? (typeof serviceResponse["options"].sourceOfWater === "string"
                  ? [serviceResponse["options"].sourceOfWater]
                  : serviceResponse["options"].sourceOfWater)
                : [],
              housingType: serviceResponse["options"].housingType
                ? (typeof serviceResponse["options"].housingType === "string"
                  ? [serviceResponse["options"].housingType]
                  : serviceResponse["options"].housingType)
                : [],
              numberOfBathRooms: serviceResponse["options"].numberOfBathRooms
                ? (typeof serviceResponse["options"].numberOfBathRooms === "number"
                  ? [serviceResponse["options"].numberOfBathRooms + " Bath Room" + (serviceResponse["options"].numberOfBathRooms > 1 ? "s" : "")]
                  : serviceResponse["options"].numberOfBathRooms)
                : [],
            }
          }));

          if (serviceResponse["options"].state) {
            await fetchDistricts(serviceResponse["options"].state);
          }
        }
      } catch (error) {
        Alert.alert(t("error"), t("errorFetchingProperty"),
          [
            {
              text: t("ok"),
            },
          ]
        );
        setLoading(false);
        return;
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const fetchDistricts = async (stateId: number) => {
    if (!stateId) return;
    try {
      const response = await fetchAPI(`${constants.API_URL}/master/state/${stateId}/districts`, t);
      if (response === null || response === undefined) {
        return;
      }
      setDistricts(response)
      districtOptions = response.map((district: any) => ({
        label: district.name,
        value: district.id,
      }));
    } catch (error) {
      Alert.alert(t("error"), t("errorFetchingDistrict"),
        [
          {
            text: t("ok"),
          },
        ]
      );
    }
    return;
  };

  const [errors, setErrors] = useState({
    title: "",
    propertyType: "",
    description: "",
    address: "",
    state: "",
    district: "",
    city: "",
    zip: "",
    contactPersonName: "",
    contactPersonNumber: "",
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setErrors((prev) => ({
      ...prev,
      [field]: "",
    }));

    if (field === "propertyFor" || field === "propertyType") {
      setFormData((prev) => ({
        ...prev,
        title: value === "Guest House" ? "" : prev["propertyType"] + " for " + prev["propertyFor"],
      }));
      setErrors((prev) => ({
        ...prev,
        title: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors: typeof errors = {
      title: "",
      propertyType: "",
      description: "",
      address: "",
      state: "",
      district: "",
      city: "",
      zip: "",
      contactPersonName: "",
      contactPersonNumber: "",
    };

    if (step === 1) {
      if (!formData.propertyFor) {
        newErrors.city = t("selectValidCity");
      }

      if (!formData.title) {
        newErrors.title = t("titleRequired");
      }
      if (!formData.description) {
        newErrors.description = t("descriptionError");
      }
      if (formData.description && formData.description.length < 4) {
        newErrors.description = t("descriptionMinError");
      }
      if (formData.description && formData.description.length > 200) {
        newErrors.description = t("descriptionMaxLenError");
      }
      if (!formData.propertyType) {
        newErrors.propertyType = t("propertyTypeRequired");
      }
    } else if (step === 2) {
      if (!formData.address || formData.address.length < 4) {
        newErrors.address = t("addressError");
      }

      if (!formData.state || formData.state < 1) {
        newErrors.state = t("selectValidState");
      }

      if (!formData.district || formData.district < 1) {
        newErrors.district = t("selectValidDistrict");
      }

      if (!formData.city) {
        newErrors.city = t("cityError");
      }

      if (formData.city && formData.city.length < 2) {
        newErrors.city = t("cityMinError");
      }
      if (formData.city && formData.city.length > 30) {
        newErrors.city = t("cityMaxLenError");
      }

      if (!formData.zip || !/^\d{6}$/.test(formData.zip)) {
        newErrors.zip = t("zipError");
      }

      if (!formData.contactPersonName || formData.contactPersonName.length > 30 || formData.contactPersonName.length < 3) {
        newErrors.contactPersonName = t(!formData.contactPersonName ? "contactPersonRequired" : (formData.contactPersonName.length > 30 ? "contactPersonNameMax" : "contactPersonNameMin"));
      }

      if (!formData.contactPersonNumber || !/^\d{10}$/.test(formData.contactPersonNumber)) {
        newErrors.contactPersonNumber = t(!formData.contactPersonNumber ? "contactPersonNumberRequired" : "contactPersonNumberError");
      }
    }

    setErrors(newErrors);

    return Object.values(newErrors).every((error) => error === "");
  };

  const handleCancel = () => {
    router.push("/(provider)/(tabs)/home");
  };

  const checkSubscription = async () => {
    const userPlan = await getUserPlan(t);
    console.log(userPlan)
    let title = "active";
    if (userPlan.length === 0) {
      return "noActivePlan";
    }
    if (userPlan.length > 0) {
      if (userPlan[0].has_subscription === false) {
        title = "planExpired"
      } else if (userPlan[0].user_type_code == "S") {
        title = "invalidPlan";
      } else if (userPlan[0].credits <= userPlan[0].used) {
        title = "creditBalanceExhausted"
      }
    } else {
      title = "noActivePlan";
    }
    return title;
  }
  const handleSubmit = async (formData: any, stepIndex: number = 0) => {
    if (!validateForm()) {
      Alert.alert(
        t("error"),
        t("pleaseFixErrors"),
        [
          {
            text: t("ok"),
          },
        ]
      );
      return;
    }
    if (!token) {
      Alert.alert(t("sessionExpired"), t("pleaseLoginAgain"),
        [
          {
            text: t("ok"),
            onPress: () => {
              router.replace("/(auth)/sign-in");
            },
          },
        ]
      );
      return;
    }
    try {
      setBtnLoading(true);
      let url = `${constants.API_URL}/user-services/`;
      let method = "POST";
      if (serviceId !== null && serviceId !== undefined) {
        method = "PATCH"
        url = `${constants.API_URL}/user-services/${serviceId}/update_option/`;
      } else {
        const subscriptionStatus = await checkSubscription()
        if (subscriptionStatus !== "active") {
          setBtnLoading(false);
          Alert.alert(
            t(subscriptionStatus),
            t("subscribeNowToAddProperty"),
            [
              { text: t("cancel"), style: "cancel" },
              {
                text: t("ok"),
                style: "destructive",
                onPress: async () => {
                  router.push('/choose-subscription');
                  return false;
                },
              },
            ]
          );
          return;
        }
      }

      formData.rent = formData.rent ? parseFloat(formData.rent) : 0;
      formData.areaInSize = formData.areaInSize ? parseFloat(formData.areaInSize) : 0;
      formData.advance = formData.rent ? parseFloat(formData.rent) : 0;
      const response = await fetchAPI(url, t, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(method === "POST" ? {
          title: formData.title,
          options: formData,
          service: 1,
          is_active: true,
          plan: userInfo?.plan_id
        } : {
          title: formData.title,
          options: formData,
          service_id: 1
        }),
      });
      console.log("response", response)
      setBtnLoading(false);
      if (response === null || response === undefined) {
        return;
      }
      console.log("stepIndex", stepIndex);
      console.log("step", step + stepIndex);
      if ((step + stepIndex) === 3) {
        if (!formData.latitude || !formData.longitude) {
          const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?address=${formData.stateName},${formData.districtName},${formData.zip}&key=${googlePlacesApiKey}`
          );
          const data = await response.json();
          console.log("data", data);
          if (data.results && data.results.length > 0) {
            const location = data.results[0].formatted_address;
            setFormData((prev) => ({
              ...prev,
              latitude: data.results[0].geometry.location.lat,
              longitude: data.results[0].geometry.location.lng,
              address: location,
              location: location
            }));
          }
        }
      }
      if (method === "POST") {
        setServiceId(response.id)
      }
      if (stepIndex === 0) {
        Alert.alert(
          t("success"),
          t("propertyDetailsSaved"),
          [
            {
              text: t("ok"),
              onPress: () => {
                router.push("/(provider)/(tabs)/home");
              },
            },
          ]
        );
        return;
      }
      setBtnLoading(false);
      setStep(step + stepIndex);
    } catch (error) {
      Alert.alert(t("error"), t("failedToSaveProperty"),
        [
          {
            text: t("ok"),
          },
        ]
      );
      setBtnLoading(false);
      return;
    }
  };

  const getKey = (value: string): string => {
    if (!value) return "";
    value = "Enter " + value; // Prepend "Enter" to the value
    // Remove spaces and slashes, then convert to camelCase
    return value
      .replace(/\s+|\/+/g, " ") // Replace spaces and slashes with single space
      .split(" ")
      .map((word, idx) =>
        idx === 0
          ? word.charAt(0).toLowerCase() + word.slice(1)
          : word.charAt(0).toUpperCase() + word.slice(1)
      )
      .join("");
  };

  return (
    // <SafeAreaView className="flex h-full bg-white">
    <>
      {loading ? (
        <View className="flex-1 justify-center mt-[5%] items-center">
          <ActivityIndicator size="large" color="#00ff00" />
          <Text className="mt-2 text-base">{t("loading")}</Text>
        </View>
      ) : (

        <KeyboardAvoidingView
          className="p-5 bg-gray-100"
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
        >

          {/* <View className="p-5 bg-gray-100"> */}
          <Text className="text-base font-bold text-center">
            {serviceId ? t("editProperty") : t("addProperty")}
          </Text>
          <StepIndicator currentStep={step} totalSteps={totalSteps} />

          {step === 1 && (
            <ScrollView className="bg-gray-100 p-5"
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ flexGrow: 1 }} >
              <View className="flex-row flex-wrap justify-between mt-5">
                {staticData.propertyForOptions.map((pref) => (
                  <TouchableOpacity
                    key={pref.value}
                    className={`rounded-lg p-3 flex-1 mr-2 ${formData.propertyFor === pref.value ? 'bg-[#01BB23]' : 'bg-[#FF7F19]'}`}
                    onPress={() => handleInputChange("propertyFor", pref.value)}
                  >
                    <View className="flex-row items-center justify-center">
                      <Image
                        source={formData.propertyFor === pref.value ? icons.radioChecked : icons.radioUnchecked}
                        className="w-6 h-6 mr-2"
                        style={{ tintColor: "white" }}
                      />
                      <Text className="text-center text-base font-bold text-white">
                        {t(pref.label)}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
              <CustomDropdown
                label={t("propertyType")}
                data={
                  staticData.propertyTypeOptions[formData.propertyFor as keyof typeof staticData.propertyTypeOptions]
                }
                value={formData.propertyType}
                placeholder={t("selectPropertyType")}
                onChange={(selectedItem: DropdownProps) => handleInputChange("propertyType", selectedItem.value)}
              />
              {errors.propertyType && <Text className="text-red-500">{errors.propertyType}</Text>}

              <Text className="text-base font-bold mt-3">{t("title")}</Text>
              <TextInput
                placeholder={t(formData.propertyType ? getKey(formData.propertyType) : "enterTitle")}
                className={`border rounded-lg p-3 bg-white ${errors.title ? "border-red-500" : "border-gray-300"
                  }`}
                value={formData.title}
                onChangeText={(value) => handleInputChange("title", value)}
                onBlur={() => {
                  if (!formData.title) {
                    setErrors((prev) => ({
                      ...prev,
                      title: t("titleRequired"),
                    }));
                  }
                }}
              />
              {errors.title && <Text className="text-red-500">{errors.title}</Text>}

              <Text className="text-base font-bold mt-3 mb-3">{t("description")}</Text>
              <CustomTextarea
                value={formData.description}
                onChangeText={(value) => handleInputChange("description", value)}
                onBlur={() => {
                  if (!formData.description || formData.description.length < 4) {
                    setErrors((prev) => ({
                      ...prev,
                      description: t("descriptionError"),
                    }));
                  } else if (!formData.description || formData.description.length > 200) {
                    setErrors((prev) => ({
                      ...prev,
                      description: t("descriptionMaxLenError"),
                    }));
                  }
                }}
              />
              {errors.description && <Text className="text-red-500">{errors.description}</Text>}

              {formData.propertyType === "Full House" && (
                <View>
                  <CustomDropdown
                    label={t("housingType")}
                    data={staticData.housingTypeOptions}
                    value={formData.housingType.length ? formData.housingType[0] : ""}
                    placeholder={t("selectHousingType")}
                    onChange={(selectedItem: DropdownProps) => handleInputChange("housingType", [selectedItem.value])}
                  />

                  <CustomDropdown
                    label={t("bhkType")}
                    data={staticData.bhkTypeOptions}
                    value={formData.bhkType}
                    placeholder={t("selectBhkType")}
                    onChange={(selectedItem: DropdownProps) => handleInputChange("bhkType", selectedItem.value)}
                  />

                  <CustomDropdown
                    label={t("familyPreference")}
                    data={staticData.familyPreferenceOptions}
                    value={formData.familyPreference}
                    placeholder={t("selectFamilyPreference")}
                    onChange={(selectedItem: DropdownProps) => handleInputChange("familyPreference", selectedItem.value)}
                  />

                  <CustomDropdown
                    label={t("foodPreference")}
                    data={staticData.foodPreferenceOptions}
                    value={formData.foodPreference}
                    placeholder={t("selectFoodPreference")}
                    onChange={(selectedItem: DropdownProps) => handleInputChange("foodPreference", selectedItem.value)}
                  />
                </View>
              )}

              {formData.propertyType === "PG/Hostel" && (
                <View>
                  <CustomDropdown
                    label={t("roomType")}
                    data={staticData.roomTypeOptions}
                    value={formData.housingType.length ? formData.housingType[0] : ""}
                    placeholder={t("selectRoomType")}
                    onChange={(selectedItem: DropdownProps) => handleInputChange("housingType", [selectedItem.value])}
                  />

                  <CustomDropdown
                    label={t("genderPreference")}
                    data={staticData.genderPreferenceOptions}
                    value={formData.familyPreference}
                    placeholder={t("selectGenderPreference")}
                    onChange={(selectedItem: DropdownProps) => handleInputChange("familyPreference", selectedItem.value)}
                  />

                  <CustomDropdown
                    label={t("foodPreference")}
                    data={staticData.foodPreferenceOptions}
                    value={formData.foodPreference}
                    placeholder={t("selectFoodPreference")}
                    onChange={(selectedItem: DropdownProps) => handleInputChange("foodPreference", selectedItem.value)}
                  />
                </View>
              )}

              {formData.propertyType === "Guest House" && (
                <View>
                  <CustomDropdown
                    label={t("roomType")}
                    data={staticData.guestHouseRoomTypeOptions}
                    value={formData.housingType.length ? formData.housingType[0] : ""}
                    placeholder={t("selectRoomType")}
                    onChange={(selectedItem: DropdownProps) => handleInputChange("housingType", [selectedItem.value])}
                  />
                </View>
              )}

              {formData.propertyType === "Commercial" && (
                <View>
                  <CustomMultiDropdown
                    label={t("commercialType")}
                    data={staticData.commercialTypeOptions}
                    value={formData.housingType}
                    placeholder={t("selectCommercialType")}
                    onChange={(selectedItems: DropdownProps[]) => handleInputChange("housingType", selectedItems.map(item => item.value))}
                  />
                </View>
              )}
              <View className="text-base font-bold mt-3 mb-3"></View>
            </ScrollView>
          )}

          {step === 2 && (
            <ScrollView className="bg-gray-100 p-5"
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ flexGrow: 1 }} >
              <CustomDropdown
                label={t("state")}
                data={stateOptions}
                value={formData.state}
                placeholder={t("selectState")}
                onChange={(selectedItem: DropdownProps) => {
                  handleInputChange("state", selectedItem.value);
                  handleInputChange("stateName", selectedItem.label);
                  handleInputChange("district", 0);
                  handleInputChange("districtName", "");
                  fetchDistricts(selectedItem.value as number)
                }}
              />
              {errors.state && <Text className="text-red-500">{errors.state}</Text>}

              <CustomDropdown
                label={t("district")}
                data={districtOptions}
                value={formData.district}
                placeholder={t("selectDistrict")}
                onChange={(selectedItem: DropdownProps) => {
                  handleInputChange("district", selectedItem.value);
                  handleInputChange("districtName", selectedItem.label);
                }}
              />
              {errors.district && <Text className="text-red-500">{errors.district}</Text>}

              <Text className="text-base font-bold mt-3 mb-3">{t("city")}</Text>
              <TextInput
                placeholder={t("enterCity")}
                className={`border rounded-lg p-3 bg-white ${errors.city ? "border-red-500" : "border-gray-300"
                  }`}
                value={formData.city}
                onChangeText={(value) => handleInputChange("city", value)}
              />
              {errors.city && <Text className="text-red-500">{errors.city}</Text>}

              <Text className="text-base font-bold mt-3 mb-3">{t("pincode")}</Text>
              <TextInput
                placeholder={t("enterPincode")}
                className={`border rounded-lg p-3 bg-white ${errors.zip ? "border-red-500" : "border-gray-300"
                  }`}
                keyboardType="numeric"
                value={formData.zip}
                onChangeText={(value) => handleInputChange("zip", value)}
                onBlur={(value) => {
                  if (!formData.zip || !/^\d{6}$/.test(formData.zip)) {
                    setErrors((prev) => ({
                      ...prev,
                      zip: t("zipError"),
                    }));
                  }
                }}
              />
              {errors.zip && <Text className="text-red-500">{errors.zip}</Text>}

              <Text className="text-base font-bold mt-3 mb-3">{t("address")}</Text>
              <View>
                <TextInput
                  placeholder={t("enterAddressManually")}
                  className={`border rounded-lg p-3 bg-white mt-3 ${errors.address ? "border-red-500" : "border-gray-300"
                    }`}
                  value={formData.address}
                  onChangeText={(value) => handleInputChange("address", value)}
                  onBlur={() => {
                    if (!formData.address || formData.address.length < 4) {
                      setErrors((prev) => ({
                        ...prev,
                        address: t("addressError"),
                      }));
                    }
                  }}
                />
              </View>
              {errors.address && <Text className="text-red-500">{errors.address}</Text>}

              <Text className="text-base font-bold mt-3 mb-3">{t("contactPersonName")}</Text>
              <View>
                <TextInput
                  placeholder={t("enterContactPersonName")}
                  className="border rounded-lg p-3 bg-white mt-3 border-gray-300"
                  value={formData.contactPersonName}
                  onChangeText={(value) => handleInputChange("contactPersonName", value)}
                  onBlur={() => {
                    if (!formData.contactPersonName || formData.contactPersonName.length < 4 || formData.contactPersonName.length > 30) {
                      setErrors((prev) => ({
                        ...prev,
                        contactPersonName: t(!formData.contactPersonName ? "contactPersonRequired" : (formData.contactPersonName.length > 30 ? "contactPersonNameMax" : "contactPersonNameMin")),
                      }));
                    }
                  }}
                />
              </View>
              {errors.contactPersonName && <Text className="text-red-500">{errors.contactPersonName}</Text>}

              <Text className="text-base font-bold mt-3 mb-3">{t("contactPersonNumber")}</Text>
              <TextInput
                placeholder={t("enterContactPersonNumber")}
                className={`border rounded-lg p-3 bg-white ${errors.contactPersonNumber ? "border-red-500" : "border-gray-300"
                  }`}
                keyboardType="numeric"
                value={formData.contactPersonNumber}
                onChangeText={(value) => handleInputChange("contactPersonNumber", value)}
                onBlur={(value) => {
                  if (!formData.contactPersonNumber || !/^\d{10}$/.test(formData.contactPersonNumber)) {
                    setErrors((prev) => ({
                      ...prev,
                      contactPersonNumber: t(!formData.contactPersonNumber ? "contactPersonNumberRequired" : "contactPersonNumberError"),
                    }));
                  }
                }}
              />
              {errors.contactPersonNumber && <Text className="text-red-500">{errors.contactPersonNumber}</Text>}
              <View className="text-base font-bold mt-3 mb-3"></View>
            </ScrollView>
          )}

          {step === 3 && (
            <View
              style={{
                flex: 1,
                minHeight: Math.min(350, Math.round(require('react-native').Dimensions.get('window').height * 0.7)),
              }}
            >
              <Text className="mt-2 text-base">{t("longPressMarkerHint")}</Text>
              {isMapRender && (
                <GoogleTextInput
                  icon={icons.target}
                  initialLocation={{
                    latitude: parseFloat(String(formData?.latitude || constants.DEFAULT_LAT)),
                    longitude: parseFloat(String(formData?.longitude || constants.DEFAULT_LONG)),
                    address: String(formData?.location),
                    draggable: true
                  }}
                  handlePress={async (location) => {
                    console.log("location", location);
                    setFormData((prev) => ({
                      ...prev,
                      "latitude": location.latitude,
                      "longitude": location.longitude,
                      "location": location.address
                    }));
                    setIsMapRender(false);
                    setTimeout(() => {
                      setIsMapRender(true);
                      console.log("setIsMapRender", isMapRender);
                    }, 500);
                  }}
                />
              )}
              {!isMapRender && (
                <View className="flex-row justify-center mt-10 mb-10">
                  <ActivityIndicator size="large" color="#00ff00" />
                  <Text className="mt-2 text-base">{t("loading")}</Text>
                </View>
              )}
            </View>
          )}

          {step === 4 && (
            <ScrollView className="bg-gray-100 p-5"
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ flexGrow: 1 }} >
              {formData.propertyType == "Guest House" && (
                <>
                  <Text className="text-base font-bold mt-3 mb-3">{t("ratePerDayNight")}</Text>
                  <TextInput
                    placeholder={t("enterRatePerDayNight")}
                    className="border border-gray-300 rounded-lg p-3 bg-white"
                    keyboardType="numeric"
                    value={String(formData.rent)}
                    onChangeText={(value) => handleInputChange("rent", value)}
                  />
                </>
              )}
              {formData.propertyType !== "Guest House" && (
                <>
                  <Text className="text-base font-bold mt-3 mb-3">{t("rentAmount")}</Text>
                  <TextInput
                    placeholder={t("enterRentAmount")}
                    className="border border-gray-300 rounded-lg p-3 bg-white"
                    keyboardType="numeric"
                    value={String(formData.rent)}
                    onChangeText={(value) => handleInputChange("rent", value)}
                  />
                  <Text className="text-base font-bold mt-3 mb-3">{t("advanceAmount")}</Text>
                  <TextInput
                    placeholder={t("enterAdvanceAmount")}
                    className="border border-gray-300 rounded-lg p-3 bg-white"
                    keyboardType="numeric"
                    value={String(formData.advance)}
                    onChangeText={(value) => handleInputChange("advance", value)}
                  />
                  <Text className="text-base font-bold mb-3 mt-3">{t("isRentNegotiable")}</Text>
                  <View className="flex-row flex-wrap justify-between">
                    {['Yes', 'No'].map((pref) => (
                      <TouchableOpacity
                        key={pref}
                        className={`rounded-lg p-3 flex-1 mr-2 ${formData.rentNegotiable === pref ? 'bg-[#01BB23]' : 'bg-[#FF7F19]'}`}
                        onPress={() => handleInputChange("rentNegotiable", pref)}
                      >
                        <View className="flex-row items-center justify-center">
                          <Image
                            source={formData.rentNegotiable === pref ? icons.radioChecked : icons.radioUnchecked}
                            className="w-6 h-6 mr-2"
                            style={{ tintColor: "white" }}
                          />
                          <Text className="text-center text-base font-bold text-white">
                            {t(pref.toLowerCase())}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <Text className="text-base font-bold mt-3 mb-3">{t("areaInSize")}</Text>
                  <TextInput
                    placeholder={t("enterAreaInSize")}
                    className="border border-gray-300 rounded-lg p-3 bg-white"
                    keyboardType="numeric"
                    value={String(formData.areaInSize)}
                    onChangeText={(value) => handleInputChange("areaInSize", value)}
                  />

                  {formData.propertyType !== "Land" && (
                    <CustomDropdown
                      label={t("floorNumber")}
                      data={staticData.floors}
                      value={formData.floorNumber}
                      placeholder={t("selectFloorNumber")}
                      onChange={(selectedItem: DropdownProps) => handleInputChange("floorNumber", selectedItem.value)}
                    />
                  )}
                  {formData.propertyType === "Full House" && (
                    <>
                      <CustomDropdown
                        label={t("numberOfBedRooms")}
                        data={staticData.bedRooms}
                        value={formData.numberOfBedRooms}
                        placeholder={t("selectNumberOfBedRooms")}
                        onChange={(selectedItem: DropdownProps) => handleInputChange("numberOfBedRooms", selectedItem.value)}
                      />
                      <CustomDropdown
                        label={t("numberOfBalconies")}
                        data={staticData.balconies}
                        value={formData.numberOfBalconies}
                        placeholder={t("selectNumberOfBalconies")}
                        onChange={(selectedItem: DropdownProps) => handleInputChange("numberOfBalconies", selectedItem.value)}
                      />
                      <CustomMultiDropdown
                        label={t("numberOfBathRooms")}
                        data={staticData.bathRooms}
                        value={formData.numberOfBathRooms}
                        placeholder={t("selectNumberOfBathRooms")}
                        onChange={(selectedItems: DropdownProps[]) => handleInputChange("numberOfBathRooms", selectedItems.map(item => item.value))}
                      />
                    </>
                  )}
                  {formData.propertyType !== "Land" && (
                    <CustomDropdown
                      label={t("ageOfProperty")}
                      data={staticData.ageOfProperty}
                      value={formData.ageOfProperty}
                      placeholder={t("selectAgeOfProperty")}
                      onChange={(selectedItem: DropdownProps) => handleInputChange("ageOfProperty", selectedItem.value)}
                    />
                  )}
                </>
              )}
              <View className="text-base font-bold mt-3 mb-3"></View>
            </ScrollView>
          )}

          {step === 5 && (
            <ScrollView className="bg-gray-100 p-5"
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ flexGrow: 1 }} >
              {formData.propertyType !== "Land" && (
                <>
                  <CustomDropdown
                    label={t("furnishing")}
                    data={staticData.furnishingOptions}
                    value={formData.furnishing}
                    placeholder={t("selectFurnishingType")}
                    onChange={(selectedItem: DropdownProps) => handleInputChange("furnishing", selectedItem.value)}
                  />

                  <CustomDropdown
                    label={t("parking")}
                    data={staticData.parkingOptions}
                    value={formData.parking}
                    placeholder={t("selectParkingType")}
                    onChange={(selectedItem: DropdownProps) => handleInputChange("parking", selectedItem.value)}
                  />
                </>
              )}

              <CustomMultiDropdown
                label={t("basicAmenities")}
                data={staticData.basicAmenitiesOptions}
                value={formData.basicAmenities}
                placeholder={t("selectBasicAmenities")}
                onChange={(selectedItems: DropdownProps[]) => handleInputChange("basicAmenities", selectedItems.map(item => item.value))}
              />

              <CustomMultiDropdown
                label={t("additionalAmenities")}
                data={staticData.additionalAmenitiesOptions}
                value={formData.additionalAmenities}
                placeholder={t("selectAdditionalAmenities")}
                onChange={(selectedItems: DropdownProps[]) => handleInputChange("additionalAmenities", selectedItems.map(item => item.value))}
              />

              {formData.propertyType !== "Guest House" && (
                <CustomMultiDropdown
                  label={t("sourceOfWater")}
                  data={staticData.sourceOfWaterOptions}
                  value={formData.sourceOfWater}
                  placeholder={t("selectSourceOfWater")}
                  onChange={(selectedItems: DropdownProps[]) => handleInputChange("sourceOfWater", selectedItems.map(item => item.value))}
                />
              )}
              <View className="text-base font-bold mt-3 mb-3"></View>
            </ScrollView>
          )}

          {step === totalSteps && (
            <ScrollView className="bg-gray-100 p-5"
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ flexGrow: 1 }} >
              <Text className="text-base font-bold mb-4">{t("uploadImage")}</Text>
              <ImagePickerComponent
                serviceId={serviceId}
                images={formData.images}
                onImageDelete={(imagePath: string) => {
                  const updatedImages = formData.images.filter((img: string) => img !== imagePath);
                  handleInputChange("images", updatedImages);
                }}
                onImageSelect={(imagePath: string) => {
                  handleInputChange("images", [...formData.images, imagePath]);
                }}
                video={formData.video}
                onVideoDelete={(videoPath: string) => {
                  const updatedVideo = formData.video.filter((video: string) => video !== videoPath);
                  handleInputChange("video", updatedVideo);
                }}
                onVideoSelect={(videoPath: string) => {
                  handleInputChange("video", [videoPath]);
                }}
              />
              <View className="text-base font-bold mt-3 mb-3"></View>
            </ScrollView>
          )}

          {btnLoading ? (
            <View className="flex-row justify-center mt-5 mb-10">
              <ActivityIndicator size="large" color="#00ff00" />
              <Text className="mt-2 text-base">{t("loading")}</Text>
            </View>
          ) : (
            <View className={`flex-row ${step > 1 ? "justify-between" : "justify-end"} mt-2`}>
              {step > 1 && <TouchableOpacity onPress={() => { handleSubmit(formData, -1); }} className="bg-gray-500 py-3 px-5 rounded-lg">
                <Text className="text-white text-base font-bold">{t("back")}</Text>
              </TouchableOpacity>}
              <TouchableOpacity onPress={() => handleCancel()} className="bg-gray-500 py-3 px-5 mx-3 rounded-lg">
                <Text className="text-white text-base font-bold">{t("cancel")}</Text>
              </TouchableOpacity>
              {step < totalSteps ? (
                <TouchableOpacity onPress={() => { handleSubmit(formData, 1); }} className="bg-blue-500 py-3 px-5 rounded-lg">
                  <Text className="text-white text-base font-bold">{t("saveNext")}</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity onPress={() => handleSubmit(formData)} className="bg-green-500 py-3 px-5 rounded-lg">
                  <Text className="text-white text-base font-bold">{t("submit")}</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
          {/* </View> */}
        </KeyboardAvoidingView>
      )
      }
    </>
    // </SafeAreaView >
  );
};

export default MultiStepForm;
