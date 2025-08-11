import React from 'react';
import { View, Text, } from 'react-native';
import { useTranslation } from 'react-i18next'; // Import useTranslation
import { MaterialIcons, FontAwesome5 } from "@expo/vector-icons"; // Import icons
import { AppFormData, OtherRoom } from '@/types/type';
import { formDataKeys } from "@/constants/staticData";

import en from '../app/locales/en'; // Import your translation file
interface PropertyCommonProps {
    formData: AppFormData
}

const PropertyCommon: React.FC<PropertyCommonProps> = ({ formData = formDataKeys }) => {
    const { t } = useTranslation(); // Initialize translation hook

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
        if (value === "notAvailable") {
            return t(value);
        }
        // Find the key by value
        const key = Object.keys(en.translation).find((k) => en.translation[k as keyof typeof en.translation] === value);

        // Return the key or fallback to the lowercase version of the value
        if (key) {
            return t(key);
        }
        return value;
    };


    return (
        <>
            {/* Rent and Deposit */}
            <View className="bg-gray-100 p-4 rounded-lg shadow-md mb-5">
                <View className="flex-row justify-between mb-3">
                    <View className="flex-row items-center">
                        <FontAwesome5 name="rupee-sign" size={16} color="black" />
                        <Text className="text-gray-500 ml-2">{formData.propertyFor === "Sale" ? t("saleAmount") : t("rent")}</Text>
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
                                <Text className="text-gray-500 ml-2">{formData.propertyFor === "Sale" ? t("advanceAmount") : t("deposit")}</Text>
                            </View>
                            <Text className="text-black font-semibold">{formData.advance || t("notAvailable")}</Text>
                        </View>
                        <View className="flex-row justify-between mb-3">
                            {/* Is Rent Negotiable */}
                            <View className="flex-row items-center">
                                <FontAwesome5 name="rupee-sign" size={16} color="black" />
                                <Text className="text-gray-500 ml-2">{t("isRentNegotiable")}</Text>
                            </View>
                            <Text className="text-black font-semibold">{getKeyByValue(formData.rentNegotiable || "notAvailable")}</Text>
                        </View>
                    </>
                )}
                {formData.propertyFor === "Sale" && (
                    <>
                        <View className="flex-row justify-between">
                            <View className="flex-row items-center">
                                <FontAwesome5 name="rupee-sign" size={16} color="black" />
                                <Text className="text-gray-500 ml-2">{t("propertyListedBy")}</Text>
                            </View>
                            <Text className="text-black font-semibold">{getKeyByValue(formData.propertyListedBy || "notAvailable")}</Text>
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
                        <Text className="text-black font-semibold">{getKeyByValue(formData.propertyFor || "notAvailable")}</Text>
                    </View>
                    <View>
                        <Text className="text-gray-500">{t("propertyType")}</Text>
                        <Text className="text-black font-semibold">{getKeyByValue(formData.propertyType || "notAvailable")}</Text>
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
                        <Text className="text-black font-semibold">{getKeyByValue(formData.bhkType || "notAvailable")}</Text>
                    </View>

                    {formData.propertyFor !== "Sale" && (
                        <>
                            {/* Preferred Tenancy */}
                            <View className="flex-row justify-between items-center mb-4">
                                <View className="flex-row items-center">
                                    <MaterialIcons name="group" size={20} color="black" />
                                    <Text className="text-gray-500 ml-2">{t("preferredTenancy")}</Text>
                                </View>
                                <Text className="text-black font-semibold">{getKeyByValue(formData.familyPreference || "notAvailable")}</Text>
                            </View>

                            <View className="flex-row justify-between items-center">
                                {/* Food Preference */}
                                <View className="flex-row items-center">
                                    <MaterialIcons name="restaurant" size={20} color="black" />
                                    <Text className="text-gray-500 ml-2">{t("foodPreference")}</Text>
                                </View>
                                <Text className="text-black font-semibold">
                                    {getKeyByValue(formData.foodPreference || "notAvailable")}
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
                        <Text className="text-black font-semibold">{getKeyByValue(formData.familyPreference || "notAvailable")}</Text>
                    </View>
                    <View className="flex-row justify-between items-center">
                        {/* Food Preference */}
                        <View className="flex-row items-center">
                            <MaterialIcons name="restaurant" size={20} color="black" />
                            <Text className="text-gray-500 ml-2">{t("foodPreference")}</Text>
                        </View>
                        <Text className="text-black font-semibold">
                            {getKeyByValue(formData.foodPreference || "notAvailable")}
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
                                {getKeyByValue(formData.furnishing || "notAvailable")}
                            </Text>
                        </View>
                        <View className="flex-row justify-between mb-4">
                            {/* Parking */}
                            <View className="flex-row items-center">
                                <MaterialIcons name="local-parking" size={20} color="black" />
                                <Text className="text-gray-500 ml-2">{t("parking")}</Text>
                            </View>
                            <Text className="text-black font-semibold">
                                {getKeyByValue(formData.parking || "notAvailable")}
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
        </>
    )
}
export default PropertyCommon;