import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import {
  getUserHealthScores,
  HealthScore,
} from "../../services/getUserHealthScores";
import { Bar, CartesianChart, CartesianChartRenderArg } from "victory-native";

interface HealthScoreChartCardProps {
  onPress: () => void;
}

const HealthScoreChartCard: React.FC<HealthScoreChartCardProps> = ({
  onPress,
}) => {
  const [healthScores, setHealthScores] = useState<HealthScore[]>([]);

  useEffect(() => {
    const fetchHealthScores = async () => {
      const endDate = new Date();
      const startDate = new Date(endDate);
      startDate.setDate(startDate.getDate() - 6);
      const scores = await getUserHealthScores("daily", startDate, endDate);
      setHealthScores(scores);
    };

    fetchHealthScores();
  }, []);

  return (
    <TouchableOpacity onPress={onPress} style={styles.card}>
      <Text style={styles.title}>Weekly Health Scores</Text>
      <CartesianChart data={healthScores} xKey={"date"} yKeys={["score"]}>
        {({ points, chartBounds }) => (
          <Bar
            points={points.score}
            chartBounds={chartBounds}
            color="red"
            roundedCorners={{ topLeft: 10, topRight: 10 }}
          />
        )}
      </CartesianChart>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 16,
    margin: 16,
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
});

export default HealthScoreChartCard;
