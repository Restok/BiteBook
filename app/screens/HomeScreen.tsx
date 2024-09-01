import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { Text, Button, Colors } from "react-native-ui-lib";
import VerticalTimeline from "../components/VerticalTimeline";
import GroupPicker from "../components/GroupPicker";
import CreatePostModal from "../components/post/CreatePostModal";

const HomeScreen: React.FC = () => {
  const [selectedGroup, setSelectedGroup] = useState({
    id: "user",
    name: "You",
    icon: "👤",
  });

  const currentDate = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    weekday: "short",
  });

  const [isModalVisible, setIsModalVisible] = useState(false);

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
    // Handle the new post submission here
    console.log("New post:", post);
    // You can add the new post to your data source or send it to an API
  };

  return (
    <View style={styles.container}>
      <View style={styles.listContainer}>
        <GroupPicker onGroupSelect={setSelectedGroup} />
        <Text text30BL style={styles.dateText}>
          {currentDate}
        </Text>
        <VerticalTimeline />
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  listContainer: {
    paddingTop: 50,
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
