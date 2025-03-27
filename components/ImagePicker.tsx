// import React, { useState } from 'react';
// import { View, Image, TouchableOpacity, Text } from 'react-native';
// import { launchCamera, launchImageLibrary, CameraOptions, ImageLibraryOptions, MediaType } from 'react-native-image-picker';

// const ImagePickerComponent = () => {
//   const [selectedImage, setSelectedImage] = useState<string | null>(null);

//   const handleImagePick = (mode: 'camera' | 'gallery') => {
//     const options: CameraOptions | ImageLibraryOptions = {
//       mediaType: 'photo' as MediaType, // ✅ FIX: Explicitly set the type
//       quality: 1.0, // ✅ FIX: Ensure it's a number (0.0 to 1.0)
//     };

//     const callback = (response: any) => {
//       if (response.didCancel) {
//         console.log('User cancelled image picker');
//         return;
//       }
//       if (response.errorMessage) {
//         console.log('ImagePicker Error: ', response.errorMessage);
//         return;
//       }
//       if (response.assets && response.assets.length > 0) {
//         setSelectedImage(response.assets[0].uri);
//       }
//     };

//     if (mode === 'camera') {
//       launchCamera(options as CameraOptions, callback); // ✅ Type assertion
//     } else {
//       launchImageLibrary(options as ImageLibraryOptions, callback); // ✅ Type assertion
//     }
//   };

//   return (
//     <View className="p-4 items-center">
//       {selectedImage && (
//         <Image source={{ uri: selectedImage }} className="w-40 h-40 rounded-lg mb-4" />
//       )}

//       <View className="flex-row justify-center space-x-4">
//         <TouchableOpacity
//           className="bg-blue-500 p-3 rounded-lg mr-3"
//           onPress={() => handleImagePick('camera')}
//         >
//           <Text className="text-white font-bold">Use Camera</Text>
//         </TouchableOpacity>

//         <TouchableOpacity
//           className="bg-green-500 p-3 rounded-lg"
//           onPress={() => handleImagePick('gallery')}
//         >
//           <Text className="text-white font-bold">Select from Gallery</Text>
//         </TouchableOpacity>
//       </View>
//     </View>
//   );
// };

// export default ImagePickerComponent;

import React, { useState } from 'react';
import { View, Image, TouchableOpacity, Text, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { constants } from '@/constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ImagePickerProps {
  images: string[];
  onImageSelect: (imagePath: string) => void;
}
const ImagePickerComponent: React.FC<ImagePickerProps> = ({ images = [], onImageSelect }) => {

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
      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Please allow access to the gallery.');
        return;
      }

      let result: ImagePicker.ImagePickerResult;
      if (mode === 'camera') {
        const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
        if (cameraStatus !== 'granted') {
          Alert.alert('Permission Denied', 'Please allow access to the camera.');
          return;
        }
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          quality: 1, // 1 = Best Quality
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
        const refresh = await AsyncStorage.getItem('refresh');
        if (!token || !refresh) {
          Alert.alert("Error", "No token found. Please log in again.");
          return;
        }
        const imageUri = result.assets[0].uri;
        const base64Data = result.assets[0].base64;
        // Upload the image to the Django API
        if (result.assets[0].base64) {
          // Get the correct MIME type
          const mimeType = getMimeType(imageUri);

          // Add MIME type prefix to Base64 string
          const fullBase64 = `data:${mimeType};base64,${base64Data}`;
          console.log("fullBase64 : ", fullBase64.substring(0, 50))
          const savedPath: any = await uploadImageToDjangoAPI(fullBase64, token);
          console.log("imageUri", savedPath)
          if (savedPath) {
            // Call onImageSelect with the saved path
            onImageSelect(constants.BASE_URL + '' + savedPath);
          }
        } else {
          console.error('Base64 image data is missing.');
          Alert.alert('Error', 'Failed to process the image.');
          return;
        }

      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Something went wrong while selecting the image.');
    }
  };

  // Function to upload the image to the Django API
  const uploadImageToDjangoAPI = async (base64Image: string, token: string): Promise<string | null> => {
    try {
      console.log(`${constants.API_URL}/image-upload/`, token)
      const response = await fetch(`${constants.API_URL}/image-upload/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          image: base64Image
        }),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);


      if (response.ok) {
        const data = await response.json();
        return data.filePath; // Assuming the API returns the saved file path as `filePath`
      } else {
        console.error('Failed to upload image:', response.statusText);
        Alert.alert('Error', 'Failed to upload the image.');
        return null;
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert('Error', 'Something went wrong while uploading the image.');
      return null;
    }
  };

  return (
    <View className="p-4 items-center">
      {images.length > 0 && (
        <View className="flex-row flex-wrap gap-2">
          {images.map((image, index) => (
            <Image
              key={index}
              source={{ uri: image }}
              className="w-40 h-40 rounded-lg mb-4"
            />
          ))}
        </View>
      )}

      <View className="flex-row justify-center space-x-4">
        <TouchableOpacity
          className="bg-blue-500 p-3 rounded-lg mr-3"
          onPress={() => handleImagePick('camera')}
        >
          <Text className="text-white font-bold">Use Camera</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-green-500 p-3 rounded-lg"
          onPress={() => handleImagePick('gallery')}
        >
          <Text className="text-white font-bold">Select from Gallery</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ImagePickerComponent;

