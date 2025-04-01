import React, { useState } from 'react';
import { View, Image, TouchableOpacity, Text, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { constants } from '@/constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next'; // Import useTranslation

interface ImagePickerProps {
  images: string[];
  serviceId: number | null;
  onImageSelect: (imagePath: string) => void;
}

const ImagePickerComponent: React.FC<ImagePickerProps> = ({ images = [], serviceId, onImageSelect }) => {
  const { t } = useTranslation(); // Initialize translation hook
  const [selectedImages, setSelectedImages] = useState<string[]>(images);

  const getMimeType = (uri: string) => {
    const extension = uri.split(".").pop()?.toLowerCase() ?? "";
    const mimeTypes: Record<string, string> = {
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      gif: "image/gif",
    };
    return mimeTypes[extension] || "image/jpeg"; // Default to JPEG
  };

  const handleImagePick = async (mode: 'camera' | 'gallery') => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(t("permissionDenied"), t("allowGalleryAccess")); // Use translation keys
        return;
      }

      let result: ImagePicker.ImagePickerResult;
      if (mode === 'camera') {
        const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
        if (cameraStatus !== 'granted') {
          Alert.alert(t("permissionDenied"), t("allowCameraAccess")); // Use translation keys
          return;
        }
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          quality: 1,
          base64: true,
        });
      } else {
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          quality: 1,
          base64: true,
        });
      }

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          Alert.alert("Error", t("noTokenError")); // Use translation key
          return;
        }
        const imageUri = result.assets[0].uri;
        const base64Data = result.assets[0].base64;

        if (base64Data) {
          const mimeType = getMimeType(imageUri);
          const fullBase64 = `data:${mimeType};base64,${base64Data}`;
          const savedPath: any = await uploadImageToDjangoAPI(fullBase64, token);
          if (savedPath) {
            const fullPath = constants.BASE_URL + savedPath;
            setSelectedImages((prev) => [...prev, fullPath]);
            onImageSelect(fullPath);
          }
        } else {
          Alert.alert('Error', t("imageProcessError")); // Use translation key
        }
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', t("imageUploadError")); // Use translation key
    }
  };

  const uploadImageToDjangoAPI = async (base64Image: string, token: string): Promise<string | null> => {
    try {
      const response = await fetch(`${constants.API_URL}/image-upload/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          image: base64Image,
          id: serviceId,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return data.filePath;
      } else {
        Alert.alert('Error', t("imageUploadError")); // Use translation key
        return null;
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert('Error', t("imageUploadError")); // Use translation key
      return null;
    }
  };

  const handleDeleteImage = (imageUri: string) => {
    Alert.alert(
      t("deleteImage"), // Use translation key
      t("deleteImageConfirmation"), // Use translation key
      [
        { text: t("cancel"), style: 'cancel' }, // Use translation key
        {
          text: t("delete"), // Use translation key
          style: 'destructive',
          onPress: () => {
            setSelectedImages((prev) => prev.filter((img) => img !== imageUri));
          },
        },
      ]
    );
  };

  return (
    <View className="p-4 items-center">
      {selectedImages.length > 0 && (
        <View className="flex-row flex-wrap gap-2">
          {selectedImages.map((image, index) => (
            <View key={index} className="relative">
              <Image
                source={{ uri: image }}
                className="w-40 h-40 rounded-lg mb-4"
              />
              <TouchableOpacity
                className="absolute top-0 right-0 bg-red-500 p-1 rounded-full"
                onPress={() => handleDeleteImage(image)}
              >
                <Text className="text-white font-bold">X</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      <View className="flex-row justify-center space-x-4">
        <TouchableOpacity
          className="bg-blue-500 p-3 rounded-lg mr-3"
          onPress={() => handleImagePick('camera')}
        >
          <Text className="text-white font-bold">{t("useCamera")}</Text> {/* Use translation key */}
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-green-500 p-3 rounded-lg"
          onPress={() => handleImagePick('gallery')}
        >
          <Text className="text-white font-bold">{t("selectFromGallery")}</Text> {/* Use translation key */}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ImagePickerComponent;