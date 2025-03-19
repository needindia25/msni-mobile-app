import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, TextInput, Modal, Dimensions } from 'react-native';
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import CustomCheckBox from '@/components/CustomCheckBox';
import CustomRadioGroup from '@/components/CustomRadioGroup';
import { useRouter } from 'expo-router';
import InputField from '@/components/InputField';
import CustomTextarea from '@/components/CustomTextarea';
import ImagePickerComponent from '@/components/ImagePicker';
import ComingSoon from '@/components/ComingSoon';

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
  const [propertyType, setPropertyType] = useState('Apartment');
  const [availability, setAvailability] = useState('Immediate');
  const [preferredTenant, setPreferredTenant] = useState('Family');
  const [furnishing, setFurnishing] = useState('Full');
  const [parking, setParking] = useState('2 Wheeler');
  const [rentNegotiable, setRentNegotiable] = useState('No'); // Yes or No selection
  const [FoodPreference, setFoodPreference] = useState('Any'); // Veg, Non-Veg, Any selection
  const [availabilityStatus, setAvailabilityStatus] = useState('Active'); // Active, Inactive selection
  const [amenities, setAmenities] = useState<string[]>([]);
  const [sourceWater, setSourceWater] = useState<string[]>([]);
  const [additionalAmenities, setAdditionalAmenities] = useState<string[]>([]);
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [locality, setLocality] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');

  const bhkTypes = ['1 RHK', '1 BHK', '2 BHK', '3 BHK', '4 BHK', '4+ BHK'];
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

  const screenWidth = Dimensions.get('screen').width;

  return (
    <SafeAreaView className="flex h-full bg-white">
      <ScrollView className="flex-1 bg-white p-5">
        <ComingSoon />
      </ScrollView>
    </SafeAreaView>
  )

  return (
    <SafeAreaView className="flex h-full bg-white">
      <ScrollView className="flex-1 bg-white p-5">
        <Text className="text-2xl font-bold text-center mb-5">Add New Property</Text>
        <View className="mb-5">
          <Text className="text-lg font-bold mb-3">Category</Text>
          <View>
            <CustomRadioGroup
              options={[
                { label: "RENT", value: "RENT" },
                { label: "LEASE", value: "LEASE" },
                { label: "BUY", value: "BUY" },
              ]}
              selectedValue={selectedCategory}
              onValueChange={(value: string) => setSelectedCategory(value)}
            />
          </View>
        </View>
        {selectedCategory === 'RENT' && (
          <>
            <View className="mb-5">
              <Text className="text-lg font-bold mb-3">Property Type</Text>
              <View>
                <CustomRadioGroup
                  options={[
                    { label: "Full House", value: "Full House" },
                    { label: "PG/Hostel", value: "PG/Hostel" },
                    { label: "Flatmates", value: "Flatmates" },
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
                  <Text className="text-lg font-bold mb-3">Housing Type</Text>
                  <View className="flex-row flex-wrap justify-between">
                    {['Apartment', 'Gated Community Villa'].map((pref) => (
                      <TouchableOpacity
                        key={pref}
                        className={`rounded-lg p-3 flex-1 mr-2 ${propertyType === pref ? 'bg-[#01BB23]' : 'bg-[#FF7F19]'}`}
                        onPress={() => setPropertyType(pref)}
                      >
                        <Text className="text-center text-xs text-white">{pref}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <View className="flex-row flex-wrap justify-between mt-3">
                    <TouchableOpacity
                      key={"Independent House/Villa"}
                      className={`rounded-lg p-3 flex-1 mr-2 ${propertyType === "Independent House/Villa" ? 'bg-[#01BB23]' : 'bg-[#FF7F19]'}`}
                      onPress={() => setPropertyType("Independent House/Villa")}
                    >
                      <Text className="text-center text-xs text-white">Independent House/Villa</Text>
                    </TouchableOpacity>
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
                <View className="mb-5">
                  <Text className="text-lg font-bold mb-3">Family Preference</Text>
                  <View className="flex-row justify-between mb-3">
                    {preferences.map((pref) => (
                      <TouchableOpacity
                        key={pref}
                        className={`rounded-lg p-3 flex-1 mr-2 ${preference === pref ? 'bg-[#01BB23]' : 'bg-[#FF7F19]'}`}
                        onPress={() => setPreference(pref)}
                      >
                        <Text className="text-center text-xs text-white">{pref}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
                <View className="mb-5">
                  <Text className="text-lg font-bold mb-3">Food Preference</Text>
                  <View className="flex-row justify-between mb-3">
                    {["Veg", "Non-Veg", "Any"].map((pref) => (
                      <TouchableOpacity
                        key={pref}
                        className={`rounded-lg p-3 flex-1 mr-2 ${FoodPreference === pref ? 'bg-[#01BB23]' : 'bg-[#FF7F19]'}`}
                        onPress={() => setFoodPreference(pref)}
                      >
                        <Text className="text-center text-xs text-white">{pref}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </>
            )}

            {(lookingFor === 'PG/Hostel' || lookingFor === 'Flatmates') && (
              <>
                <View className="mb-5">
                  <Text className="text-lg font-bold mb-3">Preference</Text>
                  <View className="flex-row justify-between mb-3">
                    {['Male', 'Female', 'Any'].map((pref) => (
                      <TouchableOpacity
                        key={pref}
                        className={`rounded-lg p-3 flex-1 mr-2 ${preference === pref ? 'bg-[#01BB23]' : 'bg-[#FF7F19]'}`}
                        onPress={() => setPreference(pref)}
                      >
                        <Text className="text-center text-xs text-white">{pref}</Text>
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

        {/* {selectedCategory === 'BUY' && (
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
        )} */}

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
          <Text className="text-lg font-bold mb-3">Title</Text>
          <TextInput
            placeholder="Enter property name"
            className="bg-gray-100 rounded-lg p-3 mb-3 w-full"
          />
        </View>

        <View className="mb-5">
          <Text className="text-xl font-bold mb-2">Description</Text>
          <CustomTextarea value={description} onChangeText={setDescription} placeholder="Describe your property..." />
        </View>

        <View className="mb-5">
          <Text className="text-xl font-bold mb-2">Property Address</Text>
          <CustomTextarea value={address} onChangeText={setAddress} placeholder="Enter Address" />
        </View>

        <View className="mb-5">
          <Text className="text-lg font-bold mb-3">Location</Text>
          <TextInput
            placeholder="Enter property location"
            className="bg-gray-100 rounded-lg p-3 mb-3 w-full"
          />
        </View>

        <View className="mb-5">
          <Text className="text-lg font-bold mb-3">City / Village</Text>
          <TouchableOpacity className="bg-gray-100 rounded-lg p-3 mb-3 w-full">
            <Text className="text-center">Gaya</Text>
          </TouchableOpacity>
        </View>
        <View className="mb-5">
          <Text className="text-lg font-bold mb-3">State</Text>
          <TouchableOpacity className="bg-gray-100 rounded-lg p-3 mb-3 w-full">
            <Text className="text-center">Bihar</Text>
          </TouchableOpacity>
        </View>


        <View className="mb-5">
          <Text className="text-lg font-bold mb-3">Pin code</Text>
          <TextInput
            placeholder="Enter Pincode"
            className="bg-gray-100 rounded-lg p-3 mb-3 w-full"
            keyboardType='numeric'
          />
        </View>

        <View className="mb-5">
          {/* <Text className="text-lg font-bold mb-3">Rent Range</Text> */}
          {/* <View className="flex-row justify-between items-center mb-3">
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
            selectedStyle={{ backgroundColor: '#01BB23' }}
            unselectedStyle={{ backgroundColor: '#FF7F19' }}
            trackStyle={{ height: 10 }}
            markerStyle={{ backgroundColor: '#01BB23', height: 20, width: 20 }}
          /> */}
          <InputField
            label="Rent Amount"
            placeholder="Enter Rent Amount"
            keyboardType="numeric"
          />
          <InputField
            label="Advance Amount"
            placeholder="Enter Advance Amount"
            keyboardType="numeric"
          />
        </View>

        <View className="mb-5">
          <Text className="text-lg font-bold mb-3">Is Rent Negotiable?</Text>
          <View className="flex-row flex-wrap justify-between">
            {['Yes', 'No'].map((pref) => (
              <TouchableOpacity
                key={pref}
                className={`rounded-lg p-3 flex-1 mr-2 ${rentNegotiable === pref ? 'bg-[#01BB23]' : 'bg-[#FF7F19]'}`}
                onPress={() => setRentNegotiable(pref)}
              >
                <Text className="text-center text-xs text-white">{pref}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <View className="mb-5">
          <InputField
            label="Area in size (sqft)"
            placeholder="Enter Area in size"
            keyboardType="numeric"
          />
        </View>

        <View className="mb-5">
          <InputField
            label="Floor Number"
            placeholder="Enter Floor Number"
            keyboardType="numeric"
          />
        </View>

        <View className="mb-5">
          <InputField
            label="Number of Balconies"
            placeholder="Enter Number of Balconies"
            keyboardType="numeric"
          />
        </View>


        <View className="mb-5">
          <InputField
            label="Number of Bedroom(s)"
            placeholder="Enter Number of Bedroom(s)"
            keyboardType="numeric"
          />
        </View>


        <View className="mb-5">
          <InputField
            label="Number of Bathroom(s)"
            placeholder="Enter Number of Bathroom(s)"
            keyboardType="numeric"
          />
        </View>

        <View className="mb-5">
          <InputField
            label="Age of Property"
            placeholder="Enter Age of property"
            keyboardType="numeric"
          />
        </View>
        <View className="mb-5">
          <Text className="text-lg font-bold mb-3">Availability</Text>
          <View className="flex-row flex-wrap justify-between">
            {['Immediate', 'Within 15 Days'].map((pref) => (
              <TouchableOpacity
                key={pref}
                className={`rounded-lg p-3 flex-1 mr-2 ${availability === pref ? 'bg-[#01BB23]' : 'bg-[#FF7F19]'}`}
                onPress={() => setAvailability(pref)}
              >
                <Text className="text-center text-xs text-white">{pref}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View className="flex-row flex-wrap justify-between mt-3">
            {['Within 30 Days', 'After 30 Days'].map((pref) => (
              <TouchableOpacity
                key={pref}
                className={`rounded-lg p-3 flex-1 mr-2 ${availability === pref ? 'bg-[#01BB23]' : 'bg-[#FF7F19]'}`}
                onPress={() => setAvailability(pref)}
              >
                <Text className="text-center text-xs text-white">{pref}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* <View className="mb-5">
          <Text className="text-lg font-bold mb-3">Preferred Tenant</Text>
          <View className="flex-row flex-wrap justify-between">
            {['Family', 'Company'].map((pref) => (
              <TouchableOpacity
                key={pref}
                className={`rounded-lg p-3 flex-1 mr-2 ${preferredTenant === pref ? 'bg-[#01BB23]' : 'bg-[#FF7F19]'}`}
                onPress={() => setPreferredTenant(pref)}
              >
                <Text className="text-center text-xs text-white">{pref}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View className="flex-row flex-wrap justify-between mt-3">
            {['Bachelor Male', 'Bachelor Female'].map((pref) => (
              <TouchableOpacity
                key={pref}
                className={`rounded-lg p-3 flex-1 mr-2 ${preferredTenant === pref ? 'bg-[#01BB23]' : 'bg-[#FF7F19]'}`}
                onPress={() => setPreferredTenant(pref)}
              >
                <Text className="text-center text-xs text-white">{pref}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View> */}

        <View className="mb-5">
          <Text className="text-lg font-bold mb-3">Furnishing</Text>
          <View className="flex-row flex-wrap justify-between">
            {['Full', 'Semi', 'None'].map((pref) => (
              <TouchableOpacity
                key={pref}
                className={`rounded-lg p-3 flex-1 mr-2 ${furnishing === pref ? 'bg-[#01BB23]' : 'bg-[#FF7F19]'}`}
                onPress={() => setFurnishing(pref)}
              >
                <Text className="text-center text-xs text-white">{pref}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View className="mb-5">
          <Text className="text-lg font-bold mb-3">Parking</Text>
          <View className="flex-row justify-between mb-3">
            {['2 Wheeler', '4 Wheeler', 'None'].map((pref) => (
              <TouchableOpacity
                key={pref}
                className={`rounded-lg p-3 flex-1 mr-2 ${parking === pref ? 'bg-[#01BB23]' : 'bg-[#FF7F19]'}`}
                onPress={() => setParking(pref)}
              >
                <Text className="text-center text-xs text-white">{pref}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <View className="mb-5">
          <Text className="text-lg font-bold mb-3">Amenities</Text>
          <View className="flex-row mb-3">
            {["Lift", "Power backup", "Swimming Pool"].map((type) => (
              <View key={type} className="items-center p-4 m-2">
                <CustomCheckBox
                  value={amenities.includes(type)}
                  onValueChange={() => {
                    if (amenities.includes(type)) {
                      setAmenities(amenities.filter((item) => item !== type));
                    } else {
                      setAmenities([...amenities, type]);
                    }
                  }}
                />
                <Text className="ml-2">{type}</Text>
              </View>
            ))}
          </View>
          <View className="flex-row mb-3">
            {["Play Area", "Security"].map((type) => (
              <View key={type} className="items-center p-4 m-2">
                <CustomCheckBox
                  value={amenities.includes(type)}
                  onValueChange={() => {
                    if (amenities.includes(type)) {
                      setAmenities(amenities.filter((item) => item !== type));
                    } else {
                      setAmenities([...amenities, type]);
                    }
                  }}
                />
                <Text className="ml-2">{type}</Text>
              </View>
            ))}
          </View>
        </View>

        <View className="mb-5">
          <Text className="text-lg font-bold mb-3">Additional Amenities</Text>
          <View className="flex-row mb-3">
            {["Washing Machine", "Fridge", "AC"].map((type) => (
              <View key={type} className="items-center p-4 m-2">
                <CustomCheckBox
                  value={additionalAmenities.includes(type)}
                  onValueChange={() => {
                    if (additionalAmenities.includes(type)) {
                      setAdditionalAmenities(additionalAmenities.filter((item) => item !== type));
                    } else {
                      setAdditionalAmenities([...additionalAmenities, type]);
                    }
                  }}
                />
                <Text className="ml-2">{type}</Text>
              </View>
            ))}
          </View>
          <View className="flex-row mb-3">
            {["Cooler", "Sofa", "Internet", "Light"].map((type) => (
              <View key={type} className="items-center p-4 m-2">
                <CustomCheckBox
                  value={additionalAmenities.includes(type)}
                  onValueChange={() => {
                    if (additionalAmenities.includes(type)) {
                      setAdditionalAmenities(additionalAmenities.filter((item) => item !== type));
                    } else {
                      setAdditionalAmenities([...additionalAmenities, type]);
                    }
                  }}
                />
                <Text className="ml-2">{type}</Text>
              </View>
            ))}
          </View>
          <View className="flex-row mb-3">
            {["Fan", "RO Water", "Bed", "Dining table"].map((type) => (
              <View key={type} className="items-center p-4 m-2">
                <CustomCheckBox
                  value={additionalAmenities.includes(type)}
                  onValueChange={() => {
                    if (additionalAmenities.includes(type)) {
                      setAdditionalAmenities(additionalAmenities.filter((item) => item !== type));
                    } else {
                      setAdditionalAmenities([...additionalAmenities, type]);
                    }
                  }}
                />
                <Text className="ml-2">{type}</Text>
              </View>
            ))}
          </View>
        </View>


        <View className="mb-5">
          <Text className="text-lg font-bold mb-3">Source of water</Text>
          <View className="flex-row mb-3">
            {["Supply Water", "Borewell", "Other"].map((type) => (
              <View key={type} className="items-center p-4 m-2">
                <CustomCheckBox
                  value={sourceWater.includes(type)}
                  onValueChange={() => {
                    if (sourceWater.includes(type)) {
                      setSourceWater(sourceWater.filter((item) => item !== type));
                    } else {
                      setSourceWater([...sourceWater, type]);
                    }
                  }}
                />
                <Text className="ml-2">{type}</Text>
              </View>
            ))}
          </View>
        </View>
        <View className="mb-5">
          <Text className="text-xl font-bold mb-4">Upload Image</Text>
          <ImagePickerComponent />
        </View>

        <View className="mb-5">
          <Text className="text-lg font-bold mb-3">Availability Status</Text>
          <View className="flex-row flex-wrap justify-between">
            {['Active', 'Inactive'].map((pref) => (
              <TouchableOpacity
                key={pref}
                className={`rounded-lg p-3 flex-1 mr-2 ${availabilityStatus === pref ? 'bg-[#01BB23]' : 'bg-[#FF7F19]'}`}
                onPress={() => setAvailabilityStatus(pref)}
              >
                <Text className="text-center text-xs text-white">{pref}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity className="bg-[#01BB23] rounded-lg p-3 mt-5 w-full">
          <Text className="text-white text-center text-lg">Save</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Home;