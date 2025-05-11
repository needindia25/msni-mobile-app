import { constants } from '@/constants';
import { fetchAPI } from '@/lib/fetch';
import { Listing } from '@/types/type';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
// import { useIsFocused } from "@react-navigation/native";
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next'; // Import useTranslation
import ListingCard from '@/components/ListingCard';

const Requests = () => {
    const { t } = useTranslation(); // Initialize translation hook
    const router = useRouter();
    // const isFocused = useIsFocused();
    const defaultTab = true;

    const [loading, setLoading] = useState(true);
    const [requestListings, setRequestListings] = useState<Listing[]>([]);
    const [favouriteListings, setFavouriteListings] = useState<Listing[]>([]);
    const [showRequests, setShowRequests] = useState(defaultTab); // State to toggle between Requests and Favorites

    const fetchDetails = async () => {
        const token = await AsyncStorage.getItem('token');
        if (!token) {
            Alert.alert(t("sessionExpired"), t("pleaseLoginAgain"), [
                {
                    text: t("ok"),
                    onPress: () => {
                        router.replace("/(auth)/sign-in");
                    },
                },
            ]);
            return;
        }
        if (!!token) {
            const requestResponse: any = await fetchAPI(`${constants.API_URL}/user-services/my_requested_services/`, t, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });
            if (requestResponse === null || requestResponse === undefined) {
                return;
            }
            setRequestListings(transformData(requestResponse));

            const favouriteResponse: any = await fetchAPI(`${constants.API_URL}/user-services/my_favorite_services/`, t, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });
            if (favouriteResponse === null || favouriteResponse === undefined) {
                return;
            }
            setFavouriteListings(transformData(favouriteResponse));
        }
        setLoading(false);
    };
    useEffect(() => {        
        fetchDetails();
    }, [showRequests]);

    useFocusEffect(
        React.useCallback(() => {
            const fetchData = async () => {
                const selectedTab = await AsyncStorage.getItem('selectedTab');
                setShowRequests(selectedTab === "favorites" ? false : (selectedTab === "requests" ? true : defaultTab));
            };
            fetchData();
        }, [])
    );

    const handleShowRequests = async (value: boolean) => {
        setShowRequests(value);
        await AsyncStorage.setItem("selectedTab", value ? "requests" : "favorites");
    };

    const transformData = (data: any[]): Listing[] => {
        const sortedData = data.sort((a, b) => b.id - a.id);
        return sortedData.map((property) => ({
            id: property.id,
            title: property.title,
            location: property.options.address || "Unknown Location",
            rating: "New",
            price: property.options.rent ? '₹ ' + parseFloat(property.options.rent) : "N/A",
            requests: 0,
            favorites: 0,
            propertyType: property.options.propertyType || "Unknown Type",
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
            pathname: '/(seeker)/property-details',
            params: {
                passServiceId: id.toString()
            },
        });
        return;
    };

    return (
        <>
            <View className="flex-row justify-center bg-white p-4">
                <TouchableOpacity
                    className={`flex-1 px-4 py-2 rounded-lg ${showRequests ? "bg-green-500" : "bg-gray-300"}`}
                    onPress={() => handleShowRequests(true)}
                >
                    <Text className={`text-center font-bold ${showRequests ? "text-white" : "text-gray-700"}`}>
                        {t("myRequests")}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    className={`flex-1 px-4 py-2 rounded-lg ml-2 ${!showRequests ? "bg-green-500" : "bg-gray-300"}`}
                    onPress={() => handleShowRequests(false)}
                >
                    <Text className={`text-center font-bold ${!showRequests ? "text-white" : "text-gray-700"}`}>
                        {t("myFavorites")}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Listings */}
            <ScrollView className="bg-gray-100 p-5">
                {loading ? (
                    <View className="flex-1 justify-center mt-[60%] items-center">
                        <ActivityIndicator size="large" color="#00ff00" />
                        <Text className="mt-2 text-xl">{t("loading")}</Text>
                    </View>
                ) : (
                    <>
                        {showRequests ? (
                            requestListings.length > 0 ? (
                                requestListings.map((listing: any) => (
                                    <ListingCard key={listing.id} listing={listing} handleView={handleView} />
                                ))
                            ) : (
                                <View className="flex-1 items-center justify-center bg-white p-5">
                                    <Text className="text-xl font-bold text-black mb-2">{t("noRequestFound")}</Text>
                                    <Text className="text-base text-gray-600 text-center mb-5">{t("noRequestMessage")}</Text>
                                </View>
                            )
                        ) : favouriteListings.length > 0 ? (
                            favouriteListings.map((listing: any) => (
                                <ListingCard key={listing.id} listing={listing} handleView={handleView} />
                            ))
                        ) : (
                            <View className="flex-1 items-center justify-center bg-white p-5">
                                <Text className="text-xl font-bold text-black mb-2">{t("noFavoritesFound")}</Text>
                                <Text className="text-base text-gray-600 text-center mb-5">{t("noFavoritesMessage")}</Text>
                            </View>
                        )}
                    </>
                )}
            </ScrollView>
        </>
    );
};

export default Requests;