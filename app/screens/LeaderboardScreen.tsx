import React, { useEffect, useState } from "react";
import { View, StyleSheet, FlatList, Image } from "react-native";
import { Text, Colors, SegmentedControl, Avatar } from "react-native-ui-lib";
import { Container, NavigationAction } from "../components/ui";
import { TopNavigation } from "@ui-kitten/components";
import { useJournalContext } from "../contexts/JournalContext";
import { useUserContext } from "../contexts/UserContext";
import { LeaderboardEntry, LeaderboardType } from "../services/getLeaderboard";
const dummyLeaderboard = [
  { id: "1", points: 1000 },
  { id: "2", points: 950 },
  { id: "3", points: 900 },
  { id: "4", points: 850 },
  { id: "5", points: 800 },
  { id: "6", points: 750 },
  { id: "7", points: 700 },
  { id: "8", points: 650 },
  { id: "9", points: 600 },
  { id: "10", points: 550 },
];
const LeaderboardScreen: React.FC = () => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const segments = [
    { label: "Daily" },
    { label: "Monthly" },
    { label: "All Time" },
  ];
  const { leaderboard, loadLeaderboard, isLoading } = useJournalContext();
  const { journalUsersById } = useUserContext();

  const leaderboardTypes: LeaderboardType[] = ["daily", "monthly", "allTime"];

  useEffect(() => {
    loadLeaderboard(leaderboardTypes[selectedIndex]);
  }, [selectedIndex, loadLeaderboard]);

  const podiumColors = [Colors.yellow30, Colors.grey50, Colors.orange40];

  const renderPodium = () => (
    <View style={styles.podium}>
      {[1, 0, 2].map((place, index) => {
        const entry = leaderboard[place];
        if (!entry) return null;
        const user = journalUsersById[entry.id];
        const isFirstPlace = place === 0;
        return (
          <View
            key={entry.id}
            style={[
              styles.podiumItem,
              isFirstPlace ? styles.firstPlace : styles.otherPlace,
            ]}
          >
            <Image
              source={{
                uri: user?.photoURL || `https://via.placeholder.com/100x100`,
              }}
              style={[
                styles.avatarContainer,
                {
                  borderColor: podiumColors[place],
                  width: isFirstPlace ? 120 : 80,
                  aspectRatio: 1,
                },
              ]}
            />
            <View
              style={[
                styles.rankContainer,
                { backgroundColor: podiumColors[place] },
              ]}
            >
              <Text style={styles.podiumRank}>{place + 1}</Text>
            </View>
            <Text style={styles.points}>{entry.points}</Text>

            <Text style={styles.podiumName}>{user?.name || "Unknown"}</Text>
          </View>
        );
      })}
    </View>
  );
  const renderListItem = ({
    item,
  }: {
    item: LeaderboardEntry;
    index: number;
  }) => {
    const user = journalUsersById[item.id];
    return (
      <View style={styles.listItem}>
        <Avatar
          source={{
            uri: user?.photoURL || `https://via.placeholder.com/50x50`,
          }}
          size={50}
        />
        <Text style={styles.name}>{user?.name || "Unknown"}</Text>
        <Text style={styles.points}>{item.points}</Text>
      </View>
    );
  };

  return (
    <Container>
      <TopNavigation
        title="Leaderboard"
        accessoryLeft={() => (
          <NavigationAction
            icon={"arrow-back-outline"}
            size="giant"
            status="placeholder"
            backgroundColor={Colors.transparent}
            tintColor={Colors.grey20}
          />
        )}
      />
      <Container useSafeArea={false} style={{ paddingHorizontal: 20 }}>
        <SegmentedControl
          segments={segments}
          onChangeIndex={setSelectedIndex}
          style={styles.segmentedControl}
          initialIndex={selectedIndex}
        />
        {isLoading ? (
          <Text>Loading...</Text>
        ) : (
          <>
            {renderPodium()}
            <FlatList
              data={leaderboard.slice(3)}
              renderItem={renderListItem}
              keyExtractor={(item) => item.id}
              style={styles.list}
            />
          </>
        )}
      </Container>
    </Container>
  );
};

const styles = StyleSheet.create({
  title: {
    textAlign: "center",
    marginVertical: 20,
  },
  segmentedControl: {
    marginBottom: 20,
  },
  podium: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
    height: 200, // Adjust this value as needed
  },
  podiumItem: {
    alignItems: "center",
  },
  firstPlace: {
    zIndex: 2,
  },
  otherPlace: {
    marginTop: 30,
  },
  avatarContainer: {
    borderRadius: 100,
    borderWidth: 3,
  },
  podiumName: {
    fontSize: 14,
    marginTop: 10,
    textAlign: "center",
    fontWeight: "bold",
  },
  rankContainer: {
    backgroundColor: Colors.yellow30,
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
    marginTop: -15,
  },
  podiumRank: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 10,
  },

  podiumPoints: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  podiumBase: {
    width: 80,
    justifyContent: "center",
    alignItems: "center",
  },

  list: {
    flex: 1,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.grey60,
  },
  rank: {
    width: 30,
    fontSize: 16,
    fontWeight: "bold",
  },
  listAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  name: {
    padding: 10,
    flex: 1,
    fontSize: 16,
  },
  points: {
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default LeaderboardScreen;
