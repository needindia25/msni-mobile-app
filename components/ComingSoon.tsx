import React from "react";
import { View, Text, ImageBackground, Image, TouchableOpacity } from "react-native";


const ComingSoon = () => {
  return (
    <ImageBackground
      source={require("../assets/images/ni-on-boarding4.png")} // Replace with your image
      className="flex-1 justify-between"
      resizeMode="cover" // Ensures the image covers the entire screen
    >
      <View className="items-center">
        <Image
          source={require("../assets/images/ni-on-boarding4.png")}
          className="w-64 h-64"
          resizeMode="contain"
        />
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
