import React, { useState, useEffect } from "react";
import { View, ScrollView } from "react-native";
import {
  Layout,
  StyleService,
  useStyleSheet,
  Button,
  ButtonGroup,
} from "@ui-kitten/components";
import {
  VictoryBar,
  VictoryChart,
  VictoryAxis,
  VictoryTooltip,
} from "victory-native";
import Text from "../components/Text";
import {
  getUserHealthScores,
  HealthScore,
  Period,
} from "../services/getUserHealthScores";

const HealthScoreChartScreen: React.FC = () => {
  const [healthScores, setHealthScores] = useState<HealthScore[]>([]);
  const [period, setPeriod] = useState<Period>("daily");
  const styles = useStyleSheet(themedStyles);

  useEffect(() => {
    fetchHealthScores();
  }, [period]);

  const fetchHealthScores = async () => {
    const endDate = new Date();
    let startDate = new Date(endDate);

    switch (period) {
      case "daily":
        startDate.setDate(startDate.getDate() - 30);
        break;
      case "weekly":
        startDate.setDate(startDate.getDate() - 90);
        break;
      case "monthly":
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
    }

    const scores = await getUserHealthScores(period, startDate, endDate);
    setHealthScores(scores);
  };

  return (
    <Layout style={styles.container}>
      <Text category="h5" style={styles.title}>
        Health Score Chart
      </Text>
      <ButtonGroup style={styles.buttonGroup}>
        <Button onPress={() => setPeriod("daily")}>Daily</Button>
        <Button onPress={() => setPeriod("weekly")}>Weekly</Button>
        <Button onPress={() => setPeriod("monthly")}>Monthly</Button>
      </ButtonGroup>
      <ScrollView horizontal>
        <VictoryChart
          height={300}
          width={Math.max(healthScores.length * 30, 300)}
          padding={{ top: 20, bottom: 30, left: 40, right: 20 }}
        >
          <VictoryAxis
            tickFormat={(t) => t.split("-")[2]}
            style={{
              tickLabels: { angle: -45, fontSize: 8 },
            }}
          />
          <VictoryAxis dependentAxis tickFormat={(t) => Math.round(t)} />
          <VictoryBar
            data={healthScores}
            x="date"
            y="totalScore"
            style={{
              data: {
                fill: ({ datum }) => {
                  if (datum.totalScore >= 80) return "green";
                  if (datum.totalScore >= 60) return "yellow";
                  if (datum.totalScore >= 40) return "orange";
                  return "red";
                },
              },
            }}
            labelComponent={
              <VictoryTooltip
                flyoutStyle={{
                  stroke: "black",
                  fill: "white",
                }}
              />
            }
          />
        </VictoryChart>
      </ScrollView>
    </Layout>
  );
};

const themedStyles = StyleService.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    marginBottom: 16,
  },
  buttonGroup: {
    marginBottom: 16,
  },
});

export default HealthScoreChartScreen;
