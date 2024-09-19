import React, { useEffect, useState } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Text, Colors } from "react-native-ui-lib";
import { Icon } from "@ui-kitten/components";
import Card from "../ui/Card";
import { getUserTopFoods, UserFood } from "../../services/getUserFoods";

const TopFoodsCard: React.FC<{ onPress: () => void }> = ({ onPress }) => {
  const [topFoods, setTopFoods] = useState<UserFood[]>([]);

  useEffect(() => {
    const fetchTopFoods = async () => {
      const foods = await getUserTopFoods(5);
      setTopFoods(foods);
    };

    fetchTopFoods();
  }, []);

  return (
    <Card>
      <View style={styles.header}>
        <Text style={styles.title}>Top Foods</Text>
        <TouchableOpacity activeOpacity={0.5} onPress={onPress}>
          <Icon name={"arrow-circle-right"} style={styles.icon} />
        </TouchableOpacity>
      </View>
      <View style={styles.foodsContainer}>
        {topFoods.map((food, index) => (
          <View key={index} style={styles.foodItem}>
            <Text style={styles.foodEmoji}>{food.emoji}</Text>
            <Text style={styles.foodName}>{food.name}</Text>
            <Text style={styles.foodCount}>{food.count}</Text>
          </View>
        ))}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  icon: {
    width: 32,
    height: 32,
    tintColor: Colors.$iconPrimaryLight,
  },
  foodsContainer: {
    marginTop: 10,
  },
  foodItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  foodEmoji: {
    fontSize: 20,
    marginRight: 10,
  },
  foodName: {
    flex: 1,
    fontSize: 16,
  },
  foodCount: {
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default TopFoodsCard;
