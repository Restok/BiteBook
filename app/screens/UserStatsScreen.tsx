import React from "react";
import { View, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import HealthScoreChartCard from "../components/stats/HealthScoreChartCard";

const UserStatsScreen: React.FC = () => {
  const navigation = useNavigation();

  const handleChartPress = () => {
    // navigation.navigate('ExpandedChart');
  };

  return (
    <View style={styles.container}>
      <HealthScoreChartCard onPress={handleChartPress} />
      {/* Add more components or stats here */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
});

export default UserStatsScreen;
