import React, { useEffect, useState } from "react";
import { View, StyleSheet, Image, Alert } from "react-native";
import { Text, Colors, Button } from "react-native-ui-lib";
import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp } from "@react-navigation/native";
import { RootStackParamList } from "../types/navigation";
import { joinJournal } from "../services/joinJournal";
import { getBatchUsersByIds } from "../services/getBatchUsersByIds";
import { User } from "../types/user";

type JoinJournalScreenProps = {
  navigation: StackNavigationProp<RootStackParamList, "JoinJournal">;
  route: RouteProp<RootStackParamList, "JoinJournal">;
};

const JoinJournalScreen: React.FC<JoinJournalScreenProps> = ({
  navigation,
  route,
}) => {
  const { journal } = route.params;
  const [loading, setLoading] = React.useState(false);
  const [members, setMembers] = useState<User[]>([]);

  const handleJoin = async () => {
    setLoading(true);
    try {
      await joinJournal(journal.id);
      // Navigate to the journal or update the app state as needed
      navigation.navigate("Home"); // Adjust this based on your navigation structure
    } catch (error) {
      console.error("Error joining journal:", error);
      Alert.alert("Error", "Failed to join the journal. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    const fetchMembers = async () => {
      const usersData = await getBatchUsersByIds(journal.members);
      const membersList = Object.values(usersData).filter(
        (user): user is User => user !== null
      );
      setMembers(membersList);
    };
    fetchMembers();
  }, [journal.members]);
  return (
    <View style={styles.container}>
      <View style={{ justifyContent: "center", alignItems: "center" }}>
        <Text style={styles.title}>{`Join "${journal.name}"?`}</Text>
        <View style={styles.iconContainer}>
          {journal.icon ? (
            <Image source={{ uri: journal.icon }} style={styles.icon} />
          ) : (
            <View style={styles.placeholderIcon}>
              <Text style={styles.placeholderIconText}>📷</Text>
            </View>
          )}
        </View>
        <Text style={styles.membersText}>
          {`${journal.members.length} ${
            journal.members.length === 1 ? "person is" : "people are"
          } in this group`}
        </Text>
        <View style={styles.memberIconContainer}>
          {members.slice(0, 4).map((member, index) => (
            <View key={index} style={styles.memberIconContainer}>
              {member.photoURL ? (
                <Image
                  source={{ uri: member.photoURL }}
                  style={styles.memberIcon}
                />
              ) : (
                <View style={[styles.memberIcon, styles.placeholderMemberIcon]}>
                  <Text style={styles.placeholderMemberIconText}>
                    {member.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
            </View>
          ))}
          {members.length > 4 && (
            <View style={[styles.memberIcon, styles.extraMembersIcon]}>
              <Text style={styles.extraMembersText}>+{members.length - 4}</Text>
            </View>
          )}
        </View>
      </View>
      <Button
        label="Join"
        style={styles.joinButton}
        backgroundColor={Colors.green30}
        onPress={handleJoin}
        disabled={loading}
        loading={loading}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    alignItems: "center",
    paddingHorizontal: 20,
    justifyContent: "space-between",
    paddingVertical: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 30,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.grey70,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
  },
  icon: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  placeholderIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.grey70,
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderIconText: {
    fontSize: 40,
  },
  membersText: {
    fontSize: 16,
    color: Colors.grey30,
    marginBottom: 10,
  },
  memberIconContainer: {
    marginHorizontal: 5,
    paddingBottom: 10,
  },
  memberIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  placeholderMemberIcon: {
    backgroundColor: Colors.purple30,
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderMemberIconText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: "bold",
  },
  extraMembersIcon: {
    backgroundColor: Colors.grey50,
    justifyContent: "center",
    alignItems: "center",
  },
  extraMembersText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: "bold",
  },
  joinButton: {
    width: "100%",
    height: 50,
    borderRadius: 25,
  },
});

export default JoinJournalScreen;
