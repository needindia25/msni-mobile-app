import React, { useEffect, useState } from "react";
import { View, Image, Text, PermissionsAndroid, Alert } from "react-native";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import MapView, { Marker } from "react-native-maps";
import { MaterialIcons } from "@expo/vector-icons"; // Import icons
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import { useTranslation } from "react-i18next";

import { constants, icons } from "@/constants";
import { GoogleInputProps } from "@/types/type";

const googlePlacesApiKey = constants.EXPO_PUBLIC_PLACES_API_KEY;

const GoogleTextInput = ({
  icon,
  initialLocation,
  handlePress,
}: GoogleInputProps) => {
  const { t } = useTranslation();

  interface LocationData {
    latitude: number;
    longitude: number;
    address: string;
    draggable: boolean;
  }

  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>({
    latitude: parseFloat(String(initialLocation?.latitude || "0")),
    longitude: parseFloat(String(initialLocation?.longitude || "0")),
    address: String(initialLocation?.address || ""),
    draggable: Boolean(initialLocation?.draggable)
  });
  const [region, setRegion] = useState({
    latitude: parseFloat(String(initialLocation?.latitude || "0")),
    longitude: parseFloat(String(initialLocation?.longitude || "0")),
    latitudeDelta: 0.00275,
    longitudeDelta: 0.00275,
  });

  async function requestPermissions() {
    try {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
      ]);

      if (
        granted[PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION] === PermissionsAndroid.RESULTS.GRANTED &&
        granted[PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION] === PermissionsAndroid.RESULTS.GRANTED
      ) {
        console.log("Location permissions granted");
      } else {
        Alert.alert(t("error"), t("locationPermissionsDenied"),
          [
            {
              text: t("ok"),
            },
          ]
        );
        return;
      }
    } catch (err) {
      Alert.alert(t("error"), t("errorRequestingPermissions"),
        [
          {
            text: t("ok"),
          },
        ]
      );
      return;
    }
  }
  useEffect(() => {
    requestPermissions();
  }, []);

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
          draggable: true,
        });
        if (handlePress) {
          handlePress({
            latitude,
            longitude,
            address
          });
        }
      }
    } catch (error) {
      Alert.alert(t("error"), t("errorFetchingAddressDetails"),
        [
          {
            text: t("ok"),
          },
        ]
      );
      return;
    }
  };

  return (
    <View className="flex-1 bg-gray-100">
      {selectedLocation?.draggable && (
        <View style={{ zIndex: 10, elevation: 10 }} className="">
          <GooglePlacesAutocomplete
            fetchDetails={true}
            placeholder={t("searchPlaceholder")}
            debounce={200}
            styles={{
              textInputContainer: {
                alignItems: "center",
                justifyContent: "center",
                shadowColor: "#000",
                borderWidth: 1,
                borderColor: "#D1D5DB",
                borderRadius: 10,
                padding: 12,
                backgroundColor: "#FFFFFF",
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
                elevation: 99,
              },
            }}
            onPress={(data, details = null) => {
              if (!details) return;
              const locationData = {
                latitude: details.geometry.location.lat,
                longitude: details.geometry.location.lng,
                address: data.description,
                draggable: true
              };
              setSelectedLocation(locationData);
              setRegion({
                latitude: locationData.latitude,
                longitude: locationData.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              });
              if (handlePress) {
                handlePress(locationData);
              }
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
              placeholder: t("searchPlaceholder"),
            }}
          />
        </View>
      )}

      <MapView
        style={{ height: 300, width: "100%", marginTop: 10 }}
        region={region}
        onRegionChangeComplete={(newRegion) => setRegion(newRegion)}
        onMarkerDragEnd={(e) => {
          const { latitude, longitude } = e.nativeEvent.coordinate;
          getAddressFromCoordinates(latitude, longitude);
        }}
      >
        {selectedLocation && (
          <Marker
            coordinate={{
              latitude: selectedLocation.latitude,
              longitude: selectedLocation.longitude,
            }}
            draggable={selectedLocation.draggable || false}
            title={selectedLocation.address}
          />
        )}
      </MapView>
      {(selectedLocation?.draggable && selectedLocation.address) && (
        <View className="bg-gray-100 p-4 rounded-lg shadow-md mt-5">
          <View className="flex-row items-center mb-3">
            <MaterialIcons name="location-on" size={20} color="gray" />
            <Text className="text-gray-500 ml-1">
              {selectedLocation.address}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

export default GoogleTextInput;