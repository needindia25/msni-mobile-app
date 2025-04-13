import { constants } from '@/constants';
import { fetchAPI } from '@/lib/fetch';
import { Listing } from '@/types/type';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useTranslation } from 'react-i18next'; // Import useTranslation

import ListingCard from '@/components/ListingCard';


const Requests = () => {
    const { t } = useTranslation(); // Initialize translation hook
    const router = useRouter();
    
    const [loading, setLoading] = useState(true);
    const [listings, setListings] = useState<Listing[]>([]);

    useEffect(() => {
        const checkAuth = async () => {
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
                  }
            if (!!token) {
                const response: any = await fetchAPI(`${constants.API_URL}/user-services/my_requested_services/`, t, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                });
                console.log("API Response:", response); // Log the API response
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
            propertyType: property.options.propertyType || "Unknown Type",
            stateName: property.options.stateName || "Unknown State",
            districtName: property.options.districtName || "Unknown District",
            city: property.options.city,
            images: property.options.images && property.options.images.length > 0
                ? property.options.images.map((image: string) => image.replace("www.", "admin.")) // Replace "www." with "admin."
                : [`${constants.BASE_URL}/media/no-image-found.png`],
            status: property.is_active,
        }));
    };

    const handleView = async (id: number) => {
      await AsyncStorage.setItem("passServiceId", id.toString());
      router.push(`/(seeker)/property-details`);
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
                              <ListingCard key={listing.id} listing={listing} handleView={handleView} />
                            ))
                        ) : (
                            <View className="flex-1 items-center justify-center bg-white p-5">
                                <Text className="text-xl font-bold text-black mb-2">{t("noRequestFound")}</Text>
                                <Text className="text-base text-gray-600 text-center mb-5">
                                    {t("noRequestMessage")} {/* Message for no properties matching the filter */}
                                </Text>
                            </View>
                        )}
                    </>
                )}
            </ScrollView>
        </>
    );
};

export default Requests;