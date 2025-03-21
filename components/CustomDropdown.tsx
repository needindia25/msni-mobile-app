import { DropdownProps } from "@/types/type";
import React from "react";
import { View, Text } from "react-native";
import { Dropdown } from "react-native-element-dropdown";

interface CustomDropdownProps {
  label: string;
  data: Array<{ label: string; value: string | number }>;
  value: string | number;
  onChange: (item: DropdownProps) => void;
  placeholder: string;
}

const CustomDropdown: React.FC<CustomDropdownProps> = ({ label, data, value, onChange, placeholder }) => {
  return (
    <View className="mt-5">
      <Text className="text-lg font-bold mb-3">{label}</Text>
      <Dropdown
        data={data}
        labelField="label"
        valueField="value"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        style={{
          borderWidth: 1,
          borderColor: "#D1D5DB",
          borderRadius: 8,
          padding: 12,
          backgroundColor: "#FFFFFF",
        }}
      />
    </View>
  );
};

export default CustomDropdown;
