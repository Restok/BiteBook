import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Image,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { Text, Colors, Button, Picker } from "react-native-ui-lib";
import * as ImagePicker from "expo-image-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import JournalSelectionModal from "./JournalSelectionModal";
import { createEntry } from "../../services/createEntry";
import { Entry } from "../../types/entry";
import { compressImage } from "../../utils/compressImage";
import { useLoading } from "../../contexts/LoadingContext";
import { RootStackParamList } from "../../types/navigation";
import { useConfetti } from "../../contexts/ConfettiContext";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigaation/stack";

interface CreatePostModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

const CreatePostModal: React.FC<CreatePostModalProps> = ({
  visible,
  onClose,
  onSubmit,
}) => {
  const [images, setImages] = useState<string[]>([]);
  const [title, setTitle] = useState("");
  const [type, setType] = useState("Meal");
  const [time, setTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showJournalSelection, setShowJournalSelection] = useState(false);
  const [selectedJournals, setSelectedJournals] = useState<string[]>([]);
  const { triggerConfetti } = useConfetti();
  const { isLoading, setIsLoading } = useLoading();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImagePick = async (source: "library" | "camera") => {
    let result;
    if (source === "library") {
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 1,
      });
    } else {
      result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
      });
    }

    if (!result.canceled) {
      const compressedImages = await Promise.all(
        result.assets.map((asset) => compressImage(asset.uri))
      );
      setImages([...images, ...compressedImages]);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };
  const handleTimeChange = (event: any, selectedTime: Date | undefined) => {
    setShowTimePicker(Platform.OS === "ios");
    if (selectedTime) {
      setTime(selectedTime);
    }
  };
  const handleSubmit = () => {
    if (title.trim() && images.length > 0) {
      setShowJournalSelection(true);
    }
  };
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const handleJournalSelectionSubmit = async (selectedJournals: string[]) => {
    setIsSubmitting(true);
    setIsLoading(true);
    try {
      const entryId = await createEntry({
        images,
        title: title.trim(),
        type,
        time,
        journals: selectedJournals,
      });
      onSubmit();
      setImages([]);
      setTitle("");
      setType("Meal");
      setTime(new Date());
      setSelectedJournals([]);
      triggerConfetti();
      navigation.navigate("ExpandedPost", { index: 0 });
    } catch (error) {
      console.error("Error creating entry:", error);
      // Handle error (e.g., show an error message to the user)
    } finally {
      setIsSubmitting(false);
      setIsLoading(false);
    }
  };
  useEffect(() => {
    if (visible) {
      setTime(new Date());
    }
  }, [visible]);
  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <Text style={styles.closeButtonText}>✕</Text>
      </TouchableOpacity>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <ScrollView style={styles.content}>
          <View style={styles.headerContainer}>
            <Text style={styles.title}>Log a new:</Text>
            <Picker
              value={type}
              onChange={(value: string) => setType(value)}
              renderPicker={() => (
                <View style={styles.pickerContainer}>
                  <Text style={styles.pickerText}>{type}</Text>
                  <Text style={styles.dropdownArrow}>▼</Text>
                </View>
              )}
            >
              <Picker.Item label="Meal" value="Meal" />
              <Picker.Item label="Snack" value="Snack" />
              <Picker.Item label="Note" value="Note" />
            </Picker>
          </View>
          <Text style={styles.inputLabel}>Select time:</Text>
          <TouchableOpacity
            style={styles.timePickerButton}
            onPress={() => setShowTimePicker(true)}
          >
            <Text style={styles.timePickerButtonText}>
              {time.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
          </TouchableOpacity>
          {showTimePicker && (
            <DateTimePicker
              value={time}
              mode="time"
              // is24Hour={true}
              display="default"
              onChange={handleTimeChange}
            />
          )}
          <View style={styles.imageContainer}>
            {images.length > 0 ? (
              <ScrollView horizontal style={styles.imagePreviewContainer}>
                {images.map((uri, index) => (
                  <View key={index} style={styles.imagePreview}>
                    <Image source={{ uri }} style={styles.previewImage} />
                    <TouchableOpacity
                      style={styles.removeImageButton}
                      onPress={() => handleRemoveImage(index)}
                    >
                      <Text style={styles.removeImageButtonText}>✕</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            ) : (
              <Text style={styles.hintText}>Snap a pic or upload images!</Text>
            )}
            <View style={styles.imageButtonsContainer}>
              <TouchableOpacity
                style={styles.imageButton}
                onPress={() => handleImagePick("library")}
              >
                <Ionicons
                  name="images-outline"
                  size={24}
                  color={Colors.white}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.imageButton}
                onPress={() => handleImagePick("camera")}
              >
                <Ionicons
                  name="camera-outline"
                  size={24}
                  color={Colors.white}
                />
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.inputLabel}>Give it a title:</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Enter title"
          />
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={styles.buttonContainer}>
        <Button
          label="Post"
          style={styles.postButton}
          backgroundColor={Colors.purple30}
          onPress={handleSubmit}
          disabled={
            !title.trim() || images.length === 0 || isSubmitting || isLoading
          }
        />
      </View>

      <JournalSelectionModal
        visible={showJournalSelection}
        onClose={() => setShowJournalSelection(false)}
        onSubmit={handleJournalSelectionSubmit}
      />
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    // justifyContent: "space-between",
  },
  content: {
    flex: 1,
    paddingTop: 25,
    paddingHorizontal: 20,
    height: "100%",
  },
  closeButton: {
    position: "absolute",
    top: 25,
    right: 20,
    zIndex: 1,
  },
  closeButtonText: {
    fontSize: 24,
    fontWeight: "bold",
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    marginTop: 40, // Add some top margin to prevent obscuring the back button
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginRight: 10,
  },
  pickerContainer: {
    backgroundColor: Colors.green30,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    flexDirection: "row",
    alignItems: "center",
  },
  pickerText: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.white,
    textDecorationLine: "underline",
    marginRight: 5, // Add some space between the text and the arrow
  },
  dropdownArrow: {
    color: Colors.white,
    fontSize: 14,
  },
  imageContainer: {
    borderWidth: 2,
    borderColor: Colors.dark,
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
    minHeight: 130,
    justifyContent: "center", // Center content vertically
    position: "relative", // Add this to allow absolute positioning of child elements
  },
  imagePreviewContainer: {
    flexDirection: "row",
    marginBottom: 40, // Add some bottom margin to prevent overlap with buttons
  },
  imageButtonsContainer: {
    position: "absolute",
    bottom: 10,
    right: 10,
    flexDirection: "row",
  },
  imageButton: {
    backgroundColor: Colors.purple30,
    borderRadius: 30,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10, // Add some space between buttons
  },
  hintText: {
    textAlign: "center",
    color: Colors.grey30,
    fontSize: 16,
  },

  imagePreview: {
    width: 80,
    height: 80,
    marginRight: 10,
    position: "relative",
  },
  previewImage: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },
  removeImageButton: {
    position: "absolute",
    top: 5,
    right: 5,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  removeImageButtonText: {
    color: Colors.white,
    fontSize: 12,
  },
  uploadButton: {
    position: "absolute",
    bottom: 10,
    right: 10,
    backgroundColor: Colors.purple30,
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  uploadButtonText: {
    color: Colors.white,
    fontSize: 24,
  },
  inputLabel: {
    fontSize: 16,
    marginBottom: 5,
  },
  input: {
    borderWidth: 2,
    borderColor: Colors.dark,
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
    fontSize: 16,
  },
  buttonContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  postButton: {
    height: 50,
    borderRadius: 25,
  },
  timePickerButton: {
    borderWidth: 2,
    borderColor: Colors.dark,
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
  },
  timePickerButtonText: {
    fontSize: 16,
  },
});

export default CreatePostModal;
