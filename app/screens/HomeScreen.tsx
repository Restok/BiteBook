import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { Text, Button, Colors } from "react-native-ui-lib";
import VerticalTimeline from "../components/VerticalTimeline";
import GroupPicker from "../components/GroupPicker";
import CreatePostModal from "../components/post/CreatePostModal";
import ExpandedPostOverlay from "../components/post/ExpandedPostOverlay";

const HomeScreen: React.FC = () => {
  const [selectedJournal, setSelectedJournal] = useState({
    id: "user",
    name: "You",
    icon: "👤",
  });

  const [journals, setJournals] = useState([
    { id: "user", name: "You", icon: "👤" },
    { id: "group1", name: "Family", icon: "👨‍👩‍👧‍👦" },
    { id: "group2", name: "Friends", icon: "👥" },
    // Add more journals as needed
  ]);

  const currentDate = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    weekday: "short",
  });

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isOverlayVisible, setOverlayVisible] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);

  const handleAddPost = () => {
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
  };

  const handleSubmitPost = (post: {
    images: string[];
    title: string;
    type: string;
  }) => {
    console.log("New post:", post);
  };

  const handleEntryPress = (post) => {
    setSelectedPost(post);
    setOverlayVisible(true);
  };

  return (
    <View style={styles.container}>
      <View style={styles.listContainer}>
        <GroupPicker onGroupSelect={setSelectedJournal} />
        <Text text30BL style={styles.dateText}>
          {currentDate}
        </Text>
        <VerticalTimeline onEntryPress={handleEntryPress} />
      </View>
      <CreatePostModal
        visible={isModalVisible}
        onClose={handleCloseModal}
        onSubmit={handleSubmitPost}
        journals={journals}
        currentJournal={selectedJournal}
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
      <ExpandedPostOverlay
        visible={isOverlayVisible}
        onClose={() => setOverlayVisible(false)}
        // post={selectedPost}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  listContainer: {
    paddingTop: 15,
    flex: 1,
  },
  dateText: {
    textAlign: "left",
    marginBottom: 16,
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
