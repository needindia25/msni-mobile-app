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

const PropertyDetails = () => {
    const { t } = useTranslation(); // Initialize translation hook
    const screenWidth = Dimensions.get('window').width;
    const router = useRouter();
    const [id, setId] = useState<number | null>(null);
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
        status: false,
    });

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
                if (passServiceId && token) {
                    console.log("Fetching service response...");
                    const serviceResponse = await fetchAPI(`${constants.API_URL}/user-services/${passServiceId}/`, {
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
        return format(date, "do MMMM yyyy HH:mm");
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
                            Alert.alert(
                                t("success"),
                                t("propertyDeleted"),
                                [
                                    {
                                        text: t("ok"),
                                        onPress: () => {
                                            // Perform the action when "OK" is pressed
                                            router.back()
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
            console.error("Error saving service ID to AsyncStorage:", error);
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
                        if (token) {
                            await fetchAPI(`${constants.API_URL}/user-services/${id}/toggle_status/`, {
                                method: "PATCH",
                                headers: {
                                    'Authorization': `Bearer ${token}`,
                                },
                            });

                            Alert.alert(
                                t("success"),
                                t("statusUpdated"),
                                [
                                    {
                                        text: t("ok"),
                                        onPress: () => {
                                            // Perform the action when "OK" is pressed
                                            setFormData((prevFormData: any) => ({
                                                ...prevFormData,
                                                status: !prevFormData.status,
                                            }));
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
                        <ScrollView horizontal pagingEnabled className="flex-row mb-3">
                            {formData.images.map((image, index) => (
                                <Image
                                    key={index}
                                    source={{ uri: image }}
                                    style={{ width: screenWidth - 40 }}
                                    className="h-48 rounded-lg mr-2"
                                />
                            ))}
                        </ScrollView>

                        {/* Title and Address */}
                        <Text className="text-2xl font-bold mb-2">{formData.title}</Text>
                        <View className="flex-row items-center mb-3">
                            <MaterialIcons name="location-on" size={20} color="gray" />
                            <Text className="text-gray-500 ml-1">
                                {formData.address}, {formData.city}, {formData.districtName}, {formData.stateName} - {formData.zip}
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
                            <View className="flex-row justify-between">
                                <View className="flex-row items-center">
                                    <FontAwesome5 name="rupee-sign" size={16} color="black" />
                                    <Text className="text-gray-500 ml-2">{t("deposit")}</Text>
                                </View>
                                <Text className="text-black font-semibold">{formData.advance || t("notAvailable")}</Text>
                            </View>
                        </View>

                        {/* Area */}
                        <View className="bg-gray-100 p-4 rounded-lg shadow-md mb-5">
                            <View className="flex-row justify-between mb-3">
                                <View className="flex-row items-center">
                                    <MaterialIcons name="square-foot" size={20} color="black" />
                                    <Text className="text-gray-500 ml-2">{t("area")}</Text>
                                </View>
                                <Text className="text-black font-semibold">{formData.areaInSize || t("notAvailable")} {t("sqFt")}</Text>
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
                                <View className="flex-row justify-between items-center">
                                    <View className="flex-row items-center">
                                        <MaterialIcons name="group" size={20} color="black" />
                                        <Text className="text-gray-500 ml-2">{t("preferredTenancy")}</Text>
                                    </View>
                                    <Text className="text-black font-semibold">{getKeyByValue(formData.familyPreference) || t("notAvailable")}</Text>
                                </View>
                            </View>
                        )}

                        {formData.propertyType === "PG/Hostel" && (
                            <View className="bg-gray-100 p-4 rounded-lg shadow-md mb-5">
                                <Text className="text-lg font-bold mb-3">{t("roomDetails")}</Text> {/* Section Title */}
                                <View className="flex-row justify-between mb-4">
                                    {/* Room Type */}
                                    <View>
                                        <Text className="text-gray-500">{t("roomType")}</Text>
                                        <Text className="text-black font-semibold">
                                            {formData.roomType ? getKeyByValue(formData.roomType) : t("notAvailable")}
                                        </Text>
                                    </View>
                                    {/* Gender Preference */}
                                    <View>
                                        <Text className="text-gray-500">{t("genderPreference")}</Text>
                                        <Text className="text-black font-semibold">
                                            {formData.familyPreference ? getKeyByValue(formData.familyPreference) : t("notAvailable")}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        )}

                        {(formData.propertyType === "Full House" || formData.propertyType === "PG/Hostel") && (
                            <View className="bg-gray-100 p-4 rounded-lg shadow-md mb-5">
                                <Text className="text-lg font-bold mb-3">{t("propertyDetails")}</Text> {/* Section Title */}
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
                                <View className="flex-row justify-between">
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
                                <Text className="text-lg font-bold mb-3">{t("commercialDetails")}</Text> {/* Section Title */}
                                <View className="flex-row justify-between items-center">
                                    <View className="flex-row items-center">
                                        <MaterialIcons name="business" size={20} color="black" /> {/* Icon for Commercial Type */}
                                        <Text className="text-gray-500 ml-2">{t("commercialType")}</Text>
                                    </View>
                                    <Text className="text-black font-semibold">{getKeyByValue(formData.housingType) || t("notAvailable")}</Text>
                                </View>
                            </View>
                        )}

                        <View className="bg-gray-100 p-4 rounded-lg shadow-md mb-5">
                            <Text className="text-lg font-bold mb-3">{t("otherDetails")}</Text> {/* Section Title */}
                            <View className="flex-row justify-between mb-4">
                                {/* Is Rent Negotiable */}
                                <View className="flex-row items-center">
                                    <MaterialIcons name="attach-money" size={20} color="black" />
                                    <Text className="text-gray-500 ml-2">{t("isRentNegotiable")}</Text>
                                </View>
                                <Text className="text-black font-semibold">{getKeyByValue(formData.rentNegotiable) || t("notAvailable")}</Text>
                            </View>
                            {/* <View className="flex-row justify-between">
                                <View className="flex-row items-center">
                                    <MaterialIcons name="water-drop" size={20} color="black" />
                                    <Text className="text-gray-500 ml-2">{t("sourceOfWater")}</Text>
                                </View>
                                <Text className="text-black font-semibold">{getKeyByValue(formData.sourceOfWater) || t("notAvailable")}</Text>
                            </View> */}
                            <Text className="text-lg font-bold mb-1">{t("additionalAmenities")}</Text>
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

                        {(formData.propertyType === "Full House" || formData.propertyType === "PG/Hostel") && (
                            <View className="bg-gray-100 p-4 rounded-lg shadow-md mb-5">
                                <Text className="text-lg font-bold mb-3">{t("propertyDetails")}</Text> {/* Section Title */}
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
                                        {/* <View className="flex-row justify-between mb-4">
                                            <View className="flex-row items-center">
                                                <MaterialIcons name="bathtub" size={20} color="black" />
                                                <Text className="text-gray-500 ml-2">{t("numberOfBathRooms")}</Text>
                                            </View>
                                            <Text className="text-black font-semibold">{formData.numberOfBathRooms.join(", ") || t("notAvailable")}</Text>
                                        </View> */}
                                        {/* <Text className="text-lg font-bold mb-1">{t("numberOfBathRooms")}</Text> */}
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
                                <View className="flex-row justify-between">
                                    {/* Age of Property */}
                                    <View className="flex-row items-center">
                                        <MaterialIcons name="calendar-today" size={20} color="black" />
                                        <Text className="text-gray-500 ml-2">{t("ageOfProperty")}</Text>
                                    </View>
                                    <Text className="text-black font-semibold">{formData.ageOfProperty || t("notAvailable")}</Text>
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
                        </View>

                        {/* Dates */}
                        <View className="bg-gray-100 p-4 rounded-lg shadow-md mb-5">
                            <Text className="text-lg font-bold mb-3">{t("dates")}</Text> {/* Section Title */}
                            <View className="flex-row justify-between mb-2">
                                {/* Last Updated */}
                                <View className="flex-row items-center">
                                    <MaterialIcons name="update" size={20} color="black" />
                                    <Text className="text-gray-500 ml-2">{t("lastUpdated")}</Text>
                                </View>
                                <Text className="text-black font-semibold">{formatDate(formData.date_updated)}</Text>
                            </View>
                            <View className="flex-row justify-between">
                                {/* Posted On */}
                                <View className="flex-row items-center">
                                    <MaterialIcons name="calendar-today" size={20} color="black" />
                                    <Text className="text-gray-500 ml-2">{t("postedOn")}</Text>
                                </View>
                                <Text className="text-black font-semibold">{formatDate(formData.date_created)}</Text>
                            </View>
                        </View>
                    </View>

                    <View className="flex-row justify-between mb-[40px] mt-[20px]">
                        <TouchableOpacity
                            className="bg-blue-500 py-2 px-4 rounded-lg"
                            onPress={() => router.back()}
                        >
                            <Text className="text-white font-bold">{t("back")}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            className="bg-yellow-500 py-2 px-4 rounded-lg"
                            onPress={() => id !== null && handleEdit(id)}
                        >
                            <Text className="text-white font-bold">{t("edit")}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            className="bg-green-500 py-2 px-4 rounded-lg"
                            onPress={() => id !== null && handleChangeStatus(id)}
                        >
                            <Text className="text-white font-bold">
                                {formData.status ? t("deactivate") : t("activate")}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            className="bg-red-500 py-2 px-4 rounded-lg"
                            onPress={() => id !== null && handleDelete(id)}
                        >
                            <Text className="text-white font-bold">{t("delete")}  </Text>
                        </TouchableOpacity>
                    </View>
                </>
            )}
        </ScrollView >
    );
};

export default PropertyDetails;