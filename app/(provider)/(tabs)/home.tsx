import { constants, icons } from '@/constants';
import { fetchAPI } from '@/lib/fetch';
import { Listing } from '@/types/type';
import ImageCarousel from "@/components/ImageCarousel";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useTranslation } from 'react-i18next'; // Import useTranslation

const Home = () => {
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
                                router.replace("/(auth)/sign-in");
                            },
                        },
                    ]
                );
            }
            if (!!token) {
                const response: any = await fetchAPI(`${constants.API_URL}/user-services/my_property/`, t, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                });
                if (response === null || response === undefined) {
                    return;
                }
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
            images: property.options.images && property.options.images.length > 0
                ? property.options.images.map((image: string) => image.replace("www.", constants.REPACE_TEXT))
                : [`${constants.BASE_URL}/media/no-image-found.png`],
            status: property.is_active,
        }));
    };

    const handleView = async (id: number) => {
        await AsyncStorage.setItem("passServiceId", id.toString());
        router.push(`/property-details`);
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
                            ); // Use translation keys
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
            Alert.alert(t("error"), t("errorSavingServiceId"),
                [
                    {
                        text: t("ok"),
                    },
                ]
            ); // Use translation key
        }
    };

    const handleChangeStatus = (id: number) => {
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
                            ); // Use translation keys
                        }
                    },
                },
            ]
        );
    };

    const handleAddPropert = async () => {
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
        }
        const response = await fetchAPI(
            `${constants.API_URL}/user/plan/`,
            t,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            }
        );
        if (response === null || response === undefined) {
            return;
        }
        const plans = response.map((item: any) => ({
            id: item.id,
            subscription_id: item.subscription_id,
            planName: item.title,
            price: item.amount,
            description: item.descriptions,
            period: item.period,
            credits: item.credits,
            used: item.used,
        })) || [];

        if (plans.length === 0 || plans[0].credits <= plans[0].used) {
            Alert.alert(t("error"), t("invalidPlanToCreateService"),
                [
                    {
                        text: t("ok"),
                    },
                ]
            );
            return
        }
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
                                            {listing.price} <Text className="text-sm text-gray-500">/month</Text>
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
                                            onPress={() => handleChangeStatus(listing.id)}
                                        >
                                            <Text className="text-white font-bold">
                                                {listing.status ? t("deactivate") : t("activate")}
                                            </Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            className="bg-red-500 py-2 px-4 rounded-lg"
                                            onPress={() => handleDelete(listing.id)}
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