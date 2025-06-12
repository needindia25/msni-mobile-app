import { MaterialIcons } from "@expo/vector-icons";
import RequestCard from '@/components/RequestCard';
import { constants } from '@/constants';
import { fetchAPI } from '@/lib/fetch';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { format } from 'date-fns';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View, Text, SafeAreaView, ScrollView, Alert, ActivityIndicator, TouchableOpacity } from 'react-native';
import ImageCarousel from "@/components/ImageCarousel";

const ServiceRequests = () => {
  const { t } = useTranslation(); // Initialize translation hook
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [serviceData, setServiceData] = useState<any>(null);
  const [requestUserList, setRequestedUsers] = useState<any>([]);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const serviceAsString = await AsyncStorage.getItem("passService");
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          Alert.alert(t("sessionExpired"), t("pleaseLoginAgain"), [
            {
              text: t("ok"),
              onPress: () => router.replace("/(auth)/sign-in"),
            },
          ]);
          return;
        }
        if (serviceAsString && token) {
          const service = JSON.parse(serviceAsString);
          setServiceData(service);
          const passServiceId = service.id;
          const requestedResponse = await fetchAPI(`${constants.API_URL}/user-services/${passServiceId}/requested_user_details/`, t, {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          });

          if (requestedResponse === null || requestedResponse === undefined) {
            return;
          }
          setRequestedUsers(transformData(requestedResponse));
        }
      } catch (error) {
        Alert.alert(t("error"), t("errorFetchingUserDetails"),
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

  const getInitialURL = (name: string) => {
    let names = name.split(' ');
    names = names.filter((n) => n.length > 0); // Filter out any empty strings
    if (names.length === 0) return "NI"; // Return empty string if no names found
    return names.length > 1 ? names[0][0] + names[1][0] : names[0][0];
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return t("notAvailable");
    const date = new Date(dateString);
    return format(date, "do MMMM, yyyy");
  };

  const transformData = (data: any[]): any[] => {
    const sortedData = data.sort((a, b) => b.id - a.id);
    return sortedData.map((request) => ({
      id: request.id,
      initials: getInitialURL(request.user__first_name + " " + request.user__last_name),
      name: request.user__first_name + " " + request.user__last_name,
      phone: request.user__username,
      date_created: formatDate(request.date_created),
    }));
  };

  return (
    <SafeAreaView className="flex h-full bg-gray-100">
      {/* Header */}
      <View className="bg-blue-500 py-4 px-10 shadow-md">
        {/* <TouchableOpacity onPress={() => router.back()} className="absolute left-5 top-5">
          <MaterialIcons name="arrow-back" size={24} color="white" />
        </TouchableOpacity> */}
        <Text className="text-xl font-bold text-white text-center">{t("serviceRequests")}</Text>
      </View>

      <ScrollView className="flex-1 p-5">
        {/* Service Details */}
        <View key={serviceData?.id} className="bg-white rounded-lg shadow-md mb-5 p-5">
          <ImageCarousel images={serviceData ? serviceData?.images : []} />
          <Text className="text-xl font-bold mb-1">{serviceData?.title}</Text>
          <Text className="text-gray-500 mb-1">{serviceData?.location}</Text>

          {/* Rating and Price Row */}
          <View className="flex-row justify-between items-center mb-1">
            <Text className="text-blue-500 text-lg font-bold">
              {serviceData?.price} <Text className="text-sm text-gray-500">{t(serviceData?.propertyType !== "Guest House" ? "pricePerMonth" : "priceDayNight")}</Text>
            </Text>
            <View className="flex-row items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <MaterialIcons
                  key={star}
                  name={star <= Math.floor(serviceData?.rating) ? "star" : star - serviceData?.rating <= 0.5 ? "star-half" : "star-border"}
                  size={20}
                  color="#FFD700"
                />
              ))}
              <Text className="text-gray-500 ml-2">({serviceData?.rating.toFixed(1)})</Text>
            </View>
          </View>

          {/* Requests and Favorites Row */}
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-gray-500">{serviceData?.requests} {t("requests")}</Text>
            <View className="flex-row items-center">
              <Text className="text-red-500 mr-1">❤</Text>
              <Text className="text-gray-500">{serviceData?.favorites} {t("favorites")}</Text>
            </View>
          </View>
        </View>


        {/* Content */}
        {/* <ScrollView className="flex-1 p-5"> */}
        {loading ? (
          <View className="flex-1 justify-center items-center mt-10">
            <ActivityIndicator size="large" color="#4CAF50" />
            <Text className="mt-2 text-gray-500">{t("loading")}</Text>
          </View>
        ) : (
          <>
            {requestUserList.length > 0 ? (
              requestUserList.map((request: any, index: number) => (
                <RequestCard key={index} request={request} />
              ))
            ) : (
              <View className="flex-1 justify-center items-center mt-10">
                <Text className="text-gray-500 text-lg">{t("noRequestFound")}</Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default ServiceRequests;