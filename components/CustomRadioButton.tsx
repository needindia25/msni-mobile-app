import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface CustomRadioButtonProps {
  label: string;
  value: string;
  selected: boolean;
  onPress: (value: string) => void;
}

const CustomRadioButton: React.FC<CustomRadioButtonProps> = ({ label, value, selected, onPress }) => {
  return (
    <TouchableOpacity
      className={`flex-1 py-2 px-4 rounded-[5px] mx-1 ${selected ? 'bg-[#01BB23]' : 'bg-[#FF7F19]'
        }`}
      onPress={() => onPress(value)}
    >
      <Text className="text-center text-xs text-white">
        {label}
      </Text>
    </TouchableOpacity>
  );
};

export default CustomRadioButton;