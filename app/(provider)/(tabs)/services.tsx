import { constants, icons } from '@/constants';
import { fetchAPI } from '@/lib/fetch';
import { Listing } from '@/types/type';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import { useTranslation } from 'react-i18next'; // Import useTranslation

const Services = () => {
  const { t } = useTranslation(); // Initialize translation hook
  const screenWidth = Dimensions.get('window').width;
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [listings, setListings] = useState<Listing[]>([]);

  useEffect(() => {
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem('token');
      await AsyncStorage.setItem("passServiceId", "");
      console.log(`token: ${token}`);
      if (!!token) {
        const response: any = await fetchAPI(`${constants.API_URL}/user-services/my_property/`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
        setListings(transformData(response));
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const transformData = (data: any[]): Listing[] => {
    const sortedData = data.sort((a, b) => b.id - a.id);
    return sortedData.map((property) => ({
      id: property.id,
      title: property.title,
      location: property.options.address || "Unknown Location",
      rating: "New",
      price: `₹ ${property.options.rent || "N/A"}`,
      requests: 0,
      favorites: 0,
      images: property.options.images.length > 0 ? property.options.images : ["https://www.multisolutionofneedindia.com/media/no-image-found.png"],
      status: property.is_active,
    }));
  };

  return (
    <>
      <ScrollView className="bg-gray-100 p-5">
        {loading ? (
          <View className="flex-1 justify-center mt-[60%] items-center">
            <ActivityIndicator size="large" color="#00ff00" />
            <Text className="mt-2 text-xl">{t("loading")}</Text> {/* Use translation key */}
          </View>
        ) : (
          <>
            {listings.length > 0 ? (
              listings.map((listing: any) => (
                <View key={listing.id} className="bg-white rounded-lg shadow-md mb-5 p-5">
                  <ScrollView horizontal pagingEnabled className="flex-row mb-3">
                    {listing.images.map((image: string, index: number) => (
                      <Image key={index} source={{ uri: image }} style={{ width: screenWidth - 40 }} className="h-48 rounded-lg mr-1" />
                    ))}
                  </ScrollView>
                  <Text className="text-xl font-bold mb-1">{listing.title}</Text>
                  <Text className="text-gray-500 mb-1">{listing.location}</Text>

                  {/* Rating and Price Row */}
                  <View className="flex-row justify-between items-center mb-1">
                    <Text className="text-blue-500 text-lg font-bold">
                      {listing.price} <Text className="text-sm text-gray-500">{t("pricePerMonth")}</Text> {/* Use translation key */}
                    </Text>
                    <View className="flex-row items-center">
                      <Text className="text-yellow-500 mr-1">★</Text>
                      <Text className="text-gray-500">{listing.rating}</Text>
                    </View>
                  </View>

                  {/* Requests and Favorites Row */}
                  <View className="flex-row justify-between items-center mb-3">
                    <Text className="text-gray-500">{listing.requests} {t("requests")}</Text> {/* Use translation key */}
                    <View className="flex-row items-center">
                      <Text className="text-red-500 mr-1">❤</Text>
                      <Text className="text-gray-500">{listing.favorites} {t("favorites")}</Text> {/* Use translation key */}
                    </View>
                  </View>
                </View>
              ))
            ) : (
              <View className="flex-1 items-center justify-center bg-white p-5">
                <View className="bg-gray-200 rounded-full p-5 mb-5">
                  <Image
                    source={icons.lock}
                    className="w-12 h-12"
                  />
                </View>
                <Text className="text-xl font-bold text-black mb-2">{t("noPropertyFound")}</Text> {/* Use translation key */}
                <Text className="text-base text-gray-600 text-center mb-10">
                  {t("noPropertyMessage")} {/* Use translation key */}
                </Text>
                <TouchableOpacity
                  className="bg-green-500 py-3 px-10 rounded-full mb-5"
                  onPress={() => router.push('/add-property')}
                >
                  <Text className="text-white text-lg font-bold">{t("addNewProperty")}</Text> {/* Use translation key */}
                </TouchableOpacity>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </>
  );
};

export default Services;