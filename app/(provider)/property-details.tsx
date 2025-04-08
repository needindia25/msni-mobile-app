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
        stateName:"",
        district: 0,
        districtName:"",
        city: "",
        zip: "",
        housingType: "",
        bhkType: "",
        familyPreference: "",
        foodPreference: "",
        genderPreference:"",
        roomType:"",
        commercialType:"",
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
        date_updated: "",
        date_created:"",
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
              console.log(formData);
            }
          } catch (error) {
            console.error("Error fetching data:", error);
        }
        };
    
        fetchDetails();
      }, []);
    

    
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

                {formData.propertyType === "Full House" && (
                <View>
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
                        <Text className="text-gray-500">Preferred Tenancy</Text>
                        <Text className="text-black">{formData.familyPreference}</Text>
                    </View>
                    
                </View>
                </View> )}

                {formData.propertyType === "PG/Hostel" && (
                    <View>
                        <View className="flex-row justify-between mb-3">
                            <View>
                                <Text className="text-gray-500">Room Type</Text>
                                <Text className="text-black">{formData.roomType}</Text>
                            </View>
                            <View>
                                <Text className="text-gray-500">Gender Preference</Text>
                                <Text className="text-black">{formData.genderPreference}</Text>
                            </View>
                        </View>
                    </View>
                    )}

                    {(formData.propertyType === "Full House" || formData.propertyType === "PG/Hostel") && (
                     <View>
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

                        <View>
                            <Text className="text-gray-500">Food Preference</Text>
                            <Text className="text-black">{formData.foodPreference}</Text>
                        </View>
                        
                    </View>
                )}

                {formData.propertyType === "Commercial" && (
                    <View>
                        <View>
                            <Text className="text-gray-500">Commercial Type</Text>
                            <Text className="text-black">{formData.commercialType}</Text>
                        </View>
                    </View>
                )}

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

            {formData.propertyType === "Full House" && (
            <View>
                <View className="flex-row justify-between mb-3">
                    
                    <View>
                        <Text className="text-gray-500">Bedroom</Text>
                        <Text className="text-black">{formData.numberOfBedRooms}</Text>
                    </View>
                    <View>
                        <Text className="text-gray-500">Balcony         </Text>
                        <Text className="text-black">{formData.numberOfBalconies}</Text>
                    </View>
                </View>
                <View className="flex-row justify-between mb-3">
                    
                    <View>
                        <Text className="text-gray-500">Number of Bathroom</Text>
                        <Text className="text-black">{formData.numberOfBathRooms}</Text>
                    </View>
                </View>
                </View> )}

                {(formData.propertyType === "Full House" || formData.propertyType === "PG/Hostel") && (
                <View>
                    <View className="flex-row justify-between mb-3">
                        <View>
                            <Text className="text-gray-500">Floor Number</Text>
                            <Text className="text-black">{formData.floorNumber}</Text>
                        </View>
                        <View>
                            <Text className="text-gray-500">Age of Property</Text>
                            <Text className="text-black">{formData.ageOfProperty}</Text>
                        </View>
                        
                    </View>
           
                 </View> )}
            

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
                        <Text className="text-black">{formData.districtName}</Text>
                        <Text className="text-black">{formData.stateName}</Text>
                        <Text className="text-black">Pin - {formData.zip}</Text>
                    </View>
                
                

                <Text className="text-gray-500 mt-5 mb-5">Last Updated On: {formData.date_updated}</Text>
                <Text className="text-gray-500 mb-5">Posted On: {formData.date_created}</Text>

               
            </View>
        </ScrollView>
    );
};

export default PropertyDetails;