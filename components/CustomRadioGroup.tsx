import React from 'react';
import { View } from 'react-native';
import CustomRadioButton from './CustomRadioButton';

interface Option {
  label: string;
  value: string;
}

interface CustomRadioGroupProps {
  options: Option[];
  selectedValue: string;
  onValueChange: (value: string) => void;
}

const CustomRadioGroup: React.FC<CustomRadioGroupProps> = ({ options, selectedValue, onValueChange }) => {
  return (
    <View className="flex-row justify-center my-4">
      {options.map((option) => (
        <CustomRadioButton
          key={option.value}
          label={option.label}
          value={option.value}
          selected={selectedValue === option.value}
          onPress={onValueChange}
        />
      ))}
    </View>
  );
};

export default CustomRadioGroup;