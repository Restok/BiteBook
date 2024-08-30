import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Image,
} from "react-native";
import { Text, Colors, Button } from "react-native-ui-lib";
import * as ImagePicker from "expo-image-picker";

interface CreateJournalOverlayProps {
  visible: boolean;
  onClose: () => void;
  onCreateJournal: (name: string, image: string) => void;
}

const CreateJournalOverlay: React.FC<CreateJournalOverlayProps> = ({
  visible,
  onClose,
  onCreateJournal,
}) => {
  const [journalName, setJournalName] = useState("");
  const [journalImage, setJournalImage] = useState("");

  const handleImagePick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setJournalImage(result.assets[0].uri);
    }
  };

  const handleCreateJournal = () => {
    if (journalName.trim() && journalImage) {
      onCreateJournal(journalName.trim(), journalImage);
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
        <TouchableOpacity style={styles.backButton} onPress={onClose}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Create your new journal</Text>
        <Text style={styles.subtitle}>
          Share what you've been eating to each other. Set group goals and keep
          each other accountable
        </Text>
        <TouchableOpacity
          style={styles.imageContainer}
          onPress={handleImagePick}
        >
          {journalImage ? (
            <Image source={{ uri: journalImage }} style={styles.journalImage} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.imagePlaceholderText}>🖼️</Text>
              <Text style={styles.uploadText}>Upload</Text>
            </View>
          )}
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          placeholder="Journal Name"
          value={journalName}
          onChangeText={setJournalName}
        />
        <Button
          label="Create Journal"
          style={styles.createButton}
          backgroundColor={Colors.purple30}
          onPress={handleCreateJournal}
          disabled={!journalName.trim() || !journalImage}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    paddingTop: 40,
    paddingHorizontal: 20,
  },
  backButton: {
    position: "absolute",
    top: 40,
    left: 20,
    zIndex: 1,
  },
  backButtonText: {
    fontSize: 24,
    fontWeight: "bold",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 40,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 30,
    color: Colors.grey30,
  },
  imageContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.grey70,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 30,
    overflow: "hidden",
  },
  journalImage: {
    width: "100%",
    height: "100%",
  },
  imagePlaceholder: {
    alignItems: "center",
  },
  imagePlaceholderText: {
    fontSize: 40,
  },
  uploadText: {
    marginTop: 5,
    color: Colors.grey30,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.grey70,
    borderRadius: 8,
    padding: 10,
    marginBottom: 30,
    fontSize: 16,
  },
  createButton: {
    height: 50,
    borderRadius: 25,
  },
});

export default CreateJournalOverlay;