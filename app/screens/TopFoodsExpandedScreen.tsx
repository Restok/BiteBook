import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Text, Colors } from "react-native-ui-lib";
import { Container, NavigationAction } from "../components/ui";
import { TopNavigation } from "@ui-kitten/components";
import { getUserFoodsByCategory, UserFood } from "../services/getUserFoods";

const TopFoodsExpandedScreen: React.FC = () => {
  const [foodsByCategory, setFoodsByCategory] = useState<
    Record<string, UserFood[]>
  >({});

  useEffect(() => {
    const fetchFoodsByCategory = async () => {
      const foods = await getUserFoodsByCategory();
      setFoodsByCategory(foods);
    };

    fetchFoodsByCategory();
  }, []);

  const getScoreColor = (score: string) => {
    switch (score) {
      case "green":
        return Colors.green40;
      case "yellow":
        return Colors.yellow40;
      case "orange":
        return Colors.orange40;
      case "red":
        return Colors.red40;
      default:
        return Colors.grey30;
    }
  };
  return (
    <Container>
      <TopNavigation
        style={{ backgroundColor: "transparent" }}
        title="Top Foods"
        accessoryLeft={() => (
          <NavigationAction
            icon={"arrow-back-outline"}
            size="giant"
            status="placeholder"
            tintColor={Colors.grey20}
          />
        )}
      />
      <ScrollView style={styles.container}>
        {Object.entries(foodsByCategory).map(([category, foods]) => (
          <View key={category} style={styles.categoryContainer}>
            <Text style={styles.categoryTitle}>{category}</Text>
            <View style={styles.foodsContainer}>
              {foods.map((food, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.foodItem,
                    { backgroundColor: getScoreColor(food.score) },
                  ]}
                  onPress={() => {
                    // Handle food item press
                  }}
                >
                  <Text style={styles.foodEmoji}>{food.emoji}</Text>
                  <Text style={styles.foodName}>{food.name}</Text>
                  <Text style={styles.foodCount}>x{food.count}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  categoryContainer: {
    marginBottom: 20,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  foodsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    borderRadius: 5,
    borderColor: Colors.black,
    borderWidth: 2,
    padding: 10,
  },
  foodItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    marginBottom: 5,
    marginRight: 5,
    borderRadius: 5,
    flexShrink: 1,
  },
  foodEmoji: {
    fontSize: 20,
    marginRight: 5,
    color: Colors.white,
  },
  foodName: {
    fontSize: 16,
    color: Colors.white,
    fontWeight: "bold",
  },
  foodCount: {
    fontSize: 16,
    marginLeft: 5,
    fontWeight: "bold",
    color: Colors.white,
  },
});

export default TopFoodsExpandedScreen;
