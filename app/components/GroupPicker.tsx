import React, { useState } from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import { Text, Avatar, Colors } from "react-native-ui-lib";
import GroupPickerOverlay from "./groups/GroupPickerOverlay";

interface Group {
  id: string;
  name: string;
  icon: string;
}

const GroupPicker: React.FC<{ onGroupSelect: (group: Group) => void }> = ({
  onGroupSelect,
}) => {
  const [selectedGroup, setSelectedGroup] = useState({
    id: "user",
    name: "You",
    icon: "👤",
  });
  const [overlayVisible, setOverlayVisible] = useState(false);

  const handleGroupSelect = (group: Group) => {
    setSelectedGroup(group);
    setOverlayVisible(false);
    onGroupSelect(group);
  };

  return (
    <>
      <TouchableOpacity
        style={styles.picker}
        onPress={() => setOverlayVisible(true)}
      >
        <Avatar size={30} label={selectedGroup.icon} />
        <Text style={styles.pickerText}>{selectedGroup.name}</Text>
      </TouchableOpacity>

      <GroupPickerOverlay
        visible={overlayVisible}
        onClose={() => setOverlayVisible(false)}
        onGroupSelect={handleGroupSelect}
      />
    </>
  );
};

const styles = StyleSheet.create({
  picker: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: Colors.grey70,
    borderRadius: 20,
  },
  pickerText: {
    marginLeft: 10,
    fontSize: 16,
  },
});

export default GroupPicker;
