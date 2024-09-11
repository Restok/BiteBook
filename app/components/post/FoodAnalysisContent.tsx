import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import { Text, Colors, Card } from "react-native-ui-lib";
import { Entry } from "../../types/entry";
import Svg, { Path } from "react-native-svg";
import UserIcon from "../ui/UserIcon";
import Carousel from "react-native-reanimated-carousel";
import { SafeAreaView } from "react-native-safe-area-context";
import { NavigationAction } from "../ui";

interface FoodAnalysisContentProps {
  entryData: Entry;
}

const FoodAnalysisContent: React.FC<FoodAnalysisContentProps> = ({
  entryData,
}) => {
  const [displayedScore, setDisplayedScore] = useState(0);

  useEffect(() => {
    setDisplayedScore(0);
  }, []);
  useEffect(() => {
    if (entryData.points == null) return;
    const targetScore = Math.round(entryData.points);
    const duration = 1000; // Animation duration in milliseconds
    const interval = 60; // Update interval in milliseconds
    const steps = duration / interval;

    let currentStep = 0;

    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 2);

    const timer = setInterval(() => {
      currentStep++;
      const progress = easeOutCubic(currentStep / steps);
      setDisplayedScore(Math.round(targetScore * progress));
      if (currentStep >= steps) {
        clearInterval(timer);
        setDisplayedScore(targetScore); // Ensure we end on the exact target score
      }
    }, interval);

    return () => clearInterval(timer);
  }, [entryData]);

  const [selectedIngredient, setSelectedIngredient] = useState<{
    name: string;
    score: string;
    reasoning: string;
    emoji: string;
  } | null>(null);

  const renderCarouselItem = ({ item }: { item: string }) => (
    <Image
      source={{ uri: item }}
      style={styles.carouselImage}
      resizeMode="cover"
    />
  );
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

  const healthScorePercentage = useMemo(() => {
    if (entryData.overallScore == null) return 0;
    return entryData.overallScore * 100;
  }, [entryData.overallScore, entryData.entryType]);

  const StarIcon = ({ color }: { color: string }) => (
    <Svg
      width="100%"
      height="100%"
      viewBox="0 0 50 50"
      preserveAspectRatio="xMidYMid meet"
      rotation={isNaN(displayedScore) ? 0 : displayedScore * 3}
    >
      <Path
        fill={color}
        stroke={Colors.yellow50}
        strokeWidth={2}
        d="M25,1.5c0.9,0,1.7,0.6,2,1.5l4.6,13.7h14.2c1,0,1.8,0.7,2,1.6c0.2,0.9-0.2,1.9-1,2.4l-11.5,8.4l4.4,13.6c0.3,0.9,0,1.9-0.8,2.5c-0.8,0.6-1.8,0.6-2.6,0L25,37.1l-11.3,8.2c-0.8,0.6-1.8,0.6-2.6,0c-0.8-0.6-1.1-1.6-0.8-2.5l4.4-13.6L3.2,20.7c-0.8-0.5-1.2-1.5-1-2.4c0.2-0.9,1-1.6,2-1.6h14.2L23,3c0.3-0.9,1.1-1.5,2-1.5z"
      />
    </Svg>
  );
  const getColorSortValue = (score: string) => {
    switch (score) {
      case "green":
        return 0;
      case "yellow":
        return 1;
      case "orange":
        return 2;
      case "red":
        return 3;
      default:
        return 4;
    }
  };
  const sortedNutritionAnalysis = useMemo(() => {
    if (!entryData || !entryData.nutritionAnalysis) {
      return [];
    }
    return [...entryData.nutritionAnalysis].sort(
      (a, b) => getColorSortValue(a.score) - getColorSortValue(b.score)
    );
  }, [entryData]);

  return (
    // <LinearGradient
    //   colors={["#EBE4FF", "#C8EFFF"]} // Light blue gradient
    // >
    <ScrollView>
      <SafeAreaView>
        <NavigationAction
          icon={"arrow-back-outline"}
          size="giant"
          status="placeholder"
          backgroundColor={Colors.transparent}
          tintColor={Colors.grey20}
        />
        <View style={styles.container}>
          <UserIcon size={80} styles={styles.userIcon} />
          {entryData.points != null && (
            <View style={styles.starWrapper}>
              <StarIcon color={Colors.yellow60} />
              <View style={styles.pointsOverlay}>
                <Text style={styles.pointsText}>{displayedScore}</Text>
                <Text style={styles.pointsLabel}>points earned</Text>
              </View>
            </View>
          )}

          <Text style={styles.title}>{entryData.title}</Text>

          <Carousel
            data={entryData.images}
            renderItem={renderCarouselItem}
            width={300}
            height={460}
            mode="vertical-stack"
            modeConfig={{
              snapDirection: "left",
              stackInterval: 30,
            }}
            style={styles.carousel}
          />

          {entryData.overallScore != null ? (
            <>
              <View style={styles.healthScoreContainer}>
                <Text style={styles.healthScoreLabel}>Health Score:</Text>
                <View style={styles.healthScoreBar}>
                  <View
                    style={[
                      styles.healthScoreFill,
                      { width: `${healthScorePercentage}%` },
                    ]}
                  />
                </View>
              </View>

              <View
                style={[
                  styles.infoCard,
                  selectedIngredient && {
                    backgroundColor: getScoreColor(selectedIngredient.score),
                  },
                ]}
              >
                <Text
                  style={[
                    styles.infoCardText,
                    {
                      color: selectedIngredient ? Colors.white : Colors.black,
                    },
                  ]}
                >
                  {selectedIngredient
                    ? `${selectedIngredient.emoji} ${selectedIngredient.reasoning}`
                    : "Tap an item to see details"}
                </Text>
              </View>

              <ScrollView
                style={styles.ingredientsContainer}
                contentContainerStyle={styles.ingredientsContentContainer}
              >
                {sortedNutritionAnalysis.map((ingredient, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.ingredientItem,
                      { backgroundColor: getScoreColor(ingredient.score) },
                    ]}
                    onPress={() => setSelectedIngredient(ingredient)}
                  >
                    <Text style={styles.ingredientName}>
                      {ingredient.emoji} {ingredient.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </>
          ) : (
            <View>
              <Text>No analysis available</Text>
            </View>
          )}
        </View>
      </SafeAreaView>
    </ScrollView>
    // {/* </LinearGradient> */}
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  starWrapper: {
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 15,
    width: "100%",
    aspectRatio: 1,
    zIndex: -1,

    // borderWidth: 3,
    // borderColor: Colors.black,
    // backgroundColor: Colors.blue70,
    marginTop: -100,
  },
  pointsOverlay: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
  },
  pointsText: {
    fontSize: 90,
    fontWeight: "bold",
    color: Colors.$black,
    marginBottom: -10,
  },
  pointsLabel: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    color: Colors.$black,
  },
  userIcon: { zIndex: 2 },
  healthScoreContainer: {
    verticalAlign: "middle",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  healthScoreLabel: {
    fontSize: 18,
    fontWeight: "bold",
  },
  healthScoreBar: {
    height: 20,
    width: "100%",
    backgroundColor: Colors.grey50,
    borderRadius: 5,
    borderColor: Colors.black,
    borderWidth: 3,
  },
  healthScoreFill: {
    height: "100%",
    backgroundColor: Colors.green40,
    borderRadius: 3,
  },
  ingredientsContainer: {
    flex: 1,
    borderColor: Colors.black,
    borderWidth: 3,
    backgroundColor: Colors.white,
    padding: 15,
    width: "100%",
    borderRadius: 15,
  },
  ingredientsContentContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
  },
  ingredientItem: {
    padding: 10,
    marginBottom: 5,
    marginRight: 5,
    borderRadius: 5,
    flexShrink: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
  },
  carousel: {
    alignSelf: "center",
  },
  carouselImage: {
    width: 300,
    height: 400,
    borderRadius: 10,
    borderColor: Colors.black,
    borderWidth: 3,
  },
  ingredientName: {
    color: Colors.white,
    fontWeight: "bold",
    flexDirection: "row",
    alignItems: "center",
  },
  reasoningCard: {
    borderRadius: 5,
    marginTop: 5,
  },
  infoCard: {
    marginVertical: 20,
    padding: 10,
    width: "100%",
    borderColor: Colors.black,
    borderWidth: 3,
    borderRadius: 8,
    minHeight: 100,
    alignContent: "center",
    backgroundColor: Colors.white,
    justifyContent: "center",
    verticalAlign: "middle",
  },
  infoCardText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  reasoningText: {
    color: Colors.black,
    fontSize: 12,
  },
});

export default FoodAnalysisContent;
