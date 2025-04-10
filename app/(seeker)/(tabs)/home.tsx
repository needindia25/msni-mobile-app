import React, { useState, useRef, useEffect } from 'react';
import { Alert, View, Text, TouchableOpacity, SafeAreaView, ScrollView, TextInput, Modal, Dimensions, Image, ActivityIndicator } from 'react-native';
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import CustomCheckBox from '@/components/CustomCheckBox';
import CustomRadioGroup from '@/components/CustomRadioGroup';
import { useRouter } from 'expo-router';
// import ComingSoon from '@/components/ComingSoon';
import { fetchAPI } from "@/lib/fetch";
import { Dropdown } from 'react-native-element-dropdown';
import { constants, icons, images } from "@/constants";

import { getStaticData } from "@/constants/staticData"; // Import static data
import { useTranslation } from "react-i18next"; // Import useTranslation
import CustomDropdown from '@/components/CustomDropdown';
import { DropdownProps } from '@/types/type';
import en from '../../locales/en';

const Home = () => {
  const router = useRouter();
  const { t } = useTranslation();

  const staticData = getStaticData(t); // Get static data with translations

  const [searchData, setSearchData] = useState({
    propertyFor: "Rent",
    propertyType: "Full House",
    latitude: 0,
    longitude: 0,
    address: "",
    location: "",
    state: 0,
    district: 0,
    city: "",
    housingType: [] as string[],
    bhkType: [] as string[],
    familyPreference: "Any",
    foodPreference: "Any",
    rent_min: 0,
    rent_max: 0,
    rentNegotiable: "No",
    furnishing: "None",
    parking: [] as string[],
    basicAmenities: [] as string[],
    additionalAmenities: [] as string[],
    sourceOfWater: [] as string[],
  });

  const handleInputChange = (field: string, value: any) => {
    console.log("Field:", field, "Value:", value);
    setSearchData((prev) => ({
      ...prev,
      [field]: value,
    }));
  }
  const [rentRange, setRentRange] = useState([0, 500000]);
  const [bhkTypeModalVisible, setBhkTypeModalVisible] = useState(false);
  const [selectedBhkTypes, setSelectedBhkTypes] = useState<string[]>([]);
  const [roomTypeModalVisible, setRoomTypeModalVisible] = useState(false);
  const [selectedRoomTypes, setSelectedRoomTypes] = useState<string[]>([]);
  const [housingTypeModalVisible, setHousingTypesVisible] = useState(false);
  const [selectedHousingTypes, setSelectedHousingTypes] = useState<string[]>([]);


  const [commercialTypeModalVisible, setCommercialTypeModalVisible] = useState(false);
  const [selectedCommercialTypes, setSelectedCommercialTypes] = useState<string[]>([]);

  useEffect(() => {
    const updateRentRange = async () => {
      searchData.rent_min = rentRange[0];
      searchData.rent_max = rentRange[1];
      console.log("Updated Rent Range:", searchData.rent_min, searchData.rent_max);
    };
    updateRentRange();
  }, [rentRange]);

  const toggleBhkType = (type: string) => {
    if (selectedBhkTypes.includes(type)) {
      setSelectedBhkTypes(selectedBhkTypes.filter((item) => item !== type));
    } else {
      setSelectedBhkTypes([...selectedBhkTypes, type]);
    }
    handleInputChange("bhkType", selectedBhkTypes);
  };

  const toggleHousingType = (type: string) => {
    if (selectedHousingTypes.includes(type)) {
      setSelectedHousingTypes(selectedHousingTypes.filter((item) => item !== type));
    } else {
      setSelectedHousingTypes([...selectedHousingTypes, type]);
    }
    handleInputChange("housingType", selectedHousingTypes);
  };

  const toggleRoomType = (type: string) => {
    if (selectedRoomTypes.includes(type)) {
      setSelectedRoomTypes(selectedRoomTypes.filter((item) => item !== type));
    } else {
      setSelectedRoomTypes([...selectedRoomTypes, type]);
    }
    handleInputChange("housingType", selectedRoomTypes);
  };

  const toggleCommercialType = (type: string) => {
    if (selectedCommercialTypes.includes(type)) {
      setSelectedCommercialTypes(selectedCommercialTypes.filter((item) => item !== type));
    } else {
      setSelectedCommercialTypes([...selectedCommercialTypes, type]);
    }
    handleInputChange("commercialType", selectedCommercialTypes);
  };

  const [loading, setLoading] = useState(true);

  const validateForm = () => {
    console.log("Form data:", searchData);
    if (searchData.state === 0) {
      Alert.alert(
        t("error"),
        t("selectValidState"),
        [
          {
            text: t("ok"),
          },
        ]);
      return false;
    }
    if (searchData.district === 0) {
      Alert.alert(
        t("error"),
        t("selectValidDistrict"),
        [
          {
            text: t("ok"),
          },
        ]);
      return false;
    }
    if (searchData.city.trim().length < 2) {
      Alert.alert(
        t("error"),
        t("cityError"),
        [
          {
            text: t("ok"),
          },
        ]);
      return false;
    }
    return true;
  };

  const onProprtySearchPress = async () => {
    console.log("Form Data:", searchData);
    // return;
    if (!validateForm()) {
      return;
    }
    router.push({
      pathname: '/(seeker)/search-list',
      params: {
        searchData: JSON.stringify(searchData), // Pass searchData as a string
      },
    });
  };

  const [states, setStates] = useState<{ id: number; name: string; code: string }[]>([]);
  const [districts, setDistricts] = useState<{ id: number; name: string }[]>([]);
  useEffect(() => {
    const fetchStates = async () => {
      try {
        const response = await fetchAPI(`${constants.API_URL}/master/states`); // Replace with your API endpoint
        setStates(response);
        if (searchData.state) {
          fetchDistricts(searchData.state);
        }
        console.log("States fetched:", response);
      } catch (error) {
        console.error('Error fetching states--:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStates();
  }, []);

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

  const stateOptions = states?.map(state => ({
    label: state.name,
    value: state.id
  })) || [];

  let districtOptions = districts.map((district: any) => ({
    label: district.name,
    value: district.id,
  }));

  const getKeyByValue = (value: string): string => {
    // Find the key by value
    const key = Object.keys(en.translation).find((k) => en.translation[k as keyof typeof en.translation] === value);

    // Return the key or fallback to the lowercase version of the value
    if (key) {
      return t(key);
    }
    return value;
  };

  return (
    <SafeAreaView className="flex h-full bg-white">
      <ScrollView className="flex-1 bg-white p-5">
        {loading ? (
          <View className="flex-1 justify-center mt-[5%] items-center">
            <ActivityIndicator size="large" color="#00ff00" />
            <Text className="mt-2 text-base">{t("loading")}</Text>
          </View>
        ) : (
          <>
            <Text className="text-2xl font-bold text-center mb-5">{t("searchProperties")}</Text>
            <View className="mb-5">
              <View>
                <View className="flex-row flex-wrap justify-between mt-5">
                  {staticData.propertyForOptions.map((pref) => (
                    <TouchableOpacity
                      key={pref.value}
                      className={`rounded-lg p-3 flex-1 mr-2 ${searchData.propertyFor === pref.value ? 'bg-[#01BB23]' : 'bg-[#FF7F19]'}`}
                      onPress={() => handleInputChange("propertyFor", pref.value)}
                    >
                      <View className="flex-row items-center justify-center">
                        <Image
                          source={searchData.propertyFor === pref.value ? icons.radioChecked : icons.radioUnchecked}
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
              </View>
            </View>
            <View className="mt-4">
              <CustomDropdown
                label={t("state")}
                data={stateOptions}
                value={searchData.state}
                placeholder={t("selectState")}
                onChange={(selectedItem: DropdownProps) => {
                  handleInputChange("state", selectedItem.value);
                  handleInputChange("district", 0);
                  fetchDistricts(selectedItem.value as number)
                }}
              />
            </View>
            <View className="mt-4">
              <CustomDropdown
                label={t("district")}
                data={districtOptions}
                value={searchData.district}
                placeholder={t("selectDistrict")}
                onChange={(selectedItem: DropdownProps) => {
                  handleInputChange("district", selectedItem.value);
                }}
              />
            </View>
            <View className="mt-4">
              <Text className="text-base font-bold mt-3 mb-3">{t("city")}</Text>
              <TextInput
                placeholder={t("enterCity")}
                className={`border rounded-lg p-3 bg-white "border-gray-300}`}
                value={searchData.city}
                onChangeText={(value) => handleInputChange("city", value)}
              />
            </View>
            <View className="mt-4">
              <Text className="text-base font-bold mt-3 mb-3">{t("address")}</Text>
              <View>
                <TextInput
                  placeholder={t("enterAddressManually")}
                  className={`border rounded-lg p-3 bg-white mt-3 border-gray-300}`}
                  value={searchData.address}
                  onChangeText={(value) => handleInputChange("address", value)}
                />
              </View>
            </View>
            <View className="mt-4">
              <Text className="text-lg font-bold mb-3">{t("propertyType")}</Text>
              <View className="flex-row flex-wrap justify-between">
                {staticData.propertyTypeOptions[searchData.propertyFor as keyof typeof staticData.propertyTypeOptions].map((propertyType, index) => (
                  <TouchableOpacity
                    key={index}
                    className={`rounded-lg p-3 mb-3 ${searchData.propertyType === propertyType.value ? 'bg-[#01BB23]' : 'bg-[#FF7F19]'}`}
                    style={{
                      width: '48%', // Ensures two items fit per row
                      marginRight: searchData.propertyType.indexOf(propertyType.value) % 2 === 0 ? '2%' : 0, // Adds margin to the right for the first item in the row
                    }}
                    onPress={() => handleInputChange("propertyType", propertyType.value)}
                  >
                    <View className="flex-row items-center justify-center">
                      <Image
                        source={searchData.propertyType === propertyType.value ? icons.radioChecked : icons.radioUnchecked}
                        className="w-6 h-6 mr-2"
                        style={{ tintColor: "white" }} // Apply white tint color
                      />
                      <Text className="text-center text-base font-bold text-white">{propertyType.label}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            {searchData.propertyType === 'Full House' && (
              <>
                <View className="mb-5">
                  <Text className="text-lg font-bold mb-3">{t("housingType")}</Text>
                  <TouchableOpacity
                    className="bg-gray-100 rounded-lg p-3 mb-3 w-full"
                    onPress={() => setHousingTypesVisible(true)}
                  >
                    <Text className="text-center">{selectedHousingTypes.length > 0 ? selectedHousingTypes.map((val) => { return getKeyByValue(val) }).join(', ') : t("selectHousingType")}</Text>
                  </TouchableOpacity>
                </View>

                <View className="mb-5">
                  <Text className="text-lg font-bold mb-3">{t("bhkType")}</Text>
                  <TouchableOpacity
                    className="bg-gray-100 rounded-lg p-3 mb-3 w-full"
                    onPress={() => setBhkTypeModalVisible(true)}
                  >
                    <Text className="text-center">{selectedBhkTypes.length > 0 ? selectedBhkTypes.map((val) => { return getKeyByValue(val) }).join(', ') : t("selectBhkType")}</Text>
                  </TouchableOpacity>
                </View>
                <View className="mb-5">
                  <Text className="text-lg font-bold mb-3">{t("familyPreference")}</Text>
                  <View className="flex-row flex-wrap justify-between">
                    {staticData.familyPreferenceOptions.map((familyPreference, index) => (
                      <TouchableOpacity
                        key={index}
                        className={`rounded-lg p-3 mb-3 ${searchData.familyPreference === familyPreference.value ? 'bg-[#01BB23]' : 'bg-[#FF7F19]'}`}
                        style={{
                          width: '48%', // Ensures two items fit per row
                          marginRight: searchData.familyPreference.indexOf(familyPreference.value) % 2 === 0 ? '2%' : 0, // Adds margin to the right for the first item in the row
                        }}
                        onPress={() => handleInputChange("familyPreference", familyPreference.value)}
                      >
                        <View className="flex-row items-center justify-center">
                          <Image
                            source={searchData.familyPreference === familyPreference.value ? icons.radioChecked : icons.radioUnchecked}
                            className="w-6 h-6 mr-2"
                            style={{ tintColor: "white" }} // Apply white tint color
                          />
                          <Text className="text-center text-base font-bold text-white">{familyPreference.label}</Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
                {/* <View className="mb-5">
                  <Text className="text-lg font-bold mb-3">{t("furnishing")}</Text>
                  <View>
                    <CustomRadioGroup
                      options={staticData.furnishingOptions}
                      selectedValue={searchData.furnishing}
                      onValueChange={(value: string) => handleInputChange("furnishing", value)}
                    />
                  </View>
                </View> */}

                {/* <View className="mb-5">
                  <Text className="text-lg font-bold mb-3">{t("foodPreference")}</Text>
                  <View>
                    <CustomRadioGroup
                      options={staticData.foodPreferenceOptions}
                      selectedValue={searchData.foodPreference}
                      onValueChange={(value: string) => handleInputChange("foodPreference", value)}
                    />
                  </View>
                </View> */}
              </>
            )}
            {(searchData.propertyType === 'PG/Hostel') && (
              <>
                <View className="mb-5">
                  <Text className="text-lg font-bold mb-3">{t("roomType")}</Text>
                  <TouchableOpacity
                    className="bg-gray-100 rounded-lg p-3 mb-3 w-full"
                    onPress={() => setRoomTypeModalVisible(true)}
                  >
                    <Text className="text-center">{selectedRoomTypes.length > 0 ? selectedRoomTypes.map((val) => { return getKeyByValue(val) }).join(', ') : t("selectRoomType")}</Text>
                  </TouchableOpacity>
                </View>
                <View className="mb-5">
                  <Text className="text-lg font-bold mb-3">{t("genderPreference")}</Text>
                  <View className="flex-row justify-between mb-3">
                    {staticData.genderPreferenceOptions.map((genderPreference, index) => (
                      <TouchableOpacity
                        key={index}
                        className={`rounded-lg p-3 flex-1 mr-2 ${searchData.familyPreference === genderPreference.value ? 'bg-[#01BB23]' : 'bg-[#FF7F19]'}`}
                        onPress={() => handleInputChange("familyPreference", genderPreference.value)}
                      >
                        <View className="flex-row items-center justify-center">
                          <Image
                            source={searchData.familyPreference === genderPreference.value ? icons.radioChecked : icons.radioUnchecked}
                            className="w-6 h-6 mr-2"
                            style={{ tintColor: "white" }} // Apply white tint color
                          />
                          <Text className="text-center text-base font-bold text-white">{genderPreference.label}</Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </>
            )}
            {searchData.propertyType === 'Commercial' && (
              <View className="mb-5">
                <Text className="text-lg font-bold mb-3">{t("commercialType")}</Text>
                <TouchableOpacity
                  className="bg-gray-100 rounded-lg p-3 mb-3 w-full"
                  onPress={() => setCommercialTypeModalVisible(true)}
                >
                  <Text className="text-center">{selectedCommercialTypes.length > 0 ? selectedCommercialTypes.map((val) => { return getKeyByValue(val) }).join(', ') : 'Select Commercial Type'}</Text>
                </TouchableOpacity>
              </View>
            )}
            <Modal
              visible={housingTypeModalVisible}
              transparent={true}
              animationType="slide"
              onRequestClose={() => setHousingTypesVisible(false)}
            >
              <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
                <View className="bg-white rounded-lg p-5 w-3/4">
                  <Text className="text-lg font-bold mb-3">{t("selectHousingType")}</Text>
                  {staticData.housingTypeOptions.map((housingType, index) => (
                    <View key={index} className="flex-row items-center mb-2">
                      <CustomCheckBox
                        value={selectedHousingTypes.includes(housingType.value)}
                        onValueChange={() => toggleHousingType(housingType.value)}
                      />
                      <Text className="ml-2">{housingType.label}</Text>
                    </View>
                  ))}
                  <TouchableOpacity
                    className="bg-teal-500 rounded-lg p-3 mt-5"
                    onPress={() => setHousingTypesVisible(false)}
                  >
                    <Text className="text-white text-center">{t("done")}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
            <Modal
              visible={bhkTypeModalVisible}
              transparent={true}
              animationType="slide"
              onRequestClose={() => setBhkTypeModalVisible(false)}
            >
              <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
                <View className="bg-white rounded-lg p-5 w-3/4">
                  <Text className="text-lg font-bold mb-3">{t("selectBhkType")}</Text>
                  {staticData.bhkTypeOptions.map((bhkType, index) => (
                    <View key={index} className="flex-row items-center mb-2">
                      <CustomCheckBox
                        value={selectedBhkTypes.includes(bhkType.value)}
                        onValueChange={() => toggleBhkType(bhkType.value)}
                      />
                      <Text className="ml-2">{bhkType.label}</Text>
                    </View>
                  ))}
                  <TouchableOpacity
                    className="bg-teal-500 rounded-lg p-3 mt-5"
                    onPress={() => setBhkTypeModalVisible(false)}
                  >
                    <Text className="text-white text-center">{t("done")}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
            <Modal
              visible={roomTypeModalVisible}
              transparent={true}
              animationType="slide"
              onRequestClose={() => setRoomTypeModalVisible(false)}
            >
              <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
                <View className="bg-white rounded-lg p-5 w-3/4">
                  <Text className="text-lg font-bold mb-3">{t("selectRoomType")}</Text>
                  {staticData.roomTypeOptions.map((roomType, index) => (
                    <View key={index} className="flex-row items-center mb-2">
                      <CustomCheckBox
                        value={selectedRoomTypes.includes(roomType.value)}
                        onValueChange={() => toggleRoomType(roomType.value)}
                      />
                      <Text className="ml-2">{roomType.label}</Text>
                    </View>
                  ))}
                  <TouchableOpacity
                    className="bg-teal-500 rounded-lg p-3 mt-5"
                    onPress={() => setRoomTypeModalVisible(false)}
                  >
                    <Text className="text-white text-center">{t("done")}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
            <Modal
              visible={commercialTypeModalVisible}
              transparent={true}
              animationType="slide"
              onRequestClose={() => setCommercialTypeModalVisible(false)}
            >
              <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
                <View className="bg-white rounded-lg p-5 w-3/4">
                  <Text className="text-lg font-bold mb-3">{t("selectCommercialType")}</Text>
                  {staticData.commercialTypeOptions.map((commercialType, index) => (
                    <View key={index} className="flex-row items-center mb-2">
                      <CustomCheckBox
                        value={selectedCommercialTypes.includes(commercialType.value)}
                        onValueChange={() => toggleCommercialType(commercialType.value)}
                      />
                      <Text className="ml-2">{commercialType.label}</Text>
                    </View>
                  ))}
                  <TouchableOpacity
                    className="bg-teal-500 rounded-lg p-3 mt-5"
                    onPress={() => setCommercialTypeModalVisible(false)}
                  >
                    <Text className="text-white text-center">{t("done")}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>
            <TouchableOpacity className="bg-teal-500 rounded-lg p-3 mt-5 mb-10 w-full"
              onPress={() => onProprtySearchPress()}>
              <Text className="text-white text-center text-lg">{t("search")}</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView >
    </SafeAreaView>
  );
};

export default Home;