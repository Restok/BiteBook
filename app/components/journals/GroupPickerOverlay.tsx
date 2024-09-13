import React, { useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Modal,
  TouchableOpacity,
} from "react-native";
import { Text, Avatar, Colors, Button } from "react-native-ui-lib";
import { Ionicons } from "@expo/vector-icons";
import { Journal } from "../../types/journal";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../types/navigation";
import JournalSettingsModal from "./JournalSettingsModal";
import auth from "@react-native-firebase/auth";
import { useJournalContext } from "../../contexts/JournalContext";

interface GroupPickerOverlayProps {
  visible: boolean;
  onClose: () => void;
  onJournalSelect: (journal: Journal) => void;
}

const GroupPickerOverlay: React.FC<GroupPickerOverlayProps> = ({
  visible,
  onClose,
  onJournalSelect,
}) => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [isSettingsModalVisible, setIsSettingsModalVisible] = useState(false);
  const { journals, loadJournals, selectedJournal, setSelectedJournal } =
    useJournalContext();
  const user = auth().currentUser;
  const renderGroupItem = ({ item }: { item: Journal }) => (
    <View style={styles.groupItem}>
      <TouchableOpacity
        style={styles.groupItemContent}
        onPress={() => onJournalSelect(item)}
      >
        <Avatar size={40} source={{ uri: item.icon }} />
        <Text style={styles.groupName}>{item.name}</Text>
      </TouchableOpacity>
      {item.id !== user?.uid && ( // Only show the settings icon if journal.id != user.uid
        <TouchableOpacity onPress={() => handleSettingsPress(item)}>
          <Ionicons name="settings-outline" size={24} color={Colors.primary} />
        </TouchableOpacity>
      )}
    </View>
  );

  const handleSettingsPress = (journal: Journal) => {
    setSelectedJournal(journal);
    setIsSettingsModalVisible(true);
  };

  const handleCloseSettingsModal = () => {
    setIsSettingsModalVisible(false);
    setSelectedJournal(null);
    loadJournals();
  };

  const handleJournalLeft = (journal: Journal) => {
    setIsSettingsModalVisible(false);
    if (selectedJournal?.id === journal.id) {
      setSelectedJournal(null);
    }
  };
  const handleCreateOrJoinPress = () => {
    navigation.navigate("ExpandBitebook");
  };

  return (
    <>
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
            data={journals}
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
      </Modal>
      {selectedJournal && (
        <JournalSettingsModal
          journal={selectedJournal}
          visible={isSettingsModalVisible}
          onClose={handleCloseSettingsModal}
          onJournalLeft={handleJournalLeft}
        />
      )}
    </>
  );
};
const styles = StyleSheet.create({
  groupItemContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

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
