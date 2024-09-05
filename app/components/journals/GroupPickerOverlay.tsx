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
import { Journal } from "../../types/journal";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../types/navigation";

interface GroupPickerOverlayProps {
  visible: boolean;
  onClose: () => void;
  onJournalSelect: (journal: Journal) => void;
  journals: Journal[];
}

const GroupPickerOverlay: React.FC<GroupPickerOverlayProps> = ({
  visible,
  onClose,
  onJournalSelect,
  journals,
}) => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const renderGroupItem = ({ item }: { item: Journal }) => (
    <TouchableOpacity
      style={styles.groupItem}
      onPress={() => onJournalSelect(item)}
    >
      <Avatar size={40} source={{ uri: item.icon }} />
      <Text style={styles.groupName}>{item.name}</Text>
    </TouchableOpacity>
  );
  const handleCreateOrJoinPress = () => {
    navigation.navigate("ExpandBitebook");
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
