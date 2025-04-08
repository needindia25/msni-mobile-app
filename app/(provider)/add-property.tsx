import ComingSoon from "@/components/ComingSoon";
import CustomDropdown from "@/components/CustomDropdown";
import CustomTextarea from "@/components/CustomTextarea";
import { constants, icons } from "@/constants";
import { fetchAPI } from "@/lib/fetch";
import { DropdownProps } from "@/types/type";
import React, { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert, KeyboardAvoidingView, FlatList, Platform, Image, ScrollView } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import CustomMultiDropdown from "@/components/CustomMultiDropdown";
import ImagePickerComponent from "@/components/ImagePicker";
import GoogleTextInput from "@/components/GoogleTextInput";
import { useLocationStore } from "@/store";

import { getStaticData } from "@/constants/staticData"; // Import static data
import { useTranslation } from "react-i18next"; // Import useTranslation


const MultiStepForm = () => {
  const router = useRouter();
  const { t } = useTranslation();

  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [token, setToken] = useState<string | null>(null);

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
    housingType: "",
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
    numberOfBathRooms: 0,
    ageOfProperty: 0,
    furnishing: "",
    parking: "",
    basicAmenities: [] as string[],
    additionalAmenities: [] as string[],
    sourceOfWater: "",
    images: [] as string[],
  });

  const [serviceId, setServiceId] = useState<number | null>(null);
  const [states, setStates] = useState<{ id: number; name: string; code: string }[]>([]);
  const [districts, setDistricts] = useState<{ id: number; name: string }[]>([]);
  const staticData = getStaticData(t); // Get static data with translations

  const {
    userAddress,
    destinationAddress,
    setDestinationLocation,
    setUserLocation,
  } = useLocationStore();
  const stateOptions = states.map((state) => ({
    label: state.name,
    value: state.id,
  }));
  let districtOptions = districts.map((district: any) => ({
    label: district.name,
    value: district.id,
  }));

  useEffect(() => {
    console.log("Component re-rendered");
    const fetchData = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const passServiceId = await AsyncStorage.getItem('passServiceId');
        if (token) {
          setToken(token);
        }

        const response = await fetchAPI(`${constants.API_URL}/master/states`);
        setStates(response);

        if (passServiceId) {
          setServiceId(parseInt(passServiceId, 10));
          console.log(`URL : ${constants.API_URL}`)
          const serviceResponse = await fetchAPI(`${constants.API_URL}/user-services/${passServiceId}/`, {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          });

          setFormData((prevFormData: any) => ({
            ...prevFormData,
            ...serviceResponse["options"],
            ...{
              images: serviceResponse["options"].images && serviceResponse["options"].images.length > 0
                ? serviceResponse["options"].images.map((image: string) => image.replace("www.", "admin.")) // Replace "www." with "admin."
                : [`${constants.BASE_URL}/media/no-image-found.png`],
            }
          }));

          if (serviceResponse["options"].state) {
            await fetchDistricts(serviceResponse["options"].state);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []); // Empty dependency array ensures this runs only once

  // Fetch Cities when state changes
  const fetchDistricts = async (stateId: number) => {
    if (!stateId) return;
    try {
      const response = await fetchAPI(`${constants.API_URL}/master/state/${stateId}/districts`);
      setDistricts(response)
      districtOptions = response.map((district: any) => ({
        label: district.name,
        value: district.id,
      }));
    } catch (error) {
      console.error("Error fetching districts:", error);
    }
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
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setErrors((prev) => ({
      ...prev,
      [field]: "", // Clear the error when the user starts typing
    }));

    if (field === "propertyFor" || field === "propertyType") {
      setFormData((prev) => ({
        ...prev,
        title: prev["propertyType"] + " for " + prev["propertyFor"],
      }));
      setErrors((prev) => ({
        ...prev,
        title: "", // Clear the error when the user starts typing
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
    };

    if (step === 1) {
      if (!formData.propertyFor) {
        newErrors.city = t("selectValidCity"); // Use translation key
      }

      if (!formData.title) {
        newErrors.title = t("titleRequired"); // Use translation key
      }
      if (!formData.description) {
        newErrors.description = t("descriptionError"); // Use translation key
      }
      if (formData.description && formData.description.length < 4) {
        newErrors.description = t("descriptionMinError"); // Use translation key
      }
      if (formData.description && formData.description.length > 200) {
        newErrors.description = t("descriptionMaxLenError"); // Use translation key
      }
      if (!formData.propertyType) {
        newErrors.propertyType = t("propertyTypeRequired"); // Use translation key
      }
    } else if (step === 2) {
      if (!formData.address || formData.address.length < 4) {
        newErrors.address = t("addressError"); // Use translation key
      }

      if (!formData.state || formData.state < 1) {
        newErrors.state = t("selectValidState"); // Use translation key
      }

      if (!formData.district || formData.district < 1) {
        newErrors.district = t("selectValidDistrict"); // Use translation key
      }

      if (!formData.city) {
        newErrors.city = t("cityError"); // Use translation key
      }

      if (formData.city && formData.city.length < 2) {
        newErrors.city = t("cityMinError"); // Use translation key
      }
      if (formData.city && formData.city.length > 30) {
        newErrors.city = t("cityMaxLenError"); // Use translation key
      }

      if (!formData.zip || !/^\d{6}$/.test(formData.zip)) {
        newErrors.zip = t("zipError"); // Use translation key
      }
    }

    setErrors(newErrors);

    // Return true if there are no errors
    return Object.values(newErrors).every((error) => error === "");
  };

  const handleCancel = () => {
    router.push("/(provider)/(tabs)/home");
  };

  // Handle Form Submission
  const handleSubmit = async (formData: any, stepIndex: number = 0) => {
    console.log("Form values:", formData);
    if (!validateForm()) {
      Alert.alert(t("error"), t("pleaseFixErrors"),
        [
          {
            text: t("ok"),
          },
        ]
      );
      return;
    }
    try {
      let url = `${constants.API_URL}/user-services/`;
      let method = "POST";
      if (serviceId !== null && serviceId !== undefined) {
        method = "PATCH"
        url = `${constants.API_URL}/user-services/${serviceId}/update_option/`;
      }
      console.log("URL", url)
      console.log("METHOD", method)
      const response = await fetchAPI(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(method === "POST" ? {
          title: formData.title,
          options: formData,
          service_id: 1,
          is_active: true
        } : {
          title: formData.title,
          options: formData,
        }),
      });
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
                // Perform the action when "OK" is pressed
                router.push("/(provider)/(tabs)/home");
              },
            },
          ]
        ); // Use translation keys
      }
      setStep(step + stepIndex);
    } catch (error) {
      Alert.alert(t("error"), t("failedToSaveProperty"),
        [
          {
            text: t("ok"),
          },
        ]
      ); // Use translation keys
      console.error("Error saving data:", error);
    }
  };

  return (
    <SafeAreaView className="flex h-full bg-white">
      {loading ? (
        <View className="flex-1 justify-center mt-[5%] items-center">
          <ActivityIndicator size="large" color="#00ff00" />
          <Text className="mt-2 text-base">{t("loading")}</Text>
        </View>
      ) : (

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
        >
          {/* <FlatList
            data={[{ key: "form" }]} // Dummy data to render the form
            renderItem={() => ( */}
          <ScrollView className="bg-gray-100 p-5">
            <View className="p-5 bg-gray-100">
              <Text className="text-base font-bold text-center mb-5">
                {serviceId ? t("editProperty") : t("addProperty")}
              </Text>
              {/* Step Indicator */}
              <View className="flex-row justify-between mb-5">
                {[1, 2, 3, 4, 5].map((num) => (
                  <Text key={num} className={`text-base font-bold ${step === num ? "text-blue-500" : "text-gray-400"}`}>
                    {t("step")} {num}
                  </Text>
                ))}
              </View>

              {step === 1 && (
                <View>
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
                            style={{ tintColor: "white" }} // Apply white tint color
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
                    placeholder={t("enterTitle")}
                    className={`border rounded-lg p-3 bg-white ${errors.title ? "border-red-500" : "border-gray-300"
                      }`} // Highlight border in red if there's an error
                    value={formData.title}
                    onChangeText={(value) => handleInputChange("title", value)}
                    onBlur={() => {
                      if (!formData.title) {
                        setErrors((prev) => ({
                          ...prev,
                          title: t("titleRequired"), // Use translation key for error message
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
                          description: t("descriptionError"), // Use translation key for error message
                        }));
                      } else if (!formData.description || formData.description.length > 200) {
                        setErrors((prev) => ({
                          ...prev,
                          description: t("descriptionMaxLenError"), // Use translation key for error message
                        }));
                      }
                    }}
                  />
                  {errors.description && <Text className="text-red-500">{errors.description}</Text>} {/* Display error message */}
                </View>
              )}

              {/* {step === 1 && formData.propertyType === "Land" && (
                <View className="mb-[120px]"></View>
              )} */}

              {step === 1 && formData.propertyType === "Full House" && (
                <View>
                  {/* Housing Type Dropdown */}
                  <CustomDropdown
                    label={t("housingType")}
                    data={staticData.housingTypeOptions}
                    value={formData.housingType}
                    placeholder={t("selectHousingType")}
                    onChange={(selectedItem: DropdownProps) => handleInputChange("housingType", selectedItem.value)}
                  />

                  {/* BHK Type Dropdown */}
                  <CustomDropdown
                    label={t("bhkType")}
                    data={staticData.bhkTypeOptions}
                    value={formData.bhkType}
                    placeholder={t("selectBhkType")}
                    onChange={(selectedItem: DropdownProps) => handleInputChange("bhkType", selectedItem.value)}
                  />

                  {/* Family Preference Dropdown */}
                  <CustomDropdown
                    label={t("familyPreference")}
                    data={staticData.familyPreferenceOptions}
                    value={formData.familyPreference}
                    placeholder={t("selectFamilyPreference")}
                    onChange={(selectedItem: DropdownProps) => handleInputChange("familyPreference", selectedItem.value)}
                  />

                  {/* Food Preference Dropdown */}
                  <CustomDropdown
                    label={t("foodPreference")}
                    data={staticData.foodPreferenceOptions}
                    value={formData.foodPreference}
                    placeholder={t("selectFoodPreference")}
                    onChange={(selectedItem: DropdownProps) => handleInputChange("foodPreference", selectedItem.value)}
                  />
                </View>
              )}

              {step === 1 && formData.propertyType === "PG/Hostel" && (
                <View>
                  {/* Room Type Dropdown */}
                  <CustomDropdown
                    label={t("roomType")}
                    data={staticData.roomTypeOptions}
                    value={formData.housingType}
                    placeholder={t("selectRoomType")}
                    onChange={(selectedItem: DropdownProps) => handleInputChange("housingType", selectedItem.value)}
                  />

                  {/* Gender Preference Dropdown */}
                  <CustomDropdown
                    label={t("genderPreference")}
                    data={staticData.genderPreferenceOptions}
                    value={formData.familyPreference}
                    placeholder={t("selectGenderPreference")}
                    onChange={(selectedItem: DropdownProps) => handleInputChange("familyPreference", selectedItem.value)}
                  />

                  {/* Food Preference Dropdown */}
                  <CustomDropdown
                    label={t("foodPreference")}
                    data={staticData.foodPreferenceOptions}
                    value={formData.foodPreference}
                    placeholder={t("selectFoodPreference")}
                    onChange={(selectedItem: DropdownProps) => handleInputChange("foodPreference", selectedItem.value)}
                  />
                </View>
              )}

              {step === 1 && formData.propertyType === "Commercial" && (
                <View>
                  {/* Commercial Type Dropdown */}
                  <CustomDropdown
                    label={t("commercialType")}
                    data={staticData.commercialTypeOptions}
                    value={formData.housingType}
                    placeholder={t("selectCommercialType")}
                    onChange={(selectedItem: DropdownProps) => handleInputChange("housingType", selectedItem.value)}
                  />
                </View>
              )}

              {step === 2 && (
                <View>
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
                      }`} // Highlight border in red if there's an error
                    value={formData.city}
                    onChangeText={(value) => handleInputChange("city", value)} // Update formData on change
                  />
                  {errors.city && <Text className="text-red-500">{errors.city}</Text>} {/* Display error message */}

                  <Text className="text-base font-bold mt-3 mb-3">{t("pincode")}</Text>
                  <TextInput
                    placeholder={t("enterPincode")}
                    className={`border rounded-lg p-3 bg-white ${errors.zip ? "border-red-500" : "border-gray-300"
                      }`} // Highlight border in red if there's an error
                    keyboardType="numeric"
                    value={formData.zip}
                    onChangeText={(value) => handleInputChange("zip", value)} // Update formData on change
                    onBlur={(value) => {
                      if (!formData.zip || !/^\d{6}$/.test(formData.zip)) {
                        setErrors((prev) => ({
                          ...prev,
                          zip: t("zipError"), // Use translation key for error message
                        }));
                      }
                    }}
                  />
                  {errors.zip && <Text className="text-red-500">{errors.zip}</Text>} {/* Display error message */}

                  <Text className="text-base font-bold mt-3 mb-3">{t("address")}</Text>
                  <View>
                    <TextInput
                      placeholder={t("enterAddressManually")} // Translation key for "Enter address manually"
                      className={`border rounded-lg p-3 bg-white mt-3 ${errors.address ? "border-red-500" : "border-gray-300"
                        }`} // Highlight border in red if there's an error
                      value={formData.address}
                      onChangeText={(value) => handleInputChange("address", value)} // Update formData on change
                      onBlur={() => {
                        if (!formData.address || formData.address.length < 4) {
                          setErrors((prev) => ({
                            ...prev,
                            address: t("addressError"), // Use translation key for error message
                          }));
                        }
                      }}
                    />
                  </View>
                  {errors.address && <Text className="text-red-500">{errors.address}</Text>}

                  {/* <View className="mb-[20px]"></View> */}
                    {/* <GoogleTextInput
                        icon={icons.target}
                        initialLocation={userAddress ? (() => {
                          const parsedAddress = typeof userAddress === "string" ? JSON.parse(userAddress) : userAddress;
                          return { latitude: parseFloat(parsedAddress?.latitude || "0"), longitude: parseFloat(parsedAddress?.longitude || "0") };
                        })() : undefined}
                        handlePress={async (location) => {
                          setUserLocation(location);
                          console.log("location", location)
                          formData.latitude = location.latitude;
                          formData.longitude = location.longitude;
                          formData.location = location.address;
                        }}
                      /> */}
                  {/* <View className="mb-[120px]"></View> */}
                </View>
              )}

              {step === 3 && (
                <View>
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
                            style={{ tintColor: "white" }} // Apply white tint color
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
                      <CustomDropdown
                        label={t("numberOfBathRooms")}
                        data={staticData.bathRooms}
                        value={formData.numberOfBathRooms}
                        placeholder={t("selectNumberOfBathRooms")}
                        onChange={(selectedItem: DropdownProps) => handleInputChange("numberOfBathRooms", selectedItem.value)}
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
                </View>
              )}

              {step === 4 && (
                <View>
                  {formData.propertyType !== "Land" && (
                    <CustomDropdown
                      label={t("furnishing")}
                      data={staticData.furnishingOptions}
                      value={formData.furnishing}
                      placeholder={t("selectFurnishingType")}
                      onChange={(selectedItem: DropdownProps) => handleInputChange("furnishing", selectedItem.value)}
                    />
                  )}

                  <CustomDropdown
                    label={t("parking")}
                    data={staticData.parkingOptions}
                    value={formData.parking}
                    placeholder={t("selectParkingType")}
                    onChange={(selectedItem: DropdownProps) => handleInputChange("parking", selectedItem.value)}
                  />

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

                  <CustomDropdown
                    label={t("sourceOfWater")}
                    data={staticData.sourceOfWaterOptions}
                    value={formData.sourceOfWater}
                    placeholder={t("selectSourceOfWater")}
                    onChange={(selectedItem: DropdownProps) => handleInputChange("sourceOfWater", selectedItem.value)}
                  />
                </View>
              )}

              {step === 5 && (
                <View className="mb-5">
                  <Text className="text-base font-bold mb-4">{t("uploadImage")}</Text>
                  <ImagePickerComponent
                    images={formData.images}
                    serviceId={serviceId}
                    onImageSelect={(imagePath: string) => {
                      console.log(formData.images, imagePath);
                      handleInputChange("images", [...formData.images, imagePath]);
                      console.log(formData);
                    }}
                  />
                  {/* <View className="mb-[120px]"></View> */}
                </View>
              )}
              {step === 6 && (<ComingSoon />)}

              {/* Navigation Buttons */}
              <View className={`flex-row ${step > 1 ? "justify-between" : "justify-end"} mt-5 mb-10`}>
                {step > 1 && <TouchableOpacity onPress={() => { handleSubmit(formData, -1); }} className="bg-gray-500 py-3 px-5 rounded-lg">
                  <Text className="text-white text-base font-bold">{t("back")}</Text>
                </TouchableOpacity>}
                <TouchableOpacity onPress={() => handleCancel()} className="bg-gray-500 py-3 px-5 mx-3 rounded-lg">
                  <Text className="text-white text-base font-bold">{t("cancel")}</Text>
                </TouchableOpacity>
                {step < 5 ? (
                  <TouchableOpacity onPress={() => { handleSubmit(formData, 1); }} className="bg-blue-500 py-3 px-5 rounded-lg">
                    <Text className="text-white text-base font-bold">{t("saveNext")}</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity onPress={() => handleSubmit(formData)} className="bg-green-500 py-3 px-5 rounded-lg">
                    <Text className="text-white text-base font-bold">{t("submit")}</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </ScrollView>
          {/*    )}
          //   keyExtractor={(item) => item.key}
          //   keyboardShouldPersistTaps="handled"
          // />*/}
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
};

export default MultiStepForm;
