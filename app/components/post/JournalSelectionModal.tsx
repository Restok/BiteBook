import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Text, Colors, Checkbox, Button, Avatar } from "react-native-ui-lib";
import { useJournalContext } from "../../contexts/JournalContext";
import auth from "@react-native-firebase/auth";

interface JournalSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (selectedJournals: string[]) => void;
}

const JournalSelectionModal: React.FC<JournalSelectionModalProps> = ({
  visible,
  onClose,
  onSubmit,
}) => {
  const [selectedJournals, setSelectedJournals] = useState<string[]>([]);
  const { journals, selectedJournal } = useJournalContext();
  const currentJournalId = selectedJournal?.id;

  useEffect(() => {
    if (visible) {
      const userJournal = journals.find(
        (j) => j.id === auth().currentUser?.uid
      );
      const initialSelected = [userJournal?.id, currentJournalId].filter(
        Boolean
      ) as string[];
      setSelectedJournals([...new Set(initialSelected)]);
    }
  }, [visible, journals, currentJournalId]);

  const toggleJournal = (id: string) => {
    setSelectedJournals((prev) =>
      prev.includes(id) ? prev.filter((j) => j !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    setSelectedJournals(journals.map((j) => j.id));
  };

  const deselectAll = () => {
    setSelectedJournals([]);
  };

  const handleSubmit = () => {
    onSubmit(selectedJournals);
    onClose();
  };

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <Text style={styles.title}>Select Journals</Text>
        <ScrollView style={styles.journalList}>
          {journals.map((journal) => (
            <TouchableOpacity
              key={journal.id}
              style={styles.journalItem}
              onPress={() => toggleJournal(journal.id)}
            >
              <Avatar source={{ uri: journal.icon }} />
              <Text style={styles.journalName}>{journal.name}</Text>
              <Checkbox
                value={selectedJournals.includes(journal.id)}
                onValueChange={() => toggleJournal(journal.id)}
              />
            </TouchableOpacity>
          ))}
        </ScrollView>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.selectButton} onPress={selectAll}>
            <Text style={styles.buttonText}>Select All</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.selectButton} onPress={deselectAll}>
            <Text style={styles.buttonText}>Deselect All</Text>
          </TouchableOpacity>
        </View>
        <Button
          label="Post"
          style={styles.submitButton}
          backgroundColor={Colors.purple30}
          onPress={handleSubmit}
          disabled={selectedJournals.length === 0}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: Colors.white,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  journalList: {
    flex: 1,
  },
  journalItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.grey70,
  },
  journalIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  journalName: {
    flex: 1,
    fontSize: 16,
    marginLeft: 10,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 20,
  },
  selectButton: {
    backgroundColor: Colors.blue30,
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: Colors.white,
    fontWeight: "bold",
  },
  submitButton: {
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
  },
  submitButtonText: {
    color: Colors.white,
    fontWeight: "bold",
    fontSize: 18,
  },
});

export default JournalSelectionModal;
