import { useRouter } from 'expo-router';
import React, { useEffect,useState } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { constants, icons } from "@/constants";
import { fetchAPI } from "@/lib/fetch";

const PropertyDetails = () => {
    const screenWidth = Dimensions.get('window').width;
    const [showContactInfo, setShowContactInfo] = useState(false);
    const router = useRouter();
    const [serviceId, setServiceId] = useState<string | null>(null); // Allow both null and string
    const [token, setToken] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        propertyFor: "Rent",
        title: "",
        propertyType: "",
        description: "",
        latitude: 0,
        longitude: 0,
        address: "",
        location: "",
        state: 0,
        district: 0,
        city: "",
        zip: "",
        housingType: "",
        bhkType: "",
        familyPreference: "",
        foodPreference: "",
        rent: 0,
        advance: 0,
        rentNegotiable: "No",
        areaInSize: 0,
        floorNumber: 0,
        numberOfBedRooms: 1,
        numberOfBalconies: 0,
        numberOfBathRooms: 0,
        ageOfProperty: 0,
        furnishing: "",
        parking: "",
        basicAmenities: [] as string[],
        additionalAmenities: [] as string[],
        sourceOfWater: "",
        images: [] as string[],
      });
      
    useEffect(() => {
        const fetchDetails = async () => {
          try {
            const token = await AsyncStorage.getItem('token')
            if (token) {
                setToken(token);
            }
            
            const id = await AsyncStorage.getItem("passServiceId");
            if (id) {
              setServiceId(id);
              console.log("serviceId::->",id);
              const serviceResponse = await fetchAPI(`${constants.API_URL}/user-services/${id}/`, {
                headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                },
            });

            setFormData((prevFormData: any) => ({
                ...prevFormData,
                ...serviceResponse["options"],
              
              }));
    
              if (serviceResponse["options"].state) {
                await fetchDistricts(serviceResponse["options"].state);
              }
            }
          } catch (error) {
            console.error("Error fetching data:", error);
        }
        console.log(formData);
        };
    
        fetchDetails();
      }, []);
    
      // Fetch District
        const fetchDistricts = async (stateId: number) => {
          if (!stateId) return;
          try {
            const response = await fetchAPI(`${constants.API_URL}/master/state/${stateId}/districts`);
            
          } catch (error) {
            console.error("Error fetching districts:", error);
          }
        };

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
      //  services: ['Estimate Moving Cost', 'Create Agreement', 'Painting'],
       // nearby: ['ICICI Bank ATM', 'Bus Stop', 'Varthur market'],
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
                    {formData.images.map((image, index) => (
                         <Image key={index} source={{ uri: image }} style={{ width: screenWidth - 40 }} className="h-48 rounded-lg mr-1" />

                    ))}
                    
                </ScrollView>
                <Text className="text-2xl font-bold mb-1">{formData.title}</Text>
                <Text className="text-gray-500 mb-1">{formData.address}</Text>
                <View className="flex-row justify-between mb-3">
                    <View>
                    </View>
                    <View>
                    </View>
                </View>
                
                <View className="flex-row justify-between mb-3">
                    <View>
                         <Text className="text-lg font-bold mb-1">Rent: {formData.rent}</Text>
                    </View>
                    <View>
                        <Text className="text-lg font-bold mb-1">Deposit: {formData.advance}</Text>
                    </View>
                </View>
                
                <Text className="text-lg font-bold mb-1">Area(in Sq. Ft.): {formData.areaInSize}</Text>
                   
                <Text className="text-lg font-bold mb-1">Description</Text>
                <Text className="text-gray-500 mb-3">{formData.description}</Text>

                <Text className="text-lg font-bold mb-1">Overview</Text>
                <View className="flex-row justify-between mb-3">
                    <View>
                        <Text className="text-gray-500">Available For</Text>
                        <Text className="text-black">{formData.propertyFor}</Text>
                    </View>
                    <View>
                        <Text className="text-gray-500">Property Type</Text>
                        <Text className="text-black">{formData.propertyType}</Text>
                    </View>
                </View>


                <View className="flex-row justify-between mb-3">
                    <View>
                        <Text className="text-gray-500">Housing Type</Text>
                        <Text className="text-black">{formData.housingType}</Text>
                    </View>
                    <View>
                        <Text className="text-gray-500">BHK Type        </Text>
                        <Text className="text-black">{formData.bhkType}</Text>
                    </View>
                </View>

                <View className="flex-row justify-between mb-3">
                    <View>
                        <Text className="text-gray-500">Parking</Text>
                        <Text className="text-black">{formData.parking}</Text>
                    </View>
                    <View>
                        <Text className="text-gray-500">Furnishing Type</Text>
                        <Text className="text-black">{formData.furnishing}</Text>
                    </View>
                    
                </View>
                
                <View className="flex-row justify-between mb-3">
                    <View>
                        <Text className="text-gray-500">Preferred Tenancy</Text>
                        <Text className="text-black">{formData.familyPreference}</Text>
                    </View>
                    <View>
                        <Text className="text-gray-500">Food Preference</Text>
                        <Text className="text-black">{formData.foodPreference}</Text>
                    </View>
                </View>

                <Text className="text-lg font-bold mb-1">Other Details</Text>
                <View className="flex-row justify-between mb-3">
                    <View>
                        <Text className="text-gray-500">Rent Negotiable</Text>
                        <Text className="text-black">{formData.rentNegotiable}</Text>
                    </View>
                    <View>
                        <Text className="text-gray-500">Source of Water</Text>
                        <Text className="text-black">{formData.sourceOfWater}</Text>
                    </View>
                </View>
                <View className="flex-row justify-between mb-3">
                    <View>
                        <Text className="text-gray-500">Floor Number</Text>
                        <Text className="text-black">{formData.floorNumber}</Text>
                    </View>
                    <View>
                        <Text className="text-gray-500">Bedroom             </Text>
                        <Text className="text-black">{formData.numberOfBedRooms}</Text>
                    </View>
                </View>
                <View className="flex-row justify-between mb-3">
                    <View>
                        <Text className="text-gray-500">Balcony</Text>
                        <Text className="text-black">{formData.numberOfBalconies}</Text>
                    </View>
                    <View>
                        <Text className="text-gray-500">Number of Bathroom</Text>
                        <Text className="text-black">{formData.numberOfBathRooms}</Text>
                    </View>
                </View>
                <View className="flex-row justify-between mb-3">
                    <View>
                        <Text className="text-gray-500">Age of Property</Text>
                        <Text className="text-black">{formData.ageOfProperty}</Text>
                    </View>
                    
                </View>


                <Text className="text-lg font-bold mb-1">Amenities </Text>
                <View className="flex-row justify-between mb-3">
                {formData.basicAmenities.map((amenity, index) => (
                         <Text className="text-black">{amenity}</Text>
                    ))}
                    
                </View>

                <Text className="text-lg font-bold mb-1">Other Amenities </Text>
                <View className="flex-row justify-between mb-3">
                {formData.additionalAmenities.map((otherAmenity, index) => (
                         <Text className="text-black">{otherAmenity}</Text>
                    ))}
                    
                </View>

                <Text className="text-lg font-bold mb-1">Address Details</Text>
                
                    <View>
                        <Text className="text-black">{formData.address}</Text>
                        <Text className="text-black">{formData.city}</Text>
                        <Text className="text-black">{formData.district}</Text>
                        <Text className="text-black">{formData.state}</Text>
                        <Text className="text-black">Pin - {formData.zip}</Text>
                    </View>
                
                

                <Text className="text-gray-500 mt-5 mb-5">Last Updated On: {property.lastUpdated}</Text>
                <Text className="text-gray-500 mb-5">Posted On: {property.postedOn}</Text>

               
            </View>
        </ScrollView>
    );
};

export default PropertyDetails;