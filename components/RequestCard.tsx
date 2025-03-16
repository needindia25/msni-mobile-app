import React from 'react';
import { View, Text } from 'react-native';

interface Request {
    initials: string;
    name: string;
    phone: string;
    property: string;
    location: string;
    rating: number;
    price: string;
    duration: string;
    expiration: string;
    favorites: number;
}

const RequestCard: React.FC<{ request: Request }> = ({ request }) => {
    return (
        <View className="border border-gray-300 rounded-lg p-5 mb-5 mx-2 flex-1">
            <View className="flex-row mb-3">
                <View className="flex-1 pr-2 items-center">
                    <View className="bg-gray-300 rounded-full w-12 h-12 items-center justify-center mr-3">
                        <Text className="text-xl text-white">{request.initials}</Text>
                    </View>
                    <View>
                        <Text className="text-lg font-semibold">{request.name}</Text>
                        <Text className="text-gray-500">{request.phone}</Text>
                    </View>
                </View>
                <View className="flex-1 pl-2">
                    <Text className="text-lg font-bold text-black mb-1">{request.property}</Text>
                    <Text className="text-gray-500 mb-1">{request.location}</Text>
                    <View className="flex-row items-center mb-1">
                        <Text className="text-yellow-500">★</Text>
                        <Text className="text-yellow-500">★</Text>
                        <Text className="text-yellow-500">★</Text>
                        <Text className="text-yellow-500">★</Text>
                        <Text className="text-yellow-500">★</Text>
                        <Text className="text-gray-500 ml-1">{request.rating}</Text>
                    </View>
                    <Text className="text-1xl text-blue-500 mb-1">
                        {request.price} {"  "}
                        <Text className="text-gray-600 mb-5 pl-5">{request.duration}</Text>
                    </Text>
                </View>
            </View>
            <Text className="text-gray-500 mb-1 absolute bottom-2 left-2">{request.expiration}</Text>
            <View className="flex-row items-center absolute bottom-2 right-2">
                <Text className="text-red-500">❤</Text>
                <Text className="text-gray-500 ml-1">{request.favorites}</Text>
            </View>
        </View>
    );
};

export default RequestCard;