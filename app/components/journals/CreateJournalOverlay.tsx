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
import { createJournal } from "../../services/createJournal";
import { Icon, TopNavigation } from "@ui-kitten/components";
import { NavigationAction } from "../ui";

interface CreateJournalOverlayProps {
  onClose: () => void;
  onCreateJournal: (journal) => void;
}

const CreateJournalOverlay: React.FC<CreateJournalOverlayProps> = ({
  onClose,
  onCreateJournal,
}) => {
  const [journalName, setJournalName] = useState("");
  const [journalImage, setJournalImage] = useState("");
  const [newJournal, setNewJournal] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const handleImagePick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setJournalImage(result.assets[0].uri);
    }
  };

  const handleCreateJournal = async () => {
    if (journalName.trim() && journalImage) {
      setIsLoading(true);
      setError(null);
      const journal = await createJournal(journalName.trim(), journalImage);
      onCreateJournal(journal);
    }
  };

  return (
    <View style={styles.container}>
      <TopNavigation
        style={{ backgroundColor: "transparent" }}
        accessoryLeft={() => {
          return (
            <NavigationAction
              icon={"arrow-back-outline"}
              size="giant"
              status="placeholder"
              tintColor={Colors.grey20}
            />
          );
        }}
      />
      <Text style={styles.title}>Create your new journal</Text>
      <Text style={styles.subtitle}>
        Share what you've been eating to each other. Set group goals and keep
        each other accountable
      </Text>
      <TouchableOpacity style={styles.imageContainer} onPress={handleImagePick}>
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
        label={isLoading ? "Creating..." : "Create Journal"}
        style={styles.createButton}
        backgroundColor={Colors.purple30}
        onPress={handleCreateJournal}
        disabled={!journalName.trim() || !journalImage || isLoading}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    paddingTop: 40,
    paddingHorizontal: 20,
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
