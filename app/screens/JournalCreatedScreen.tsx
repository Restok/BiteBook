import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Text, Colors, Button } from "react-native-ui-lib";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import * as Sharing from "expo-sharing";
import { Journal } from "../types/journal";
import { RootStackParamList } from "../types/navigation";
import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp, useNavigation } from "@react-navigation/native";

type JournalCreatedScreenRouteProp = RouteProp<
  RootStackParamList,
  "JournalCreated"
>;

interface JournalCreatedScreenProps {
  route: JournalCreatedScreenRouteProp;
}

const JournalCreatedScreen: React.FC<JournalCreatedScreenProps> = ({
  route,
}) => {
  // const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const { journal } = route.params;
  console.log("WE SHOULD BE HERE");

  const handleCopy = async () => {
    await Clipboard.setStringAsync(journal.inviteCode);
  };
  const handleShare = async () => {
    await Sharing.shareAsync(
      `Join my journal "${journal.name}" with invite code: ${journal.inviteCode}`
    );
  };
  const onClose = () => {
    // navigation.navigate("Home");
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={onClose}>
        <Ionicons name="arrow-back" size={24} color={Colors.black} />
      </TouchableOpacity>
      <Text style={styles.title}>Success!</Text>
      <View style={styles.iconContainer}>
        <Ionicons name="image-outline" size={48} color={Colors.grey30} />
      </View>
      <Text style={styles.journalName}>{journal.name}</Text>
      <Text style={styles.shareText}>
        Share the invite code with your friends!
      </Text>
      <View style={styles.inviteCodeContainer}>
        <Text style={styles.inviteCode}>{journal.inviteCode}</Text>
        <View style={styles.buttonContainer}>
          <Button
            style={[styles.button, styles.copyButton]}
            label="Copy"
            labelStyle={styles.buttonLabel}
            iconSource={() => (
              <Ionicons name="copy-outline" size={20} color={Colors.purple30} />
            )}
            onPress={handleCopy}
          />
          <Button
            style={[styles.button, styles.shareButton]}
            label="Share"
            labelStyle={styles.buttonLabel}
            iconSource={() => (
              <Ionicons name="share-outline" size={20} color={Colors.white} />
            )}
            onPress={handleShare}
          />
        </View>
      </View>
      <Button
        label="Done!"
        style={styles.doneButton}
        backgroundColor={Colors.green30}
        onPress={onClose}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    paddingTop: 40,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  backButton: {
    position: "absolute",
    top: 40,
    left: 20,
    zIndex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 40,
    marginBottom: 20,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.grey70,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  journalName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
  },
  shareText: {
    fontSize: 16,
    color: Colors.grey30,
    marginBottom: 10,
  },
  inviteCodeContainer: {
    width: "100%",
    marginBottom: 30,
  },
  inviteCode: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  button: {
    flex: 1,
    height: 40,
    borderRadius: 20,
    marginHorizontal: 5,
  },
  copyButton: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.purple30,
  },
  shareButton: {
    backgroundColor: Colors.purple30,
  },
  buttonLabel: {
    fontSize: 14,
    fontWeight: "bold",
  },
  doneButton: {
    width: "100%",
    height: 50,
    borderRadius: 25,
  },
});

export default JournalCreatedScreen;
