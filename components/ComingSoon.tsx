import React from "react";
import { View, Text, ImageBackground, Image, TouchableOpacity } from "react-native";


const ComingSoon = () => {
  return (
    <ImageBackground
      source={require("../assets/images/ni-on-boarding4.png")} // Replace with your image
      className="flex-1 justify-between"
      resizeMode="cover" // Ensures the image covers the entire screen
    >
      <View className="p-4 items-center">
        <Text className="text-xl font-bold text-black">Rent & Lease</Text>
        {/* <Text className="text-sm text-center text-gray-700">
          Find your dream hotel room with us.
          Enabling an end-to-end travel experience with Digi Yatra!
        </Text> */}
      </View>

      <View className="items-center">
        {/* <Image
          source={require("../assets/images/ni-on-boarding3.png")} // Replace with actual illustration
          className="w-64 h-64"
          resizeMode="contain"
        /> */}
        <TouchableOpacity
          style={{
            marginTop: 16,
            backgroundColor: "#2563eb",
            paddingHorizontal: 24,
            paddingVertical: 8,
            borderRadius: 8,
          }}
        >
          <Text style={{ color: "white", fontWeight: "bold" }}>Coming Soon!</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

export default ComingSoon;
