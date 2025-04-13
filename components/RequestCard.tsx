import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

interface Request {
    initials: string;
    name: string;
    phone: string;
    date_created: string;
}

const RequestCard: React.FC<{ request: Request }> = ({ request }) => {
    const { t } = useTranslation();

    return (
        <View className="border border-gray-300 rounded-lg p-5 mb-5 mx-2 bg-white shadow-md">
            {/* Header Row */}
            <View className="flex-row items-center mb-4">
                <View className="bg-blue-500 rounded-full w-14 h-14 items-center justify-center mr-4">
                    <Text className="text-xl text-white font-bold">{request.initials}</Text>
                </View>
                <View className="flex-1">
                    <Text className="text-lg font-semibold text-gray-800">{request.name}</Text>
                </View>
                <TouchableOpacity className="flex-row items-center">
                    <MaterialIcons name="phone" size={24} color="#4CAF50" />
                    <Text className="text-lg font-semibold text-gray-800 ml-2">+91 {request.phone}</Text>
                </TouchableOpacity>
            </View>

            {/* Divider */}
            <View className="border-t border-gray-200 my-3"></View>

            {/* Date Row */}
            <View className="flex-row justify-between items-center">
                <Text className="text-gray-500 text-sm">{`${t("requestedOn")}: ${request.date_created}`}</Text>
            </View>
        </View>
    );
};

export default RequestCard;