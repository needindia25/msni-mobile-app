import { View, Image, Text } from "react-native";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import 'react-native-get-random-values'; // Polyfill for crypto.getRandomValues
import { v4 as uuidv4 } from 'uuid';
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { useState } from "react";

import { constants, icons } from "@/constants";
import { GoogleInputProps } from "@/types/type";

const googlePlacesApiKey = constants.EXPO_PUBLIC_PLACES_API_KEY;

const GoogleTextInput = ({
  icon,
  initialLocation,
  containerStyle,
  textInputBackgroundColor,
  handlePress,
}: GoogleInputProps) => {
  
  interface LocationData {
    latitude: number;
    longitude: number;
    address: string;
    address_components: Array<any> | undefined;
  }
  
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);

  return (
    <View className="flex-1 bg-gray-100">
      
      {/* Google Places Input */}
      <View className={`px-4 pt-4 z-50 ${containerStyle}`}>
        <GooglePlacesAutocomplete
          fetchDetails={true}
          placeholder="Search"
          debounce={200}
          styles={{
            textInputContainer: {
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 20,
              marginHorizontal: 20,
              shadowColor: "#d4d4d4",
            },
            textInput: {
              backgroundColor: textInputBackgroundColor || "white",
              fontSize: 16,
              fontWeight: "600",
              marginTop: 5,
              width: "100%",
              borderRadius: 200,
            },
            listView: {
              backgroundColor: textInputBackgroundColor || "white",
              position: "absolute",
              top: 50,
              width: "100%",
              borderRadius: 10,
              shadowColor: "#d4d4d4",
              zIndex: 99,
            },
          }}
          onPress={(data, details = null) => {
            if (!details) return;

            const locationData = {
              latitude: details.geometry.location.lat,
              longitude: details.geometry.location.lng,
              address: data.description,
              address_components: details.address_components,
            };

            setSelectedLocation(locationData);
            handlePress(locationData);
          }}
          query={{
            key: googlePlacesApiKey,
            language: "en",
          }}
          renderLeftButton={() => (
            <View className="justify-center items-center w-6 h-6">
              <Image
                source={icon || icons.search}
                className="w-6 h-6"
                resizeMode="contain"
              />
            </View>
          )}
          textInputProps={{
            placeholderTextColor: "gray",
            placeholder: initialLocation ?? "Where is your property?",
          }}
        />
      </View>

      {/* MapView with Selected Location */}
      <View className="flex-1 mt-4 border h-[100px]">
        {selectedLocation ? (
          <MapView
            provider={PROVIDER_GOOGLE}
            className="w-full h-full rounded-lg"
            region={{
              latitude: selectedLocation.latitude,
              longitude: selectedLocation.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
            showsUserLocation={true}
          >
            <Marker
              coordinate={{
                latitude: selectedLocation.latitude,
                longitude: selectedLocation.longitude,
              }}
              title="Selected Location"
              description={selectedLocation.address}
            />
          </MapView>
        ) : (
          <View className="flex-1 items-center justify-center">
            <Image source={icons.map} className="w-20 h-20 opacity-50" />
            <Text className="text-gray-400 mt-2">Select a location</Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default GoogleTextInput;
