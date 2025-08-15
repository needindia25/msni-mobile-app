import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import ImageCarousel from "@/components/ImageCarousel";
import { useTranslation } from "react-i18next";
import en from '../app/locales/en';

interface ListingCardProps {
  listing: {
    id: number;
    images: string[];
    title: string;
    city: string;
    districtName: string;
    stateName: string;
    price: string;
    propertyType: string;
    propertyFor: string;
  };
  handleView: (id: number) => void;
}

const ListingCard: React.FC<ListingCardProps> = ({ listing, handleView }) => {
  const { t } = useTranslation();

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
    <View key={listing.id} className="bg-white rounded-lg shadow-md mb-5 p-5 relative">
      {/* Image Carousel */}
      <ImageCarousel images={listing.images} />

      {/* Title */}
      <Text className="text-xl font-bold mb-2 text-gray-800">{listing.title}</Text>

      {/* Location */}
      <View className="flex-row items-center mb-3">
        <MaterialIcons name="location-on" size={20} color="#4CAF50" />
        <Text className="text-gray-600 ml-2">
          {listing.city}, {listing.districtName}, {listing.stateName}
        </Text>
      </View>

      {/* Price */}
      <View className="flex-row justify-between items-center mb-3">
        <Text className="text-blue-600 text-lg font-bold">
          {listing.price} <Text className="text-sm text-gray-500">{listing.propertyFor === "Sell" ? "" : t(listing.propertyType !== "Guest House" ? "pricePerMonth" : "priceDayNight")}</Text>
        </Text>
      </View>

      {/* Property Type */}
      <View className="flex-row justify-between items-center mb-3">
        <Text className="text-gray-700 text-base font-medium">
          {getKeyByValue(listing.propertyType)}
        </Text>
      </View>

      {/* View Details Button */}
      <TouchableOpacity
        className="bg-blue-500 py-2 px-5 rounded-lg mt-3"
        onPress={() => handleView(listing.id)}
      >
        <Text className="text-white text-center font-bold">{t("viewDetails")}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ListingCard;