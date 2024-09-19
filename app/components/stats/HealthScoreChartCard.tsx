import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import {
  getUserHealthScores,
  HealthScore,
} from "../../services/getUserHealthScores";
import { Bar, CartesianChart, Line } from "victory-native";
import { useFont } from "@shopify/react-native-skia";
import { Inter_400Regular, Inter_900Black } from "@expo-google-fonts/inter";
import { Colors } from "react-native-ui-lib";
import { Icon } from "@ui-kitten/components";
import { Ionicons } from "@expo/vector-icons";
import Card from "../ui/Card";
import HealthScoreChart from "./HealthScoreChart";
const HealthScoreChartCard: React.FC<{ onPress: () => void }> = ({
  onPress,
}) => {
  const [healthScores, setHealthScores] = useState([
    { date: "", score: 0, i: 0, target: 1 },
  ]);
  const font = useFont(Inter_400Regular, 16);
  const endDate = new Date();
  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - 6);

  useEffect(() => {
    const fetchHealthScores = async () => {
      const scores = await getUserHealthScores("daily", startDate, endDate);

      setHealthScores(scores);
    };

    fetchHealthScores();
  }, []);

  return (
    <Card>
      <View style={styles.header}>
        <Text style={styles.title}>
          {startDate.toLocaleDateString("en-US", {
            month: "short",
            day: "2-digit",
          }) +
            " - " +
            endDate.toLocaleDateString("en-US", {
              month: "short",
              day: "2-digit",
            })}
        </Text>
        <TouchableOpacity activeOpacity={0.5} onPress={onPress}>
          <Icon name={"arrow-circle-right"} style={styles.icon} />
        </TouchableOpacity>
      </View>
      <View style={styles.chartContainer}>
        <HealthScoreChart data={healthScores} period={"daily"} />
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  chartContainer: {
    height: 200, // Set a fixed height for the chart container
  },
  noDataText: {
    fontSize: 16,
    color: "gray",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    zIndex: 10,
    marginBottom: 10,
  },
  icon: {
    width: 32,
    height: 32,
    tintColor: Colors.$iconPrimaryLight,
  },
});

export default HealthScoreChartCard;
