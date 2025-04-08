import { View, Image, TouchableOpacity } from "react-native";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import MapView, { Marker } from "react-native-maps"; // Import MapView and Marker
import 'react-native-get-random-values'; // Polyfill for crypto.getRandomValues
import { v4 as uuidv4 } from 'uuid';
import { useState } from "react";
import { useTranslation } from "react-i18next"; // Import useTranslation

import { constants, icons } from "@/constants";
import { GoogleInputProps } from "@/types/type";

const googlePlacesApiKey = constants.EXPO_PUBLIC_PLACES_API_KEY;

const GoogleTextInput = ({
  icon,
  initialLocation,
  handlePress,
}: GoogleInputProps) => {
  const { t } = useTranslation(); // Initialize translation hook

  interface LocationData {
    latitude: number;
    longitude: number;
    address: string;
    address_components: Array<any> | undefined;
  }

  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);

  // Default region for the map
  const [region, setRegion] = useState({
    latitude: initialLocation?.latitude || 24.799644726160327,
    longitude: initialLocation?.longitude || 85.06087840697387,
    latitudeDelta: 0.0175,
    longitudeDelta: 0.0175,
  });

  // Function to fetch address using Google Geocoding API
  const getAddressFromCoordinates = async (latitude: number, longitude: number) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${googlePlacesApiKey}`
      );
      const data = await response.json();
      if (data.results && data.results.length > 0) {
        const address = data.results[0].formatted_address;
        setSelectedLocation({
          latitude,
          longitude,
          address,
          address_components: data.results[0].address_components,
        });
        handlePress({
          latitude,
          longitude,
          address,
          address_components: data.results[0].address_components,
        });
      }
    } catch (error) {
      console.error("Error fetching address:", error);
    }
  };

  return (
    <View className="flex-1 bg-gray-100">
      {/* Google Places Input */}
      <View className="z-50">
        <GooglePlacesAutocomplete
          fetchDetails={true}
          placeholder={t("searchPlaceholder")} // Use translation key
          debounce={200}
          styles={{
            textInputContainer: {
              alignItems: "center",
              justifyContent: "center",
              shadowColor: "#000",
              borderWidth: 1,
              borderColor: '#D1D5DB',
              borderRadius: 10,
              padding: 12,
              backgroundColor: '#FFFFFF',
            },
            textInput: {
              backgroundColor: "white",
              fontSize: 16,
              fontWeight: "600",
              width: "100%",
              borderRadius: 10,
            },
            listView: {
              backgroundColor: "white",
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
            setRegion({
              latitude: locationData.latitude,
              longitude: locationData.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            });
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
            placeholder: t("searchPlaceholder"), // Use translation key
          }}
        />
      </View>

      {/* MapView */}
      <MapView
        style={{ height: 300, width: "100%", marginTop: 20 }} // Adjust height and width as needed
        region={region}
        onRegionChangeComplete={(newRegion) => setRegion(newRegion)}
      >
        {selectedLocation && (
          <Marker
            coordinate={{
              latitude: selectedLocation.latitude,
              longitude: selectedLocation.longitude,
            }}
            draggable // Make the marker draggable
            onDragEnd={(e) => {
              const { latitude, longitude } = e.nativeEvent.coordinate;
              getAddressFromCoordinates(latitude, longitude); // Fetch address for new coordinates
            }}
            title={selectedLocation.address}
          />
        )}
      </MapView>
    </View>
  );
};

export default GoogleTextInput;