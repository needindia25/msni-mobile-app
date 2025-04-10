import { icons } from '@/constants';
import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import en from '../app/locales/en';
import { useTranslation } from "react-i18next"; // Import useTranslation
interface CustomRadioButtonProps {
  label: string;
  value: string;
  selected: boolean;
  onPress: (value: string) => void;
}

const CustomRadioButton: React.FC<CustomRadioButtonProps> = ({ label, value, selected, onPress }) => {
  const { t } = useTranslation(); // Initialize translation hook


  const getKeyByValue = (value: string): string => {
    // Find the key by value
    const key = Object.keys(en.translation).find((k) => en.translation[k as keyof typeof en.translation] === value);

    // Return the key or fallback to the lowercase version of the value
    if (key) {
      return t(key);
    }
    return value;
  };
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
        <Text className="text-center text-base font-bold text-white">{getKeyByValue(label)}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default CustomRadioButton;