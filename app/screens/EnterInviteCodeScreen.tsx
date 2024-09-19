import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { Text, Colors, Button, TextField } from "react-native-ui-lib";
import { Ionicons } from "@expo/vector-icons";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../types/navigation";
import { getJournalFromInviteCode } from "../services/getJournalFromInviteCode";
import { useNavigation } from "@react-navigation/native";
import { TopNavigation } from "@ui-kitten/components";
import { NavigationAction } from "../components/ui";
import { useLoading } from "../contexts/LoadingContext";

const EnterInviteCodeScreen: React.FC<{}> = ({}) => {
  const [inviteCode, setInviteCode] = useState("");
  const { isLoading, setIsLoading } = useLoading();
  const onClose = () => navigation.goBack();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const handleJoinJournal = async () => {
    setIsLoading(true);
    try {
      const journal = await getJournalFromInviteCode(inviteCode.trim());
      if (journal) {
        navigation.navigate("JoinJournal", { journal });
      } else {
        // Show error message for invalid invite code
        Alert.alert("Error", "Invalid invite code. Please try again.");
      }
    } catch (error) {
      console.error("Error fetching journal:", error);
      Alert.alert("Error", "An error occurred.");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <View style={styles.container}>
      <View>
        <NavigationAction
          icon={"arrow-back-outline"}
          size="giant"
          status="placeholder"
          tintColor={Colors.grey20}
        />
        <View style={{ justifyContent: "center", alignItems: "center" }}>
          <Text style={styles.title}>Join a Journal</Text>
          <Text style={styles.subtitle}>Enter an invite code</Text>
          <TextField
            placeholder="Invite code"
            value={inviteCode}
            onChangeText={setInviteCode}
            style={styles.input}
          />
        </View>
      </View>

      <Button
        label="Join Journal"
        style={styles.button}
        backgroundColor={Colors.purple30}
        onPress={handleJoinJournal}
        disabled={!inviteCode.trim() || isLoading}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    paddingHorizontal: 20,
    justifyContent: "space-between",
    paddingVertical: 40,
    paddingBottom: 40,
  },
  closeButton: {
    position: "absolute",
    top: 40,
    right: 20,
    zIndex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 60,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 40,
    color: Colors.grey30,
  },
  input: {
    width: 230,
    borderRadius: 10,
    marginTop: 20,
    padding: 20,
    fontSize: 18,
    textAlign: "center",
    height: 50,
    borderWidth: 1,
  },
  button: {
    width: "100%",
    height: 50,
    borderRadius: 25,
  },
});

export default EnterInviteCodeScreen;
