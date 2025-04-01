import ComingSoon from "@/components/ComingSoon";
import CustomDropdown from "@/components/CustomDropdown";
import CustomTextarea from "@/components/CustomTextarea";
import { constants, icons } from "@/constants";
import { fetchAPI } from "@/lib/fetch";
import { DropdownProps } from "@/types/type";
import React, { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert, KeyboardAvoidingView, FlatList, Platform, Image } from "react-native";
import { Formik, FormikProps } from "formik";
import * as yup from "yup";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import CustomMultiDropdown from "@/components/CustomMultiDropdown";
import ImagePickerComponent from "@/components/ImagePicker";
import GoogleTextInput from "@/components/GoogleTextInput";
import { useLocationStore } from "@/store";

import { getStaticData } from "@/constants/staticData"; // Import static data
import { useTranslation } from "react-i18next"; // Import useTranslation


const MultiStepForm = () => {
  // const { passServiceId } = useSearchParams(); // Retrieve the id from the route

  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [previousStep, setPreviousStep] = useState(0);
  const [token, setToken] = useState<string | null>(null);
  const [formData, setFormDate] = useState<any>(
    {
      propertyFor: "Rent",
      title: "",
      propertyType: "",
      description: "",
      latitude: 0,
      longitude: 0,
      address: "",
      location: "",
      state: 0,
      city: 0,
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
    }
  )
  const [serviceId, setServiceId] = useState<number | null>(null);
  const [states, setStates] = useState<{ id: number; name: string; code: string }[]>([]);
  const [cities, setCities] = useState<{ id: number; name: string }[]>([]);

  const { t } = useTranslation(); // Initialize translation hook
  const staticData = getStaticData(t); // Get static data with translations

  const {
    userAddress,
    destinationAddress,
    setDestinationLocation,
    setUserLocation,
  } = useLocationStore();
  const stateOptions = states.map((state) => ({ label: state.name, value: state.id }));
  let cityOptions = cities.map((city) => ({ label: city.name, value: city.id }));

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch token
        const token = await AsyncStorage.getItem('token');
        const passServiceId = await AsyncStorage.getItem('passServiceId');
        console.log(`token: ${token}`);
        if (token) {
          setToken(token);
        }

        // Fetch states
        const response = await fetchAPI(`${constants.API_URL}/master/states`);
        setStates(response);

        if (passServiceId) {
          console.log("passServiceId", passServiceId);
          setServiceId(parseInt(passServiceId, 10));

          const serviceResponse = await fetchAPI(`${constants.API_URL}/user-services/${passServiceId}`, {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          });

          setFormDate((prevFormData: any) => ({
            ...prevFormData,
            ...serviceResponse["options"],
          }));

          // Fetch cities based on the state from the service response
          if (serviceResponse["options"].state) {
            await fetchCities(serviceResponse["options"].state); // Pass the state ID directly
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
  const fetchCities = async (stateId: number) => {
    if (!stateId) return;
    try {
      const response = await fetchAPI(`${constants.API_URL}/master/state/${stateId}/cities`);
      setCities(response);
    } catch (error) {
      console.error("Error fetching cities:", error);
    }
  };

  // 📌 Validation Schema using Yup
  const validationSchemas = [
    yup.object().shape({
      title: yup.string().required("Title is required"),
      propertyType: yup.string().required("Property type is required"),
      description: yup.string().min(10, "Description should be at least 10 characters").required("Description is required"),
      state: yup.number().min(1, "Select a valid state").required("State is required"),
      zip: yup.string().matches(/^\d{6}$/, "Enter a valid 6-digit ZIP code").required("ZIP is required"),
    }),
  ];

  // Handle Form Submission
  const handleSubmit = async (values: any) => {
    console.log("Form values:", values);
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
          title: values.title,
          options: values,
          service_id: 1,
          is_active: false
        } : {
          title: values.title,
          options: values,
        }),
      });
      console.log(response)
      if (method === "POST") {
        setServiceId(response.id)
      }
      console.log(step, previousStep);
      if (step === previousStep) {
        router.push("/(provider)/(tabs)/home");
      }
      setPreviousStep(step)
    } catch (error) {
      Alert.alert("Error", "Failed to save property details.");
      console.error("Error saving data:", error);
    }
  };

  return (
    <SafeAreaView className="flex h-full bg-white">
      {loading ? (
        <View className="flex-1 justify-center mt-[5%] items-center">
          <ActivityIndicator size="large" color="#00ff00" />
          <Text className="mt-2 text-xl">{t("loading")}</Text>
        </View>
      ) : (
        <Formik
          initialValues={formData}
          validationSchema={step == 1 ? validationSchemas[0] : null}
          onSubmit={(values) => {
            console.log("111 step:", step);
            handleSubmit(values);
          }}
        >
          {({
            handleChange,
            handleBlur,
            handleSubmit,
            values,
            errors,
            touched,
            setFieldValue,
          }: FormikProps<{
            propertyFor: string;
            title: string;
            propertyType: string;
            description: string;
            latitude: number;
            longitude: number;
            address: string;
            location: string;
            state: number;
            city: number;
            zip: string;
            housingType: string;
            bhkType: string;
            familyPreference: string;
            foodPreference: string;
            rent: number;
            advance: number;
            rentNegotiable: string;
            areaInSize: number;
            floorNumber: number;
            numberOfBedRooms: number;
            numberOfBalconies: number;
            numberOfBathRooms: number;
            ageOfProperty: number;
            furnishing: string;
            parking: string;
            basicAmenities: string[];
            additionalAmenities: string[];
            sourceOfWater: string;
            images: string[];
          }>) => (
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : undefined}
              style={{ flex: 1 }}
            >
              <FlatList
                data={[{ key: "form" }]} // Dummy data to render the form
                renderItem={() => (
                  <View className="p-5 bg-gray-100">
                    <Text className="text-2xl font-bold text-center mb-5">
                      {serviceId ? t("editProperty") : t("addProperty")} {/* Use translation key */}
                    </Text>
                    {/* Step Indicator */}
                    <View className="flex-row justify-between mb-5">
                      {[1, 2, 3, 4, 5].map((num) => (
                        <Text key={num} className={`text-lg font-bold ${step === num ? "text-blue-500" : "text-gray-400"}`}>
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
                              className={`rounded-lg p-3 flex-1 mr-2 ${values.propertyFor === pref.value ? 'bg-[#01BB23]' : 'bg-[#FF7F19]'}`}
                              onPress={() => setFieldValue("propertyFor", pref.value)}
                            >
                              <View className="flex-row items-center justify-center">
                                <Image
                                  source={values.propertyFor === pref.value ? icons.radioChecked : icons.radioUnchecked}
                                  className="w-6 h-6 mr-2"
                                  style={{ tintColor: "white" }} // Apply white tint color
                                />
                                <Text className="text-center text-2xl font-bold text-white">
                                  {t(pref.label)}
                                </Text>
                              </View>
                            </TouchableOpacity>
                          ))}
                        </View>
                        <CustomDropdown
                          label={t("propertyType")}
                          data={
                            staticData.propertyTypeOptions[values.propertyFor as keyof typeof staticData.propertyTypeOptions]
                          }
                          value={values.propertyType}
                          placeholder={t("selectPropertyType")}
                          onChange={(selectedItem: DropdownProps) => setFieldValue("propertyType", selectedItem.value)}
                        />
                        {touched.propertyType && errors.propertyType && <Text className="text-red-500">{errors.propertyType}</Text>}

                        <Text className="text-lg font-bold mt-3">
                          {t("title")} {/* Use translation key */}
                        </Text>
                        <TextInput
                          placeholder={t("enterTitle")}
                          className="border border-gray-300 rounded-lg p-3 bg-white"
                          value={values.title}
                          onChangeText={handleChange("title")}
                          onBlur={handleBlur("title")}
                        />
                        {touched.title && errors.title && <Text className="text-red-500">{errors.title}</Text>}

                        <Text className="text-lg font-bold mt-3  mb-3">{t("description")}</Text>
                        <CustomTextarea
                          value={values.description}
                          onChangeText={handleChange("description")} />
                        {touched.description && errors.description && <Text className="text-red-500">{errors.description}</Text>}

                        <Text className="text-lg font-bold mt-3 mb-3">{t("address")}</Text>
                        <View>
                          <GoogleTextInput
                            icon={icons.target}
                            initialLocation={userAddress!}
                            handlePress={async (location) => {
                              setUserLocation(location);
                              values.latitude = location.latitude;
                              values.longitude = location.longitude;
                              values.address = location.address;
                              values.location = location.address;

                              const addressComponents = location.address_components;
                              if (!addressComponents || addressComponents.length === 0) return; // ✅ Check for undefined components

                              const totalAddComponents = addressComponents.length - 1;
                              values.state = 0;
                              values.city = 0;
                              values.zip = ""
                              for (let index = totalAddComponents; index >= 0; index--) {
                                const element = addressComponents[index];

                                // ✅ Extract ZIP Code
                                if (index === totalAddComponents && parseInt(element.long_name, 10)) {
                                  console.log("zip", index, "=>", typeof element.long_name, "=>", element.long_name);
                                  values.zip = element.long_name;
                                  continue;
                                }

                                // ✅ Extract State
                                if (!values.state) {
                                  const selectedState = stateOptions.find((state) => state.label === element.long_name);
                                  if (selectedState) {
                                    values.state = selectedState.value;
                                    console.log(selectedState)
                                    await fetchCities(values.state); // ✅ Awaiting city fetch
                                    continue;
                                  }
                                }

                                // ✅ Extract City
                                if (!values.city) {
                                  const selectedCity = cityOptions.find((city) => city.label === element.long_name);
                                  console.log(selectedCity)
                                  if (selectedCity) {
                                    values.city = selectedCity.value;
                                    break;
                                  }
                                }
                              }
                            }}
                          />
                        </View>
                        {touched.address && errors.address && <Text className="text-red-500">{errors.address}</Text>}

                        <CustomDropdown
                          label={t("state")}
                          data={stateOptions}
                          value={values.state}
                          placeholder={t("selectState")}
                          onChange={(selectedItem: DropdownProps) => {
                            setFieldValue("state", selectedItem.value);
                            fetchCities(selectedItem.value as number)
                          }}
                        />
                        {touched.state && errors.state && <Text className="text-red-500">{errors.state}</Text>}

                        <CustomDropdown
                          label={t("city")}
                          data={cityOptions}
                          value={values.city}
                          placeholder={t("selectCity")}
                          onChange={(selectedItem: DropdownProps) => setFieldValue("city", selectedItem.value)}
                        />
                        {touched.city && errors.city && <Text className="text-red-500">{errors.city}</Text>}

                        <Text className="text-lg font-bold mt-3 mb-3">{t("pincode")}</Text>
                        <TextInput
                          placeholder={t("enterPincode")}
                          className="border border-gray-300 rounded-lg p-3 bg-white"
                          keyboardType="numeric"
                          value={values.zip}
                          onChangeText={handleChange("zip")}
                          onBlur={handleBlur("zip")}
                        />
                        {touched.zip && errors.zip && <Text className="text-red-500">{errors.zip}</Text>}
                      </View>
                    )}

                    {step === 2 && values.propertyType === "Full House" && (
                      <View>
                        {/* Housing Type Dropdown */}
                        <CustomDropdown
                          label={t("housingType")}
                          data={staticData.housingTypeOptions}
                          value={values.housingType}
                          placeholder={t("selectHousingType")}
                          onChange={(selectedItem: DropdownProps) => setFieldValue("housingType", selectedItem.value)}
                        />
                        {touched.housingType && errors.housingType && (
                          <Text className="text-red-500">{errors.housingType}</Text>
                        )}

                        {/* BHK Type Dropdown */}
                        <CustomDropdown
                          label={t("bhkType")}
                          data={staticData.bhkTypeOptions}
                          value={values.bhkType}
                          placeholder={t("selectBhkType")}
                          onChange={(selectedItem: DropdownProps) => setFieldValue("bhkType", selectedItem.value)}
                        />
                        {touched.bhkType && errors.bhkType && (
                          <Text className="text-red-500">{errors.bhkType}</Text>
                        )}

                        {/* Family Preference Dropdown */}
                        <CustomDropdown
                          label={t("familyPreference")}
                          data={staticData.familyPreferenceOptions}
                          value={values.familyPreference}
                          placeholder={t("selectFamilyPreference")}
                          onChange={(selectedItem: DropdownProps) => setFieldValue("familyPreference", selectedItem.value)}
                        />
                        {touched.familyPreference && errors.familyPreference && (
                          <Text className="text-red-500">{errors.familyPreference}</Text>
                        )}

                        {/* Food Preference Dropdown */}
                        <CustomDropdown
                          label={t("foodPreference")}
                          data={staticData.foodPreferenceOptions}
                          value={values.foodPreference}
                          placeholder={t("selectFoodPreference")}
                          onChange={(selectedItem: DropdownProps) => setFieldValue("foodPreference", selectedItem.value)}
                        />
                        {touched.foodPreference && errors.foodPreference && (
                          <Text className="text-red-500">{errors.foodPreference}</Text>
                        )}
                      </View>
                    )}

                    {step === 2 && values.propertyType === "PG/Hostel" && (
                      <View>
                        {/* Room Type Dropdown */}
                        <CustomDropdown
                          label={t("roomType")}
                          data={staticData.roomTypeOptions}
                          value={values.housingType}
                          placeholder={t("selectRoomType")}
                          onChange={(selectedItem: DropdownProps) => setFieldValue("housingType", selectedItem.value)}
                        />
                        {touched.housingType && errors.housingType && (
                          <Text className="text-red-500">{errors.housingType}</Text>
                        )}

                        {/* Gender Preference Dropdown */}
                        <CustomDropdown
                          label={t("genderPreference")}
                          data={staticData.genderPreferenceOptions}
                          value={values.familyPreference}
                          placeholder={t("selectGenderPreference")}
                          onChange={(selectedItem: DropdownProps) => setFieldValue("familyPreference", selectedItem.value)}
                        />
                        {touched.familyPreference && errors.familyPreference && (
                          <Text className="text-red-500">{errors.familyPreference}</Text>
                        )}

                        {/* Food Preference Dropdown */}
                        <CustomDropdown
                          label={t("foodPreference")}
                          data={staticData.foodPreferenceOptions}
                          value={values.foodPreference}
                          placeholder={t("selectFoodPreference")}
                          onChange={(selectedItem: DropdownProps) => setFieldValue("foodPreference", selectedItem.value)}
                        />
                        {touched.foodPreference && errors.foodPreference && (
                          <Text className="text-red-500">{errors.foodPreference}</Text>
                        )}
                      </View>
                    )}

                    {step === 2 && values.propertyType === "Commercial" && (
                      <View>
                        {/* Commercial Type Dropdown */}
                        <CustomDropdown
                          label={t("commercialType")}
                          data={staticData.commercialTypeOptions}
                          value={values.housingType}
                          placeholder={t("selectCommercialType")}
                          onChange={(selectedItem: DropdownProps) => setFieldValue("housingType", selectedItem.value)}
                        />
                        {touched.housingType && errors.housingType && (
                          <Text className="text-red-500">{errors.housingType}</Text>
                        )}
                      </View>
                    )}

                    {step === 3 && (
                      <View>
                        <Text className="text-lg font-bold mt-3 mb-3">{t("rentAmount")}</Text>
                        <TextInput
                          placeholder={t("enterRentAmount")}
                          className="border border-gray-300 rounded-lg p-3 bg-white"
                          keyboardType="numeric"
                          value={String(values.rent)}
                          onChangeText={handleChange("rent")}
                          onBlur={handleBlur("rent")}
                        />
                        {touched.rent && errors.rent && <Text className="text-red-500">{errors.rent}</Text>}

                        <Text className="text-lg font-bold mt-3 mb-3">{t("advanceAmount")}</Text>
                        <TextInput
                          placeholder={t("enterAdvanceAmount")}
                          className="border border-gray-300 rounded-lg p-3 bg-white"
                          keyboardType="numeric"
                          value={String(values.advance)}
                          onChangeText={handleChange("advance")}
                          onBlur={handleBlur("advance")}
                        />
                        {touched.advance && errors.advance && <Text className="text-red-500">{errors.advance}</Text>}

                        <Text className="text-lg font-bold mb-3 mt-3">{t("isRentNegotiable")}</Text>
                        <View className="flex-row flex-wrap justify-between">
                          {['Yes', 'No'].map((pref) => (
                            <TouchableOpacity
                              key={pref}
                              className={`rounded-lg p-3 flex-1 mr-2 ${values.rentNegotiable === pref ? 'bg-[#01BB23]' : 'bg-[#FF7F19]'}`}
                              onPress={() => setFieldValue("rentNegotiable", pref)}
                            >
                              <View className="flex-row items-center justify-center">
                                <Image
                                  source={values.rentNegotiable === pref ? icons.radioChecked : icons.radioUnchecked}
                                  className="w-6 h-6 mr-2"
                                  style={{ tintColor: "white" }} // Apply white tint color
                                />
                                <Text className="text-center text-2xl font-bold text-white">
                                  {t(pref.toLowerCase())}
                                </Text>
                              </View>
                            </TouchableOpacity>
                          ))}
                        </View>

                        <Text className="text-lg font-bold mt-3 mb-3">{t("areaInSize")}</Text>
                        <TextInput
                          placeholder={t("enterAreaInSize")}
                          className="border border-gray-300 rounded-lg p-3 bg-white"
                          keyboardType="numeric"
                          value={String(values.areaInSize)}
                          onChangeText={handleChange("areaInSize")}
                          onBlur={handleBlur("areaInSize")}
                        />
                        {touched.areaInSize && errors.areaInSize && <Text className="text-red-500">{errors.areaInSize}</Text>}

                        <CustomDropdown
                          label={t("floorNumber")}
                          data={staticData.floors}
                          value={values.floorNumber}
                          placeholder={t("selectFloorNumber")}
                          onChange={(selectedItem: DropdownProps) => setFieldValue("floorNumber", selectedItem.value)}
                        />
                        {touched.floorNumber && errors.floorNumber && <Text className="text-red-500">{errors.floorNumber}</Text>}

                        {values.propertyType === "Full House" && (
                          <>
                            <CustomDropdown
                              label={t("numberOfBedRooms")}
                              data={staticData.bedRooms}
                              value={values.numberOfBedRooms}
                              placeholder={t("selectNumberOfBedRooms")}
                              onChange={(selectedItem: DropdownProps) => setFieldValue("numberOfBedRooms", selectedItem.value)}
                            />
                            {touched.numberOfBedRooms && errors.numberOfBedRooms && <Text className="text-red-500">{errors.numberOfBedRooms}</Text>}

                            <CustomDropdown
                              label={t("numberOfBalconies")}
                              data={staticData.balconies}
                              value={values.numberOfBalconies}
                              placeholder={t("selectNumberOfBalconies")}
                              onChange={(selectedItem: DropdownProps) => setFieldValue("numberOfBalconies", selectedItem.value)}
                            />
                            {touched.numberOfBalconies && errors.numberOfBalconies && <Text className="text-red-500">{errors.numberOfBalconies}</Text>}

                            <CustomDropdown
                              label={t("numberOfBathRooms")}
                              data={staticData.bathRooms}
                              value={values.numberOfBathRooms}
                              placeholder={t("selectNumberOfBathRooms")}
                              onChange={(selectedItem: DropdownProps) => setFieldValue("numberOfBathRooms", selectedItem.value)}
                            />
                            {touched.numberOfBathRooms && errors.numberOfBathRooms && <Text className="text-red-500">{errors.numberOfBathRooms}</Text>}
                          </>
                        )}

                        <CustomDropdown
                          label={t("ageOfProperty")}
                          data={staticData.ageOfProperty}
                          value={values.ageOfProperty}
                          placeholder={t("selectAgeOfProperty")}
                          onChange={(selectedItem: DropdownProps) => setFieldValue("ageOfProperty", selectedItem.value)}
                        />
                        {touched.ageOfProperty && errors.ageOfProperty && <Text className="text-red-500">{errors.ageOfProperty}</Text>}
                      </View>
                    )}

                    {step === 4 && (
                      <View>
                        <CustomDropdown
                          label={t("furnishing")}
                          data={staticData.furnishingOptions}
                          value={values.furnishing}
                          placeholder={t("selectFurnishingType")}
                          onChange={(selectedItem: DropdownProps) => setFieldValue("furnishing", selectedItem.value)}
                        />
                        {touched.furnishing && errors.furnishing && <Text className="text-red-500">{errors.furnishing}</Text>}

                        <CustomDropdown
                          label={t("parking")}
                          data={staticData.parkingOptions}
                          value={values.parking}
                          placeholder={t("selectParkingType")}
                          onChange={(selectedItem: DropdownProps) => setFieldValue("parking", selectedItem.value)}
                        />
                        {touched.parking && errors.parking && <Text className="text-red-500">{errors.parking}</Text>}

                        <CustomMultiDropdown
                          label={t("basicAmenities")}
                          data={staticData.basicAmenitiesOptions}
                          value={values.basicAmenities}
                          placeholder={t("selectBasicAmenities")}
                          onChange={(selectedItems: DropdownProps[]) => setFieldValue("basicAmenities", selectedItems.map(item => item.value))}
                        />
                        {touched.basicAmenities && errors.basicAmenities && <Text className="text-red-500">{errors.basicAmenities}</Text>}

                        <CustomMultiDropdown
                          label={t("additionalAmenities")}
                          data={staticData.additionalAmenitiesOptions}
                          value={values.additionalAmenities}
                          placeholder={t("selectAdditionalAmenities")}
                          onChange={(selectedItems: DropdownProps[]) => setFieldValue("additionalAmenities", selectedItems.map(item => item.value))}
                        />
                        {touched.additionalAmenities && errors.additionalAmenities && <Text className="text-red-500">{errors.additionalAmenities}</Text>}

                        <CustomDropdown
                          label={t("sourceOfWater")}
                          data={staticData.sourceOfWaterOptions}
                          value={values.sourceOfWater}
                          placeholder={t("selectSourceOfWater")}
                          onChange={(selectedItem: DropdownProps) => setFieldValue("sourceOfWater", selectedItem.value)}
                        />
                        {touched.sourceOfWater && errors.sourceOfWater && <Text className="text-red-500">{errors.sourceOfWater}</Text>}
                      </View>
                    )}

                    {step === 5 && (
                      <View className="mb-5">
                        <Text className="text-xl font-bold mb-4">{t("uploadImage")}</Text>
                        <ImagePickerComponent
                          images={values.images}
                          serviceId={serviceId}
                          onImageSelect={(imagePath: string) => {
                            console.log(values.images, imagePath);
                            setFieldValue("images", [...values.images, imagePath]);
                            console.log(values);
                          }}
                        />
                      </View>
                    )}
                    {step === 6 && (<ComingSoon />)}

                    {/* Navigation Buttons */}
                    <View className={`flex-row ${step > 1 ? "justify-between" : "justify-end"} mt-5 mb-10`}>
                      {step > 1 && <TouchableOpacity onPress={() => { handleSubmit(); setStep(step - 1); }} className="bg-gray-500 py-3 px-5 rounded-lg">
                        <Text className="text-white text-2xl font-bold">{t("back")}</Text>
                      </TouchableOpacity>}
                      {step < 5 ? (
                        <TouchableOpacity disabled={!!Object.keys(errors).length} onPress={() => { handleSubmit(); setStep(step + 1); }} className="bg-blue-500 py-3 px-5 rounded-lg">
                          <Text className="text-white text-2xl font-bold">{t("saveNext")}</Text>
                        </TouchableOpacity>
                      ) : (
                        <TouchableOpacity onPress={() => handleSubmit()} className="bg-green-500 py-3 px-5 rounded-lg">
                          <Text className="text-white text-2xl font-bold">{t("submit")}</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                )}
                keyExtractor={(item) => item.key}
                keyboardShouldPersistTaps="handled"
              />
            </KeyboardAvoidingView>
          )}
        </Formik>
      )}
    </SafeAreaView>
  );
};

export default MultiStepForm;
