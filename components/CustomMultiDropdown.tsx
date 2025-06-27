import React, { useState } from "react";
import { View, Text, TouchableOpacity, Modal, FlatList, ScrollView } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

interface DropdownProps {
    label: string;
    value: string | number;
}

interface CustomMultiDropdownProps {
    label: string;
    data: Array<DropdownProps>;
    value: Array<string | number>;
    onChange: (items: Array<DropdownProps>) => void;
    placeholder: string;
}

const CustomMultiDropdown: React.FC<CustomMultiDropdownProps> = ({
    label,
    data,
    value,
    onChange,
    placeholder,
}) => {
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedValues, setSelectedValues] = useState<Array<string | number>>(value);

    const toggleSelect = (itemValue: string | number) => {
        let newSelected;
        if (selectedValues.includes(itemValue)) {
            newSelected = selectedValues.filter((v) => v !== itemValue);
        } else {
            newSelected = [...selectedValues, itemValue];
        }
        setSelectedValues(newSelected);
    };

    const handleConfirm = () => {
        setModalVisible(false);
        const selectedData = data.filter((item) => selectedValues.includes(item.value));
        onChange(selectedData);
    };

    const selectedLabels = data
        .filter((item) => selectedValues.includes(item.value))
        .map((item) => item.label)
        .join(", ");

    return (
        <View className="mt-5">
            <Text className="text-lg font-bold mb-3">{label}</Text>
            <TouchableOpacity
                style={{
                    borderWidth: 1,
                    borderColor: "#D1D5DB",
                    borderRadius: 8,
                    padding: 12,
                    backgroundColor: "#FFFFFF",
                    minHeight: 48,
                }}
                onPress={() => setModalVisible(true)}
            >
                <Text style={{ color: selectedLabels ? "#000" : "#888" }}>
                    {selectedLabels || placeholder}
                </Text>
            </TouchableOpacity>
            <Modal
                visible={modalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={{
                    flex: 1,
                    backgroundColor: "rgba(0,0,0,0.3)",
                    justifyContent: "center",
                    alignItems: "center"
                }}>
                    <View style={{
                        backgroundColor: "#fff",
                        borderRadius: 12,
                        width: "85%",
                        maxHeight: "70%",
                        padding: 16,
                    }}>
                        <Text style={{ fontWeight: "bold", fontSize: 18, marginBottom: 12 }}>{label}</Text>
                        <ScrollView style={{ maxHeight: 300 }}>
                            {data.map((item) => (
                                <TouchableOpacity
                                    key={item.value}
                                    style={{
                                        flexDirection: "row",
                                        alignItems: "center",
                                        paddingVertical: 10,
                                        borderBottomWidth: 1,
                                        borderBottomColor: "#eee",
                                    }}
                                    onPress={() => toggleSelect(item.value)}
                                >
                                    <MaterialIcons
                                        name={selectedValues.includes(item.value) ? "check-box" : "check-box-outline-blank"}
                                        size={24}
                                        color={selectedValues.includes(item.value) ? "#3B82F6" : "#aaa"}
                                    />
                                    <Text style={{ marginLeft: 12, fontSize: 16 }}>{item.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                        <View style={{ flexDirection: "row", justifyContent: "flex-end", marginTop: 16 }}>
                            <TouchableOpacity
                                style={{
                                    paddingVertical: 8,
                                    paddingHorizontal: 16,
                                    backgroundColor: "#3B82F6",
                                    borderRadius: 6,
                                    marginRight: 8,
                                }}
                                onPress={handleConfirm}
                            >
                                <Text style={{ color: "#fff", fontWeight: "bold" }}>Confirm</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={{
                                    paddingVertical: 8,
                                    paddingHorizontal: 16,
                                    backgroundColor: "#eee",
                                    borderRadius: 6,
                                }}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={{ color: "#333" }}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default CustomMultiDropdown;