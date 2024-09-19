import React, { useRef, useState, useEffect, useMemo } from "react";
import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Text, Avatar, Colors } from "react-native-ui-lib";
import { AntDesign, MaterialCommunityIcons } from "@expo/vector-icons";
import Carousel, { ICarouselInstance } from "react-native-reanimated-carousel";
import { LinearGradient } from "expo-linear-gradient";
import { useJournalContext } from "../../contexts/JournalContext";
import { useUserContext } from "../../contexts/UserContext";
import auth from "@react-native-firebase/auth";
import ConfirmationModal from "../utils/ConfirmationModal";
import { deleteEntry } from "../../services/deleteEntry";
import { useSharedValue } from "react-native-reanimated";
import Dots from "../ui/Dots";
import EmojiPicker, { EmojiType, se } from "rn-emoji-keyboard";
import { updateReaction } from "../../services/updateReaction";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "../../types/navigation";
import { StackNavigationProp } from "@react-navigation/stack";
import { useLoading } from "../../contexts/LoadingContext";

const SCREEN_WIDTH = Dimensions.get("window").width;
const SCREEN_HEIGHT = Dimensions.get("window").height;

interface ExpandedPostOverlayProps {
  onClose: () => void;
  index: number;
}

const ExpandedPostOverlay: React.FC<ExpandedPostOverlayProps> = ({
  onClose,
  index,
}) => {
  const { entries } = useJournalContext();
  const { journalUsersById } = useUserContext();
  const [activeIndex, setActiveIndex] = useState(0);
  const snapPoints = useMemo(() => ["25%", "50%", "75%"], []);

  const progress = useSharedValue(0);
  const currentUser = auth().currentUser;
  const entry = entries[index];
  const isSingleImage = entry.images.length === 1;
  const [isEmojiPickerVisible, setIsEmojiPickerVisible] = useState(false);
  const user = journalUsersById[entry.userId];
  const isCurrentUserOwner = auth().currentUser?.uid === entry.userId;
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [reactionInProgress, setReactionInProgress] = useState(false);
  const { isLoading, setIsLoading } = useLoading();
  const handleDeletePress = () => {
    setIsDeleteModalVisible(true);
  };
  const { selectedJournal, reloadSingleEntry } = useJournalContext();
  const handleReaction = async (emoji: string) => {
    if (reactionInProgress) return;
    if (!currentUser || !selectedJournal) return;
    setReactionInProgress(true);

    try {
      await updateReaction(entry.id, selectedJournal.id, emoji);
      reloadSingleEntry(entry.id);
    } catch (error) {
      console.error("Error updating reaction:", error);
    } finally {
      setReactionInProgress(false);
    }
  };

  const { navigate } = useNavigation<StackNavigationProp<RootStackParamList>>();
  const handleFoodAnalysisPress = () => {
    if (!entry.nutritionAnalysis) {
      reloadSingleEntry(entry.id);
    }
    navigate("FoodAnalysis", { entryData: entry, index: index });
  };
  const handleDeleteConfirm = async () => {
    setIsLoading(true);
    setIsDeleteModalVisible(false);

    try {
      await deleteEntry(entry.id);
    } catch (error) {
      console.error("Error deleting entry:", error);
    } finally {
      onClose();

      setIsLoading(false);
    }
  };
  const renderItem = ({ item }: { item: string }) => {
    return (
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: item }}
          style={styles.image}
          resizeMode="contain"
        />
      </View>
    );
  };

  const renderReactions = () => {
    if (!entry.reactions) return null;
    const numberOfReactions = Object.values(entry.reactions).reduce(
      (acc, val) => acc + val.length,
      0
    );
    if (numberOfReactions === 0) {
      entry.reactions["❤️"] = [];
    }
    return Object.entries(entry.reactions).map(([emoji, users]) => {
      const isUserReacted = users.includes(currentUser?.uid || "");
      return (
        <TouchableOpacity
          key={emoji}
          style={[styles.reactionItem, isUserReacted && styles.activeReaction]}
          onPress={() => handleReaction(emoji)}
        >
          <Text style={styles.emoji}>{emoji}</Text>
          <Text style={styles.reactionCount}>{users.length}</Text>
        </TouchableOpacity>
      );
    });
  };

  return (
    <View style={styles.container}>
      <EmojiPicker
        open={isEmojiPickerVisible}
        onClose={function (): void {
          setIsEmojiPickerVisible(false);
        }}
        onEmojiSelected={function (emoji: EmojiType): void {
          setIsEmojiPickerVisible(false);
          handleReaction(emoji.emoji);
        }}
        enableSearchBar={true}
        enableRecentlyUsed={true}
        enableSearchAnimation={false}
        enableCategoryChangeAnimation={false}
      />
      <TouchableOpacity
        style={styles.foodAnalysisButton}
        onPress={() => {
          handleFoodAnalysisPress();
        }}
      >
        <MaterialCommunityIcons
          name="star-four-points"
          size={24}
          color="white"
        />
      </TouchableOpacity>
      <LinearGradient
        colors={["rgba(0,0,0,0.7)", "transparent"]}
        style={styles.topVignette}
      >
        <View style={styles.userInfo}>
          <Avatar source={{ uri: user?.photoURL }} size={48} />
          <Text style={styles.userName}>{user?.name}</Text>
        </View>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <AntDesign name="close" size={24} color="white" />
        </TouchableOpacity>
      </LinearGradient>
      <Dots
        translationValue={progress}
        data={entry.images}
        widthInterpolate={
          SCREEN_WIDTH / entry.images.length -
          2 * (entry.images.length - 1) -
          12
        }
        widthDot={
          SCREEN_WIDTH / entry.images.length -
          2 * (entry.images.length - 1) -
          12
        }
        style={styles.progress}
      />
      {isSingleImage ? (
        <Image
          source={{ uri: entry.images[0] }}
          style={styles.singleImage}
          resizeMode="contain"
        />
      ) : (
        <Carousel
          width={SCREEN_WIDTH}
          data={entry.images}
          panGestureHandlerProps={{
            activeOffsetX: [-5, 5],
          }}
          renderItem={renderItem}
          onSnapToItem={setActiveIndex}
          onProgressChange={(_, absoluteProgress) => {
            progress.value = Math.abs(_);
          }}
          mode="horizontal-stack"
          modeConfig={{
            snapDirection: "left",
            stackInterval: 18,
          }}
          style={styles.carousel}
        ></Carousel>
      )}
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.7)"]}
        style={styles.bottomVignette}
      >
        <Text style={styles.title}>{entry.title}</Text>
        <View style={styles.actionsContainer}>
          <View style={styles.reactionContainer}>{renderReactions()}</View>
          <View style={styles.iconContainer}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => {
                setIsEmojiPickerVisible(true);
              }}
            >
              <AntDesign name="smileo" size={24} color="white" />
            </TouchableOpacity>
            {isCurrentUserOwner && (
              <TouchableOpacity
                style={styles.iconButton}
                onPress={handleDeletePress}
              >
                <AntDesign name="delete" size={24} color="white" />
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.iconButton}>
              <AntDesign name="link" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      <ConfirmationModal
        isVisible={isDeleteModalVisible}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setIsDeleteModalVisible(false)}
        message="Are you sure you want to delete this post?"
      />
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black,
  },
  foodAnalysisButton: {
    position: "absolute",
    right: 20,
    top: 120,
    backgroundColor: Colors.purple20,
    borderRadius: 24,
    padding: 12,
    zIndex: 10,
  },
  progress: { position: "absolute", top: 40, left: 0, right: 0, zIndex: 2 },
  carousel: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  imageContainer: {
    width: "100%",
    height: "100%",
    backgroundColor: "black",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    zIndex: 10,
  },
  singleImage: {
    width: SCREEN_WIDTH,
    height: "100%",
  },

  userName: {
    color: "white",
    marginLeft: 10,
    fontSize: 16,
    fontWeight: "bold",
  },
  bottomVignette: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 200,
    justifyContent: "flex-end",
    padding: 20,
  },
  topVignette: {
    position: "absolute",
    padding: 20,
    paddingTop: 60,
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    alignItems: "center",
    zIndex: 1,
  },

  title: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  reactionContainer: {
    flexDirection: "row",
    width: "50%",
  },
  reactionItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 8,
  },
  emoji: {
    fontSize: 14,
    marginRight: 4,
  },
  reactionCount: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },

  iconContainer: {
    flexDirection: "row",
  },
  iconButton: {
    marginLeft: 20,
  },
  closeButton: {
    zIndex: 10,
  },
  deleteButton: {
    position: "absolute",
    zIndex: 10,
  },
  activeReaction: {
    backgroundColor: Colors.blue30,
  },
});

export default ExpandedPostOverlay;
