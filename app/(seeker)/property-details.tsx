import { useRouter, useLocalSearchParams } from 'expo-router';
import { format } from "date-fns";
import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import { constants, icons } from "@/constants";
import { fetchAPI } from "@/lib/fetch";
import { useTranslation } from "react-i18next";
import en from '../locales/en';
import ImageCarousel from '@/components/ImageCarousel';
import GoogleTextInput from '@/components/GoogleTextInput';
import { UserInfo } from '@/types/type';
import { getUserPlan } from '@/lib/utils';
import Clipboard from '@react-native-clipboard/clipboard';
import { Linking } from 'react-native';
import { OtherRoom } from '@/types/type';
import { formDataKeys } from "@/constants/staticData";

const PropertyDetails = () => {
    const { t } = useTranslation();
    const [showContactInfo, setShowContactInfo] = useState(false);
    const router = useRouter();
    const { passServiceId } = useLocalSearchParams()
    const [id, setId] = useState<number | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
    const [formData, setFormData] = useState(formDataKeys);

    const [rating, setRating] = useState(4);
    const [favorites, setFavorites] = useState(false);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                if (typeof passServiceId === "string") {
                    setId(parseInt(passServiceId, 10));
                }
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
                if (passServiceId && token) {
                    setToken(token);
                    const serviceResponse = await fetchAPI(`${constants.API_URL}/user-services/${passServiceId}/info/`, t, {
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`,
                        },
                    });
                    if (serviceResponse === null || serviceResponse === undefined) {
                        return;
                    }

                    setFormData((prevFormData: any) => ({
                        ...prevFormData,
                        ...serviceResponse["options"],
                        ...{
                            date_updated: serviceResponse["date_updated"],
                            date_created: serviceResponse["date_created"],
                            status: serviceResponse["is_active"],
                            owner_contact: serviceResponse["owner_contact"],
                            owner_name: serviceResponse["owner_name"],
                            images: ((serviceResponse["options"].images && serviceResponse["options"].images.length > 0) || (serviceResponse["options"].projectMap && serviceResponse["options"].projectMap.length > 0))
                                ? [...serviceResponse["options"].images, ...serviceResponse["options"].projectMap].filter((image) => image !== "")
                                : [`/media/no-image-found.png`],
                            basicAmenities: serviceResponse["options"].basicAmenities && serviceResponse["options"].basicAmenities.length > 0 ?
                                serviceResponse["options"].basicAmenities.filter((amenity: any) => amenity !== "None") : [],
                            additionalAmenities: serviceResponse["options"].additionalAmenities && serviceResponse["options"].additionalAmenities.length > 0 ?
                                serviceResponse["options"].additionalAmenities.filter((amenity: any) => amenity !== "None") : [],
                            sourceOfWater: serviceResponse["options"].sourceOfWater
                                ? (typeof serviceResponse["options"].sourceOfWater === "string"
                                    ? [serviceResponse["options"].sourceOfWater]
                                    : serviceResponse["options"].sourceOfWater)
                                : [],
                            housingType: serviceResponse["options"].housingType
                                ? (typeof serviceResponse["options"].housingType === "string"
                                    ? [serviceResponse["options"].housingType]
                                    : serviceResponse["options"].housingType)
                                : [],
                            numberOfBathRooms: serviceResponse["options"].numberOfBathRooms
                                ? ((typeof serviceResponse["options"].numberOfBathRooms === "string" || typeof serviceResponse["options"].numberOfBathRooms === "number")
                                    ? [serviceResponse["options"].numberOfBathRooms + " Bath Room" + (serviceResponse["options"].numberOfBathRooms > 1 ? "s" : "")]
                                    : serviceResponse["options"].numberOfBathRooms)
                                : [],
                        },
                        ...{
                            latitude: parseFloat(String(serviceResponse["options"].latitude || "0")),
                            longitude: parseFloat(String(serviceResponse["options"].longitude || "0"))
                        }
                    }));

                    if (serviceResponse["service_request_count"]) {
                        const serviceRequestCount = serviceResponse["service_request_count"];
                        setShowContactInfo(serviceRequestCount["is_my_request"]);
                        setFavorites(serviceRequestCount["is_my_favorite"]);
                        setRating(serviceRequestCount["get_my_rating"]);
                    }
                }
            } catch (error) {
                Alert.alert(t("error"), t("errorFetchingProperty"),
                    [
                        {
                            text: t("ok"),
                        },
                    ]
                );
                setLoading(false);
                return;
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, []);

    const formatDate = (dateString: string) => {
        if (!dateString) return t("notAvailable");
        const date = new Date(dateString);
        return format(date, "do MMMM, yyyy");
    };

    const floorNumber = [
        "Ground Floor",
        "1st Floor",
        "2nd Floor",
        "3rd Floor",
        "4th Floor",
        "5th Floor",
        "6th Floor",
        "7th Floor",
        "8th Floor",
        "9th Floor",
        "10th Floor",
        "11th Floor",
        "12th Floor",
        "13th Floor",
        "14th Floor",
        "15th Floor",
        "16th Floor",
        "17th Floor",
        "18th Floor",
        "19th Floor",
        "20th Floor"
    ];

    const getKeyByValue = (value: string): string => {
        const key = Object.keys(en.translation).find((k) => en.translation[k as keyof typeof en.translation] === value);

        if (key) {
            return t(key);
        }
        return value;
    };

    const getOwnerDetails = async () => {
        const userPlan = await getUserPlan(t);
        console.log(userPlan)
        let title = "";
        if (userPlan.length > 0) {
            if (userPlan[0].has_subscription === false) {
                title = "planExpired"
            } else if (userPlan[0].user_type_code === "P") {
                title = "invalidPlan";
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
        if (id && token) {
            const serviceResponse = await fetchAPI(`${constants.API_URL}/user-services/${id}/requests/`, t, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });
            if (serviceResponse === null || serviceResponse === undefined) {
                return;
            }
            setShowContactInfo(true);
        }
    };

    const handleFavorites = async () => {
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
        if (id && token) {
            const serviceResponse = await fetchAPI(`${constants.API_URL}/user-services/${id}/favorites/`, t, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });
            if (serviceResponse === null || serviceResponse === undefined) {
                return;
            }
            setFavorites(!favorites);
        }
    };

    const handleRating = async (newRating: number) => {
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
        setRating(newRating);
        if (id && token) {
            const serviceResponse = await fetchAPI(`${constants.API_URL}/user-services/${id}/rating/`, t, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ rating: newRating }),
            });
            if (serviceResponse === null || serviceResponse === undefined) {
                return;
            }
        }
    };

    const handleCopy = () => {
        const phoneNumber = formData.contactPersonNumber || formData.owner_contact;
        Clipboard.setString(phoneNumber);
        Alert.alert(t("copied"), `${t("phoneNumber")} ${t("copied").toLowerCase()}`);
    };

    const handleCall = () => {
        const phoneNumber = formData.contactPersonNumber || formData.owner_contact;
        Linking.openURL(`tel:${phoneNumber}`);
    };

    return (
        <ScrollView className="bg-gray-100 p-5">
            {loading ? (
                <View className="flex-1 justify-center mt-[5%] items-center">
                    <ActivityIndicator size="large" color="#00ff00" />
                    <Text className="mt-2 text-base">{t("loading")}</Text>
                </View>
            ) : (
                <>
                    {/* <TouchableOpacity onPress={() => router.back()} className="mb-5">
                        <MaterialIcons name="arrow-back" size={24} color="blue" />
                    </TouchableOpacity> */}

                    <View className="bg-white rounded-lg shadow-md mb-5 p-5">
                        <ImageCarousel images={formData.images} video={formData.video} />

                        <Text className="text-2xl font-bold mb-2">{formData.title}</Text>
                        <View className="flex-row items-center mb-3">
                            <MaterialIcons name="location-on" size={20} color="gray" />
                            <Text className="text-gray-500 ml-1">
                                {formData.address}, {formData.city}, {formData.districtName}, {formData.stateName}
                            </Text>
                        </View>

                        <View className="flex-row justify-between items-center mb-3">
                            <View className="flex-row items-center">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <TouchableOpacity key={star} onPress={() => handleRating(star)}>
                                        <MaterialIcons
                                            name={star <= rating ? "star" : "star-border"}
                                            size={20}
                                            color="#FFD700"
                                        />
                                    </TouchableOpacity>
                                ))}
                                <Text className="text-gray-500 ml-2">({rating})</Text>
                            </View>

                            <TouchableOpacity
                                className="bg-gray-200 p-2 rounded-full"
                                onPress={() => handleFavorites()}
                            >
                                <FontAwesome5
                                    name="heart"
                                    size={16}
                                    solid={favorites}
                                    color={favorites ? "#FF7F19" : "gray"}
                                />
                            </TouchableOpacity>
                        </View>

                        {/* Rent and Deposit */}
                        <View className="bg-gray-100 p-4 rounded-lg shadow-md mb-5">
                            <View className="flex-row justify-between mb-3">
                                <View className="flex-row items-center">
                                    <FontAwesome5 name="rupee-sign" size={16} color="black" />
                                    <Text className="text-gray-500 ml-2">{formData.propertyFor === "Sale" ? t("buyAmount") : t("rent")}</Text>
                                </View>
                                <Text className="text-black font-semibold">
                                    {formData.rent || t("notAvailable")}
                                    {formData.rent ? (formData.propertyFor === "Sale" ? "" : t(formData.propertyType !== "Guest House" ? "pricePerMonth" : "priceDayNight")) : ""}
                                </Text>
                            </View>
                            {formData.propertyType !== "Guest House" && (
                                <>
                                    <View className="flex-row justify-between mb-3">
                                        <View className="flex-row items-center">
                                            <FontAwesome5 name="rupee-sign" size={16} color="black" />
                                            <Text className="text-gray-500 ml-2">{t("deposit")}</Text>
                                        </View>
                                        <Text className="text-black font-semibold">{formData.advance || t("notAvailable")}</Text>
                                    </View>
                                    <View className="flex-row justify-between">
                                        {/* Is Rent Negotiable */}
                                        <View className="flex-row items-center">
                                            <FontAwesome5 name="rupee-sign" size={16} color="black" />
                                            <Text className="text-gray-500 ml-2">{t("isRentNegotiable")}</Text>
                                        </View>
                                        <Text className="text-black font-semibold">{getKeyByValue(formData.rentNegotiable) || t("notAvailable")}</Text>
                                    </View>
                                </>
                            )}
                        </View>

                        {formData.propertyType == "Guest House" && formData.isOtherRoomAvailable && (
                            <View className="bg-gray-100 p-4 rounded-lg shadow-md mb-5">
                                <Text className="text-lg font-bold mb-2">{t("otherRoomAvailableType")}</Text>
                                {formData.otherRoomAvailable.map((option: OtherRoom) => {
                                    return (
                                        <View key={option.type} className="flex-row justify-between mb-3">
                                            <View className="flex-row items-center">
                                                <FontAwesome5 name="rupee-sign" size={16} color="black" />
                                                <Text className="text-gray-500 ml-2">{t(option.type)}</Text>
                                            </View>
                                            <Text className="text-black font-semibold">
                                                {option.rent || t("notAvailable")}
                                                {t("priceDayNight")}
                                            </Text>
                                        </View>
                                    );
                                })}
                            </View>
                        )}

                        {/* Area */}
                        {formData.propertyType !== "Guest House" && (
                            <View className="bg-gray-100 p-4 rounded-lg shadow-md mb-5">
                                <View className="flex-row justify-between mb-3">
                                    <View className="flex-row items-center">
                                        <MaterialIcons name="square-foot" size={20} color="black" />
                                        <Text className="text-gray-500 ml-2">{t("area")}</Text>
                                    </View>
                                    <Text className="text-black font-semibold">{formData.areaInSize ? (formData.areaInSize + " " + t("sqFt")) : t("notAvailable")}</Text>
                                </View>
                            </View>
                        )}

                        {/* Description */}
                        <View className="bg-gray-100 p-4 rounded-lg shadow-md mb-5">
                            <Text className="text-lg font-bold mb-2">{t("description")}</Text>
                            <Text className="text-gray-500">{formData.description || t("notAvailable")}</Text>
                        </View>

                        {/* Overview */}
                        <View className="bg-gray-100 p-4 rounded-lg shadow-md mb-5">
                            <Text className="text-lg font-bold mb-2">{t("overview")}</Text>
                            <View className="flex-row justify-between mb-3">
                                <View>
                                    <Text className="text-gray-500">{t("availableFor")}</Text>
                                    <Text className="text-black font-semibold">{getKeyByValue(formData.propertyFor) || t("notAvailable")}</Text>
                                </View>
                                <View>
                                    <Text className="text-gray-500">{t("propertyType")}</Text>
                                    <Text className="text-black font-semibold">{getKeyByValue(formData.propertyType) || t("notAvailable")}</Text>
                                </View>
                            </View>
                        </View>

                        {formData.propertyType === "Full House" && (
                            <View className="bg-gray-100 p-4 rounded-lg shadow-md mb-5">
                                {/* Housing Type and BHK Type */}
                                <View className="flex-row items-center">
                                    <MaterialIcons name="home" size={20} color="black" />
                                    <Text className="text-gray-500 ml-2">{t("housingType")}</Text>
                                </View>
                                <View className="flex-row flex-wrap mb-4 mt-4">
                                    {formData.housingType.length > 0 ? (
                                        formData.housingType.map((housingType, index) => (
                                            <View key={index} className="flex-row items-center bg-gray-200 rounded-full px-3 py-1 mr-2 mb-2">
                                                <MaterialIcons name="check" size={16} color="green" />
                                                <Text className="ml-1 text-black">{getKeyByValue(housingType)}</Text>
                                            </View>
                                        ))
                                    ) : (
                                        <Text className="text-gray-500">{t("notAvailable")}</Text>
                                    )}
                                </View>

                                <View className="flex-row justify-between items-center mb-4">
                                    <View className="flex-row items-center">
                                        <MaterialIcons name="hotel" size={20} color="black" />
                                        <Text className="text-gray-500 ml-2">{t("bhkType")}</Text>
                                    </View>
                                    <Text className="text-black font-semibold">{getKeyByValue(formData.bhkType) || t("notAvailable")}</Text>
                                </View>

                                {formData.propertyFor !== "Sale" && (
                                    <>
                                        {/* Preferred Tenancy */}
                                        <View className="flex-row justify-between items-center mb-4">
                                            <View className="flex-row items-center">
                                                <MaterialIcons name="group" size={20} color="black" />
                                                <Text className="text-gray-500 ml-2">{t("preferredTenancy")}</Text>
                                            </View>
                                            <Text className="text-black font-semibold">{getKeyByValue(formData.familyPreference) || t("notAvailable")}</Text>
                                        </View>

                                        <View className="flex-row justify-between items-center">
                                            {/* Food Preference */}
                                            <View className="flex-row items-center">
                                                <MaterialIcons name="restaurant" size={20} color="black" />
                                                <Text className="text-gray-500 ml-2">{t("foodPreference")}</Text>
                                            </View>
                                            <Text className="text-black font-semibold">
                                                {formData.foodPreference === "" ? t("notAvailable") : getKeyByValue(formData.foodPreference)}
                                            </Text>
                                        </View>
                                    </>
                                )}
                            </View>
                        )}

                        {formData.propertyType === "PG/Hostel" && (
                            <View className="bg-gray-100 p-4 rounded-lg shadow-md mb-5">
                                <View className="flex-row items-center">
                                    <MaterialIcons name="home" size={20} color="black" />
                                    <Text className="text-gray-500 ml-2">{t("roomType")}</Text>
                                </View>
                                <View className="flex-row flex-wrap mb-4 mt-4">
                                    {formData.housingType.length > 0 ? (
                                        formData.housingType.map((housingType, index) => (
                                            <View key={index} className="flex-row items-center bg-gray-200 rounded-full px-3 py-1 mr-2 mb-2">
                                                <MaterialIcons name="check" size={16} color="green" />
                                                <Text className="ml-1 text-black">{getKeyByValue(housingType)}</Text>
                                            </View>
                                        ))
                                    ) : (
                                        <Text className="text-gray-500">{t("notAvailable")}</Text>
                                    )}
                                </View>
                                {/* Gender Preference */}
                                <View className="flex-row justify-between items-center mb-4">
                                    <View className="flex-row items-center">
                                        <MaterialIcons name="group" size={20} color="black" />
                                        <Text className="text-gray-500 ml-2">{t("genderPreference")}</Text>
                                    </View>
                                    <Text className="text-black font-semibold">{getKeyByValue(formData.familyPreference) || t("notAvailable")}</Text>
                                </View>
                                <View className="flex-row justify-between items-center">
                                    {/* Food Preference */}
                                    <View className="flex-row items-center">
                                        <MaterialIcons name="restaurant" size={20} color="black" />
                                        <Text className="text-gray-500 ml-2">{t("foodPreference")}</Text>
                                    </View>
                                    <Text className="text-black font-semibold">
                                        {formData.foodPreference === "" ? t("notAvailable") : getKeyByValue(formData.foodPreference)}
                                    </Text>
                                </View>
                            </View>
                        )}

                        {formData.propertyType === "Commercial" && (
                            <View className="bg-gray-100 p-4 rounded-lg shadow-md mb-5">
                                {/* <Text className="text-lg font-bold mb-3">{t("commercialDetails")}</Text> */}
                                <View className="flex-row items-center">
                                    <MaterialIcons name="home" size={20} color="black" />
                                    <Text className="text-gray-500 ml-2">{t("commercialType")}</Text>
                                </View>
                                <View className="flex-row flex-wrap mb-4 mt-4">
                                    {formData.housingType.length > 0 ? (
                                        formData.housingType.map((housingType, index) => (
                                            <View key={index} className="flex-row items-center bg-gray-200 rounded-full px-3 py-1 mr-2 mb-2">
                                                <MaterialIcons name="check" size={16} color="green" />
                                                <Text className="ml-1 text-black">{getKeyByValue(housingType)}</Text>
                                            </View>
                                        ))
                                    ) : (
                                        <Text className="text-gray-500">{t("notAvailable")}</Text>
                                    )}
                                </View>
                            </View>
                        )}

                        {(formData.propertyType === "Full House" || formData.propertyType === "PG/Hostel" || formData.propertyType === "Commercial" || formData.propertyType === "Guest House") && (
                            <>
                                <View className="bg-gray-100 p-4 rounded-lg shadow-md mb-5">
                                    <Text className="text-lg font-bold mb-3">{t("otherDetails")}</Text>
                                    <View className="flex-row justify-between mb-4">
                                        {/* Furnishing */}
                                        <View className="flex-row items-center">
                                            <MaterialIcons name="weekend" size={20} color="black" />
                                            <Text className="text-gray-500 ml-2">{t("furnishing")}</Text>
                                        </View>
                                        <Text className="text-black font-semibold">
                                            {formData.furnishing === "" ? t("notAvailable") : getKeyByValue(formData.furnishing)}
                                        </Text>
                                    </View>
                                    <View className="flex-row justify-between mb-4">
                                        {/* Parking */}
                                        <View className="flex-row items-center">
                                            <MaterialIcons name="local-parking" size={20} color="black" />
                                            <Text className="text-gray-500 ml-2">{t("parking")}</Text>
                                        </View>
                                        <Text className="text-black font-semibold">
                                            {formData.parking === "" ? t("notAvailable") : getKeyByValue(formData.parking)}
                                        </Text>
                                    </View>
                                    {formData.propertyType === "Full House" && (
                                        <>
                                            <View className="flex-row justify-between mb-4">
                                                {/* Number of Bedrooms */}
                                                <View className="flex-row items-center">
                                                    <MaterialIcons name="bed" size={20} color="black" />
                                                    <Text className="text-gray-500 ml-2">{t("numberOfBedRooms")}</Text>
                                                </View>
                                                <Text className="text-black font-semibold">{formData.numberOfBedRooms || t("notAvailable")}</Text>
                                            </View>
                                            <View className="flex-row justify-between mb-4">
                                                {/* Number of Balconies */}
                                                <View className="flex-row items-center">
                                                    <MaterialIcons name="balcony" size={20} color="black" />
                                                    <Text className="text-gray-500 ml-2">{t("numberOfBalconies")}</Text>
                                                </View>
                                                <Text className="text-black font-semibold">{formData.numberOfBalconies || t("notAvailable")}</Text>
                                            </View>
                                            <View className="flex-row items-center">
                                                <MaterialIcons name="bathtub" size={20} color="black" />
                                                <Text className="text-gray-500 ml-2">{t("numberOfBathRooms")}</Text>
                                            </View>
                                            <View className="flex-row flex-wrap mb-4 mt-4">
                                                {formData.numberOfBathRooms.length > 0 ? (
                                                    formData.numberOfBathRooms.map((bathRoom, index) => (
                                                        <View key={index} className="flex-row items-center bg-gray-200 rounded-full px-3 py-1 mr-2 mb-2">
                                                            <MaterialIcons name="check" size={16} color="green" />
                                                            <Text className="ml-1 text-black">{getKeyByValue(bathRoom)}</Text>
                                                        </View>
                                                    ))
                                                ) : (
                                                    <Text className="text-gray-500">{t("notAvailable")}</Text>
                                                )}
                                            </View>
                                        </>
                                    )}
                                    {formData.propertyType !== "Guest House" && (
                                        <>
                                            <View className="flex-row justify-between mb-4">
                                                {/* Floor Number */}
                                                <View className="flex-row items-center">
                                                    <MaterialIcons name="stairs" size={20} color="black" />
                                                    <Text className="text-gray-500 ml-2">{t("floorNumber")}</Text>
                                                </View>
                                                <Text className="text-black font-semibold">{getKeyByValue(formData.floorNumber == -1 ? t("basement") : floorNumber[formData.floorNumber]) || t("notAvailable")}</Text>
                                            </View>
                                            <View className="flex-row justify-between mb-4">
                                                {/* Age of Property */}
                                                <View className="flex-row items-center">
                                                    <MaterialIcons name="calendar-today" size={20} color="black" />
                                                    <Text className="text-gray-500 ml-2">{t("ageOfProperty")}</Text>
                                                </View>
                                                <Text className="text-black font-semibold">
                                                    {
                                                        formData.ageOfProperty == 0 ? t("new") : (formData.ageOfProperty || t("notAvailable"))
                                                    }
                                                </Text>
                                            </View>
                                        </>
                                    )}
                                </View>
                            </>
                        )}
                        {formData.propertyFor === "Sale" && (
                            <>
                                <View className="bg-gray-100 p-4 rounded-lg shadow-md mb-5">
                                    <View className="flex-row justify-between mb-4">
                                        <View className="flex-row items-center">
                                            <MaterialIcons name="straighten" size={20} color="black" />
                                            <Text className="text-gray-500 ml-2">{t("distanceForMainRoad")}</Text>
                                        </View>
                                        <Text className="text-black font-semibold">{formData.distanceForMainRoad || t("notAvailable")}</Text>
                                    </View>
                                    <View className="flex-row justify-between mb-4">
                                        {/* Age of Property */}
                                        <View className="flex-row items-center">
                                            <MaterialIcons name="straighten" size={20} color="black" />
                                            <Text className="text-gray-500 ml-2">{t("widthOfTheRoadInFrontOfAProperty")}</Text>
                                        </View>
                                        <Text className="text-black font-semibold">{formData.widthOfTheRoadInFrontOfAProperty || t("notAvailable")}</Text>
                                    </View>
                                </View>
                            </>
                        )}
                        {formData.propertyType !== "Guest House" && (
                            <>
                                <View className="bg-gray-100 p-4 rounded-lg shadow-md mb-5">
                                    {formData.propertyType !== "Land" && (
                                        <>
                                            {/* Amenities */}
                                            <Text className="text-lg font-bold mb-1">{t("amenities")}</Text>
                                            <View className="flex-row flex-wrap mb-3">
                                                {formData.basicAmenities.length > 0 ? (
                                                    formData.basicAmenities.map((amenity, index) => (
                                                        <View key={index} className="flex-row items-center bg-gray-200 rounded-full px-3 py-1 mr-2 mb-2">
                                                            <MaterialIcons name="check" size={16} color="green" />
                                                            <Text className="ml-1 text-black">{getKeyByValue(amenity)}</Text>
                                                        </View>
                                                    ))
                                                ) : (
                                                    <Text className="text-gray-500">{t("notAvailable")}</Text>
                                                )}
                                            </View>
                                            {/* Additional Amenities */}
                                            <Text className="text-lg font-bold mb-1">{t("additionalAmenities")}</Text>
                                            <View className="flex-row flex-wrap mb-3">
                                                {formData.additionalAmenities.length > 0 ? (
                                                    formData.additionalAmenities.map((amenity, index) => (
                                                        <View key={index} className="flex-row items-center bg-gray-200 rounded-full px-3 py-1 mr-2 mb-2">
                                                            <MaterialIcons name="check" size={16} color="green" />
                                                            <Text className="ml-1 text-black">{getKeyByValue(amenity)}</Text>
                                                        </View>
                                                    ))
                                                ) : (
                                                    <Text className="text-gray-500">{t("notAvailable")}</Text>
                                                )}
                                            </View>
                                        </>
                                    )}
                                    {/* Source of Water */}
                                    <Text className="text-lg font-bold mb-1">{t("sourceOfWater")}</Text>
                                    <View className="flex-row flex-wrap mb-3">
                                        {formData.sourceOfWater.length > 0 ? (
                                            formData.sourceOfWater.map((source, index) => (
                                                <View key={index} className="flex-row items-center bg-gray-200 rounded-full px-3 py-1 mr-2 mb-2">
                                                    <MaterialIcons name="check" size={16} color="green" />
                                                    <Text className="ml-1 text-black">{getKeyByValue(source)}</Text>
                                                </View>
                                            ))
                                        ) : (
                                            <Text className="text-gray-500">{t("notAvailable")}</Text>
                                        )}
                                    </View>
                                </View>
                            </>
                        )}

                        {formData.propertyFor === "Sale" && (formData.tehsilBillYear !== "" || formData.municipleBillYear !== "") && (
                            <>
                                <View className="bg-gray-100 p-4 rounded-lg shadow-md mb-5">
                                    {formData.tehsilBillYear !== "" && (
                                        <View className="flex-row justify-between mb-4">
                                            {/* Age of Property */}
                                            <View className="flex-row items-center">
                                                <MaterialIcons name="calendar-today" size={20} color="black" />
                                                <Text className="text-gray-500 ml-2">{t("tehsilBill")}</Text>
                                            </View>
                                            <Text className="text-black font-semibold">{formData.tehsilBillYear || t("notAvailable")}</Text>
                                        </View>
                                    )}
                                    {formData.municipleBillYear !== "" && (
                                        <View className="flex-row justify-between mb-4">
                                            {/* Age of Property */}
                                            <View className="flex-row items-center">
                                                <MaterialIcons name="calendar-today" size={20} color="black" />
                                                <Text className="text-gray-500 ml-2">{t("municipleBill")}</Text>
                                            </View>
                                            <Text className="text-black font-semibold">{formData.municipleBillYear || t("notAvailable")}</Text>
                                        </View>
                                    )}
                                </View>
                            </>
                        )}

                        <View className="bg-gray-100 p-4 rounded-lg shadow-md mb-5">
                            <View className="flex-row justify-between">
                                <View className="flex-row items-center">
                                    <MaterialIcons name="calendar-today" size={20} color="black" />
                                    <Text className="text-gray-500 ml-2">{t("postedOn")}</Text>
                                </View>
                                <Text className="text-black font-semibold">{formatDate(formData.date_created)}</Text>
                            </View>
                        </View>
                        {showContactInfo && (
                            <>
                                <View className="bg-[#FF7F19] p-4 rounded-lg shadow-md mb-5">
                                    <Text className="text-lg text-white font-bold mb-3">{t("contactPerson")}</Text>
                                    <View className="flex-row justify-between mb-2">
                                        <View className="flex-row items-center">
                                            <MaterialIcons name="person" size={20} color="white" />
                                            {/* <Text className="text-white ml-2">{t("nameLabel")}</Text> */}
                                            <Text className="text-white font-semibold ml-2">
                                                {formData.contactPersonName ? formData.contactPersonName : formData.owner_name}
                                            </Text>
                                        </View>
                                        {/* <Text className="text-white font-semibold">
                                            {formData.contactPersonName ? formData.contactPersonName : formData.owner_name}
                                        </Text> */}
                                    </View>
                                    <View className="flex-row justify-between mb-3">
                                        <View className="flex-row items-center">
                                            <MaterialIcons name="smartphone" size={20} color="white" />
                                            {/* <Text className="text-white ml-2">{t("phoneNumber")}</Text> */}
                                            <Text className="text-white mr-2 ml-2">
                                                {formData.contactPersonNumber ? formData.contactPersonNumber : formData.owner_contact}
                                            </Text>
                                        </View>
                                        <View className="flex-row items-center">
                                            <TouchableOpacity onPress={handleCopy} className="mr-4">
                                                <View className="flex-row items-center">
                                                    <MaterialIcons name="copy-all" size={20} color="white" />
                                                    <Text className="text-white ml-2">{t("copy")}</Text>
                                                </View>
                                            </TouchableOpacity>
                                            <TouchableOpacity onPress={handleCall} >
                                                <View className="flex-row items-center">
                                                    <MaterialIcons name="call" size={20} color="white" />
                                                    <Text className="text-white ml-2">{t("call")}</Text>
                                                </View>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                    {/* <View className="flex-row justify-between items-start">
                                        <View className="flex-row items-center flex-shrink-0 mr-4">
                                            <MaterialIcons name="location-on" size={20} color="white" />
                                            <Text className="text-white ml-2">{t("address")}</Text>
                                        </View>
                                        <Text className="text-white font-semibold flex-shrink text-right">
                                            {`${formData.address}, ${formData.city}, ${formData.districtName}, ${formData.stateName} - ${formData.zip}`}
                                        </Text>
                                    </View> */}
                                </View>
                                {
                                    (formData?.latitude != 0 && formData?.longitude != 0) && (
                                        <View className="bg-gray-100 p-4 rounded-lg shadow-md mb-5">
                                            <GoogleTextInput
                                                isDirectionEnabled={true}
                                                icon={icons.target}
                                                initialLocation={{
                                                    latitude: formData?.latitude,
                                                    longitude: formData?.longitude,
                                                    address: String(formData?.location),
                                                    draggable: false
                                                }}
                                            />
                                        </View>
                                    )
                                }
                            </>
                        )}
                    </View>

                    <View className="flex-row justify-between mb-[40px] mt-[20px]">
                        {/* <TouchableOpacity
                            className="bg-blue-500 py-2 px-4 rounded-lg"
                            onPress={() => router.back()}
                        >
                            <Text className="text-white font-bold">{t("back")}</Text>
                        </TouchableOpacity> */}
                        {!showContactInfo && (
                            <TouchableOpacity className="bg-orange-500 rounded-lg p-3" onPress={() => getOwnerDetails()}>
                                <Text className="text-white text-center font-bold">{t("contactOwner")}</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </>
            )}
        </ScrollView >
    );
};

export default PropertyDetails;