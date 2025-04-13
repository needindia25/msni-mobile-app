import { useRouter } from 'expo-router';
import { format } from "date-fns";
import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, Dimensions, Alert, ActivityIndicator } from 'react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialIcons, FontAwesome5 } from "@expo/vector-icons"; // Import icons
import { constants, icons } from "@/constants";
import { fetchAPI } from "@/lib/fetch";
import { useTranslation } from "react-i18next"; // Import useTranslation
import en from '../locales/en';
import ImageCarousel from '@/components/ImageCarousel';

const PropertyDetails = () => {
    const { t } = useTranslation(); // Initialize translation hook
    const [showContactInfo, setShowContactInfo] = useState(false);
    const router = useRouter();
    const [id, setId] = useState<number | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        propertyFor: "Rent",
        title: "",
        propertyType: "",
        description: "",
        latitude: 0,
        longitude: 0,
        address: "",
        location: "",
        state: 0,
        stateName: "",
        district: 0,
        districtName: "",
        city: "",
        zip: "",
        housingType: "",
        bhkType: "",
        familyPreference: "",
        foodPreference: "",
        roomType: "",
        commercialType: "",
        rent: 0,
        advance: 0,
        rentNegotiable: "No",
        areaInSize: 0,
        floorNumber: 0,
        numberOfBedRooms: 1,
        numberOfBalconies: 0,
        numberOfBathRooms: [] as string[],
        ageOfProperty: 0,
        furnishing: "",
        parking: "",
        basicAmenities: [] as string[],
        additionalAmenities: [] as string[],
        sourceOfWater: [] as string[],
        images: [] as string[],
        date_updated: "",
        date_created: "",
        owner_name: "",
        owner_contact: "",
        status: false,
    });

    const [rating, setRating] = useState(4); // State to track the current rating
    const [favorites, setFavorites] = useState(false); // State to track the current rating

    useEffect(() => {
        console.log("PropertyDetails component mounted");
        const fetchDetails = async () => {
            console.log("Fetching property details...");
            try {
                const passServiceId = await AsyncStorage.getItem("passServiceId");
                if (passServiceId) {
                    setId(parseInt(passServiceId, 10));
                }
                console.log("Fetched service ID:", passServiceId);
                const token = await AsyncStorage.getItem('token');
                console.log("Fetched token ID:", token);
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
                if (passServiceId && token) {
                    setToken(token);
                    console.log("Fetching service response...");
                    const serviceResponse = await fetchAPI(`${constants.API_URL}/user-services/${passServiceId}/info/`, t, {
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`,
                        },
                    });
                    console.log("Service response:", serviceResponse);
                    console.log("Service response options:", serviceResponse["options"]);

                    setFormData((prevFormData: any) => ({
                        ...prevFormData,
                        ...serviceResponse["options"],
                        ...{
                            date_updated: serviceResponse["date_updated"],
                            date_created: serviceResponse["date_created"],
                            status: serviceResponse["is_active"],
                            owner_contact: serviceResponse["owner_contact"],
                            owner_name: serviceResponse["owner_name"],
                            images: serviceResponse["options"].images && serviceResponse["options"].images.length > 0
                                ? serviceResponse["options"].images.map((image: string) => image.replace("www.", "admin.")) // Replace "www." with "admin."
                                : [`${constants.BASE_URL}/media/no-image-found.png`],
                            basicAmenities: serviceResponse["options"].basicAmenities && serviceResponse["options"].basicAmenities.length > 0 ?
                                serviceResponse["options"].basicAmenities.filter((amenity: any) => amenity !== "None") : [],
                            additionalAmenities: serviceResponse["options"].additionalAmenities && serviceResponse["options"].additionalAmenities.length > 0 ?
                                serviceResponse["options"].additionalAmenities.filter((amenity: any) => amenity !== "None") : [],
                            sourceOfWater: serviceResponse["options"].sourceOfWater
                                ? (typeof serviceResponse["options"].sourceOfWater === "string"
                                    ? [serviceResponse["options"].sourceOfWater]
                                    : serviceResponse["options"].sourceOfWater)
                                : [],
                            numberOfBathRooms: serviceResponse["options"].numberOfBathRooms
                                ? (typeof serviceResponse["options"].numberOfBathRooms === "number"
                                    ? [serviceResponse["options"].numberOfBathRooms + " Bath Room" + (serviceResponse["options"].numberOfBathRooms > 1 ? "s" : "")]
                                    : serviceResponse["options"].numberOfBathRooms)
                                : [],
                        }
                    }));

                    if (serviceResponse["service_request_count"]) {
                        const serviceRequestCount = serviceResponse["service_request_count"];
                        console.log("Service request count:", serviceRequestCount);
                        setShowContactInfo(serviceRequestCount["is_my_request"]);
                        setFavorites(serviceRequestCount["is_my_favorite"]);
                        setRating(serviceRequestCount["get_my_rating"]);
                    }
                    console.log(serviceResponse);
                    console.log(formData);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, []);

    const formatDate = (dateString: string) => {
        if (!dateString) return t("notAvailable");
        const date = new Date(dateString);
        // return format(date, "do MMMM yyyy HH:mm");
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
        // Find the key by value
        const key = Object.keys(en.translation).find((k) => en.translation[k as keyof typeof en.translation] === value);

        // Return the key or fallback to the lowercase version of the value
        if (key) {
            return t(key);
        }
        return value;
    };

    const getOwnerDetails = async () => {
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
        if (id && token) {
            console.log("Add a request");
            const serviceResponse = await fetchAPI(`${constants.API_URL}/user-services/${id}/requests/`, t, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });
            console.log(serviceResponse)
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
                            // Perform the action when "OK" is pressed
                            router.replace("/(auth)/sign-in");
                        },
                    },
                ]
            );
        }
        if (id && token) {
            const serviceResponse = await fetchAPI(`${constants.API_URL}/user-services/${id}/favorites/`, t, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });
            console.log(serviceResponse)
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
                            // Perform the action when "OK" is pressed
                            router.replace("/(auth)/sign-in");
                        },
                    },
                ]
            );
        }
        setRating(newRating); // Update the rating state
        console.log(`User rated: ${newRating} stars`);
        if (id && token) {
            const serviceResponse = await fetchAPI(`${constants.API_URL}/user-services/${id}/rating/`, t, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ rating: newRating }),
            });
            console.log(serviceResponse)
        }
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
                    <TouchableOpacity onPress={() => router.back()} className="mb-5">
                        <MaterialIcons name="arrow-back" size={24} color="blue" />
                    </TouchableOpacity>

                    <View className="bg-white rounded-lg shadow-md mb-5 p-5">
                        {/* Image Carousel */}
                        <ImageCarousel images={formData.images} />

                        {/* Title and Address */}
                        <Text className="text-2xl font-bold mb-2">{formData.title}</Text>
                        <View className="flex-row items-center mb-3">
                            <MaterialIcons name="location-on" size={20} color="gray" />
                            <Text className="text-gray-500 ml-1">
                                {formData.city}, {formData.districtName}, {formData.stateName}
                            </Text>
                        </View>

                        {/* Rent and Deposit */}
                        <View className="bg-gray-100 p-4 rounded-lg shadow-md mb-5">
                            <View className="flex-row justify-between mb-3">
                                <View className="flex-row items-center">
                                    <FontAwesome5 name="rupee-sign" size={16} color="black" />
                                    <Text className="text-gray-500 ml-2">{t("rent")}</Text>
                                </View>
                                <Text className="text-black font-semibold">{formData.rent || t("notAvailable")}</Text>
                            </View>
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
                        </View>

                        {/* Area */}
                        <View className="bg-gray-100 p-4 rounded-lg shadow-md mb-5">
                            <View className="flex-row justify-between mb-3">
                                <View className="flex-row items-center">
                                    <MaterialIcons name="square-foot" size={20} color="black" />
                                    <Text className="text-gray-500 ml-2">{t("area")}</Text>
                                </View>
                                <Text className="text-black font-semibold">{formData.areaInSize ? (formData.areaInSize + " " + t("sqFt")) : t("notAvailable")}</Text>
                            </View>
                        </View>

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
                                <View className="flex-row justify-between items-center mb-4">
                                    <View className="flex-row items-center">
                                        <MaterialIcons name="home" size={20} color="black" />
                                        <Text className="text-gray-500 ml-2">{t("housingType")}</Text>
                                    </View>
                                    <Text className="text-black font-semibold">{getKeyByValue(formData.housingType) || t("notAvailable")}</Text>
                                </View>

                                <View className="flex-row justify-between items-center mb-4">
                                    <View className="flex-row items-center">
                                        <MaterialIcons name="hotel" size={20} color="black" />
                                        <Text className="text-gray-500 ml-2">{t("bhkType")}</Text>
                                    </View>
                                    <Text className="text-black font-semibold">{getKeyByValue(formData.bhkType) || t("notAvailable")}</Text>
                                </View>

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
                            </View>
                        )}

                        {formData.propertyType === "PG/Hostel" && (
                            <View className="bg-gray-100 p-4 rounded-lg shadow-md mb-5">
                                {/* <Text className="text-lg font-bold mb-3">{t("roomDetails")}</Text> */}

                                <View className="flex-row justify-between items-center mb-4">
                                    <View className="flex-row items-center">
                                        <MaterialIcons name="hotel" size={20} color="black" />
                                        <Text className="text-gray-500 ml-2">{t("roomType")}</Text>
                                    </View>
                                    <Text className="text-black font-semibold">{getKeyByValue(formData.housingType) || t("notAvailable")}</Text>
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
                                <View className="flex-row justify-between items-center">
                                    <View className="flex-row items-center">
                                        <MaterialIcons name="business" size={20} color="black" /> {/* Icon for Commercial Type */}
                                        <Text className="text-gray-500 ml-2">{t("commercialType")}</Text>
                                    </View>
                                    <Text className="text-black font-semibold">{getKeyByValue(formData.housingType) || t("notAvailable")}</Text>
                                </View>
                            </View>
                        )}

                        {(formData.propertyType === "Full House" || formData.propertyType === "PG/Hostel" || formData.propertyType === "Commercial") && (
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
                                <View className="flex-row justify-between mb-4">
                                    {/* Floor Number */}
                                    <View className="flex-row items-center">
                                        <MaterialIcons name="stairs" size={20} color="black" />
                                        <Text className="text-gray-500 ml-2">{t("floorNumber")}</Text>
                                    </View>
                                    <Text className="text-black font-semibold">{getKeyByValue(floorNumber[formData.floorNumber]) || t("notAvailable")}</Text>
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
                            </View>
                        )}

                        {/* Amenities */}
                        <View className="bg-gray-100 p-4 rounded-lg shadow-md mb-5">
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

                        {/* Dates */}
                        <View className="bg-gray-100 p-4 rounded-lg shadow-md mb-5">
                            {/* <Text className="text-lg font-bold mb-3">{t("dates")}</Text>
                            <View className="flex-row justify-between mb-2">
                                <View className="flex-row items-center">
                                    <MaterialIcons name="update" size={20} color="black" />
                                    <Text className="text-gray-500 ml-2">{t("lastUpdated")}</Text>
                                </View>
                                <Text className="text-black font-semibold">{formatDate(formData.date_updated)}</Text>
                            </View> */}
                            <View className="flex-row justify-between">
                                <View className="flex-row items-center">
                                    <MaterialIcons name="calendar-today" size={20} color="black" />
                                    <Text className="text-gray-500 ml-2">{t("postedOn")}</Text>
                                </View>
                                <Text className="text-black font-semibold">{formatDate(formData.date_created)}</Text>
                            </View>
                        </View>
                        {showContactInfo && (
                            <View className="bg-[#FF7F19] p-4 rounded-lg shadow-md mb-5">
                                <Text className="text-lg text-white font-bold mb-3">{t("ownerDetails")}</Text>
                                <View className="flex-row justify-between mb-2">
                                    <View className="flex-row items-center">
                                        <MaterialIcons name="person" size={20} color="white" />
                                        <Text className="text-white ml-2">{t("ownerName")}</Text>
                                    </View>
                                    <Text className="text-white font-semibold">{formData.owner_name}</Text>
                                </View>
                                <View className="flex-row justify-between mb-3">
                                    <View className="flex-row items-center">
                                        <MaterialIcons name="phone" size={20} color="white" />
                                        <Text className="text-white ml-2">{t("phoneNumber")}</Text>
                                    </View>
                                    <Text className="text-white font-semibold">{formData.owner_contact}</Text>
                                </View>

                                <View className="flex-row justify-between items-start">
                                    <View className="flex-row items-center flex-shrink-0 mr-4">
                                        <MaterialIcons name="location-on" size={20} color="white" />
                                        <Text className="text-white ml-2">{t("address")}</Text>
                                    </View>
                                    <Text className="text-white font-semibold flex-shrink text-right">
                                        {`${formData.address}, ${formData.city}, ${formData.districtName}, ${formData.stateName} - ${formData.zip}`}
                                    </Text>
                                </View>
                            </View>
                        )}
                    </View>

                    <View className="flex-row justify-between mb-[40px] mt-[20px]">
                        <TouchableOpacity
                            className="bg-blue-500 py-2 px-4 rounded-lg"
                            onPress={() => router.back()}
                        >
                            <Text className="text-white font-bold">{t("back")}</Text>
                        </TouchableOpacity>
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