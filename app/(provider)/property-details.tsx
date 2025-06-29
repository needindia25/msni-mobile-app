import { useLocalSearchParams, useRouter } from 'expo-router';
import { format } from "date-fns";
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Alert, ActivityIndicator } from 'react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialIcons, FontAwesome5 } from "@expo/vector-icons"; // Import icons
import { constants, icons } from "@/constants";
import ImageCarousel from "@/components/ImageCarousel";
import { fetchAPI } from "@/lib/fetch";
import { useTranslation } from "react-i18next"; // Import useTranslation
import en from '../locales/en';
import GoogleTextInput from '@/components/GoogleTextInput';

const PropertyDetails = () => {
    const { t } = useTranslation(); // Initialize translation hook
    const router = useRouter();
    const { passServiceId } = useLocalSearchParams()
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
        housingType: [] as string[],
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
        video: [] as string[],
        images: [] as string[],
        date_updated: "",
        date_created: "",
        status: false,
        contactPersonNumber: "",
        contactPersonName: "",
    });

    useEffect(() => {
        const fetchDetails = async () => {
            try {
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
                    const serviceResponse = await fetchAPI(`${constants.API_URL}/user-services/${passServiceId}/`, t, {
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
                            images: serviceResponse["options"].images && serviceResponse["options"].images.length > 0
                                ? serviceResponse["options"].images
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
        return format(date, "do MMMM yyyy HH:mm");
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
                    {/* <TouchableOpacity onPress={() => router.back()} className="mb-5">
                        <MaterialIcons name="arrow-back" size={24} color="blue" />
                    </TouchableOpacity> */}

                    <View className="bg-white rounded-lg shadow-md mb-5 p-5">
                        {/* Image Carousel */}
                        <ImageCarousel images={formData.images} video={formData.video} />

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
                                <Text className="text-black font-semibold">
                                    {formData.rent || t("notAvailable")}
                                    {formData.rent ? t(formData.propertyType !== "Guest House" ? "pricePerMonth" : "priceDayNight") : ""}
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
                            {formData.propertyType !== "Guest House" && (
                                <>
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
                                </>
                            )}
                        </View>

                        {/* Contact Person */}
                        <View className="bg-gray-100 p-4 rounded-lg shadow-md mb-5">
                            <Text className="text-lg font-bold mb-3">{t("contactPerson")}</Text>
                            <View className="flex-row justify-between mb-2">
                                <View className="flex-row items-center">
                                    <MaterialIcons name="person" size={20} color="black" />
                                    <Text className="text-gray-500 ml-2">{t("nameLabel")}</Text>
                                </View>
                                <Text className="text-black font-semibold">
                                    {formData.contactPersonName ? formData.contactPersonName : t("notAvailable")}
                                </Text>
                            </View>
                            <View className="flex-row justify-between">
                                <View className="flex-row items-center">
                                    <MaterialIcons name="phone" size={20} color="black" />
                                    <Text className="text-gray-500 ml-2">{t("phoneNumber")}</Text>
                                </View>
                                <Text className="text-black font-semibold">
                                    {formData.contactPersonNumber ? formData.contactPersonNumber : t("notAvailable")}
                                </Text>
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

                        {
                            (formData?.latitude != 0 && formData?.longitude != 0) && (
                                <View className="bg-gray-100 p-4 rounded-lg shadow-md mb-5">
                                    <GoogleTextInput
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

                    </View>
                </>
            )}
        </ScrollView >
    );
};

export default PropertyDetails;