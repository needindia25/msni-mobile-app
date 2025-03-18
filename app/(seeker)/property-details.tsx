import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, Dimensions } from 'react-native';

const PropertyDetails = () => {
    const screenWidth = Dimensions.get('window').width;
    const [showContactInfo, setShowContactInfo] = useState(false);
    const router = useRouter();

    const property = {
        id: 1,
        title: '2 BHK Independent Builder Floor',
        location: 'Sector 2, HSR Layout, Bangalore, India',
        deposit: '₹ 50000',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
        images: [
            'https://plus.unsplash.com/premium_photo-1674676471104-3c4017645e6f?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8YXBhcnRtZW50fGVufDB8fDB8fHww',
            'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YXBhcnRtZW50fGVufDB8fDB8fHww',
            'https://plus.unsplash.com/premium_photo-1684175656320-5c3f701c082c?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8YXBhcnRtZW50fGVufDB8fDB8fHww',
            'https://images.unsplash.com/photo-1523192193543-6e7296d960e4?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8YXBhcnRtZW50fGVufDB8fDB8fHww',
        ],
        services: ['Estimate Moving Cost', 'Create Agreement', 'Painting'],
        nearby: ['ICICI Bank ATM', 'Bus Stop', 'Varthur market'],
        overview: {
            parking: 'Car & Bike',
            furnishing: 'Semi Furnished',
            bathroom: '2',
            facing: 'East',
            tenants: 'Family',
            age: '10 years',
            size: '950 sq-ft',
            waterSupply: 'Borewell',
        },
        lastUpdated: '21/02/2025',
        postedOn: '05/02/2025',
        similarProperties: [
            {
                id: 2,
                title: '3BHK Apartment',
                location: 'Koramangala, Bangalore',
                price: '₹ 35000',
                images: [
                    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fGFwYXJ0bWVudHxlbnwwfHwwfHx8MA%3D%3D',
                    'https://images.unsplash.com/photo-1459767129954-1b1c1f9b9ace?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTR8fGFwYXJ0bWVudHxlbnwwfHwwfHx8MA%3D%3D',

                ],
            },
            {
                id: 3,
                title: '3BHK Apartment',
                location: 'Koramangala, Bangalore',
                price: '₹ 35000',
                images: [
                    'https://plus.unsplash.com/premium_photo-1683769251695-963095b23d67?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTd8fGFwYXJ0bWVudHxlbnwwfHwwfHx8MA%3D%3D',
                    'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fGFwYXJ0bWVudHxlbnwwfHwwfHx8MA%3D%3D',
                ],
            },
        ],
        owner: {
            name: 'Santosh Kumar',
            phone: '+91 0987654321',
            address: 'Leeway Enclave Apartment, Sector 2, HSR Layout, Bangalore, Karnataka, 560068, India',
        },
    };

    return (
        <ScrollView className="bg-gray-100 p-5">
            <TouchableOpacity onPress={() => router.back()} className="mb-5">
                <Text className="text-blue-500">Back</Text>
            </TouchableOpacity>
            <View className="bg-white rounded-lg shadow-md mb-5 p-5">
                <ScrollView horizontal pagingEnabled className="flex-row mb-3">
                    {property.images.map((image, index) => (
                        <Image key={index} source={{ uri: image }} style={{ width: screenWidth - 40 }} className="h-48 rounded-lg mr-1" />
                    ))}
                </ScrollView>
                <Text className="text-2xl font-bold mb-1">{property.title}</Text>
                <Text className="text-gray-500 mb-1">{property.location}</Text>
                <Text className="text-lg font-bold mb-1">Deposit: {property.deposit}</Text>

                <View className="flex-row flex-wrap mb-3">
                    {property.services.map((service, index) => (
                        <View key={index} className="bg-gray-200 rounded-full px-3 py-1 mr-2 mb-2">
                            <Text className="text-gray-700">{service}</Text>
                        </View>
                    ))}
                </View>

                <Text className="text-lg font-bold mb-1">Description</Text>
                <Text className="text-gray-500 mb-3">{property.description}</Text>

                <View className="flex-row flex-wrap mb-3">
                    {property.nearby.map((place, index) => (
                        <View key={index} className="bg-gray-200 rounded-full px-3 py-1 mr-2 mb-2">
                            <Text className="text-gray-700">{place}</Text>
                        </View>
                    ))}
                </View>

                <Text className="text-lg font-bold mb-1">Overview</Text>
                <View className="flex-row justify-between mb-3">
                    <View>
                        <Text className="text-gray-500">Parking</Text>
                        <Text className="text-black">{property.overview.parking}</Text>
                    </View>
                    <View>
                        <Text className="text-gray-500">Preferred Tenants</Text>
                        <Text className="text-black">{property.overview.tenants}</Text>
                    </View>
                </View>
                <View className="flex-row justify-between mb-3">
                    <View>
                        <Text className="text-gray-500">Furnishing</Text>
                        <Text className="text-black">{property.overview.furnishing}</Text>
                    </View>
                    <View>
                        <Text className="text-gray-500">Building Age</Text>
                        <Text className="text-black">{property.overview.age}</Text>
                    </View>
                </View>
                <View className="flex-row justify-between mb-3">
                    <View>
                        <Text className="text-gray-500">Bathroom</Text>
                        <Text className="text-black">{property.overview.bathroom}</Text>
                    </View>
                    <View>
                        <Text className="text-gray-500">Size</Text>
                        <Text className="text-black">{property.overview.size}</Text>
                    </View>
                </View>
                <View className="flex-row justify-between mb-3">
                    <View>
                        <Text className="text-gray-500">Facing</Text>
                        <Text className="text-black">{property.overview.facing}</Text>
                    </View>
                    <View>
                        <Text className="text-gray-500">Water Supply</Text>
                        <Text className="text-black">{property.overview.waterSupply}</Text>
                    </View>
                </View>

                <Text className="text-gray-500 mb-1">Last Updated: {property.lastUpdated}</Text>
                <Text className="text-gray-500 mb-5">Posted On: {property.postedOn}</Text>

                <Text className="text-lg font-bold mb-1">Similar Properties</Text>
                <ScrollView horizontal className="flex-row mb-5">
                    {property.similarProperties.map((similarProperty) => (
                        <View key={similarProperty.id} className="bg-white rounded-lg shadow-md mr-5 p-3">
                            <Image source={{ uri: similarProperty.images[0] }} className="w-40 h-24 rounded-lg mb-2" />
                            <Text className="text-lg font-bold mb-1">{similarProperty.title}</Text>
                            <Text className="text-gray-500 mb-1">{similarProperty.location}</Text>
                            <Text className="text-blue-500 font-bold">{similarProperty.price} <Text className="text-lg text-gray-500">/month</Text></Text>
                        </View>
                    ))}
                </ScrollView>

                {showContactInfo ? (
                    <View className="border border-gray-300 rounded-lg p-3 mt-5">
                        <Text className="text-center font-bold">{property.owner.name}</Text>
                        <Text className="text-center">{property.owner.phone}</Text>
                        <Text className="text-center mt-2">Property Address</Text>
                        <Text className="text-center">{property.owner.address}</Text>
                    </View>
                ) : (
                    <TouchableOpacity className="bg-orange-500 rounded-lg p-3" onPress={() => setShowContactInfo(true)}>
                        <Text className="text-white text-center font-bold">Contact Owner</Text>
                    </TouchableOpacity>
                )}
            </View>
        </ScrollView>
    );
};

export default PropertyDetails;