import React, { useState, useCallback, useEffect } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Text, Button, Colors, Icon } from "react-native-ui-lib";
import {
  useFocusEffect,
  useIsFocused,
  useNavigation,
} from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { useJournalContext } from "../contexts/JournalContext";

import VerticalTimeline from "../components/VerticalTimeline";
import GroupPicker from "../components/GroupPicker";
import CreatePostModal from "../components/post/CreatePostModal";
import GroupPickerOverlay from "../components/journals/GroupPickerOverlay";
import { Journal } from "../types/journal";
import { RootStackParamList } from "../types/navigation";
import { Ionicons } from "@expo/vector-icons";
import JournalSettingsModal from "../components/journals/JournalSettingsModal";

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const isFocused = useIsFocused();
  const {
    selectedJournal,
    journals,
    setSelectedJournal,
    loadJournals,
    loadEntriesForDate,
  } = useJournalContext();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isGroupPickerOverlayVisible, setGroupPickerOverlayVisible] =
    useState(false);
  const [isSettingsModalVisible, setIsSettingsModalVisible] = useState(false);

  const handleCloseSettingsModal = useCallback(() => {
    setIsSettingsModalVisible(false);
  }, []);

  const currentDate = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    weekday: "short",
  });

  useFocusEffect(
    useCallback(() => {
      if (isFocused) {
        loadJournals();
        setIsModalVisible(false);
        setGroupPickerOverlayVisible(false);
      }
    }, [isFocused, loadJournals])
  );
  useEffect(() => {
    if (!isFocused) {
      setIsModalVisible(false);
      setGroupPickerOverlayVisible(false);
      setIsSettingsModalVisible(false);
    }
  }, [isFocused]);

  const handleJournalSelect = useCallback(
    async (journal: Journal) => {
      setSelectedJournal(journal);
      setGroupPickerOverlayVisible(false);
    },
    [setSelectedJournal]
  );

  const handleAddPost = useCallback(() => {
    setIsModalVisible(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalVisible(false);
  }, []);

  const handleSubmitPost = useCallback(() => {
    setIsModalVisible(false);
    loadEntriesForDate(new Date());
  }, []);
  const handleSettingsPress = useCallback(() => {
    // TODO: Implement settings navigation or modal
    setIsSettingsModalVisible(true);
  }, []);

  const handleEntryPress = useCallback(
    (post) => {
      navigation.navigate("ExpandedPost", { post });
    },
    [navigation]
  );

  const handleJournalLeft = useCallback(() => {
    setSelectedJournal(null);
    loadJournals();
  }, [loadJournals]);

  const handleOpenGroupPicker = useCallback(() => {
    setGroupPickerOverlayVisible(true);
  }, []);

  const handleCloseGroupPicker = useCallback(() => {
    setGroupPickerOverlayVisible(false);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <GroupPicker
          selectedJournal={selectedJournal}
          onOpenPicker={handleOpenGroupPicker}
        />
        <TouchableOpacity onPress={handleSettingsPress}>
          <Ionicons name="settings-outline" size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>
      <View style={styles.listContainer}>
        <Text text40BL style={styles.dateText}>
          {currentDate}
        </Text>
        <VerticalTimeline onEntryPress={handleEntryPress} />
      </View>
      <CreatePostModal
        visible={isModalVisible}
        onClose={handleCloseModal}
        onSubmit={handleSubmitPost}
      />
      <Button
        text40R
        label="+"
        size={Button.sizes.large}
        backgroundColor={Colors.primary}
        style={styles.addButton}
        round
        onPress={handleAddPost}
      />
      {isGroupPickerOverlayVisible && (
        <GroupPickerOverlay
          visible={isGroupPickerOverlayVisible}
          onClose={handleCloseGroupPicker}
          onJournalSelect={handleJournalSelect}
          journals={journals}
        />
      )}
      {selectedJournal && (
        <JournalSettingsModal
          journal={selectedJournal}
          visible={isSettingsModalVisible}
          onClose={handleCloseSettingsModal}
          onJournalLeft={handleJournalLeft}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  listContainer: {
    flex: 1,
    paddingLeft: 20,
  },
  dateText: {
    textAlign: "left",
    paddingBottom: 25,
  },
  addButton: {
    position: "absolute",
    bottom: 20,
    alignSelf: "center",
    width: 60,
    height: 60,
    textAlign: "center",
    textAlignVertical: "center",
  },
});

export default HomeScreen;
