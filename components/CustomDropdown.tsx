import React, { useState } from "react";
import { View, Text, TouchableOpacity, Modal, ScrollView } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

interface DropdownProps {
  label: string;
  value: string | number;
}

interface CustomDropdownProps {
  label: string;
  data: Array<DropdownProps>;
  value: string | number;
  onChange: (item: DropdownProps) => void;
  placeholder: string;
}

const CustomDropdown: React.FC<CustomDropdownProps> = ({
  label,
  data,
  value,
  onChange,
  placeholder,
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  const selectedLabel =
    data.find((item) => item.value === value)?.label || "";

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
        <Text style={{ color: selectedLabel ? "#000" : "#888" }}>
          {selectedLabel || placeholder}
        </Text>
      </TouchableOpacity>
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.3)",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View
            style={{
              backgroundColor: "#fff",
              borderRadius: 12,
              width: "85%",
              maxHeight: "70%",
              padding: 16,
            }}
          >
            <Text style={{ fontWeight: "bold", fontSize: 18, marginBottom: 12 }}>
              {label}
            </Text>
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
                  onPress={() => {
                    setModalVisible(false);
                    onChange(item);
                  }}
                >
                  <MaterialIcons
                    name={value === item.value ? "radio-button-checked" : "radio-button-unchecked"}
                    size={24}
                    color={value === item.value ? "#3B82F6" : "#aaa"}
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

export default CustomDropdown;