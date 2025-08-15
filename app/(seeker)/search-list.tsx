import { constants, icons } from '@/constants';
import { fetchAPI } from '@/lib/fetch';
import { Listing } from '@/types/type';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { MaterialIcons } from "@expo/vector-icons";
import { View, Text, Image, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useTranslation } from 'react-i18next'; // Import useTranslation
import en from '../locales/en';
import ImageCarousel from '@/components/ImageCarousel';

const SearchList = () => {
    const { t } = useTranslation(); // Initialize translation hook
    const router = useRouter();
    const { searchData } = useLocalSearchParams(); // Use useLocalSearchParams instead of useSearchParams
    const filtersData = typeof searchData === 'string' ? JSON.parse(searchData) : {}; // Ensure searchData is a string before parsing

    const [loading, setLoading] = useState(true);
    const [listings, setListings] = useState<Listing[]>([]);

    useFocusEffect(
        useCallback(() => {
            console.log("Services screen focused");
            reloadData(); // Run checkAuth every time the screen comes into focus
        }, [])
    );
    const reloadData = async () => {
        setLoading(true);
        const token = await AsyncStorage.getItem('token');
        if (!token) {
            Alert.alert(t("sessionExpired"), t("pleaseLoginAgain"),
                [
                    {
                        text: t("ok"),
                        onPress: () => {
                            router.replace("/(auth)/sign-in");
                        },
                    },
                ]
            );
            return;
        }
        if (!!token) {
            console.log("filtersData", filtersData);
            const response: any = await fetchAPI(`${constants.API_URL}/search/`, t, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(filtersData), // Send filters as JSON
            });
            setLoading(false);
            if (response === null || response === undefined) {
                return;
            }
            setListings(transformData(response));
        }
    };

    const transformData = (data: any[]): Listing[] => {
        const sortedData = data.sort((a, b) => b.id - a.id);
        return sortedData.map((property) => ({
            id: property.id,
            title: property.title,
            propertyFor: property.options.propertyFor,
            location: property.options.address || "Unknown Location",
            rating: "New",
            price: property.options.rent ? '₹ ' + parseFloat(property.options.rent) : "N/A",
            requests: 0,
            favorites: 0,
            propertyType: property.options.propertyType || "Unknown Property Type",
            housingType: property.options.housingType || "Unknown Housing Type",
            stateName: property.options.stateName || "Unknown State",
            districtName: property.options.districtName || "Unknown District",
            city: property.options.city,
            images: property.options.images && property.options.images.length > 0
                ? property.options.images
                : [`/media/no-image-found.png`],
            status: property.is_active,
        }));
    };

    const handleView = async (id: number) => {
        router.push({
            pathname: '/property-details',
            params: {
                passServiceId: id.toString()
            },
        });
        return;
    };

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
                                <View key={listing.id} className="bg-white rounded-lg shadow-md mb-5 p-5 relative">
                                    {/* Favorite Button */}
                                    {/* <TouchableOpacity
                                        className="absolute top-3 right-3 bg-gray-200 p-2 rounded-full"
                                        onPress={() => console.log("Favorite clicked")}
                                    >
                                        <FontAwesome5 name="heart" size={16} color="#FF7F19" />
                                    </TouchableOpacity> */}

                                    {/* Image Carousel */}
                                    {/* <ScrollView horizontal pagingEnabled className="flex-row mb-3">
                                        {listing.images.map((image: string, index: number) => (
                                            <View key={index} className="relative">
                                                <Image
                                                    source={{ uri: image }}
                                                    style={{ width: screenWidth - 40 }}
                                                    className="h-48 rounded-lg mr-2"
                                                />
                                                <View className="absolute bottom-2 right-2 bg-black bg-opacity-50 px-2 py-1 rounded-full">
                                                    <Text className="text-white text-xs">{`${index + 1}/${listing.images.length}`}</Text>
                                                </View>
                                            </View>
                                        ))}
                                    </ScrollView> */}
                                    <ImageCarousel images={listing.images} />

                                    {/* Title */}
                                    <Text className="text-xl font-bold mb-2 text-gray-800">{listing.title}</Text>

                                    {/* Location */}
                                    <View className="flex-row items-center mb-3">
                                        <MaterialIcons name="location-on" size={20} color="#4CAF50" />
                                        <Text className="text-gray-600 ml-2">
                                            {listing.location}, {listing.city}, {listing.districtName}, {listing.stateName}
                                        </Text>
                                    </View>

                                    {/* Price */}
                                    <View className="flex-row justify-between items-center mb-3">
                                        <Text className="text-blue-600 text-lg font-bold">
                                            {listing.price} <Text className="text-sm text-gray-500">{listing.propertyFor === "Sell" ? "" : t(listing.propertyType !== "Guest House" ? "pricePerMonth" : "priceDayNight")}</Text>
                                        </Text>
                                    </View>

                                    {/* Property Type & Housing Type */}
                                    <View className="flex-row justify-between items-center mb-3">
                                        <Text className="text-gray-700 text-base font-medium flex-1">
                                            {getKeyByValue(listing.propertyType)}
                                        </Text>
                                        {["Full House", "PG/Hostel", "Guest House", "Commercial"].includes(listing.propertyType) && (
                                            <Text className="text-gray-700 text-base font-medium flex-1 text-right">
                                                {getKeyByValue(listing.housingType)}
                                            </Text>
                                        )}
                                    </View>
                                    {/* View Details Button */}
                                    <TouchableOpacity
                                        className="bg-blue-500 py-2 px-5 rounded-lg mt-3"
                                        onPress={() => handleView(listing.id)}
                                    >
                                        <Text className="text-white text-center font-bold">{t("viewDetails")}</Text>
                                    </TouchableOpacity>
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
                                <Text className="text-xl font-bold text-black mb-2">{t("noPropertyFound")}</Text>
                                <Text className="text-base text-gray-600 text-center mb-5">
                                    {t("noFilteredPropertyMessage")} {/* Message for no properties matching the filter */}
                                </Text>
                                <TouchableOpacity
                                    className="bg-green-500 py-3 px-10 rounded-full mb-3"
                                    onPress={() => router.back()} // Navigate back to the home page to reset filters
                                >
                                    <Text className="text-white text-lg font-bold">{t("resetFilters")}</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </>
                )}
            </ScrollView>
        </>
    );
};

export default SearchList;