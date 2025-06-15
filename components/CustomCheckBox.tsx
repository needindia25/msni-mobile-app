import React from 'react';
import { TouchableOpacity, Text } from 'react-native';

const CustomCheckBox = ({
    value,
    onValueChange,
}: {
    value: boolean;
    onValueChange?: (checked: boolean) => void
}) => (
    <TouchableOpacity onPress={() => onValueChange && onValueChange(!value)}>
        <Text>{value ? '☑️' : '⬜️'}</Text>
    </TouchableOpacity>
);

export default CustomCheckBox;
