import { useRouter } from 'expo-router';
import { format } from "date-fns";
import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, Dimensions, Alert, ActivityIndicator } from 'react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialIcons, FontAwesome5 } from "@expo/vector-icons"; // Import icons
import { constants, icons } from "@/constants";
import { fetchAPI } from "@/lib/fetch";
import { useTranslation } from "react-i18next"; // Import useTranslation

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
        numberOfBathRooms: 0,
        ageOfProperty: 0,
        furnishing: "",
        parking: "",
        basicAmenities: [] as string[],
        additionalAmenities: [] as string[],
        sourceOfWater: "",
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
                        <View className="flex-row justify-between mb-3">
                            <View className="flex-row items-center">
                                <FontAwesome5 name="rupee-sign" size={16} color="black" />
                                <Text className="text-lg font-bold ml-1">{t("rent")}: {formData.rent}</Text>
                            </View>
                            <View className="flex-row items-center">
                                <FontAwesome5 name="rupee-sign" size={16} color="black" />
                                <Text className="text-lg font-bold ml-1">{t("deposit")}: {formData.advance}</Text>
                            </View>
                        </View>

                        {/* Area */}
                        <View className="flex-row items-center mb-3">
                            <MaterialIcons name="square-foot" size={20} color="black" />
                            <Text className="text-lg font-bold ml-2">{t("area")}: {formData.areaInSize} {t("sqFt")}</Text>
                        </View>

                        {/* Description */}
                        <Text className="text-lg font-bold mb-1">{t("description")}</Text>
                        <Text className="text-gray-500 mb-3">{formData.description}</Text>

                        <Text className="text-lg font-bold mb-1">{t("overview")}</Text>
                        <View className="flex-row justify-between mb-3">
                            <View>
                                <Text className="text-gray-500">{t("availableFor")}</Text>
                                <Text className="text-black">{formData.propertyFor}</Text>
                            </View>
                            <View>
                                <Text className="text-gray-500">{t("propertyType")}</Text>
                                <Text className="text-black">{formData.propertyType}</Text>
                            </View>
                        </View>

                        {formData.propertyType === "Full House" && (
                            <View>
                                <View className="flex-row justify-between mb-3">
                                    <View>
                                        <Text className="text-gray-500">{t("housingType")}</Text>
                                        <Text className="text-black">{formData.housingType}</Text>
                                    </View>
                                    <View>
                                        <Text className="text-gray-500">{t("bhkType")}</Text>
                                        <Text className="text-black">{formData.bhkType}</Text>
                                    </View>
                                </View>
                                <View className="flex-row justify-between mb-3">
                                    <View>
                                        <Text className="text-gray-500">{t("preferredTenancy")}</Text>
                                        <Text className="text-black">{formData.familyPreference}</Text>
                                    </View>
                                </View>
                            </View>
                        )}

                        {formData.propertyType === "PG/Hostel" && (
                            <View>
                                <View className="flex-row justify-between mb-3">
                                    <View>
                                        <Text className="text-gray-500">{t("roomType")}</Text>
                                        <Text className="text-black">{formData.roomType}</Text>
                                    </View>
                                    <View>
                                        <Text className="text-gray-500">{t("genderPreference")}</Text>
                                        <Text className="text-black">{formData.familyPreference}</Text>
                                    </View>
                                </View>
                            </View>
                        )}

                        {(formData.propertyType === "Full House" || formData.propertyType === "PG/Hostel") && (
                            <View>
                                {/* Furnishing and Parking */}
                                <View className="flex-row justify-between mb-3">
                                    <View className="flex-row items-center">
                                        <MaterialIcons name="weekend" size={20} color="black" />
                                        <Text className="text-lg font-bold ml-2">{t("furnishing")}: </Text>
                                        <Text className="text-gray-500">{formData.furnishing === "" ? t("notAvailable") : formData.furnishing}</Text>
                                    </View>
                                    <View className="flex-row items-center">
                                        <MaterialIcons name="local-parking" size={20} color="black" />
                                        <Text className="text-lg font-bold ml-2">{t("parking")}: </Text>
                                        <Text className="text-gray-500">{formData.parking === "" ? t("notAvailable") : formData.parking}</Text>
                                    </View>
                                </View>
                                <View className="flex-row justify-between mb-3">
                                    <View className="flex-row items-center">
                                        <MaterialIcons name="restaurant" size={20} color="black" />
                                        <Text className="text-lg font-bold ml-2">{t("foodPreference")}: </Text>
                                        <Text className="text-gray-500">{formData.foodPreference === "" ? t("notAvailable") : formData.foodPreference}</Text>
                                    </View>
                                </View>
                            </View>
                        )}

                        {formData.propertyType === "Commercial" && (
                            <View>
                                <View>
                                    <Text className="text-gray-500">{t("commercialType")}</Text>
                                    <Text className="text-black">{formData.housingType}</Text>
                                </View>
                            </View>
                        )}

                        <Text className="text-lg font-bold mb-1">{t("otherDetails")}</Text>
                        <View className="flex-row justify-between mb-3">
                            <View>
                                <Text className="text-gray-500">{t("isRentNegotiable")}</Text>
                                <Text className="text-black">{formData.rentNegotiable}</Text>
                            </View>
                            <View>
                                <Text className="text-gray-500">{t("sourceOfWater")}</Text>
                                <Text className="text-black">{formData.sourceOfWater}</Text>
                            </View>
                        </View>

                        {formData.propertyType === "Full House" && (
                            <View>
                                <View className="flex-row justify-between mb-3">

                                    <View>
                                        <Text className="text-gray-500">{t("numberOfBedRooms")}</Text>
                                        <Text className="text-black">{formData.numberOfBedRooms}</Text>
                                    </View>
                                    <View>
                                        <Text className="text-gray-500">{t("numberOfBalconies")}</Text>
                                        <Text className="text-black">{formData.numberOfBalconies}</Text>
                                    </View>
                                </View>
                                <View className="flex-row justify-between mb-3">

                                    <View>
                                        <Text className="text-gray-500">{t("numberOfBathRooms")}</Text>
                                        <Text className="text-black">{formData.numberOfBathRooms}</Text>
                                    </View>
                                </View>
                            </View>
                        )}

                        {(formData.propertyType === "Full House" || formData.propertyType === "PG/Hostel") && (
                            <View>
                                <View className="flex-row justify-between mb-3">
                                    <View>
                                        <Text className="text-gray-500">{t("floorNumber")}</Text>
                                        <Text className="text-black">{formData.floorNumber}</Text>
                                    </View>
                                    <View>
                                        <Text className="text-gray-500">{t("ageOfProperty")}</Text>
                                        <Text className="text-black">{formData.ageOfProperty}</Text>
                                    </View>
                                </View>
                            </View>
                        )}


                        {/* Amenities */}
                        <Text className="text-lg font-bold mb-1">{t("amenities")}</Text>
                        <View className="flex-row flex-wrap mb-3">
                            {formData.basicAmenities.length > 0 ? (
                                formData.basicAmenities.map((amenity, index) => (
                                    <View key={index} className="flex-row items-center bg-gray-200 rounded-full px-3 py-1 mr-2 mb-2">
                                        <MaterialIcons name="check" size={16} color="green" />
                                        <Text className="ml-1 text-black">{amenity}</Text>
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
                                        <Text className="ml-1 text-black">{amenity}</Text>
                                    </View>
                                ))
                            ) : (
                                <Text className="text-gray-500">{t("notAvailable")}</Text>
                            )}
                        </View>

                        {/* Dates */}
                        <Text className="text-gray-500 mt-5">{t("lastUpdated")}: {formatDate(formData.date_updated)}</Text>
                        <Text className="text-gray-500">{t("postedOn")}: {formatDate(formData.date_created)}</Text>
                    </View>

                    <View className="flex-row justify-between mb-[40px] mt-[20px]">
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
                            <Text className="text-white font-bold">{t("delete")}</Text>
                        </TouchableOpacity>
                    </View>
                </>
            )}
        </ScrollView >
    );
};

export default PropertyDetails;