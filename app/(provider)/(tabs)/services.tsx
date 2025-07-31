import { constants, icons } from '@/constants';
import { fetchAPI } from '@/lib/fetch';
import { Listing } from '@/types/type';
import ImageCarousel from "@/components/ImageCarousel";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { MaterialIcons } from "@expo/vector-icons"; // Import icons
import { View, Text, Image, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions, Alert } from 'react-native';
import { useTranslation } from 'react-i18next'; // Import useTranslation
import { getUserPlan } from '@/lib/utils';
import { getInitialURL } from 'expo-linking';

const Services = () => {
  const { t } = useTranslation(); // Initialize translation hook
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [totalActiveServices, setTotalActiveServices] = useState(0);
  const [listings, setListings] = useState<Listing[]>([]);

  useFocusEffect(
    useCallback(() => {
      console.log("Services screen focused");
      reloadData(); // Run checkAuth every time the screen comes into focus
    }, [])
  );

  const handleViewRequests = async (service: any) => {
    const userPlan = await getUserPlan(t);
    console.log(userPlan)
    let title = "";
    if (userPlan.length > 0) {
      if (userPlan[0].has_subscription === false) {
        title = "planExpired"
      }
    } else {
      title = "noActivePlan";
    }
    if (title) {
      Alert.alert(
        t(title),
        t("subscribeNowToViewDetails"),
        [
          { text: t("cancel"), style: "cancel" },
          {
            text: t("ok"),
            style: "destructive",
            onPress: async () => {
              router.push('/choose-subscription');
              return;
            },
          },
        ]
      );
      return;
    }
    await AsyncStorage.setItem("passService", JSON.stringify(service));
    router.push('/(provider)/service-requests');
  }

  const reloadData = async () => {
    setLoading(true);
    const token = await AsyncStorage.getItem('token');
    await AsyncStorage.setItem("passServiceId", "");
    if (!token) {
      Alert.alert(t("sessionExpired"), t("pleaseLoginAgain"),
        [
          {
            text: t("ok"),
            onPress: () => {
              // Perform the action when "OK" is pressed
              router.replace("/(auth)/sign-in");
            },
          },
        ]
      );
      setLoading(false);
      return;
    }
    if (!!token) {
      const response: any = await fetchAPI(`${constants.API_URL}/user-services/my_property/`, t, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      
      setLoading(false);
      if (response === null || response === undefined) {
        return;
      }
      console.log("Data:", response); // Log the parsed data
      setTotalActiveServices(response.length);
      setListings(transformData(response));
    }
  };

  const transformData = (data: any[]): Listing[] => {
    let sortedData = data.sort((a, b) => b.id - a.id);
    sortedData = sortedData.filter((property) => property.service_request_count.requests > 0 || property.service_request_count.favorites > 0 || property.service_request_count.avg_rating > 0);
    return sortedData.map((property) => ({
      id: property.id,
      title: property.title,
      propertyFor: property.propertyFor,
      propertyType: property.options.propertyType || "Unknown Property Type",
      housingType: property.options.housingType || "Unknown Housing Type",
      location: property.options.address || "Unknown Location",
      price: property.options.rent ? '₹ ' + parseFloat(property.options.rent) : "N/A",
      requests: property.service_request_count.requests || 0,
      favorites: property.service_request_count.favorites || 0,
      rating: property.service_request_count.avg_rating || 0,
      images: property.options.images && property.options.images.length > 0
        ? property.options.images
        : [`/media/no-image-found.png`],
      status: property.is_active,
    }));
  };

  const handleAddPropert = async () => {
    // const userPlan = await getUserPlan(t);
    // console.log(userPlan)
    // let title = "";
    // if (userPlan.length > 0) {
    //   if (userPlan[0].has_subscription === false) {
    //     title = "planExpired"
    //   } else if (userPlan[0].credits <= userPlan[0].used) {
    //     title = "creditBalanceExhausted"
    //   }
    // } else {
    //   title = "noActivePlan";
    // }
    // if (title) {
    //   Alert.alert(
    //     t(title),
    //     t("subscribeNowToAddProperty"),
    //     [
    //       { text: t("cancel"), style: "cancel" },
    //       {
    //         text: t("ok"),
    //         style: "destructive",
    //         onPress: async () => {
    //           router.push('/choose-subscription');
    //           return;
    //         },
    //       },
    //     ]
    //   );
    //   return;
    // }
    await AsyncStorage.setItem("passServiceId", "");
    router.push('/add-property')
  }

  return (
    <>
      <ScrollView className="bg-gray-100 p-5">
        {loading ? (
          <View className="flex-1 justify-center mt-[60%] items-center">
            <ActivityIndicator size="large" color="#00ff00" />
            <Text className="mt-2 text-xl">{t("loading")}</Text>
          </View>
        ) : (
          <>
            {listings.length > 0 ? (
              listings.map((listing: any) => (
                <View key={listing.id} className="bg-white rounded-lg shadow-md mb-5 p-5">
                  <ImageCarousel images={listing.images} />
                  <Text className="text-xl font-bold mb-1">{listing.title}</Text>
                  <Text className="text-gray-500 mb-1">{listing.location}</Text>

                  {/* Rating and Price Row */}
                  <View className="flex-row justify-between items-center mb-1">
                    <Text className="text-blue-500 text-lg font-bold">
                      {listing.price} <Text className="text-sm text-gray-500">{listing.propertyFor === "Sale" ? "" : t(listing.propertyType !== "Guest House" ? "pricePerMonth" : "priceDayNight")}</Text>
                    </Text>
                    <View className="flex-row items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <MaterialIcons
                          key={star}
                          name={star <= Math.floor(listing.rating) ? "star" : star - listing.rating <= 0.5 ? "star-half" : "star-border"}
                          size={20}
                          color="#FFD700"
                        />
                      ))}
                      <Text className="text-gray-500 ml-2">({listing.rating.toFixed(1)})</Text>
                    </View>
                  </View>

                  {/* Requests and Favorites Row */}
                  <View className="flex-row justify-between items-center mb-3">
                    {listing.requests > 0 ? (
                      <TouchableOpacity onPress={() => handleViewRequests(listing)}>
                        <Text className="text-blue-500 underline">{listing.requests} {t("requests")}</Text>
                      </TouchableOpacity>
                    ) : (
                      <Text className="text-gray-500">{listing.requests} {t("requests")}</Text>
                    )}
                    <View className="flex-row items-center">
                      <Text className="text-red-500 mr-1">❤</Text>
                      <Text className="text-gray-500">{listing.favorites} {t("favorites")}</Text>
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
                <Text className="text-xl font-bold text-black mb-2">
                  {totalActiveServices ? t("noActivityFound") : t("noPropertyFound")}
                </Text>
                <Text className="text-base text-gray-600 text-center mb-10">
                  {totalActiveServices ? t("noActivityMessage") : t("noPropertyMessage")}
                </Text>
                {!totalActiveServices && (
                  <TouchableOpacity
                    className="bg-green-500 py-3 px-10 rounded-full mb-5"
                    onPress={() => handleAddPropert()}
                  >
                    <Text className="text-white text-lg font-bold">{t("addNewProperty")}</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </>
  );
};

export default Services;