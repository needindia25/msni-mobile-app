import React, { useState, useRef, useEffect } from 'react';
import {Alert, View, Text, TouchableOpacity, SafeAreaView, ScrollView, TextInput, Modal, Dimensions } from 'react-native';
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import CustomCheckBox from '@/components/CustomCheckBox';
import CustomRadioGroup from '@/components/CustomRadioGroup';
import { useRouter } from 'expo-router';
// import ComingSoon from '@/components/ComingSoon';
import { fetchAPI } from "@/lib/fetch";
import { Dropdown } from 'react-native-element-dropdown';
import { constants, icons, images } from "@/constants";


const Home = () => {
  const router = useRouter();
  const [rentRange, setRentRange] = useState([0, 500000]);
  const [bhkTypeModalVisible, setBhkTypeModalVisible] = useState(false);
  const [selectedBhkTypes, setSelectedBhkTypes] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('RENT');
  const [lookingFor, setLookingFor] = useState('Full House');
  const [roomTypeModalVisible, setRoomTypeModalVisible] = useState(false);
  const [selectedRoomTypes, setSelectedRoomTypes] = useState<string[]>([]);
  const [commercialTypeModalVisible, setCommercialTypeModalVisible] = useState(false);
  const [selectedCommercialTypes, setSelectedCommercialTypes] = useState<string[]>([]);
  const [preference, setPreference] = useState('Any');

  const bhkTypes = ['1 RK', '1 BHK', '2 BHK', '3 BHK', '4 BHK', '4+ BHK'];
  const roomTypes = ['Single', 'Sharing (2)', 'Sharing (3)', 'Sharing (4)'];
  const commercialTypes = ['Office Space', 'Co-Working', 'Shop', 'Showroom', 'Godown', 'Warehouse', 'Industrial Shed', 'Industrial Building', 'Restaurant/Cafe/Others'];
  const preferences = ['Family', 'Bachelor', 'Female', 'Any'];

  const toggleBhkType = (type: string) => {
    if (selectedBhkTypes.includes(type)) {
      setSelectedBhkTypes(selectedBhkTypes.filter((item) => item !== type));
    } else {
      setSelectedBhkTypes([...selectedBhkTypes, type]);
    }
  };

  const toggleRoomType = (type: string) => {
    if (selectedRoomTypes.includes(type)) {
      setSelectedRoomTypes(selectedRoomTypes.filter((item) => item !== type));
    } else {
      setSelectedRoomTypes([...selectedRoomTypes, type]);
    }
  };

  const toggleCommercialType = (type: string) => {
    if (selectedCommercialTypes.includes(type)) {
      setSelectedCommercialTypes(selectedCommercialTypes.filter((item) => item !== type));
    } else {
      setSelectedCommercialTypes([...selectedCommercialTypes, type]);
    }
  };

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showVerificationModal, setVerificationModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState<{
    state: number;
    city: number;
    locality: string;
    lookingFor: string;
    BHKType: string | null;
    rentRange: number|null;    
  }>({
    state: 5,
    city: 0,
    locality: "",
    lookingFor: "fullHouse", 
    BHKType: null,
    rentRange: null,
  });

  const validateForm = () => {
    console.log("Form data:", form);
    if (!form.state) {
      Alert.alert("Error", "State is required");
      return false;
    }
    if (!form.city) {
      Alert.alert("Error", "City is required");
      return false;
    }
    if (!form.locality) {
      Alert.alert("Error", "Locality is required");
      return false;
    }
    return true;
  };

  const onVerficationPress = async () => {
    if (!validateForm()) {
      return;
    }
    setVerificationModal(true);
  };

  const onProprtySearchPress = async () => {
    setLoading(true);
    setVerificationModal(false);
    try {
      const response = await fetch(`${constants.API_URL}/getPropertyList/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          state: form.state,
          city: form.city,
          locality: form.locality,
          lookingFor: form.lookingFor,
          BHKType: form.BHKType,
          rentRange: form.rentRange,
        }),
      });
      console.log(response)

      if (response.ok) {
        //setShowSuccessModal(true);
        console.log(response)

      } else {
        const errorData = await response.json();
        Alert.alert("Error", errorData.error || "No Property Found for the selected options!");
      }
    } catch (err) {
      Alert.alert("Error", "An error occurred");
    } finally {
      setLoading(false);
    }
  };

const [states, setStates] = useState<{ id: number; name: string; code: string }[]>([]);
const [cities, setCities] = useState<{ id: number; name: string }[]>([]);

  useEffect(() => {
    const fetchStates = async () => {
      try {
        const response = await fetchAPI(`${constants.API_URL}/master/states`); // Replace with your API endpoint
        setStates(response);
      } catch (error) {
        console.error('Error fetching states--:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStates();
  }, []);

  useEffect(() => {
    // Fetch cities when a state is selected
    const fetchCities = async () => {
      if (form.state) {
        try {
          const response = await fetchAPI(
            `${constants.API_URL}/master/state/${form.state}/cities`
          );
          setCities(response);
        } catch (error) {
          console.error('Error fetching citiess:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchCities();
  }, [form.state]);

  const stateOptions = states?.map(state => ({
    label: state.name,
    value: state.id
  })) || [];

  const cityOptions = cities?.map(city => ({
    label: city.name,
    value: city.id
  })) || [];

  const screenWidth = Dimensions.get('screen').width;
  
  return (
    <SafeAreaView className="flex h-full bg-white">
      <ScrollView className="flex-1 bg-white p-5">
        <Text className="text-2xl font-bold text-center mb-5">Search Properties</Text>
        <View className="mb-5">
          <Text className="text-lg font-bold mb-3">Category</Text>
          {/* <View className="flex-row justify-between mb-3">
            <TouchableOpacity
              className={`rounded-lg p-3 flex-1 mr-2 ${selectedCategory === 'BUY' ? 'bg-teal-500' : 'bg-gray-100'}`}
              onPress={() => setSelectedCategory('BUY')}
            >
              <Text className={`text-center ${selectedCategory === 'BUY' ? 'text-white' : 'text-black'}`}>BUY</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`rounded-lg p-3 flex-1 ml-2 ${selectedCategory === 'RENT' ? 'bg-teal-500' : 'bg-gray-100'}`}
              onPress={() => setSelectedCategory('RENT')}
            >
              <Text className={`text-center ${selectedCategory === 'RENT' ? 'text-white' : 'text-black'}`}>RENT</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`rounded-lg p-3 flex-1 ml-2 ${selectedCategory === 'LEASE' ? 'bg-teal-500' : 'bg-gray-100'}`}
              onPress={() => setSelectedCategory('LEASE')}
            >
              <Text className={`text-center ${selectedCategory === 'LEASE' ? 'text-white' : 'text-black'}`}>LEASE</Text>
            </TouchableOpacity>
          </View> */}
          <View>
            <CustomRadioGroup
              options={[
                { label: "RENT", value: "RENT" },
                { label: "LEASE", value: "LEASE" },
               // { label: "BUY", value: "BUY" },
              ]}
              selectedValue={selectedCategory}
              onValueChange={(value: string) => setSelectedCategory(value)}
            />
          </View>
        </View>
        <View className="mt-4">
          <Text className="text-lg mb-2">State</Text>
          <Dropdown
            data={stateOptions}
            labelField="label"
            valueField="value"
            placeholder="Select a state"
            value={form.state}
            onChange={(item) => {
              console.log("Selected state:", item);
              setForm({ ...form, state: item.value });
            }}
            style={{
              padding: 10,
              borderColor: 'gray',
              borderWidth: 1,
              borderRadius: 5,
            }}
          />
        </View>
        <View className="mt-4">
          <Text className="text-lg mb-2">City</Text>
          <Dropdown
            data={cityOptions}
            labelField="label"
            valueField="value"
            placeholder="Select your City"
            value={form.city}
            onChange={(item) => {
              console.log("Selected city:", item);
              setForm({ ...form, city: item.value });
            }}
            style={{
              padding: 10,
              borderColor: 'gray',
              borderWidth: 1,
              borderRadius: 5,
            }}
            disable={!form.state}
          />
        </View>
        {/* <View className="mb-5">
          <Text className="text-lg font-bold mb-3">City</Text>
          <TouchableOpacity className="bg-gray-100 rounded-lg p-3 mb-3 w-full">
            <Text className="text-center">Bangalore</Text>
          </TouchableOpacity>
        </View> */}

        <View className="mb-5">
          <Text className="text-lg font-bold mb-3">Locality</Text>
          <TextInput
            placeholder="Search upto 3 localities or landmarks"
            className="bg-gray-100 rounded-lg p-3 mb-3 w-full"
          />
        </View>

        {selectedCategory === 'RENT' && (
          <>
            <View className="mb-5">
              <Text className="text-lg font-bold mb-3">Looking For</Text>
              {/* <View className="flex-row justify-between mb-3">
                <TouchableOpacity
                  className={`rounded-lg p-3 flex-1 mr-2 ${lookingFor === 'Full House' ? 'bg-teal-500' : 'bg-gray-100'}`}
                  onPress={() => setLookingFor('Full House')}
                >
                  <Text className={`text-center ${lookingFor === 'Full House' ? 'text-white' : 'text-black'}`}>Full House</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className={`rounded-lg p-3 flex-1 ml-2 ${lookingFor === 'PG/Hostel' ? 'bg-teal-500' : 'bg-gray-100'}`}
                  onPress={() => setLookingFor('PG/Hostel')}
                >
                  <Text className={`text-center ${lookingFor === 'PG/Hostel' ? 'text-white' : 'text-black'}`}>PG/Hostel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className={`rounded-lg p-3 flex-1 ml-2 ${lookingFor === 'Flatmates' ? 'bg-teal-500' : 'bg-gray-100'}`}
                  onPress={() => setLookingFor('Flatmates')}
                >
                  <Text className={`text-center ${lookingFor === 'Flatmates' ? 'text-white' : 'text-black'}`}>Flatmates</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className={`rounded-lg p-3 flex-1 ml-2 ${lookingFor === 'Commercial' ? 'bg-teal-500' : 'bg-gray-100'}`}
                  onPress={() => setLookingFor('Commercial')}
                >
                  <Text className={`text-center ${lookingFor === 'Commercial' ? 'text-white' : 'text-black'}`}>Commercial</Text>
                </TouchableOpacity>
              </View> */}
              <View>
                <CustomRadioGroup
                  options={[
                    { label: "Full House", value: "Full House" },
                    { label: "PG/Hostel", value: "PG/Hostel" },
                    { label: "Commercial", value: "Commercial" },
                  ]}
                  selectedValue={lookingFor}
                  onValueChange={(value: string) => setLookingFor(value)}
                />
              </View>
            </View>

            {lookingFor === 'Full House' && (
              <>
              <View className="mb-5">
                <Text className="text-lg font-bold mb-3">Preference</Text>
                <View className="flex-row flex-wrap justify-between">
                  {preferences.map((pref) => (
                    <TouchableOpacity
                      key={pref}
                      className={`rounded-lg p-3 mb-3 ${preference === pref ? 'bg-teal-500' : 'bg-gray-100'}`}
                      style={{
                        width: '48%', // Ensures two items fit per row
                        marginRight: preferences.indexOf(pref) % 2 === 0 ? '2%' : 0, // Adds margin to the right for the first item in the row
                      }}
                      onPress={() => setPreference(pref)}
                    >
                      <Text className={`text-center ${preference === pref ? 'text-white' : 'text-black'}`}>{pref}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>


                <View className="mb-5">
                  <Text className="text-lg font-bold mb-3">BHK Type</Text>
                  <TouchableOpacity
                    className="bg-gray-100 rounded-lg p-3 mb-3 w-full"
                    onPress={() => setBhkTypeModalVisible(true)}
                  >
                    <Text className="text-center">{selectedBhkTypes.length > 0 ? selectedBhkTypes.join(', ') : 'Select BHK Type'}</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

            {(lookingFor === 'PG/Hostel') && (
              <>
                <View className="mb-5">
                  <Text className="text-lg font-bold mb-3">Preference</Text>
                  <View className="flex-row justify-between mb-3">
                    {['Male', 'Female', 'Any'].map((pref) => (
                      <TouchableOpacity
                        key={pref}
                        className={`rounded-lg p-3 flex-1 mr-2 ${preference === pref ? 'bg-teal-500' : 'bg-gray-100'}`}
                        onPress={() => setPreference(pref)}
                      >
                        <Text className={`text-center ${preference === pref ? 'text-white' : 'text-black'}`}>{pref}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <View className="mb-5">
                  <Text className="text-lg font-bold mb-3">Room Type</Text>
                  <TouchableOpacity
                    className="bg-gray-100 rounded-lg p-3 mb-3 w-full"
                    onPress={() => setRoomTypeModalVisible(true)}
                  >
                    <Text className="text-center">{selectedRoomTypes.length > 0 ? selectedRoomTypes.join(', ') : 'Select Room Type'}</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

            {lookingFor === 'Commercial' && (
              <View className="mb-5">
                <Text className="text-lg font-bold mb-3">Commercial Type</Text>
                <TouchableOpacity
                  className="bg-gray-100 rounded-lg p-3 mb-3 w-full"
                  onPress={() => setCommercialTypeModalVisible(true)}
                >
                  <Text className="text-center">{selectedCommercialTypes.length > 0 ? selectedCommercialTypes.join(', ') : 'Select Commercial Type'}</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}

        {selectedCategory === 'BUY' && (
          <>
            <View className="mb-5">
              <Text className="text-lg font-bold mb-3">Looking For</Text>
              <View className="flex-row justify-between mb-3">
                <TouchableOpacity
                  className={`rounded-lg p-3 flex-1 mr-2 ${lookingFor === 'Full House' ? 'bg-teal-500' : 'bg-gray-100'}`}
                  onPress={() => setLookingFor('Full House')}
                >
                  <Text className={`text-center ${lookingFor === 'Full House' ? 'text-white' : 'text-black'}`}>Full House</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className={`rounded-lg p-3 flex-1 ml-2 ${lookingFor === 'Land/Plot' ? 'bg-teal-500' : 'bg-gray-100'}`}
                  onPress={() => setLookingFor('Land/Plot')}
                >
                  <Text className={`text-center ${lookingFor === 'Land/Plot' ? 'text-white' : 'text-black'}`}>Land/Plot</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className={`rounded-lg p-3 flex-1 ml-2 ${lookingFor === 'Commercial' ? 'bg-teal-500' : 'bg-gray-100'}`}
                  onPress={() => setLookingFor('Commercial')}
                >
                  <Text className={`text-center ${lookingFor === 'Commercial' ? 'text-white' : 'text-black'}`}>Commercial</Text>
                </TouchableOpacity>
              </View>
            </View>

            {lookingFor === 'Full House' && (
              <View className="mb-5">
                <Text className="text-lg font-bold mb-3">BHK Type</Text>
                <TouchableOpacity
                  className="bg-gray-100 rounded-lg p-3 mb-3 w-full"
                  onPress={() => setBhkTypeModalVisible(true)}
                >
                  <Text className="text-center">{selectedBhkTypes.length > 0 ? selectedBhkTypes.join(', ') : 'Select BHK Type'}</Text>
                </TouchableOpacity>
              </View>
            )}

            {lookingFor === 'Commercial' && (
              <View className="mb-5">
                <Text className="text-lg font-bold mb-3">Commercial Type</Text>
                <TouchableOpacity
                  className="bg-gray-100 rounded-lg p-3 mb-3 w-full"
                  onPress={() => setCommercialTypeModalVisible(true)}
                >
                  <Text className="text-center">{selectedCommercialTypes.length > 0 ? selectedCommercialTypes.join(', ') : 'Select Commercial Type'}</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}

        {selectedCategory === 'LEASE' && (
          <>
            <View className="mb-5">
              <Text className="text-lg font-bold mb-3">Looking For</Text>
              <View className="flex-row justify-between mb-3">
                <TouchableOpacity
                  className={`rounded-lg p-3 flex-1 mr-2 ${lookingFor === 'Full House' ? 'bg-teal-500' : 'bg-gray-100'}`}
                  onPress={() => setLookingFor('Full House')}
                >
                  <Text className={`text-center ${lookingFor === 'Full House' ? 'text-white' : 'text-black'}`}>Full House</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className={`rounded-lg p-3 flex-1 ml-2 ${lookingFor === 'Land/Plot' ? 'bg-teal-500' : 'bg-gray-100'}`}
                  onPress={() => setLookingFor('Land/Plot')}
                >
                  <Text className={`text-center ${lookingFor === 'Land/Plot' ? 'text-white' : 'text-black'}`}>Land/Plot</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className={`rounded-lg p-3 flex-1 ml-2 ${lookingFor === 'Commercial' ? 'bg-teal-500' : 'bg-gray-100'}`}
                  onPress={() => setLookingFor('Commercial')}
                >
                  <Text className={`text-center ${lookingFor === 'Commercial' ? 'text-white' : 'text-black'}`}>Commercial</Text>
                </TouchableOpacity>
              </View>
            </View>

            {lookingFor === 'Full House' && (
              <View className="mb-5">
                <Text className="text-lg font-bold mb-3">BHK Type</Text>
                <TouchableOpacity
                  className="bg-gray-100 rounded-lg p-3 mb-3 w-full"
                  onPress={() => setBhkTypeModalVisible(true)}
                >
                  <Text className="text-center">{selectedBhkTypes.length > 0 ? selectedBhkTypes.join(', ') : 'Select BHK Type'}</Text>
                </TouchableOpacity>
              </View>
            )}

            {lookingFor === 'Commercial' && (
              <View className="mb-5">
                <Text className="text-lg font-bold mb-3">Commercial Type</Text>
                <TouchableOpacity
                  className="bg-gray-100 rounded-lg p-3 mb-3 w-full"
                  onPress={() => setCommercialTypeModalVisible(true)}
                >
                  <Text className="text-center">{selectedCommercialTypes.length > 0 ? selectedCommercialTypes.join(', ') : 'Select Commercial Type'}</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}

        <Modal
          visible={bhkTypeModalVisible}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setBhkTypeModalVisible(false)}
        >
          <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
            <View className="bg-white rounded-lg p-5 w-3/4">
              <Text className="text-lg font-bold mb-3">Select BHK Type</Text>
              {bhkTypes.map((type) => (
                <View key={type} className="flex-row items-center mb-2">
                  <CustomCheckBox
                    value={selectedBhkTypes.includes(type)}
                    onValueChange={() => toggleBhkType(type)}
                  />
                  <Text className="ml-2">{type}</Text>
                </View>
              ))}
              <TouchableOpacity
                className="bg-teal-500 rounded-lg p-3 mt-5"
                onPress={() => setBhkTypeModalVisible(false)}
              >
                <Text className="text-white text-center">Done</Text>
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
              <Text className="text-lg font-bold mb-3">Select Room Type</Text>
              {roomTypes.map((type) => (
                <View key={type} className="flex-row items-center mb-2">
                  <CustomCheckBox
                    value={selectedRoomTypes.includes(type)}
                    onValueChange={() => toggleRoomType(type)}
                  />
                  <Text className="ml-2">{type}</Text>
                </View>
              ))}
              <TouchableOpacity
                className="bg-teal-500 rounded-lg p-3 mt-5"
                onPress={() => setRoomTypeModalVisible(false)}
              >
                <Text className="text-white text-center">Done</Text>
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
              <Text className="text-lg font-bold mb-3">Select Commercial Type</Text>
              {commercialTypes.map((type) => (
                <View key={type} className="flex-row items-center mb-2">
                  <CustomCheckBox
                    value={selectedCommercialTypes.includes(type)}
                    onValueChange={() => toggleCommercialType(type)}
                  />
                  <Text className="ml-2">{type}</Text>
                </View>
              ))}
              <TouchableOpacity
                className="bg-teal-500 rounded-lg p-3 mt-5"
                onPress={() => setCommercialTypeModalVisible(false)}
              >
                <Text className="text-white text-center">Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <View className="mb-5">
          <Text className="text-lg font-bold mb-3">Rent Range</Text>
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-lg">₹ {rentRange[0]}</Text>
            <Text className="text-lg">₹ {rentRange[1]}</Text>
          </View>
          <MultiSlider
            values={rentRange}
            sliderLength={screenWidth - 40}
            onValuesChange={(values: number[]) => setRentRange(values)}
            min={0}
            max={500000}
            step={500}
            selectedStyle={{ backgroundColor: '#1FB28A' }}
            unselectedStyle={{ backgroundColor: '#d3d3d3' }}
            trackStyle={{ height: 10 }}
            markerStyle={{ backgroundColor: '#1FB28A', height: 20, width: 20 }}
          />
        </View>

        <View className="mb-5">
          <Text className="text-lg font-bold mb-3">Property Type</Text>
          <View className="flex-row flex-wrap justify-between">
            <TouchableOpacity className="bg-gray-100 rounded-lg p-3 flex-1 mr-2">
              <Text className="text-center">Apartment</Text>
            </TouchableOpacity>
            <TouchableOpacity className="bg-gray-100 rounded-lg p-3 flex-1 mr-2">
              <Text className="text-center">Gated Community Villa</Text>
            </TouchableOpacity>
          </View>
          <View className="flex-row flex-wrap justify-between mt-3">
            <TouchableOpacity className="bg-gray-100 rounded-lg p-3 flex-1 mr-2">
              <Text className="text-center">Independent House/Villa</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View className="mb-5">
          <Text className="text-lg font-bold mb-3">Availability</Text>
          <View className="flex-row flex-wrap justify-between">
            <TouchableOpacity className="bg-gray-100 rounded-lg p-3 flex-1 mr-2">
              <Text className="text-center">Immediate</Text>
            </TouchableOpacity>
            <TouchableOpacity className="bg-gray-100 rounded-lg p-3 flex-1 mr-2">
              <Text className="text-center">Within 15 Days</Text>
            </TouchableOpacity>
          </View>
          <View className="flex-row flex-wrap justify-between mt-3">
            <TouchableOpacity className="bg-gray-100 rounded-lg p-3 flex-1 mr-2">
              <Text className="text-center">Within 30 Days</Text>
            </TouchableOpacity>
            <TouchableOpacity className="bg-gray-100 rounded-lg p-3 flex-1 mr-2">
              <Text className="text-center">After 30 Days</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View className="mb-5">
          <Text className="text-lg font-bold mb-3">Preferred Tenant</Text>
          <View className="flex-row flex-wrap justify-between">
            <TouchableOpacity className="bg-gray-100 rounded-lg p-3 flex-1 mr-2">
              <Text className="text-center">Family</Text>
            </TouchableOpacity>
            <TouchableOpacity className="bg-gray-100 rounded-lg p-3 flex-1 mr-2">
              <Text className="text-center">Company</Text>
            </TouchableOpacity>
          </View>
          <View className="flex-row flex-wrap justify-between mt-3">
            <TouchableOpacity className="bg-gray-100 rounded-lg p-3 flex-1 mr-2">
              <Text className="text-center">Bachelor Male</Text>
            </TouchableOpacity>
            <TouchableOpacity className="bg-gray-100 rounded-lg p-3 flex-1 mr-2">
              <Text className="text-center">Bachelor Female</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View className="mb-5">
          <Text className="text-lg font-bold mb-3">Furnishing</Text>
          <View className="flex-row flex-wrap justify-between">
            <TouchableOpacity className="bg-gray-100 rounded-lg p-3 m-1 w-[30%]">
              <Text className="text-center">Full</Text>
            </TouchableOpacity>
            <TouchableOpacity className="bg-gray-100 rounded-lg p-3 m-1 w-[30%]">
              <Text className="text-center">Semi</Text>
            </TouchableOpacity>
            <TouchableOpacity className="bg-gray-100 rounded-lg p-3 m-1 w-[30%]">
              <Text className="text-center">None</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View className="mb-5">
          <Text className="text-lg font-bold mb-3">Parking</Text>
          <View className="flex-row justify-between mb-3">
            <TouchableOpacity className="bg-gray-100 rounded-lg p-3 flex-1 mr-2">
              <Text className="text-center">2 Wheeler</Text>
            </TouchableOpacity>
            <TouchableOpacity className="bg-gray-100 rounded-lg p-3 flex-1 mr-2">
              <Text className="text-center">4 Wheeler</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity className="bg-teal-500 rounded-lg p-3 mt-5 mb-10 w-full"
          onPress={() => router.push('/(seeker)/search-list')}>
          <Text className="text-white text-center text-lg">SEARCH</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Home;