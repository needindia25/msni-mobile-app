import React from "react";
import { View, Text } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

interface LabelValueRowProps {
  icon?: keyof typeof MaterialIcons.glyphMap;
  label: string;
  value: string;
}

export default function LabelValueRow({
  icon = "calendar-today",
  label,
  value,
}: LabelValueRowProps) {
  return (
    <View className="flex-row justify-between items-center mb-4 flex-nowrap">
      {/* Left side */}
      <View className="flex-row items-center flex-shrink">
        <MaterialIcons name={icon} size={20} color="black" />
        <Text
          className="text-gray-500 ml-2 flex-shrink"
          numberOfLines={2}
          ellipsizeMode="tail"
        >
          {label}
        </Text>
      </View>

      {/* Right side */}
      <View className="items-end">
        <Text
          className="text-black font-semibold text-right"
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {value}
        </Text>
      </View>
    </View>
  );
}
