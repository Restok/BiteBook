import React, { useRef, useState } from "react";
import { View, FlatList, Dimensions, StatusBar } from "react-native";
import ExpandedPostOverlay from "../components/post/ExpandedPostOverlay";
import { StackNavigationProp } from "@react-navigation/stack";
import { useJournalContext } from "../contexts/JournalContext";
import { Colors } from "react-native-ui-lib";
import { useLoading } from "../contexts/LoadingContext";

type ExpandedPostScreenProps = {
  navigation: StackNavigationProp<any>;
  route: any;
};

const ExpandedPostScreen: React.FC<ExpandedPostScreenProps> = ({
  navigation,
  route,
}) => {
  const onClose = () => navigation.goBack();
  const initialIndex = route.params.index;
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const flatListRef = useRef<FlatList>(null);
  const { height } = Dimensions.get("window");
  const { entries } = useJournalContext();
  // const entriesOrdered = useMemo(() => entries
  // Assume you have a data array of posts
  const renderItem = ({ item, index }: { item: any; index: number }) => (
    <View style={{ height }}>
      <ExpandedPostOverlay onClose={onClose} index={index} />
    </View>
  );

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  return (
    <View style={{ flex: 1 }}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={Colors.black}
        translucent={true}
      />
      {entries.length > 0 && (
        <FlatList
          ref={flatListRef}
          data={entries}
          renderItem={renderItem}
          keyExtractor={(item, index) => index.toString()}
          snapToInterval={height}
          snapToAlignment="start"
          decelerationRate="fast"
          showsVerticalScrollIndicator={false}
          initialScrollIndex={Math.min(initialIndex, entries.length - 1)}
          disableIntervalMomentum
          getItemLayout={(_, index) => ({
            length: height,
            offset: height * index,
            index,
          })}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
          ListFooterComponent={
            <View style={{ backgroundColor: Colors.black, height: 20 }}></View>
          }
          style={{ backgroundColor: Colors.black }}
        />
      )}
    </View>
  );
};

export default ExpandedPostScreen;
