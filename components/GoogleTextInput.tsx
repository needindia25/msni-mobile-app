import React, { useRef, useState } from "react";
import { View, Image, Text, Alert, TouchableOpacity, Linking, Platform, PermissionsAndroid, ActivityIndicator } from "react-native";
import { GooglePlacesAutocomplete, GooglePlacesAutocompleteRef } from "react-native-google-places-autocomplete";
import MapView, { Marker } from "react-native-maps";
import { MaterialIcons } from "@expo/vector-icons"; // Import icons
import Geolocation from '@react-native-community/geolocation';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import { useTranslation } from "react-i18next";

import { constants, icons } from "@/constants";
import { GoogleInputProps } from "@/types/type";

const googlePlacesApiKey = constants.EXPO_PUBLIC_PLACES_API_KEY;

const GoogleTextInput = ({
  isDirectionEnabled,
  icon,
  initialLocation,
  handlePress,
}: GoogleInputProps) => {
  const { t } = useTranslation();
  const placesRef = useRef<GooglePlacesAutocompleteRef>(null);
  const [isFechingGEO, setIsFechingGEO] = useState(false);

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

  const getAddressFromCoordinates = async (latitude: number, longitude: number) => {
    if (selectedLocation?.draggable) {
      setSelectedLocation({
        latitude,
        longitude,
        address: "",
        draggable: true,
      });
    } else {
      return;
    }
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

  const openDirections = async () => {
    if (!selectedLocation) return;
    setIsFechingGEO(true);
    try {
      // Request permission on Android
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: t("locationPermissionTitle") || "Location Permission",
            message: t("locationPermissionMessage") || "This app needs access to your location.",
            buttonNeutral: t("askMeLater") || "Ask Me Later",
            buttonNegative: t("cancel") || "Cancel",
            buttonPositive: t("ok") || "OK",
          }
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert(t("error"), t("locationPermissionsDenied"));
          setIsFechingGEO(false);
          return;
        }
      }
      Geolocation.getCurrentPosition(
        (position) => {
          console.log("Current position:", position);
          const url = `https://www.google.com/maps/dir/?api=1&origin=${position.coords.latitude},${position.coords.longitude}&destination=${selectedLocation.latitude},${selectedLocation.longitude}&travelmode=driving`;
          Linking.openURL(url);
          setIsFechingGEO(false);
        },
        (error) => {
          Alert.alert(t("error"), t("failedToGetLocation"));
          console.error("Error getting current location:", error);
          setIsFechingGEO(false);
        },
        { enableHighAccuracy: false, timeout: 20000, maximumAge: 1000 }
      );
    } catch (error) {
      Alert.alert(t("error"), t("failedToGetLocation"));
      console.error("Error getting current location:", error);
      setIsFechingGEO(false);
    }
  };

  return (
    <View className="flex-1 bg-gray-100">
      {selectedLocation?.draggable && (
        <View style={{ zIndex: 10, elevation: 10, position: "absolute", top: 20, left: 20, right: 20 }}>
          <GooglePlacesAutocomplete
            ref={placesRef}
            fetchDetails={true}
            placeholder={t("searchPlaceholder")}
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
            onFail={(error) => console.error(error)}
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
        style={{ height: Math.min(350, Math.round(require('react-native').Dimensions.get('window').height * 0.7)), width: "100%", marginTop: 10 }}
        region={region}
        showsUserLocation={true}
        onRegionChangeComplete={(newRegion) => setRegion(newRegion)}
        onPress={(e) => {
          const { latitude, longitude } = e.nativeEvent.coordinate;
          getAddressFromCoordinates(latitude, longitude);
        }}
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
        <View style={{
          position: "absolute",
          bottom: 30,
          left: 20,
          right: 20,
          backgroundColor: "#f3f4f6",
          padding: 16,
          borderRadius: 12,
          shadowColor: "#000",
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 5,
        }}>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
            <MaterialIcons name="location-on" size={20} color="gray" />
            <Text style={{ color: "#6b7280", marginLeft: 4 }}>
              {selectedLocation.address}
            </Text>
          </View>
        </View>
      )}
      {(!selectedLocation?.draggable && isDirectionEnabled) && (
        <TouchableOpacity
          style={{
            backgroundColor: "#01BB23",
            paddingVertical: 10,
            borderRadius: 8,
            alignItems: "center",
            marginTop: 8,
          }}
          onPress={openDirections}
          disabled={isFechingGEO}
        >
          <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}>
            {t("openInGoogleMaps") || "Open Directions in Google Maps"}
          </Text>
          {isFechingGEO && (
            <ActivityIndicator size="small" color="#fff" className="ml-2" />
          )}
        </TouchableOpacity>
      )}
    </View>
  );
};

export default GoogleTextInput;