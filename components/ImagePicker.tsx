import React, { useState, useEffect } from 'react';
import { ScrollView } from 'react-native';
import { View, Image, TouchableOpacity, Text, Alert, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Video from 'react-native-video';
import { router } from "expo-router";
import { constants } from '@/constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next'; // Import useTranslation
import { MaterialIcons } from '@expo/vector-icons';

interface ImagePickerProps {
  images: string[];
  serviceId: number | null;
  onImageSelect: (imagePath: string) => void;
  onImageDelete: (imagePath: string) => void;
}

const ImagePickerComponent: React.FC<ImagePickerProps> = ({ images = [], serviceId, onImageSelect, onImageDelete }) => {
  const { t } = useTranslation(); // Initialize translation hook
  const [selectedImages, setSelectedImages] = useState<string[]>(images);
  const [uploading, setUploading] = useState(false); // Add this
  const [imageLoading, setImageLoading] = useState<{ [key: number]: boolean }>({});
  const [isVideoUploaed, setisVideoUploaed] = useState(false);


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

  const handleImagePick = async (mode: 'camera' | 'gallery' | 'video') => {
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
          mediaTypes: "images",
          allowsEditing: true,
          quality: 1,
          base64: true,
        });
      } else {
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: "images",
          allowsEditing: true,
          quality: 1,
          base64: true,
        });
      }

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setUploading(true); // Set uploading true here
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          Alert.alert(t("error"), t("noTokenError"),
            [
              {
                text: t("ok"),
              },
            ]
          ); // Use translation key
          return;
        }
        const imageUri = result.assets[0].uri;
        const base64Data = result.assets[0].base64;

        if (base64Data) {
          const mimeType = getMimeType(imageUri);
          const fullBase64 = `data:${mimeType};base64,${base64Data}`;
          const savedPath: any = await uploadImageToDjangoAPI(fullBase64, token);
          if (savedPath) {
            setSelectedImages((prev) => [...prev, savedPath]);
            onImageSelect(savedPath);
          }
        } else {
          Alert.alert('Error', t("imageProcessError")); // Use translation key
        }
        setUploading(false); // Set uploading false after process
      }
    } catch (error) {
      setUploading(false); // Ensure uploading is false on error
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
      console.log("Data", response);
      if (response.status === 401) {
        Alert.alert(t("sessionExpired"), t("pleaseLoginAgain"), [
          {
            text: t("ok"),
            onPress: () => router.push(`/(auth)/sign-in`),
          },
        ]);
        return null;
      }
      if (response.ok) {
        const data = await response.json();
        return data.filePath;
      } else {
        Alert.alert(
          t('error'),
          t("imageUploadError"),
          [
            {
              text: t("ok"),
            },
          ]
        );
        return null;
      }
    } catch (error) {
      Alert.alert(
        t('error'),
        t("imageUploadError"),
        [
          {
            text: t("ok"),
          },
        ]
      );
      return null;
    }
  };

  const handleDeleteImage = (imageUri: string) => {
    let title = t("deleteImage"); // Use translation key
    let message = t("deleteImageConfirmation"); // Use translation key
    if (imageUri.includes('videos')) {
      title = t("deleteVideo"); // Use translation key
      message = t("deleteVideoConfirmation"); // Use translation key
    }
    Alert.alert(
      title, // Use translation key
      message, // Use translation key
      [
        { text: t("cancel"), style: 'cancel' }, // Use translation key
        {
          text: t("delete"), // Use translation key
          style: 'destructive',
          onPress: () => {
            setSelectedImages((prev) => prev.filter((img) => img !== imageUri));
            onImageDelete(imageUri);
          },
        },
      ]
    );
  };

  const uploadVideoToDjangoAPI = async (videoUri: string, token: string): Promise<string | null> => {
    try {
      // Prepare form data
      const formData = new FormData();
      formData.append('video', {
        uri: videoUri,
        name: 'video.mp4',
        type: 'video/mp4',
      } as any);
      if (serviceId) {
        formData.append('id', String(serviceId));
      }

      const response = await fetch(`${constants.API_URL}/video-upload/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          // Do NOT set 'Content-Type', let fetch set it automatically for FormData
        },
        body: formData,
      });
      console.log("Video Upload Response", response);
      if (response.status === 401) {
        Alert.alert(t("sessionExpired"), t("pleaseLoginAgain"), [
          {
            text: t("ok"),
            onPress: () => router.push(`/(auth)/sign-in`),
          },
        ]);
        return null;
      }

      if (response.ok) {
        const data = await response.json();
        return data.filePath; // Adjust according to your backend response
      } else {
        Alert.alert(
          t('error'),
          t("videoUploadError"),
          [
            {
              text: t("ok"),
            },
          ]
        );
        return null;
      }
    } catch (error) {
      Alert.alert(
        t('error'),
        t("videoUploadError"),
        [
          {
            text: t("ok"),
          },
        ]
      );
      return null;
    }
  };

  useEffect(() => {
    if (selectedImages.length > 0) {
      selectedImages.forEach((image, index) => {
        if (image.includes('videos')) {
          setisVideoUploaed(true);
        }
      });
    }
  }, [selectedImages]);
  return (
    <>
      <View className="p-4 items-center">
        {selectedImages.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="w-full mb-4">
            <View className="flex-row flex-wrap gap-2">
              {selectedImages.map((image, index) => (
                <View key={index} className="relative">
                  {image.includes('videos')
                    ? (
                      <View className="w-80 h-40 rounded-lg mb-4 bg-black justify-center items-center">
                        <Video
                          source={{ uri: constants.BASE_URL + image }}
                          style={{ width: 280, height: 140, borderRadius: 12, backgroundColor: "#000" }}
                          resizeMode="contain"
                          controls
                          paused={true}
                          repeat={false}
                          onLoadStart={() =>
                            setImageLoading((prev) => ({ ...prev, [index]: true }))
                          }
                          onLoad={() =>
                            setImageLoading((prev) => ({ ...prev, [index]: false }))
                          }
                          onTouchStart={() => {
                            console.log("Video touched");
                          }}
                          onError={e => console.log('Video error:', e.error)}
                        />
                        {/* Play Icon Overlay */}
                        <View className="absolute inset-0 justify-center items-center pointer-events-none">
                          <View className="bg-black/50 rounded-full p-3">
                            <Text style={{ fontSize: 36, color: "#fff", fontWeight: "bold" }}>
                              {/* ▶ */}
                              <MaterialIcons name="play-circle-outline" size={48} color="#fff" />
                            </Text>
                          </View>
                        </View>
                      </View>
                    )
                    : (
                      <Image
                        source={{ uri: constants.BASE_URL + image }}
                        className="w-40 h-40 rounded-lg mb-4"
                        onLoadStart={() =>
                          setImageLoading((prev) => ({ ...prev, [index]: true }))
                        }
                        onLoadEnd={() =>
                          setImageLoading((prev) => ({ ...prev, [index]: false }))
                        }
                      />
                    )
                  }
                  {imageLoading[index] && (
                    <View className="absolute inset-0 justify-center items-center bg-white/60 rounded-lg">
                      <ActivityIndicator size="large" color="#00ff00" />
                    </View>
                  )}
                  <TouchableOpacity
                    className="absolute top-0 right-0 bg-red-500 p-1 rounded-full"
                    onPress={() => handleDeleteImage(image)}
                  >
                    <Text className="text-white font-bold">X</Text>
                  </TouchableOpacity>
                </View>
              ))}
              {uploading && (
                <View className="w-40 h-40 rounded-lg mb-4 justify-center items-center bg-gray-200">
                  <ActivityIndicator size="large" color="#00ff00" />
                </View>
              )}
            </View>
          </ScrollView>
        )}
      {!selectedImages.length && uploading && (
        <View className="w-40 h-40 rounded-lg mb-4 justify-center items-center bg-gray-200">
          <ActivityIndicator size="large" color="#00ff00" />
        </View>
      )}

      <View className="flex-row justify-center space-x-4">
        <TouchableOpacity
          className={`p-3 rounded-lg mr-3 ${uploading ? 'bg-gray-400' : 'bg-green-500'}`}
          onPress={() => handleImagePick('camera')}
          disabled={uploading}
        >
          <Text className="text-white font-bold">{t("useCamera")}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className={`p-3 rounded-lg mr-3 ${uploading ? 'bg-gray-400' : 'bg-green-500'}`}
          onPress={() => handleImagePick('gallery')}
          disabled={uploading}
        >
          <Text className="text-white font-bold">{t("uploadImage")}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className={`p-3 rounded-lg mr-3 ${(uploading || isVideoUploaed) ? 'bg-gray-400' : 'bg-green-500'}`}
          onPress={async () => {
            try {
              const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
              if (status !== 'granted') {
                Alert.alert(t("permissionDenied"), t("allowGalleryAccess"));
                return;
              }
              // Pick video only
              const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: "videos",
                videoMaxDuration: 60, // Limit to 60 seconds
                allowsEditing: false,
                quality: 1,
              });

              if (!result.canceled && result.assets && result.assets.length > 0) {
                const video = result.assets[0];
                // Check file size (in bytes), e.g., 50MB = 50 * 1024 * 1024
                const MAX_SIZE = 100 * 1024 * 1024;
                if (video.fileSize !== undefined) {
                  console.log((video.fileSize / 1024 / 1024), MAX_SIZE);
                } else {
                  console.log('video.fileSize is undefined', MAX_SIZE);
                }
                if (video.fileSize && video.fileSize > MAX_SIZE) {
                  Alert.alert(
                    t("error"),
                    t("videoSizeLimit") || "Video size should not exceed 50MB."
                  );
                  return;
                }
                setUploading(true);
                const token = await AsyncStorage.getItem('token');
                if (!token) {
                  Alert.alert(t("error"), t("noTokenError"), [{ text: t("ok") }]);
                  setUploading(false);
                  return;
                }
                // Upload video to API (implement your own upload logic)
                console.log("Uploading video to API", video.uri);
                console.log("token", token);
                const savedPath = await uploadVideoToDjangoAPI(video.uri, token);
                console.log("savedPath", savedPath);
                if (savedPath) {
                  setSelectedImages((prev) => [...prev, savedPath]);
                  onImageSelect(savedPath);
                }
                setUploading(false);
              }
            } catch (error) {
              setUploading(false);
              Alert.alert(t("error"), t("videoUploadError") || "Failed to upload the video.");
            }
          }}
          disabled={uploading || isVideoUploaed}
        >
          <Text className="text-white font-bold">{t("uploadVideo")}</Text>
        </TouchableOpacity>
      </View>
    </View >
    </>
  )
}
export default ImagePickerComponent;