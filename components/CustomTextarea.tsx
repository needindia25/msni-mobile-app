import React from 'react';
import { TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next'; // Import useTranslation

interface CustomTextareaProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

const CustomTextarea: React.FC<CustomTextareaProps> = ({ value, onChangeText, placeholder }) => {
  const { t } = useTranslation(); // Initialize translation hook

  return (
    <View className="border border-gray-300 rounded-lg p-3 bg-white">
      <TextInput
        className="text-lg text-gray-700"
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder || t("enterDescription")} // Use translation key
        multiline
        numberOfLines={4}
        textAlignVertical="top"
      />
    </View>
  );
};

export default CustomTextarea;