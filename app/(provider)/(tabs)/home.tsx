import ComingSoon from '@/components/ComingSoon';
import { icons } from '@/constants';
import { UserInfo } from '@/types/type';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, ActivityIndicator, SafeAreaView } from 'react-native';

const Home = () => {
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

    useEffect(() => {
        const checkAuth = async () => {
            const token = await AsyncStorage.getItem('token');
            console.log(`token: ${token}`)
            if (!!token) {
                const userInfo = await AsyncStorage.getItem('user_info');
                console.log(`userInfo: ${userInfo}`)
                setUserInfo(userInfo ? JSON.parse(userInfo) : null)
            }
            setLoading(false);
        };
        checkAuth();
    }, []);
    // const listings: any = [];
    const listings = [
        {
            id: 1,
            title: 'Modern Apartment',
            location: 'Downtown Area',
            rating: 4.8,
            price: '₹ 25000',
            requests: 12,
            favorites: 10,
            image: 'https://plus.unsplash.com/premium_photo-1674676471104-3c4017645e6f?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8YXBhcnRtZW50fGVufDB8fDB8fHww',
        },
        {
            id: 2,
            title: '3BHK Apartment',
            location: 'Koramangala, Bangalore',
            rating: 4.2,
            price: '₹ 25000',
            requests: 12,
            favorites: 10,
            image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YXBhcnRtZW50fGVufDB8fDB8fHww',
        },
        {
            id: 3,
            title: 'Luxury Villa',
            location: 'HSR Layout, Bangalore',
            rating: 4.8,
            price: '₹ 25000',
            requests: 12,
            favorites: 10,
            image: 'https://plus.unsplash.com/premium_photo-1684175656320-5c3f701c082c?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8YXBhcnRtZW50fGVufDB8fDB8fHww',
        },
    ];

    return (
        <SafeAreaView className="flex h-full bg-white">
            <ScrollView className="flex-1 bg-white p-5">
                <ComingSoon />
            </ScrollView>
        </SafeAreaView>
    )

    return (
        <>
            {listings.length && (
                <TouchableOpacity
                    className="absolute top-5 right-5 bg-green-500 rounded-full p-5 shadow-lg"
                    onPress={() => router.push('/add-service')}
                    style={{ zIndex: 1000 }} // Ensures it stays on top of other elements
                >
                    <Text className="text-white text-2xl font-bold">+</Text>
                </TouchableOpacity>
            )}
            <ScrollView className="bg-gray-100 p-5">
                {loading ? (
                    <View className="flex-1 justify-center mt-[60%] items-center">
                        <ActivityIndicator size="large" color="#00ff00" />
                        <Text className="mt-2 text-xl">Loading...</Text>
                    </View>
                ) : (
                    <>
                        {listings.length === 0 && (
                            <View className="flex-1 items-center justify-center bg-white p-5">
                                <View className="bg-gray-200 rounded-full p-5 mb-5">
                                    <Image
                                        source={icons.lock} // Replace with your icon URL or local image
                                        className="w-12 h-12"
                                    />
                                </View>
                                <Text className="text-xl font-bold text-black mb-2">No Service Found</Text>
                                <Text className="text-base text-gray-600 text-center mb-10">
                                    You currently don't have an active service
                                </Text>
                                <TouchableOpacity
                                    className="bg-green-500 py-3 px-10 rounded-full mb-5"
                                    onPress={() => router.push('/add-service')}
                                >
                                    <Text className="text-white text-lg font-bold">Add New Service</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                        {listings.map((listing: any) => (
                            <View key={listing.id} className="bg-white rounded-lg shadow-md mb-5 p-5">
                                <Image source={{ uri: listing.image }} className="w-full h-40 rounded-lg mb-3" />
                                <Text className="text-xl font-bold mb-1">{listing.title}</Text>
                                <Text className="text-gray-500 mb-1">{listing.location}</Text>

                                {/* Rating and Price Row */}
                                <View className="flex-row justify-between items-center mb-1">
                                    <Text className="text-blue-500 text-lg font-bold">
                                        {listing.price} <Text className="text-sm text-gray-500">/month</Text>
                                    </Text>
                                    <View className="flex-row items-center">
                                        <Text className="text-yellow-500 mr-1">★</Text>
                                        <Text className="text-gray-500">{listing.rating}</Text>
                                    </View>
                                </View>

                                {/* Requests and Favorites Row */}
                                <View className="flex-row justify-between items-center">
                                    <Text className="text-gray-500">{listing.requests} request</Text>
                                    <View className="flex-row items-center">
                                        <Text className="text-red-500 mr-1">❤</Text>
                                        <Text className="text-gray-500">{listing.favorites}</Text>
                                    </View>
                                </View>
                            </View>
                        ))}
                    </>
                )}
            </ScrollView>
        </>
    );
};

export default Home;