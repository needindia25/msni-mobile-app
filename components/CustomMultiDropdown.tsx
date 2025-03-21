import { DropdownProps } from "@/types/type";
import React, { useState } from "react";
import { View, Text } from "react-native";
import MultiSelect from "react-native-multiple-select";
import { LogBox } from "react-native";

LogBox.ignoreLogs(["Text strings must be rendered within a <Text> component"]);

interface CustomMultiDropdownProps {
    label: string;
    data: Array<DropdownProps>;
    value: Array<string | number>;
    onChange: (items: Array<DropdownProps>) => void;
    placeholder: string;
}

const CustomMultiDropdown: React.FC<CustomMultiDropdownProps> = ({ label, data, value, onChange, placeholder }) => {
    const [selectedValues, setSelectedValues] = useState(value);

    const handleChange = (selectedItems: Array<string | number>) => {
        setSelectedValues(selectedItems);
        const selectedData = data.filter(item => selectedItems.includes(item.value));
        onChange(selectedData);
    };

    return (
        <View className="mt-5">
            <Text className="text-lg font-bold mb-3">{label}</Text>
            <MultiSelect
                items={data}
                uniqueKey="value"
                onSelectedItemsChange={handleChange}
                selectedItems={selectedValues}
                selectText={placeholder}
                searchInputPlaceholderText="Search..."
                tagRemoveIconColor="#3B82F6"
                tagBorderColor="#3B82F6"
                tagTextColor="#3B82F6"
                selectedItemTextColor="#3B82F6"
                selectedItemIconColor="#3B82F6"
                itemTextColor="#000"
                displayKey="label"
                submitButtonText="Confirm"
                styleDropdownMenu={{
                    paddingLeft: 10,
                    paddingRight: 5,
                    borderWidth: 1,
                    borderColor: "#D1D5DB",
                    borderRadius: 8,
                    backgroundColor: "#FFFFFF",
                }}
                styleDropdownMenuSubsection={{
                    padding: 12,
                }}
            />
        </View>
    );
};

export default CustomMultiDropdown;
