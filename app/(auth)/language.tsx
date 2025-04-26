import React, { useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, Image, Alert } from "react-native";
import { useTranslation } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { icons, images } from "@/constants";

const LanguageSelector = () => {
  const { t, i18n } = useTranslation();

  // Check if a language is already set and redirect to the welcome page
  useEffect(() => {
    const checkLanguage = async () => {
      const savedLanguage = await AsyncStorage.getItem("language");
      if (savedLanguage) {
        i18n.changeLanguage(savedLanguage);
        router.replace("/(auth)/welcome");
      } else {
        i18n.changeLanguage("A");
      }
    };
    checkLanguage();
  }, []);

  // Function to change the language and save it
  const changeLanguage = async (language: string) => {
    try {
      await AsyncStorage.setItem("language", language); // Save the selected language
      i18n.changeLanguage(language); // Change the language
      router.replace("/(auth)/welcome"); // Navigate to the welcome screen
    } catch (error) {
      Alert.alert(t("error"), t("errorSavingLanguagePreference"),
        [
          {
            text: t("ok"),
          },
        ]
      );
    }
  };

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="flex-1 bg-white mx-2">
        {/* Logo */}
        <View className="w-full justify-center items-center mt-10">
          <Image source={images.HorizontalLogo} className="z-0 w-[250px] h-[100px]" />
        </View>

        {/* Instruction Text */}
        <View className="relative w-full mt-5 mb-5 px-5">
          <Text className="text-lg text-gray-700 font-JakartaRegular">
            {t("selectPreferredLanguage")}
          </Text>
        </View>

        {/* Language Selection Buttons */}
        <View className="flex-row flex-wrap justify-between mt-5">
          {[
            { code: "en", name: "English" },
            { code: "hi", name: "हिंदी" },
          ].map((pref) => (
            <TouchableOpacity
              key={pref.code}
              className={`rounded-lg p-3 flex-1 mr-2 ${i18n.language === pref.code ? "bg-[#01BB23]" : "bg-[#FF7F19]"
                }`}
              onPress={() => changeLanguage(pref.code)}
            >
              <View className="flex-row items-center justify-center">
                <Image
                  source={i18n.language === pref.code ? icons.radioChecked : icons.radioUnchecked}
                  className="w-6 h-6 mr-2"
                  style={{ tintColor: "white" }} // Apply white tint color
                />
                <Text className="text-center text-2xl font-bold text-white">{pref.name}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

export default LanguageSelector;