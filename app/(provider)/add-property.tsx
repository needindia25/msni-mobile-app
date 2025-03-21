import ComingSoon from "@/components/ComingSoon";
import CustomDropdown from "@/components/CustomDropdown";
import CustomTextarea from "@/components/CustomTextarea";
import { constants } from "@/constants";
import { fetchAPI } from "@/lib/fetch";
import { DropdownProps } from "@/types/type";
import React, { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator, Alert } from "react-native";
import { Formik, FormikProps } from "formik";
import * as yup from "yup";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import CustomMultiDropdown from "@/components/CustomMultiDropdown";

const MultiStepForm = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [states, setStates] = useState<{ id: number; name: string; code: string }[]>([]);
  const [cities, setCities] = useState<{ id: number; name: string }[]>([]);

  useEffect(() => {
    const fetchStates = async () => {
      try {
        const response = await fetchAPI(`${constants.API_URL}/master/states`);
        setStates(response);
      } catch (error) {
        console.error("Error fetching states:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStates();
  }, []);

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

  const stateOptions = states.map((state) => ({ label: state.name, value: state.id }));
  const cityOptions = cities.map((district) => ({ label: district.name, value: district.id }));

  // 📌 Validation Schema using Yup
  const validationSchemas = [
    yup.object().shape({
      title: yup.string().required("Title is required"),
      propertyType: yup.string().required("Property type is required"),
      description: yup.string().min(10, "Description should be at least 10 characters").required("Description is required"),
      address: yup.string().required("Address is required"),
      // location: yup.string().required("Location is required"),
      state: yup.number().min(1, "Select a valid state").required("State is required"),
      city: yup.number().min(1, "Select a valid city").required("City is required"),
      zip: yup.string().matches(/^\d{6}$/, "Enter a valid 6-digit ZIP code").required("ZIP is required"),
    }),

    yup.object().shape({
      housingType: yup.string().required("Housing Type is required"),
      bhkType: yup.string().required("BHK Type is required"),
      familyPreference: yup.string().required("Family Preference in size is required"),
      foodPreference: yup.string().required("Food Preference is required"),

    }),
    yup.object().shape({
      rent: yup.number().min(0, "Enter valid rent").required("Rent is required"),
      advance: yup.number().min(0, "Enter valid advance").required("Advance is required"),
      areaInSize: yup.number().min(0, "Enter valid Area in size").required("Area in size is required"),
      floorNumber: yup.number().min(0, "Select a Floor number").required("Floor Number is required"),
      numberOfBedRooms: yup.number().min(0, "Select Number of Bed Rooms").required("Number of Bed Rooms is required"),
      numberOfBalconies: yup.number().min(0, "Select Number of Balconies").required("Number of Balconies is required"),
      numberOfBathRooms: yup.number().min(0, "Select Number of Bath Rooms").required("Number of Bath Rooms is required"),
      ageOfProperty: yup.number().min(0, "Select Age of Property").required("Age of Property is required"),

    }),
  ];

  // Handle Form Submission
  const handleSubmit = async (values: any) => {
    console.log("Form values:", values);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert("Error", "No token found. Please log in again.");

        await AsyncStorage.clear();
        Alert.alert("Success", "You have been logged out.");
        router.replace("/(auth)/sign-in");
        return;
      }
      const response = await fetchAPI(`${constants.API_URL}/property/create`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(values),
      });

      if (response.success) {
        Alert.alert("Success", "Property details saved successfully!");
      } else {
        Alert.alert("Error", "Something went wrong. Please try again.");
      }
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
          <Text className="mt-2 text-xl">Loading...</Text>
        </View>
      ) : (
        <Formik
          initialValues={{
            title: "",
            propertyType: "",
            description: "",
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
          }}
          validationSchema={validationSchemas[step - 1]}
          onSubmit={(values) => {
            console.log("step:", step);
            if (step === validationSchemas.length) {
              handleSubmit(values);
            } else {
              setStep(step + 1);
            }
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
            title: string;
            propertyType: string;
            description: string;
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
          }>) => (
            <ScrollView className="flex-1 p-5 bg-gray-100">
              <Text className="text-2xl font-bold text-center mb-5">Add New Property</Text>
              {/* Step Indicator */}
              <View className="flex-row justify-between mb-5">
                {[1, 2, 3, 4].map((num) => (
                  <Text key={num} className={`text-lg font-bold ${step === num ? "text-blue-500" : "text-gray-400"}`}>
                    Step {num}
                  </Text>
                ))}
              </View>

              {step === 1 && (
                <View>
                  <Text className="text-lg font-bold mb-3">Title</Text>
                  <TextInput
                    placeholder="Enter property name"
                    className="border border-gray-300 rounded-lg p-3 bg-white"
                    value={values.title}
                    onChangeText={handleChange("title")}
                    onBlur={handleBlur("title")}
                  />
                  {touched.title && errors.title && <Text className="text-red-500">{errors.title}</Text>}

                  <CustomDropdown
                    label="Property Type"
                    data={[
                      { label: "Full House", value: "Full House" },
                      { label: "PG/Hostel", value: "PG/Hostel" },
                      { label: "Flatmates", value: "Flatmates" },
                      { label: "Commercial", value: "Commercial" },
                    ]}
                    value={values.propertyType}
                    placeholder="Select a Property Type"
                    onChange={(selectedItem: DropdownProps) => setFieldValue("propertyType", selectedItem.value)}
                  />
                  {touched.propertyType && errors.propertyType && <Text className="text-red-500">{errors.propertyType}</Text>}

                  <Text className="text-lg font-bold mt-3  mb-3">Description</Text>
                  <CustomTextarea value={values.description} onChangeText={handleChange("description")} />
                  {touched.description && errors.description && <Text className="text-red-500">{errors.description}</Text>}

                  <Text className="text-lg font-bold mt-3  mb-3">Address</Text>
                  <CustomTextarea value={values.address} onChangeText={handleChange("address")} />
                  {touched.address && errors.address && <Text className="text-red-500">{errors.address}</Text>}

                  <CustomDropdown
                    label="State"
                    data={stateOptions}
                    value={values.state}
                    placeholder="Select a State"
                    onChange={(selectedItem: DropdownProps) => {
                      setFieldValue("state", selectedItem.value);
                      fetchCities(selectedItem.value as number)
                    }}
                  />
                  {touched.state && errors.state && <Text className="text-red-500">{errors.state}</Text>}

                  <CustomDropdown
                    label="City"
                    data={cityOptions}
                    value={values.city}
                    placeholder="Select a city"
                    onChange={(selectedItem: DropdownProps) => setFieldValue("city", selectedItem.value)}
                  />
                  {touched.city && errors.city && <Text className="text-red-500">{errors.city}</Text>}

                  <Text className="text-lg font-bold mt-3 mb-3">Pincode</Text>
                  <TextInput
                    placeholder="Enter Pincode"
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
                    label="Housing Type"
                    data={[
                      { label: "Apartment", value: "Apartment" },
                      { label: "Gated Community Villa", value: "Gated Community Villa" },
                      { label: "Independent House/Villa", value: "Independent House/Villa" },
                    ]}
                    value={values.housingType}
                    placeholder="Select Housing Type"
                    onChange={(selectedItem: DropdownProps) => setFieldValue("housingType", selectedItem.value)}
                  />
                  {touched.housingType && errors.housingType && (
                    <Text className="text-red-500">{errors.housingType}</Text>
                  )}

                  {/* BHK Type Dropdown */}
                  <CustomDropdown
                    label="BHK Type"
                    data={[
                      { label: "1 RHK", value: "1 RHK" },
                      { label: "1 BHK", value: "1 BHK" },
                      { label: "2 BHK", value: "2 BHK" },
                      { label: "3 BHK", value: "3 BHK" },
                      { label: "4 BHK", value: "4 BHK" },
                      { label: "4+ BHK", value: "4+ BHK" },
                    ]}
                    value={values.bhkType}
                    placeholder="Select BHK Type"
                    onChange={(selectedItem: DropdownProps) => setFieldValue("bhkType", selectedItem.value)}
                  />
                  {touched.bhkType && errors.bhkType && (
                    <Text className="text-red-500">{errors.bhkType}</Text>
                  )}

                  {/* Family Preference Dropdown */}
                  <CustomDropdown
                    label="Family Preference"
                    data={[
                      { label: "Family", value: "Family" },
                      { label: "Bachelor", value: "Bachelor" },
                      { label: "Female", value: "Female" },
                      { label: "Any", value: "Any" },
                    ]}
                    value={values.familyPreference}
                    placeholder="Select Family Preference"
                    onChange={(selectedItem: DropdownProps) => setFieldValue("familyPreference", selectedItem.value)}
                  />
                  {touched.familyPreference && errors.familyPreference && (
                    <Text className="text-red-500">{errors.familyPreference}</Text>
                  )}

                  {/* Food Preference Dropdown */}
                  <CustomDropdown
                    label="Food Preference"
                    data={[
                      { label: "Veg", value: "Veg" },
                      { label: "Non-Veg", value: "Non-Veg" },
                      { label: "Any", value: "Any" },
                    ]}
                    value={values.foodPreference}
                    placeholder="Select Food Preference"
                    onChange={(selectedItem: DropdownProps) => setFieldValue("foodPreference", selectedItem.value)}
                  />
                  {touched.foodPreference && errors.foodPreference && (
                    <Text className="text-red-500">{errors.foodPreference}</Text>
                  )}
                </View>
              )}

              {step === 3 && (
                <View>
                  <Text className="text-lg font-bold mt-3 mb-3">Rent Amount</Text>
                  <TextInput
                    placeholder="Enter Rent Amount"
                    className="border border-gray-300 rounded-lg p-3 bg-white"
                    keyboardType="numeric"
                    value={String(values.rent)}
                    onChangeText={handleChange("rent")}
                    onBlur={handleBlur("rent")}
                  />
                  {touched.rent && errors.rent && <Text className="text-red-500">{errors.rent}</Text>}

                  <Text className="text-lg font-bold mt-3 mb-3">Advance Amount</Text>
                  <TextInput
                    placeholder="Enter Advance Amount"
                    className="border border-gray-300 rounded-lg p-3 bg-white"
                    keyboardType="numeric"
                    value={String(values.advance)}
                    onChangeText={handleChange("advance")}
                    onBlur={handleBlur("advance")}
                  />
                  {touched.advance && errors.advance && <Text className="text-red-500">{errors.advance}</Text>}

                  <Text className="text-lg font-bold mb-3 mt-3">Is Rent Negotiable?</Text>
                  <View className="flex-row flex-wrap justify-between">
                    {['Yes', 'No'].map((pref) => (
                      <TouchableOpacity
                        key={pref}
                        className={`rounded-lg p-3 flex-1 mr-2 ${values.rentNegotiable === pref ? 'bg-[#01BB23]' : 'bg-[#FF7F19]'}`}
                        onPress={() => setFieldValue("rentNegotiable", pref)}
                      >
                        <Text className="text-center text-xs text-white">{pref}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <Text className="text-lg font-bold mt-3 mb-3">Area in size (sqft)</Text>
                  <TextInput
                    placeholder="Enter Area in size (sqft)"
                    className="border border-gray-300 rounded-lg p-3 bg-white"
                    keyboardType="numeric"
                    value={String(values.areaInSize)}
                    onChangeText={handleChange("areaInSize")}
                    onBlur={handleBlur("areaInSize")}
                  />
                  {touched.areaInSize && errors.areaInSize && <Text className="text-red-500">{errors.areaInSize}</Text>}

                  <CustomDropdown
                    label="Floor Number"
                    data={[
                      { label: "Ground Floor", value: 0 },
                      { label: "1st Floor", value: 1 },
                      { label: "2nd Floor", value: 2 },
                      { label: "3rd Floor", value: 3 },
                      { label: "4th Floor", value: 4 },
                      { label: "5th Floor", value: 5 },
                      { label: "6th Floor", value: 6 },
                      { label: "7th Floor", value: 7 },
                      { label: "8th Floor", value: 8 },
                      { label: "9th Floor", value: 9 },
                      { label: "10th Floor", value: 10 },
                      { label: "11th Floor", value: 11 },
                      { label: "12th Floor", value: 12 },
                      { label: "13th Floor", value: 13 },
                      { label: "14th Floor", value: 14 },
                      { label: "15th Floor", value: 15 },
                      { label: "16th Floor", value: 16 },
                      { label: "17th Floor", value: 17 },
                      { label: "18th Floor", value: 18 },
                      { label: "19th Floor", value: 19 },
                      { label: "20th Floor", value: 20 },
                    ]}
                    value={values.floorNumber}
                    placeholder="Select a Floor Number"
                    onChange={(selectedItem: DropdownProps) => setFieldValue("floorNumber", selectedItem.value)}
                  />
                  {touched.floorNumber && errors.floorNumber && <Text className="text-red-500">{errors.floorNumber}</Text>}

                  <CustomDropdown
                    label="Number of Bed Room(s)"
                    data={[
                      { label: "1", value: 1 },
                      { label: "2", value: 2 },
                      { label: "3", value: 3 },
                      { label: "4+", value: 4 },
                    ]}
                    value={values.numberOfBedRooms}
                    placeholder="Select a Number of Bed Room(s)"
                    onChange={(selectedItem: DropdownProps) => setFieldValue("numberOfBedRooms", selectedItem.value)}
                  />
                  {touched.numberOfBedRooms && errors.numberOfBedRooms && <Text className="text-red-500">{errors.numberOfBedRooms}</Text>}

                  <CustomDropdown
                    label="Number of Balconies"
                    data={[
                      { label: "0", value: 0 },
                      { label: "1", value: 1 },
                      { label: "2", value: 2 },
                      { label: "3", value: 3 },
                      { label: "4+", value: 4 },
                    ]}
                    value={values.numberOfBalconies}
                    placeholder="Select a Number of Balconies"
                    onChange={(selectedItem: DropdownProps) => setFieldValue("numberOfBalconies", selectedItem.value)}
                  />
                  {touched.numberOfBalconies && errors.numberOfBalconies && <Text className="text-red-500">{errors.numberOfBalconies}</Text>}

                  <CustomDropdown
                    label="Number of Bath Room(s)"
                    data={[
                      { label: "1", value: 1 },
                      { label: "2", value: 2 },
                      { label: "3", value: 3 },
                      { label: "4", value: 4 },
                    ]}
                    value={values.numberOfBathRooms}
                    placeholder="Select a Number of Bath Room(s)"
                    onChange={(selectedItem: DropdownProps) => setFieldValue("numberOfBathRooms", selectedItem.value)}
                  />
                  {touched.numberOfBathRooms && errors.numberOfBathRooms && <Text className="text-red-500">{errors.numberOfBathRooms}</Text>}

                  <CustomDropdown
                    label="Age of Property"
                    data={[
                      { label: "New", value: 0 },
                      { label: "1", value: 1 },
                      { label: "2", value: 2 },
                      { label: "3", value: 3 },
                      { label: "4", value: 4 },
                      { label: "5", value: 5 },
                      { label: "6", value: 6 },
                      { label: "7", value: 7 },
                      { label: "8", value: 8 },
                      { label: "9", value: 9 },
                      { label: "10+", value: 10 },
                    ]}
                    value={values.ageOfProperty}
                    placeholder="Select a Number of Bath Room(s)"
                    onChange={(selectedItem: DropdownProps) => setFieldValue("ageOfProperty", selectedItem.value)}
                  />
                  {touched.ageOfProperty && errors.ageOfProperty && <Text className="text-red-500">{errors.ageOfProperty}</Text>}

                </View>

              )}

              {step === 4 && (
                <View>
                  <CustomDropdown
                    label="Furnishing"
                    data={[
                      { label: "Full", value: "Full" },
                      { label: "Semi", value: "Semi" },
                      { label: "None", value: "None" },
                    ]}
                    value={values.furnishing}
                    placeholder="Select Furnishing Type"
                    onChange={(selectedItem: DropdownProps) => setFieldValue("furnishing", selectedItem.value)}
                  />
                  {touched.furnishing && errors.furnishing && <Text className="text-red-500">{errors.furnishing}</Text>}

                  <CustomDropdown
                    label="Parking"
                    data={[
                      { label: "2 Wheeler", value: "2 Wheeler" },
                      { label: "4 Wheeler", value: "4 Wheeler" },
                      { label: "2 and 4 Wheeler", value: "2 and 4 Wheeler" },
                      { label: "None", value: "None" },
                    ]}
                    value={values.parking}
                    placeholder="Select Parking Type"
                    onChange={(selectedItem: DropdownProps) => setFieldValue("parking", selectedItem.value)}
                  />
                  {touched.parking && errors.parking && <Text className="text-red-500">{errors.parking}</Text>}


                  <CustomMultiDropdown
                    label="Basic Amenities"
                    data={[
                      { label: "Lift", value: "Lift" },
                      { label: "Power backup", value: "Power backup" },
                      { label: "Swimming Pool", value: "Swimming Pool" },
                      { label: "Play Area", value: "Play Area" },
                      { label: "Security", value: "Security" }
                    ]}
                    value={values.basicAmenities}
                    placeholder="Select Basic Amenities"
                    onChange={(selectedItems: DropdownProps[]) => setFieldValue("basicAmenities", selectedItems.map(item => item.value))}
                  />
                  {touched.basicAmenities && errors.basicAmenities && <Text className="text-red-500">{errors.basicAmenities}</Text>}

                  <CustomMultiDropdown
                    label="Additional Amenities"
                    data={[
                      { label: "Washing Machine", value: "Washing Machine" },
                      { label: "Fridge", value: "Fridge" },
                      { label: "AC", value: "AC" },
                      { label: "Cooler", value: "Cooler" },
                      { label: "Sofa", value: "Sofa" },
                      { label: "Internet", value: "Internet" },
                      { label: "Light", value: "Light" },
                      { label: "Fan", value: "Fan" },
                      { label: "RO Water", value: "RO Water" },
                      { label: "Bed", value: "Bed" },
                      { label: "Dining table", value: "Dining table" }
                    ]}
                    value={values.additionalAmenities}
                    placeholder="Select Additional Amenities"
                    onChange={(selectedItems: DropdownProps[]) => setFieldValue("additionalAmenities", selectedItems.map(item => item.value))}
                  />
                  {touched.additionalAmenities && errors.additionalAmenities && <Text className="text-red-500">{errors.additionalAmenities}</Text>}

                  <CustomDropdown
                    label="Source of water"
                    data={[
                      { label: "Supply Water", value: "Supply Water" },
                      { label: "Borewell", value: "Borewell" },
                      { label: "Both (Supply and Borewell)", value: "Both" },
                      { label: "Other", value: "Other" }
                    ]}
                    value={values.sourceOfWater}
                    placeholder="Select Source of water"
                    onChange={(selectedItem: DropdownProps) => setFieldValue("sourceOfWater", selectedItem.value)}
                  />
                  {touched.sourceOfWater && errors.sourceOfWater && <Text className="text-red-500">{errors.sourceOfWater}</Text>}
                </View>
              )}

              {step === 5 && (<ComingSoon />)}
              {step === 6 && (<ComingSoon />)}

              {/* Navigation Buttons */}
              <View className="flex-row justify-between mt-5 mb-10">
                {step > 1 && <TouchableOpacity onPress={() => setStep(step - 1)} className="bg-gray-500 py-3 px-5 rounded-lg">
                  <Text className="text-white text-lg">Back</Text>
                </TouchableOpacity>}
                {step < 4 ? (
                  <TouchableOpacity disabled={!!Object.keys(errors).length} onPress={() => setStep(step + 1)} className="bg-blue-500 py-3 px-5 rounded-lg">
                    <Text className="text-white text-lg">Next - {Object.keys(errors).length}</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity onPress={() => handleSubmit()} className="bg-green-500 py-3 px-5 rounded-lg">
                    <Text className="text-white text-lg">Submit</Text>
                  </TouchableOpacity>
                )}
              </View>
            </ScrollView>
          )}
        </Formik>
      )}
    </SafeAreaView>
  );
};

export default MultiStepForm;
