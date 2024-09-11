import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { Entry } from "../types/entry";
import FoodAnalysisContent from "../components/post/FoodAnalysisContent";
import { useJournalContext } from "../contexts/JournalContext";
import { useFocusEffect } from "@react-navigation/native";
type FoodAnalysisScreenProps = {
  navigation: StackNavigationProp<any>;
  route: {
    params: {
      entryData: Entry;
      index: number;
    };
  };
};

const FoodAnalysisScreen: React.FC<FoodAnalysisScreenProps> = ({ route }) => {
  const { entryData, index } = route.params;
  const { reloadSingleEntry } = useJournalContext();
  //   useFocusEffect(() => {
  //     reloadSingleEntry(entryData.id);
  //   });

  return (
    <View style={styles.container}>
      <FoodAnalysisContent entryData={entryData} isOpen={false} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default FoodAnalysisScreen;
