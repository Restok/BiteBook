import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Image,
  ScrollView,
} from "react-native";
import { Text, Colors, Button, Picker } from "react-native-ui-lib";
import * as ImagePicker from "expo-image-picker";
import DateTimePicker from "@react-native-community/datetimepicker";

interface CreatePostModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (post: { images: string[]; title: string; type: string }) => void;
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

  const handleImagePick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 1,
    });

    if (!result.canceled) {
      setImages([...images, ...result.assets.map((asset) => asset.uri)]);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (title.trim() && images.length > 0) {
      onSubmit({ images, title: title.trim(), type, time });
      setImages([]);
      setTitle("");
      setType("Meal");
      setTime(new Date());
      onClose();
    }
  };
  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
        <View style={styles.content}>
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
              is24Hour={true}
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
              <Text style={styles.hintText}>
                Upload images for your entry...
              </Text>
            )}
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={handleImagePick}
            >
              <Text style={styles.uploadButtonText}>↑</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.inputLabel}>Give it a title:</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Enter title"
          />
        </View>

        <View style={styles.buttonContainer}>
          <Button
            label="Post"
            style={styles.postButton}
            backgroundColor={Colors.purple30}
            onPress={handleSubmit}
            disabled={!title.trim() || images.length === 0}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    justifyContent: "space-between",
  },
  content: {
    flex: 1,
    paddingTop: 25,
    paddingHorizontal: 20,
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
    borderWidth: 1,
    borderColor: Colors.grey70,
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
    minHeight: 100,
    justifyContent: "center", // Center content vertically
  },
  hintText: {
    textAlign: "center",
    color: Colors.grey30,
    fontSize: 16,
  },
  imagePreviewContainer: {
    flexDirection: "row",
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
    borderWidth: 1,
    borderColor: Colors.grey70,
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
    borderWidth: 1,
    borderColor: Colors.grey70,
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
  },
  timePickerButtonText: {
    fontSize: 16,
  },
});

export default CreatePostModal;
