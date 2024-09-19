import React, { useState, useEffect, useCallback } from "react";
import { View, FlatList, StyleSheet, Dimensions } from "react-native";
import {
  getUserHealthScores,
  HealthScore,
} from "../services/getUserHealthScores";
import HealthScoreChart from "../components/stats/HealthScoreChart";
import moment from "moment-timezone";
import { Container, NavigationAction } from "../components/ui";
import { useUserContext } from "../contexts/UserContext";
import { TopNavigation } from "@ui-kitten/components";
import { Colors } from "react-native-ui-lib";

const ITEMS_PER_PAGE = 4; // Number of 7-day charts to display per page
const SCREEN_WIDTH = Dimensions.get("window").width;

const HealthScoreExpandedScreen: React.FC = () => {
  const [healthScores, setHealthScores] = useState<HealthScore[][]>([]);
  const { currentUser } = useUserContext();
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const fetchHealthScores = useCallback(async () => {
    if (loading || !hasMore || !currentUser) return;

    setLoading(true);
    const endDate =
      healthScores.length > 0
        ? moment(healthScores[healthScores.length - 1][0].date)
            .subtract(1, "day")
            .toDate()
        : new Date();
    const startDate = moment(endDate)
      .subtract(ITEMS_PER_PAGE * 7 - 1, "days")
      .toDate();
    const minStartDate = currentUser.createdAt.toDate();
    try {
      let actualStartDate = startDate;
      if (startDate < minStartDate) {
        actualStartDate = minStartDate;
      }

      const newScores = await getUserHealthScores(
        "daily",
        actualStartDate,
        endDate
      );
      const groupedScores = groupScoresByWeek(newScores);

      setHasMore(startDate > minStartDate);

      setHealthScores((prevScores) => [...prevScores, ...groupedScores]);
    } catch (error) {
      console.error("Error fetching health scores:", error);
    } finally {
      setLoading(false);
    }
  }, [healthScores, loading, hasMore]);

  useEffect(() => {
    fetchHealthScores();
  }, []);

  const groupScoresByWeek = (scores: HealthScore[]): HealthScore[][] => {
    const grouped: HealthScore[][] = [];
    let currentWeek: HealthScore[] = [];

    scores.forEach((score, index) => {
      currentWeek.push(score);
      if (currentWeek.length === 7 || index === scores.length - 1) {
        grouped.push(currentWeek);
        currentWeek = [];
      }
    });
    return grouped.reverse();
  };

  const renderItem = ({ item }: { item: HealthScore[] }) => (
    <View
      style={[
        styles.chartContainer,
        { width: (item.length / 7) * SCREEN_WIDTH },
      ]}
    >
      <HealthScoreChart data={item} period={"daily"} />
    </View>
  );

  return (
    <Container>
      <TopNavigation
        style={{ backgroundColor: "transparent" }}
        accessoryLeft={() => {
          return (
            <NavigationAction
              icon={"arrow-back-outline"}
              size="giant"
              status="placeholder"
              tintColor={Colors.grey20}
            />
          );
        }}
      />
      <FlatList
        data={healthScores}
        inverted
        horizontal
        renderItem={renderItem}
        keyExtractor={(item) => item[0].date}
        onEndReached={fetchHealthScores}
        onEndReachedThreshold={0.5}
        style={styles.container}
      />
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  chartContainer: {
    height: 500,
    width: SCREEN_WIDTH,
    marginVertical: 10,
    // padding: ,
    // marginHorizontal: -10,
  },
});

export default HealthScoreExpandedScreen;
