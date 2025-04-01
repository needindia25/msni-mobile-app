import { icons } from '@/constants';
import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';

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
      <View className="flex-row items-center justify-center">
        <Image
          source={selected ? icons.radioChecked : icons.radioUnchecked}
          className="w-6 h-6 mr-2"
          style={{ tintColor: "white" }} // Apply white tint color
        />
        <Text className="text-center text-2xl font-bold text-white">{label}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default CustomRadioButton;