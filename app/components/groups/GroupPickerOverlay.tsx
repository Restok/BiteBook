import React, { useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Modal,
  TouchableOpacity,
} from "react-native";
import { Text, Avatar, Colors, Button } from "react-native-ui-lib";
import ExpandBitebookOverlay from "./ExpandBitebookOverlay";
import CreateJournalOverlay from "./CreateJournalOverlay";

interface Group {
  id: string;
  name: string;
  icon: string;
}

const groups: Group[] = [
  { id: "user", name: "You", icon: "👤" },
  { id: "paleo", name: "paleo diet gang", icon: "🥩" },
  { id: "uni", name: "uni squad", icon: "🎓" },
];

interface GroupPickerOverlayProps {
  visible: boolean;
  onClose: () => void;
  onGroupSelect: (group: Group) => void;
}

const GroupPickerOverlay: React.FC<GroupPickerOverlayProps> = ({
  visible,
  onClose,
  onGroupSelect,
}) => {
  const [expandBitebookVisible, setExpandBitebookVisible] = useState(false);
  const [createJournalVisible, setCreateJournalVisible] = useState(false);

  const renderGroupItem = ({ item }: { item: Group }) => (
    <TouchableOpacity
      style={styles.groupItem}
      onPress={() => onGroupSelect(item)}
    >
      <Avatar size={40} label={item.icon} />
      <Text style={styles.groupName}>{item.name}</Text>
    </TouchableOpacity>
  );
  const handleCreateOrJoinPress = () => {
    setExpandBitebookVisible(true);
  };

  const handleExpandBitebookClose = () => {
    setExpandBitebookVisible(false);
  };

  const handleStartNewJournal = () => {
    setCreateJournalVisible(true);
  };
  const handleCreateJournal = (journal) => {
    // TODO: Implement create journal logic
    setCreateJournalVisible(false);
  };
  const handleJoinExistingJournal = () => {
    // TODO: Implement join existing journal logic
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
        <Text style={styles.title}>Select Group</Text>
        <FlatList
          data={groups}
          renderItem={renderGroupItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.groupList}
        />
        <Button
          label="Create or join a new group journal"
          style={styles.createButton}
          iconSource={() => <Text style={styles.plusIcon}>+</Text>}
          onPress={handleCreateOrJoinPress}
        />
      </View>
      <ExpandBitebookOverlay
        visible={expandBitebookVisible}
        onClose={handleExpandBitebookClose}
        onStartNewJournal={handleStartNewJournal}
        onJoinExistingJournal={handleJoinExistingJournal}
      />
      <CreateJournalOverlay
        visible={createJournalVisible}
        onClose={() => setCreateJournalVisible(false)}
        onCreateJournal={handleCreateJournal}
      />
    </Modal>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    paddingTop: 40,
    paddingBottom: 40, // Add padding to the bottom of the container
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
    marginBottom: 20,
  },
  groupList: {
    paddingHorizontal: 20,
  },
  groupItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: Colors.grey70,
  },
  groupName: {
    marginLeft: 15,
    fontSize: 16,
  },
  createButton: {
    marginTop: 20,
    marginHorizontal: 20,
    borderRadius: 30,
  },
  plusIcon: {
    fontSize: 24,
    marginRight: 10,
  },
});

export default GroupPickerOverlay;
