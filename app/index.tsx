import React, { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserInfo } from '@/types/type';
import { constants } from '@/constants';
import { fetchAPI } from '@/lib/fetch';
import { useTranslation } from 'react-i18next'; // Import useTranslation
const Page = () => {
  const { t } = useTranslation(); // Initialize translation hook
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem('token');
      setIsSignedIn(!!token);
      
      if (!!token) {
        const response = await fetchAPI(
            `${constants.API_URL}/auth/user_info/`,
            t,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            }
        );
        if (response === null || response === undefined) {
          AsyncStorage.clear()
          setIsSignedIn(false);
          return;
        }
        setUserInfo(response)
        response.is_both_access = false;
        if (response.user_type_id === 3) {
          response.user_type_id = 2; // Change user type to provider
          response.is_both_access = true; // Set is_both_user to true
        }
        await AsyncStorage.setItem('user_info', JSON.stringify(response));
      }
      setLoading(false);
    };
    checkAuth();
  }, []);


  if (loading) return null;

  if (isSignedIn) {
    if (userInfo && userInfo.has_subscription) {
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