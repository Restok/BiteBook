import React from "react";
import { View, StyleSheet, Modal } from "react-native";
import { Text, Button, Colors } from "react-native-ui-lib";
import { Journal } from "../../types/journal";
import { leaveJournal } from "../../services/leaveJournal";

interface JournalSettingsModalProps {
  journal: Journal;
  visible: boolean;
  onClose: () => void;
  onJournalLeft: () => void;
}

const JournalSettingsModal: React.FC<JournalSettingsModalProps> = ({
  journal,
  visible,
  onClose,
  onJournalLeft,
}) => {
  const handleLeaveJournal = async () => {
    try {
      await leaveJournal(journal);
      onJournalLeft();
      onClose();
    } catch (error) {
      console.error("Error leaving journal:", error);
      // TODO: Show error message to user
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text text50 marginB-20>
            {journal.name}
          </Text>
          <View style={styles.iconContainer}>
            <Text text40>{journal.icon}</Text>
          </View>
          <Button
            label="Leave Journal"
            backgroundColor={Colors.red30}
            marginT-20
            onPress={handleLeaveJournal}
          />
          <Button label="Close" link marginT-20 onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalView: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.grey70,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default JournalSettingsModal;