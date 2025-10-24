import { constants, icons } from '@/constants';
import { fetchAPI } from '@/lib/fetch';
import { Listing } from '@/types/type';
import ImageCarousel from "@/components/ImageCarousel";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useTranslation } from 'react-i18next'; // Import useTranslation
import { getUserPlan } from '@/lib/utils';

const Home = () => {
    const { t } = useTranslation(); // Initialize translation hook
    const router = useRouter();

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
        await AsyncStorage.setItem("passServiceId", "");
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
            // console.log("Data:", response); // Log the parsed data
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
            price: property.options.rent ? '₹ ' + property.options.rent : "N/A",
            propertyType: property.options.propertyType || "Unknown Property Type",
            housingType: property.options.housingType || "Unknown Housing Type",
            requests: 0,
            favorites: 0,
            images: property.options.images && property.options.images.length > 0
                ? property.options.images
                : [`/media/no-image-found.png`],
            status: property.is_active,
            is_deletable: (property.service_request_count.requests === 0 && property.service_request_count.ratings === 0 && property.service_request_count.favorites === 0)
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

    const handleDelete = (id: number, is_deletable: boolean = true) => {
        if (is_deletable === false) {
            Alert.alert(t("warning"), t("cannotDeleteDeactivateInstead"),
                [
                    {
                        text: t("ok"),
                    },
                ]
            );
            return;
        }
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
                        if (token) {
                            const response = await fetchAPI(`${constants.API_URL}/user-services/${id}/`, t, {
                                method: "DELETE",
                                headers: {
                                    'Authorization': `Bearer ${token}`,
                                },
                            });
                            if (response === null || response === undefined) {
                                return;
                            }
                            Alert.alert(
                                t("success"),
                                t("propertyDeleted"),
                                [
                                    {
                                        text: t("ok"),
                                        onPress: () => {
                                            setListings((prev) => prev.filter((listing) => listing.id !== id));
                                        },
                                    },
                                ]
                            );
                        }
                    },
                },
            ]
        );
    };

    const checkSubscription = async () => {
        const userPlan = await getUserPlan(t);
        console.log(userPlan)
        let title = "active";
        if (userPlan.length === 0) {
            return "noActivePlan";
        }
        if (userPlan.length > 0) {
            if (userPlan[0].has_subscription === false) {
                title = "planExpired"
            } else if (userPlan[0].user_type_code == "S") {
                title = "invalidPlan";
            } else if (userPlan[0].credits <= userPlan[0].used) {
                title = "creditBalanceExhausted"
            } else {
                const userInfoString = await AsyncStorage.getItem('user_info');
                const userInfoJson = userInfoString ? JSON.parse(userInfoString) : null
                userInfoJson.has_subscription = true;
                userInfoJson.plan_id = userPlan[0].id;
                await AsyncStorage.setItem("user_info", JSON.stringify(userInfoJson));
            }
        } else {
            title = "noActivePlan";
        }
        return title;
    }

    const handleEdit = async (id: number) => {
        const subscriptionStatus = await checkSubscription()
        if (subscriptionStatus !== "active") {
            Alert.alert(
                t(subscriptionStatus),
                t("subscribeNowToEditProperty"),
                [
                    { text: t("cancel"), style: "cancel" },
                    {
                        text: t("ok"),
                        style: "destructive",
                        onPress: async () => {
                            router.push('/choose-subscription');
                            return false;
                        },
                    },
                ]
            );
            return;
        }
        try {
            router.push({
                pathname: '/add-property',
                params: {
                    passServiceId: id.toString()
                },
            });
            return;
        } catch (error) {
            Alert.alert(t("error"), t("errorSavingServiceId"),
                [
                    {
                        text: t("ok"),
                    },
                ]
            );
            return;
        }
    };

    const handleChangeStatus = async (id: number, status: boolean) => {
        if (status === false) {
            const subscriptionStatus = await checkSubscription()
            if (subscriptionStatus === "planExpired" || subscriptionStatus === "noActivePlan") {
                Alert.alert(
                    t(subscriptionStatus),
                    t("subscribeNowToEditProperty"),
                    [
                        { text: t("cancel"), style: "cancel" },
                        {
                            text: t("ok"),
                            style: "destructive",
                            onPress: async () => {
                                router.push('/choose-subscription');
                                return false;
                            },
                        },
                    ]
                );
                return;
            }
        }
        Alert.alert(
            t("changeStatus"), // Use translation key
            t("changeStatusConfirmation"), // Use translation key
            [
                { text: t("cancel"), style: "cancel" }, // Use translation key
                {
                    text: t("changeStatus"), // Use translation key
                    onPress: async () => {
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
                        if (token) {
                            const response = await fetchAPI(`${constants.API_URL}/user-services/${id}/toggle_status/`, t, {
                                method: "PATCH",
                                headers: {
                                    'Authorization': `Bearer ${token}`,
                                },
                            });
                            if (response === null || response === undefined) {
                                return;
                            }
                            Alert.alert(
                                t("success"),
                                t("statusUpdated"),
                                [
                                    {
                                        text: t("ok"),
                                        onPress: () => {
                                            setListings((prevListings) =>
                                                prevListings.map((listing) =>
                                                    listing.id === id
                                                        ? { ...listing, status: !listing.status }
                                                        : listing
                                                )
                                            );
                                        },
                                    },
                                ]
                            );
                        }
                    },
                },
            ]
        );
    };

    const handleAddPropert = async () => {
        await AsyncStorage.setItem("passServiceId", "");
        router.push('/add-property')
    }

    return (
        <>
            {listings.length > 0 && (
                <TouchableOpacity
                    className="absolute top-5 right-5 bg-green-500 rounded-full p-5 shadow-lg"
                    onPress={() => handleAddPropert()}
                    style={{ zIndex: 1000 }}
                >
                    <Text className="text-white text-base font-bold">+ {t("addNextProperty")}</Text> {/* Wrap "+" in <Text> */}
                </TouchableOpacity>
            )}
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
                                    {/* <ScrollView horizontal pagingEnabled className="flex-row mb-3">
                                        {listing.images.map((image: string, index: number) => (
                                            <View key={index} className="relative">
                                                <Image
                                                    source={{ uri: image }}
                                                    style={{ width: screenWidth - 40 }}
                                                    className="h-48 rounded-lg mr-2"
                                                />
                                            </View>
                                        ))}
                                    </ScrollView> */}
                                    <ImageCarousel images={listing.images} />
                                    <Text className="text-xl font-bold mb-1">{listing.title}</Text>
                                    <Text className="text-gray-500 mb-1">{listing.location}</Text>

                                    <View className="flex-row justify-between items-center mb-1">
                                        <Text className="text-blue-500 text-lg font-bold">
                                            {listing.price} <Text className="text-sm text-gray-500">{listing.propertyFor === "Sell" ? "" : t(listing.propertyType !== "Guest House" ? "pricePerMonth" : "priceDayNight")}</Text>
                                        </Text>
                                    </View>

                                    <View className="flex-row justify-between">
                                        <TouchableOpacity
                                            className="bg-blue-500 py-2 px-4 rounded-lg"
                                            onPress={() => handleView(listing.id)}
                                        >
                                            <Text className="text-white font-bold">{t("view")}</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            className="bg-yellow-500 py-2 px-4 rounded-lg"
                                            onPress={() => handleEdit(listing.id)}
                                        >
                                            <Text className="text-white font-bold">{t("edit")}</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            className="bg-green-500 py-2 px-4 rounded-lg"
                                            onPress={() => handleChangeStatus(listing.id, listing.status)}
                                        >
                                            <Text className="text-white font-bold">
                                                {listing.status ? t("deactivate") : t("activate")}
                                            </Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            className={` py-2 px-4 rounded-lg ${listing.is_deletable
                                                ? "bg-red-500"
                                                : "bg-red-300"
                                                }`}
                                            onPress={() => handleDelete(listing.id, listing.is_deletable)}
                                        >
                                            <Text className="text-white font-bold">{t("delete")}</Text>
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
                                <Text className="text-xl font-bold text-black mb-2">{t("noPropertyFound")}</Text>
                                <Text className="text-base text-gray-600 text-center mb-10">
                                    {t("noPropertyMessage")}
                                </Text>
                                <TouchableOpacity
                                    className="bg-green-500 py-3 px-10 rounded-full mb-5"
                                    onPress={() => handleAddPropert()}
                                >
                                    <Text className="text-white text-lg font-bold">{t("addNewProperty")}</Text>
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