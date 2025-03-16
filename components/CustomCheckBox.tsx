import React from 'react';
import { TouchableOpacity, Text } from 'react-native';

const CustomCheckBox = ({
    value,
    onValueChange,
}: {
    value: boolean;
    onValueChange: () => void;
}) => (
    <TouchableOpacity onPress={onValueChange}>
        <Text>{value ? '☑️' : '⬜️'}</Text>
    </TouchableOpacity>
);

export default CustomCheckBox;
