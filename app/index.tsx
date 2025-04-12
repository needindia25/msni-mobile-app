import React, { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserInfo } from '@/types/type';


const Page = () => {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem('token');
      console.log(`token: ${token}`)
      setIsSignedIn(!!token);
      
      if (!!token) {
        const userInfo = await AsyncStorage.getItem('user_info');
        console.log(`userInfo: ${userInfo}`)
        setUserInfo(userInfo ? JSON.parse(userInfo) : null)
      }
      setLoading(false);
    };
    checkAuth();
  }, []);


  if (loading) return null;

  if (isSignedIn) {
    if (userInfo && userInfo.has_subscription) {
      console.log(userInfo.user_type_id, typeof userInfo.user_type_id)
      if (userInfo.user_type_id === 1) {
        return <Redirect href="/(seeker)/(tabs)/home" />;
      } else {
        return <Redirect href="/(provider)/(tabs)/home" />;
      }
      
    } else {
      return <Redirect href="/no-subscription" />;
    }
  }

  return <Redirect href="/(auth)/language" />;
};

export default Page;