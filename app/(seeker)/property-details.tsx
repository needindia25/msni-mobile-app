import { useRouter, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import { constants, icons } from "@/constants";
import { fetchAPI } from "@/lib/fetch";
import { useTranslation } from "react-i18next";
import ImageCarousel from '@/components/ImageCarousel';
import GoogleTextInput from '@/components/GoogleTextInput';
import { formatData, formatDate, getUserPlan } from '@/lib/utils';
import Clipboard from '@react-native-clipboard/clipboard';
import { Linking } from 'react-native';
import { formDataKeys } from "@/constants/staticData";
import PropertyCommon from '@/components/PropertyCommon';

const PropertyDetails = () => {
    const { t } = useTranslation();
    const [showContactInfo, setShowContactInfo] = useState(false);
    const router = useRouter();
    const { passServiceId } = useLocalSearchParams()
    const [id, setId] = useState<number | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
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
                        ...formatData(serviceResponse),
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
                        <View className="flex-row mb-3 items-center">
                            <MaterialIcons name="location-on" size={20} color="gray" />
                            <View className="ml-1 flex-1">
                                <Text className="text-gray-500">
                                    {formData.address}, {formData.city}
                                </Text>
                                <Text className="text-gray-500">
                                    {formData.districtName}, {formData.stateName} - {formData.zip}
                                </Text>
                            </View>
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

                        <PropertyCommon formData={formData} />

                        <View className="bg-gray-100 p-4 rounded-lg shadow-md mb-5">
                            <View className="flex-row justify-between">
                                <View className="flex-row items-center">
                                    <MaterialIcons name="calendar-today" size={20} color="black" />
                                    <Text className="text-gray-500 ml-2">{t("postedOn")}</Text>
                                </View>
                                <Text className="text-black font-semibold">{formatDate(formData.date_created, t)}</Text>
                            </View>
                        </View>
                        {showContactInfo && (
                            <>
                                <View className="bg-[#FF7F19] p-4 rounded-lg shadow-md mb-5">
                                    <Text className="text-lg text-white font-bold mb-3">{t("contactPerson")}</Text>
                                    <View className="flex-row justify-between mb-2">
                                        <View className="flex-row items-center">
                                            <MaterialIcons name="person" size={20} color="white" />
                                            <Text className="text-white font-semibold ml-2">
                                                {formData.contactPersonName ? formData.contactPersonName : formData.owner_name}
                                            </Text>
                                        </View>
                                    </View>
                                    <View className="flex-row justify-between mb-3">
                                        <View className="flex-row items-center">
                                            <MaterialIcons name="smartphone" size={20} color="white" />
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