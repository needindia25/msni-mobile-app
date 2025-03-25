import { useRouter } from 'expo-router';
import React from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, Dimensions } from 'react-native';

const SearchList = () => {
    const router = useRouter();
    const listings = [
        {
            id: 1,
            price: '₹ 25000',
            type: '2 BHK Independent Builder Floor',
            location: 'Sector 2, HSR Layout, Bangalore',
            size: '950 sq-ft',
            furnishing: 'Semi Furnished',
            images: [
                'https://plus.unsplash.com/premium_photo-1674676471104-3c4017645e6f?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8YXBhcnRtZW50fGVufDB8fDB8fHww',
                'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YXBhcnRtZW50fGVufDB8fDB8fHww',
                'https://plus.unsplash.com/premium_photo-1684175656320-5c3f701c082c?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8YXBhcnRtZW50fGVufDB8fDB8fHww',
                'https://images.unsplash.com/photo-1523192193543-6e7296d960e4?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8YXBhcnRtZW50fGVufDB8fDB8fHww',
            ],
            nearby: ['ICICI Bank ATM', 'Bus Stop', 'Varthur market'],
        },
        {
            id: 2,
            price: '₹ 16000',
            type: '1 BHK',
            location: 'Sector 3, HSR Layout, Bangalore',
            size: '600 sq-ft',
            furnishing: 'Fully Furnished',
            images: [
                'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fGFwYXJ0bWVudHxlbnwwfHwwfHx8MA%3D%3D',
                'https://images.unsplash.com/photo-1459767129954-1b1c1f9b9ace?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fGFwYXJ0bWVudHxlbnwwfHwwfHx8MA%3D%3D',
                'https://plus.unsplash.com/premium_photo-1683769251695-963095b23d67?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTd8fGFwYXJ0bWVudHxlbnwwfHwwfHx8MA%3D%3D',
                'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fGFwYXJ0bWVudHxlbnwwfHwwfHx8MA%3D%3D',
            ],
            nearby: ['ICICI Bank ATM', 'Bus Stop', 'Varthur market'],
        },
    ];
    const screenWidth = Dimensions.get('window').width;
    return (
        <ScrollView className="bg-gray-100 p-5">
            <TouchableOpacity onPress={() => router.back()} className="mb-5">
                <Text className="text-blue-500">Back</Text>
            </TouchableOpacity>
            {listings.map((listing) => (
                <View key={listing.id} className="bg-white rounded-lg shadow-md mb-5 p-5">
                    <ScrollView horizontal pagingEnabled className="flex-row mb-3">
                        {listing.images.map((image, index) => (
                            <Image key={index} source={{ uri: image }} style={{ width: screenWidth - 40 }} className="h-48 rounded-lg mr-1" />
                        ))}
                    </ScrollView>
                    <Text className="text-2xl text-blue-500 font-bold mb-1">{listing.price} <Text className="text-lg text-gray-500">/month</Text></Text>
                    <Text className="text-green-500 font-bold mb-1">Verified</Text>
                    <Text className="text-lg font-bold mb-1">{listing.type}</Text>
                    <Text className="text-gray-500 mb-1">{listing.location}</Text>
                    <Text className="text-gray-500 mb-1">{listing.size} - {listing.furnishing}</Text>
                    <View className="flex-row flex-wrap mb-3">
                        {listing.nearby.map((place, index) => (
                            <View key={index} className="bg-gray-200 rounded-full px-3 py-1 mr-2 mb-2">
                                <Text className="text-gray-700">{place}</Text>
                            </View>
                        ))}
                    </View>
                    <TouchableOpacity className="bg-orange-500 rounded-lg p-3"
                        onPress={() => {
                            router.push('/(seeker)/property-details');
                        }}>
                        <Text className="text-white text-center font-bold">View Details</Text>
                    </TouchableOpacity>
                </View>
            ))}
        </ScrollView>
    );
};

export default SearchList;