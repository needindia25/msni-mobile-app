import { constants, icons } from '@/constants';
import { fetchAPI } from '@/lib/fetch';
import { Listing } from '@/types/type';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions, Alert } from 'react-native';
import { useTranslation } from 'react-i18next'; // Import useTranslation

const Home = () => {
    const { t } = useTranslation(); // Initialize translation hook
    const screenWidth = Dimensions.get('window').width;
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [listings, setListings] = useState<Listing[]>([]);

    useEffect(() => {
        const checkAuth = async () => {
            const token = await AsyncStorage.getItem('token');
            await AsyncStorage.setItem("passServiceId", "");
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
            images: property.options.images.length > 0
                ? property.options.images.map((image: string) => image.replace("www.", "admin.")) // Replace "www." with "admin."
                : [`${constants.BASE_URL}/media/no-image-found.png`],
            status: property.is_active,
        }));
    };

    const handleDelete = (id: number) => {
        Alert.alert(
            t("deleteProperty"), // Use translation key
            t("deleteConfirmation"), // Use translation key
            [
                { text: t("cancel"), style: "cancel" }, // Use translation key
                {
                    text: t("delete"), // Use translation key
                    style: "destructive",
                    onPress: async () => {
                        const token = await AsyncStorage.getItem('token');
                        if (token) {
                            await fetchAPI(`${constants.API_URL}/user-services/${id}/`, {
                                method: "DELETE",
                                headers: {
                                    'Authorization': `Bearer ${token}`,
                                },
                            });
                            setListings((prev) => prev.filter((listing) => listing.id !== id));
                            Alert.alert(t("success"), t("propertyDeleted")); // Use translation key
                        }
                    },
                },
            ]
        );
    };

    const handleEdit = async (id: number) => {
        try {
            await AsyncStorage.setItem("passServiceId", id.toString());
            router.push(`/add-property`);
        } catch (error) {
            console.error("Error saving service ID to AsyncStorage:", error);
            Alert.alert(t("error"), t("errorSavingServiceId")); // Use translation key
        }
    };

    const handleChangeStatus = (id: number) => {
        Alert.alert(
            t("changeStatus"), // Use translation key
            t("changeStatusConfirmation"), // Use translation key
            [
                { text: t("cancel"), style: "cancel" }, // Use translation key
                {
                    text: t("change"), // Use translation key
                    onPress: async () => {
                        const token = await AsyncStorage.getItem('token');
                        if (token) {
                            await fetchAPI(`${constants.API_URL}/user-services/${id}/toggle_status/`, {
                                method: "PATCH",
                                headers: {
                                    'Authorization': `Bearer ${token}`,
                                },
                            });
                            Alert.alert(t("success"), t("statusUpdated")); // Use translation key
                            setListings((prevListings) =>
                                prevListings.map((listing) =>
                                    listing.id === id
                                        ? { ...listing, status: !listing.status }
                                        : listing
                                )
                            );
                        }
                    },
                },
            ]
        );
    };

    return (
        <>
            {listings.length > 0 && (
                <TouchableOpacity
                    className="absolute top-5 right-5 bg-green-500 rounded-full p-5 shadow-lg"
                    onPress={() => router.push('/add-property')}
                    style={{ zIndex: 1000 }}
                >
                    <Text className="text-white text-base font-bold">+ Add Next Property</Text> {/* Wrap "+" in <Text> */}
                </TouchableOpacity>
            )}
            <ScrollView className="bg-gray-100 p-5">
                {loading ? (
                    <View className="flex-1 justify-center mt-[60%] items-center">
                        <ActivityIndicator size="large" color="#00ff00" />
                        <Text className="mt-2 text-xl">{t("loading")}</Text> {/* Wrap text in <Text> */}
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
                                    <Text className="text-xl font-bold mb-1">{listing.title}</Text> {/* Wrap text in <Text> */}
                                    <Text className="text-gray-500 mb-1">{listing.location}</Text> {/* Wrap text in <Text> */}

                                    <View className="flex-row justify-between items-center mb-1">
                                        <Text className="text-blue-500 text-lg font-bold">
                                            {listing.price} <Text className="text-sm text-gray-500">/month</Text> {/* Wrap text in <Text> */}
                                        </Text>
                                    </View>

                                    <View className="flex-row justify-between">
                                        <TouchableOpacity
                                            className="bg-yellow-500 py-2 px-4 rounded-lg"
                                            onPress={() => handleEdit(listing.id)}
                                        >
                                            <Text className="text-white font-bold">{t("edit")}</Text> {/* Wrap text in <Text> */}
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            className="bg-green-500 py-2 px-4 rounded-lg"
                                            onPress={() => handleChangeStatus(listing.id)}
                                        >
                                            <Text className="text-white font-bold">
                                                {listing.status ? t("deactivate") : t("activate")} {/* Wrap text in <Text> */}
                                            </Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            className="bg-red-500 py-2 px-4 rounded-lg"
                                            onPress={() => handleDelete(listing.id)}
                                        >
                                            <Text className="text-white font-bold">{t("delete")}</Text> {/* Wrap text in <Text> */}
                                        </TouchableOpacity>
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
                                <Text className="text-xl font-bold text-black mb-2">{t("noPropertyFound")}</Text> {/* Wrap text in <Text> */}
                                <Text className="text-base text-gray-600 text-center mb-10">
                                    {t("noPropertyMessage")} {/* Wrap text in <Text> */}
                                </Text>
                                <TouchableOpacity
                                    className="bg-green-500 py-3 px-10 rounded-full mb-5"
                                    onPress={() => router.push('/add-property')}
                                >
                                    <Text className="text-white text-lg font-bold">{t("addNewProperty")}</Text> {/* Wrap text in <Text> */}
                                </TouchableOpacity>
                            </View>
                        )}
                    </>
                )}
            </ScrollView>
        </>
    );
};

export default Home;