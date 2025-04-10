import ComingSoon from '@/components/ComingSoon';
import RequestCard from '@/components/RequestCard';
import React from 'react';
import { View, Text, SafeAreaView, ScrollView } from 'react-native';
const requests = [
  {
    initials: 'SK',
    name: 'Santosh Kumar',
    phone: '+91 0987654321',
    property: 'Modern Apartment',
    location: 'Downtown Area',
    rating: 4.8,
    price: '₹ 25000',
    duration: '/month',
    expiration: '12-Feb-2025',
    favorites: 10,
  },
  {
    initials: 'RR',
    name: 'Rajeev Ranjan',
    phone: '+91 0987654321',
    property: '3BHK Apartment',
    location: 'Koramangala, Bangalore',
    rating: 4.2,
    price: '₹ 25000',
    duration: '/month',
    expiration: '10-Feb-2025',
    favorites: 10,
  },
  {
    initials: 'RR',
    name: 'Rajeev Ranjan',
    phone: '+91 0987654321',
    property: 'Luxury Villa',
    location: 'HSR Layout, Bangalore',
    rating: 4.8,
    price: '₹ 25000',
    duration: '/month',
    expiration: '05-Feb-2025',
    favorites: 10,
  },
];

const ServiceRequests = () => {

  return (
    <SafeAreaView className="flex h-full bg-white">
      <ScrollView className="flex-1 bg-white p-5">
        <ComingSoon />
      </ScrollView>
    </SafeAreaView>
  )
  return (
    <SafeAreaView className="flex h-full bg-white">
      <ScrollView className="flex-1 bg-white p-5">
        <Text className="text-2xl font-bold text-center mb-5">Service Requests</Text>

        {requests.map((request, index) => (
          <RequestCard key={index} request={request} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

export default ServiceRequests;