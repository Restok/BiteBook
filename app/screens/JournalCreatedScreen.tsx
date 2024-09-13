import React from "react";
import { View, StyleSheet, TouchableOpacity, Share, Image } from "react-native";
import { Text, Colors, Button } from "react-native-ui-lib";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
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
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const { journal } = route.params;

  const handleCopy = async () => {
    await Clipboard.setStringAsync(journal.inviteCode);
  };
  const handleShare = async () => {
    try {
      const result = await Share.share({
        message: `Join my journal "${journal.name}" with invite code: ${journal.inviteCode}`,
      });
      if (result.action === Share.sharedAction) {
        console.log("Shared successfully");
      } else if (result.action === Share.dismissedAction) {
        console.log("Share dismissed");
      }
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };
  const onClose = () => {
    navigation.navigate("Home");
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={onClose}>
        <Ionicons name="arrow-back" size={24} color={Colors.black} />
      </TouchableOpacity>
      <View style={{ alignItems: "center" }}>
        <Text style={styles.title}>Success!</Text>

        <Image source={{ uri: journal.icon }} style={styles.icon} />

        <Text style={styles.journalName}>{journal.name}</Text>
      </View>

      <View style={styles.inviteCodeContainer}>
        <Text style={styles.shareText}>
          Share the invite code with your friends!
        </Text>
        <Text style={styles.inviteCode}>{journal.inviteCode}</Text>
        <View style={styles.buttonContainer}>
          <Button
            style={[styles.button, styles.copyButton]}
            label="Copy"
            labelStyle={[styles.buttonLabel, { color: Colors.purple30 }]}
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
      <View style={styles.bottomContainer}>
        <Button
          label="Done!"
          style={styles.doneButton}
          backgroundColor={Colors.green30}
          onPress={onClose}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "space-between",
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
    overflow: "hidden", // Add this line
  },
  icon: {
    width: 100,
    height: 100,
    borderRadius: 40,
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
    marginBottom: 80,
    height: 200,
    justifyContent: "space-evenly",
    alignItems: "center",
  },
  inviteCode: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
    width: "100%",
    borderWidth: 1,
    borderRadius: 20,
    padding: 8,
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
    justifyContent: "center",
    alignItems: "center",
  },
  copyButton: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.purple30,
  },
  shareButton: {
    backgroundColor: Colors.purple30,
  },
  bottomContainer: {
    width: "100%",
    bottom: 20,
  },
  doneButton: {
    width: "100%",
    height: 50,
    borderRadius: 25,
  },
  buttonLabel: {
    fontSize: 14,
    textAlign: "center",
  },
});

export default JournalCreatedScreen;
