import { useLocalSearchParams, useRouter } from 'expo-router';
import { format } from "date-fns";
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Alert, ActivityIndicator } from 'react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialIcons } from "@expo/vector-icons"; // Import icons
import { constants, icons } from "@/constants";
import ImageCarousel from "@/components/ImageCarousel";
import { fetchAPI } from "@/lib/fetch";
import { useTranslation } from "react-i18next"; // Import useTranslation
import GoogleTextInput from '@/components/GoogleTextInput';
import { formDataKeys } from "@/constants/staticData";
import PropertyCommon from '@/components/PropertyCommon';
import { formatData } from '@/lib/utils';

const PropertyDetails = () => {
    const { t } = useTranslation(); // Initialize translation hook
    const router = useRouter();
    const { passServiceId } = useLocalSearchParams();
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState(formDataKeys);

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
                        ...formatData(serviceResponse),
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

    return (
        <ScrollView className="bg-gray-100 p-5">
            {loading ? (
                <View className="flex-1 justify-center mt-[5%] items-center">
                    <ActivityIndicator size="large" color="#00ff00" />
                    <Text className="mt-2 text-base">{t("loading")}</Text>
                </View>
            ) : (
                <>
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

                        <PropertyCommon formData={formData} />

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