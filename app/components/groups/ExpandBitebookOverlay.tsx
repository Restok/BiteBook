import React from "react";
import { View, StyleSheet, Modal, TouchableOpacity } from "react-native";
import { Text, Colors, Button } from "react-native-ui-lib";

interface ExpandBitebookOverlayProps {
  visible: boolean;
  onClose: () => void;
  onStartNewJournal: () => void;
  onJoinExistingJournal: () => void;
}

const ExpandBitebookOverlay: React.FC<ExpandBitebookOverlayProps> = ({
  visible,
  onClose,
  onStartNewJournal,
  onJoinExistingJournal,
}) => {
  return (
    <Modal
      animationType="fade"
      transparent={false}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Expand your Bitebook</Text>
        <Text style={styles.subtitle}>Join or create a new group journal</Text>
        <View style={styles.buttonContainer}>
          <Button
            label="Start a new journal"
            style={styles.button}
            backgroundColor={Colors.purple50}
            onPress={onStartNewJournal}
          />
          <Button
            label="Join an existing journal"
            style={styles.button}
            backgroundColor={Colors.purple30}
            onPress={onJoinExistingJournal}
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
