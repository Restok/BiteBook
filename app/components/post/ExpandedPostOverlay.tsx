import React, { useRef, useState } from "react";
import {
  View,
  StyleSheet,
  Modal,
  Image,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
} from "react-native";
import { Text, Avatar, Colors } from "react-native-ui-lib";
import { AntDesign } from "@expo/vector-icons";
import Carousel, { ICarouselInstance } from "react-native-reanimated-carousel";
import { LinearGradient } from "expo-linear-gradient";

const SCREEN_WIDTH = Dimensions.get("window").width;

interface ExpandedPostOverlayProps {
  visible: boolean;
  onClose: () => void;
}

interface CarouselItem {
  imageUrl: string;
}

const ExpandedPostOverlay: React.FC<ExpandedPostOverlayProps> = ({
  visible,
  onClose,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [carouselItems] = useState<CarouselItem[]>([
    { imageUrl: "https://placehold.co/400x800/png" },
    { imageUrl: "https://placehold.co/400x800/png" },
    { imageUrl: "https://placehold.co/400x800/png" },
  ]);
  const [title] = useState("Delicious Pizza Time!");
  const [userName] = useState("Pizza Lover");
  const [userAvatar] = useState("https://placehold.co/100x100/png");

  const carouselRef = useRef<ICarouselInstance>(null);

  const renderItem = ({ item }: { item: CarouselItem }) => {
    return <Image source={{ uri: item.imageUrl }} style={styles.image} />;
  };

  const handlePrevious = () => {
    if (carouselRef.current) {
      carouselRef.current.prev({ animated: true });
    }
  };

  const handleNext = () => {
    if (carouselRef.current) {
      carouselRef.current.next({ animated: true });
    }
  };

  return (
    <Modal
      animationType="fade"
      transparent={false}
      visible={visible}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <Carousel
          width={SCREEN_WIDTH}
          height={Dimensions.get("window").height}
          data={carouselItems}
          renderItem={renderItem}
          onSnapToItem={setActiveIndex}
          ref={carouselRef}
          scrollAnimationDuration={200}
        />
        <LinearGradient
          colors={["rgba(0,0,0,0.7)", "transparent"]}
          style={styles.topVignette}
        >
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <AntDesign name="close" size={24} color="white" />
          </TouchableOpacity>
          <View style={styles.userInfo}>
            <Avatar source={{ uri: userAvatar }} size={40} />
            <Text style={styles.userName}>{userName}</Text>
          </View>
        </LinearGradient>
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.7)"]}
          style={styles.bottomVignette}
        >
          <Text style={styles.title}>{title}</Text>
          <View style={styles.reactionContainer}>
            <TouchableOpacity style={styles.reactionButton}>
              <AntDesign name="heart" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.reactionCount}>15</Text>
          </View>
          <View style={styles.carouselControls}>
            <TouchableOpacity
              onPress={handlePrevious}
              style={styles.arrowButton}
            >
              <AntDesign name="left" size={24} color="white" />
            </TouchableOpacity>
            <View style={styles.dotsContainer}>
              {carouselItems.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.dot,
                    index === activeIndex && styles.activeDot,
                  ]}
                />
              ))}
            </View>
            <TouchableOpacity onPress={handleNext} style={styles.arrowButton}>
              <AntDesign name="right" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  image: {
    width: SCREEN_WIDTH,
    height: "100%",
    resizeMode: "cover",
  },
  topVignette: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 100,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  bottomVignette: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 200,
    justifyContent: "space-around",
    padding: 20,
    paddingTop: 45,
    paddingBottom: 0,
  },
  closeButton: {
    padding: 10,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  userName: {
    color: "white",
    marginLeft: 10,
    fontSize: 16,
  },

  title: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  reactionContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  reactionButton: {
    marginRight: 10,
  },
  reactionCount: {
    color: "white",
    fontSize: 16,
  },
  carouselControls: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  arrowButton: {
    padding: 10,
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: "white",
  },
});

export default ExpandedPostOverlay;
