import React from "react";
import { View, StyleSheet, Modal, TouchableOpacity } from "react-native";
import { Text, Colors, Button } from "react-native-ui-lib";
import { mui3Colors } from "../../styles/theme";
interface ExpandBitebookOverlayProps {
  onClose: () => void;
  onStartNewJournal: () => void;
  onJoinExistingJournal: () => void;
}

const ExpandBitebookOverlay: React.FC<ExpandBitebookOverlayProps> = ({
  onClose,
  onStartNewJournal,
  onJoinExistingJournal,
}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <Text style={styles.closeButtonText}>✕</Text>
      </TouchableOpacity>
      <Text style={styles.title}>Expand your Journals</Text>
      <Text style={styles.subtitle}>Join or create a new group journal!</Text>
      <View style={styles.buttonContainer}>
        <Button
          label="Start a new journal"
          style={styles.button}
          backgroundColor={Colors.purple30}
          onPress={onStartNewJournal}
        />
        <Button
          label="Join an existing journal"
          style={styles.button}
          backgroundColor={Colors.green30}
          onPress={onJoinExistingJournal}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    paddingTop: 40,
    paddingHorizontal: 20,
    justifyContent: "center",
  },
  closeButton: {
    position: "absolute",
    top: 40,
    right: 20,
    zIndex: 1,
  },
  closeButtonText: {
    fontSize: 24,
    fontWeight: "bold",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 40,
    color: Colors.grey30,
  },
  buttonContainer: {
    alignItems: "center",
  },
  button: {
    width: "100%",
    height: 50,
    marginBottom: 20,
    borderRadius: 25,
  },
});

export default ExpandBitebookOverlay;
