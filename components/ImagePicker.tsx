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

const ImagePickerComponent = () => {
  const [selectedImage, setSelectedImage] = useState<string[]>([]);

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
        });
      } else {
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          quality: 1,
        });
      }

      if (!result.canceled) {
        console.log(result);
        setSelectedImage([...selectedImage, result.assets[0].uri]);
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Something went wrong while selecting the image.');
    }
  };

  return (
    <View className="p-4 items-center">
      {selectedImage.length > 0 && (
        <View className="flex-row flex-wrap gap-2">
          {selectedImage.map((image, index) => (
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

