import React from "react";
import { View, StyleSheet } from "react-native";
import { Text, Avatar } from "react-native-ui-lib";
import { useUserContext } from "../../contexts/UserContext";
import auth from "@react-native-firebase/auth";

interface UserIconProps {
  userId?: string;
  size?: number;
  styles?: any;
  includeName?: boolean;
}

const UserIcon: React.FC<UserIconProps> = ({
  userId,
  size = 48,
  styles: customStyles,
  includeName = false,
}) => {
  const { journalUsersById } = useUserContext();
  const currentUserId = auth().currentUser?.uid;
  const user = userId
    ? journalUsersById[userId]
    : journalUsersById[currentUserId || ""];

  return (
    <View style={[styles.userInfo, customStyles]}>
      <Avatar source={{ uri: user?.photoURL }} size={size} />
      {includeName && <Text style={styles.userName}>{user?.name}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  userName: {
    color: "white",
    marginLeft: 10,
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default UserIcon;
