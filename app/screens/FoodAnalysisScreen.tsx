import React, { useEffect, useState } from "react";
import { View, StyleSheet, ScrollView, RefreshControl } from "react-native";
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
  const [entry, setEntry] = React.useState<Entry | null>(entryData);
  const refreshEntry = async () => {
    const updatedEntry = await reloadSingleEntry(entryData.id);
    if (updatedEntry) {
      setEntry(updatedEntry);
    }
  };
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    refreshEntry().then(() => setRefreshing(false));
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <FoodAnalysisContent entryData={entry} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default FoodAnalysisScreen;
