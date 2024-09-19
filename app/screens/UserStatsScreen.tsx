import React from "react";
import { View, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import HealthScoreChartCard from "../components/stats/HealthScoreChartCard";
import { Container, NavigationAction } from "../components/ui";
import { TopNavigation } from "@ui-kitten/components";
import { Colors, Text } from "react-native-ui-lib";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../types/navigation";
import TopFoodsCard from "../components/stats/TopFoodsCard";

const UserStatsScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const handleChartPress = () => {
    navigation.navigate("HealthScoreExpanded");
  };
  const handleTopFoodsPress = () => {
    navigation.navigate("TopFoodsExpanded");
  };
  return (
    <Container>
      <TopNavigation
        style={{ backgroundColor: "transparent" }}
        title={"Stats"}
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
      <View style={styles.container}>
        <Text text60 style={{ paddingBottom: 15 }}>
          Daily Health Score
        </Text>
        <HealthScoreChartCard onPress={handleChartPress} />
        <Text text60 style={{ paddingBottom: 15, paddingTop: 25 }}>
          Food History
        </Text>
        <TopFoodsCard onPress={handleTopFoodsPress} />

        {/* Add more components or stats here */}
      </View>
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 25,
  },
});

export default UserStatsScreen;
