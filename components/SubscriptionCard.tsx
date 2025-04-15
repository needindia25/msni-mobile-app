import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Payment from "@/components/Payment";
import { UserInfo } from '@/types/type';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeModules, Platform, ToastAndroid } from 'react-native';
const {SabPaisaSDK} = NativeModules

interface SubscriptionCardProps {
    subscriptionId: number;
    planName: string;
    price: number;
    duration: string;
    services: string;
    isPremium?: boolean;
    used?: number;
    expiryDate?: string; // Add expiryDate prop
}

const SubscriptionCard: React.FC<SubscriptionCardProps> = ({
    subscriptionId,
    planName,
    price,
    duration,
    services,
    isPremium = false,
    used = 0,
    expiryDate = "", // Add expiryDate prop
}) => {
    const [loading, setLoading] = useState(true);
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

    useEffect(() => {
        const checkAuth = async () => {
            const token = await AsyncStorage.getItem('token');
            console.log(`token: ${token}`)
            if (!!token) {
                let userInfo = await AsyncStorage.getItem('user_info');
                console.log(`userInfo: ${userInfo}`)
                let userInfoJson = userInfo ? JSON.parse(userInfo) : null
                if (userInfoJson !== null) {
                    if (!userInfoJson.hasOwnProperty("email")) {
                        userInfoJson.email = "9861236524@msni.com"
                    }
                    if (!userInfoJson.hasOwnProperty("user_id")) {
                        userInfoJson.user_id = 15
                    }
                }
                setUserInfo(userInfoJson)
            }
            setLoading(false);
        };
        checkAuth();
    }, []);

    const handleOnPress = () =>{
        SabPaisaSDK.openSabpaisaSDK(["450","testHellow","sabpaisa","7234323432","sabpaisa@gmail.com",],(errpr:any,message:String,clientTxnId:string)=>{
          console.log("sdk integrated. Transaction Status: "+message);
          if (Platform.OS === 'android') {
            ToastAndroid.show(clientTxnId, ToastAndroid.SHORT);
          }
        })
      }
    if (loading) return null;
    return (
        <View className={`rounded-lg p-5 mb-5 ${isPremium ? 'bg-orange-500' : 'border border-gray-300'}`}>
            <View className="flex-row justify-between mb-3">
                <Text className={`text-lg font-bold ${isPremium ? 'text-white' : 'text-black'}`}>{planName}</Text>
                <View>
                    <View className="flex rounded-full px-3 mb-1 py-1 bg-blue-100">
                        <Text className="text-sm text-blue-500">{services}</Text>
                    </View>
                    {used !== 0 && (
                        <View className="flex rounded-full px-3 mb-1 py-1 bg-orange-500 items-center">
                            <Text className="text-sm text-white">{used} Used</Text>
                        </View>
                    )}
                </View>
            </View>
            <Text className={`text-2xl ${isPremium ? 'text-white' : 'text-blue-500'} mb-1`}>₹ {price}</Text>
            <Text className={`mb-5 ${isPremium ? 'text-white' : 'text-gray-600'}`}>{duration}</Text>
            {used === 0 && (
                <Payment
                    fullName={userInfo?.full_name!}
                    email={userInfo?.email!}
                    amount={price}
                    subscriptionId={subscriptionId}
                />
            )}
            {used !== 0 && (
                <View className="border border-blue-500 rounded-lg p-3 mt-5">
                    <Text className="text-center text-blue-500">Expired on : {expiryDate}</Text>
                </View>
            )}
        </View>
    );
};

export default SubscriptionCard;