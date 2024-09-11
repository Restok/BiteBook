import React from "react";
import { TouchableOpacity, StyleSheet, View } from "react-native";
import { Text, Avatar, Colors } from "react-native-ui-lib";
import { Journal } from "../types/journal";

interface GroupPickerProps {
  selectedJournal: Journal | null;
  onOpenPicker: () => void;
}

const GroupPicker: React.FC<GroupPickerProps> = ({
  selectedJournal,
  onOpenPicker,
}) => {
  return (
    <TouchableOpacity style={styles.pickerContainer} onPress={onOpenPicker}>
      {selectedJournal && (
        <Avatar
          size={40}
          source={{ uri: selectedJournal.icon }}
          containerStyle={styles.avatar}
        />
      )}
      <Text style={styles.pickerText}>
        {selectedJournal?.name || "Select Journal"}
      </Text>
      {/* <Text style={styles.dropdownArrow}>▼</Text> */}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  pickerContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.$iconPrimaryLight,
    padding: 5,
    marginVertical: 15,
    borderRadius: 15,
    minWidth: "40%",
  },
  avatar: {
    marginRight: 10,
  },
  pickerText: {
    fontSize: 14,
    fontWeight: "bold",
    color: Colors.white,
    // textDecorationLine: "underline",
    marginRight: 10,
  },
  dropdownArrow: {
    color: Colors.white,
    fontSize: 20,
  },
});

export default GroupPicker;
