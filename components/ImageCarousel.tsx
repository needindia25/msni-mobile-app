import React, { useRef, useState } from "react";
import {
  ScrollView,
  Image,
  View,
  TouchableOpacity,
  Dimensions,
  Modal,
  Pressable,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { constants } from "@/constants";
import Video from 'react-native-video';
const screenWidth = Dimensions.get("window").width;

type MediaItem = { uri: string; type: "image" | "video" };

const ImageCarousel = ({
  images,
  video,
}: { images: string[]; video?: string[] }) => {
  const scrollRef = useRef<ScrollView>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalIndex, setModalIndex] = useState<number | null>(null);

  // Combine images and videos into a single array
  const media: MediaItem[] = [
    ...(video ? video.map((vid) => ({ uri: vid, type: "video" as const })) : []),
    ...images.map((img) => ({ uri: img, type: "image" as const })),
  ];

  const scrollToIndex = (index: number) => {
    scrollRef.current?.scrollTo({
      x: index * (screenWidth - 40),
      animated: true,
    });
    setCurrentIndex(index);
  };

  const handleScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / (screenWidth - 40));
    setCurrentIndex(index);
  };

  const openImageModal = (index: number) => {
    setModalIndex(index);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setModalIndex(null);
  };

  const showNext = () => {
    if (modalIndex !== null && modalIndex < media.length - 1) {
      setModalIndex(modalIndex + 1);
    }
  };

  const showPrevious = () => {
    if (modalIndex !== null && modalIndex > 0) {
      setModalIndex(modalIndex - 1);
    }
  };

  return (
    <View className="relative mb-3">
      {/* Horizontal Scroll Carousel */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        className="flex-row"
      >
        {media.map((item, index) => (
          <TouchableOpacity key={index} onPress={() => openImageModal(index)}>
            {item.type === "video" ? (
              <View
                style={{ width: screenWidth - 40 }}
                className="h-48 rounded-lg mb-4 bg-black justify-center items-center"
              >
                <Video
                  source={{ uri: constants.BASE_URL + item.uri }}
                  style={{
                    width: screenWidth - 40,
                    height: 192,
                    borderRadius: 12,
                    backgroundColor: "#000",
                  }}
                  resizeMode="contain"
                  controls
                  paused={true}
                  repeat={false}
                  onError={(e) => console.log("Video error:", e.error)}
                />
                {/* Play icon overlay */}
                <View className="absolute inset-0 justify-center items-center pointer-events-none">
                  <MaterialIcons name="play-circle-outline" size={48} color="#fff" />
                </View>
              </View>
            ) : (
              <Image
                source={{ uri: constants.BASE_URL + item.uri }}
                style={{ width: screenWidth - 40 }}
                className="h-48 rounded-lg mr-2"
              />
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Left/Right Arrows in Carousel */}
      {media.length > 1 && currentIndex > 0 && (
        <TouchableOpacity
          onPress={() => scrollToIndex(currentIndex - 1)}
          className="absolute left-2 top-[40%] bg-white/70 p-2 rounded-full"
        >
          <MaterialIcons name="chevron-left" size={28} color="black" />
        </TouchableOpacity>
      )}

      {media.length > 1 && currentIndex < media.length - 1 && (
        <TouchableOpacity
          onPress={() => scrollToIndex(currentIndex + 1)}
          className="absolute right-2 top-[40%] bg-white/70 p-2 rounded-full"
        >
          <MaterialIcons name="chevron-right" size={28} color="black" />
        </TouchableOpacity>
      )}

      {/* Fullscreen Modal with Navigation */}
      <Modal visible={modalVisible} transparent={true} animationType="fade">
        <View className="flex-1 bg-black justify-center items-center">
          {modalIndex !== null && (
            media[modalIndex].type === "video" ? (
              <Video
                source={{ uri: constants.BASE_URL + media[modalIndex].uri }}
                style={{ width: "100%", height: "100%", backgroundColor: "#000" }}
                resizeMode="contain"
                controls
                paused={true}
                repeat={false}
                onError={(e) => console.log("Video error:", e.error)}
              />
            ) : (
              <Image
                source={{ uri: constants.BASE_URL + media[modalIndex].uri }}
                className="w-full h-full"
                resizeMode="contain"
              />
            )
          )}

          {/* Close Button */}
          <Pressable
            onPress={closeModal}
            className="absolute top-10 right-5 p-2 bg-white/80 rounded-full"
          >
            <MaterialIcons name="close" size={28} color="black" />
          </Pressable>

          {/* Modal Left Arrow */}
          {modalIndex !== null && modalIndex > 0 && (
            <TouchableOpacity
              onPress={showPrevious}
              className="absolute left-4 top-[50%] bg-white/70 p-2 rounded-full"
            >
              <MaterialIcons name="chevron-left" size={32} color="black" />
            </TouchableOpacity>
          )}

          {/* Modal Right Arrow */}
          {modalIndex !== null && modalIndex < media.length - 1 && (
            <TouchableOpacity
              onPress={showNext}
              className="absolute right-4 top-[50%] bg-white/70 p-2 rounded-full"
            >
              <MaterialIcons name="chevron-right" size={32} color="black" />
            </TouchableOpacity>
          )}
        </View>
      </Modal>
    </View>
  );
};

export default ImageCarousel;