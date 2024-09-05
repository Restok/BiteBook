import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { Text } from "react-native-ui-lib";
import {
  PinchGestureHandler,
  State,
  NativeViewGestureHandler,
} from "react-native-gesture-handler";
import { useDebouncedCallback } from "use-debounce";
import { Entry } from "../types/entry";
import { useJournalContext } from "../contexts/JournalContext";

interface TimeMarkersProps {
  currentTime: number;
  zoomLevel: number;
  intervalHours: number;
}

const TimeMarkers: React.FC<TimeMarkersProps> = React.memo(
  ({ currentTime, zoomLevel, intervalHours }) => {
    const hourToDate = (hour: number) => {
      const date = new Date(currentTime);
      date.setHours(Math.floor(hour), (hour % 1) * 60, 0, 0);
      return date.getTime();
    };

    const getEntryPosition = useCallback(
      (timestamp: number) => {
        "worklet";
        const minutesDiff = (currentTime - timestamp) / (60 * 1000);
        return (minutesDiff / 60) * HOUR_HEIGHT * zoomLevel;
      },
      [currentTime, zoomLevel]
    );

    const markers = [];
    for (let i = 0; i < 24; i += 1) {
      const markerTime = hourToDate(i);
      const hoursDiff = (currentTime - markerTime) / (1000 * 60 * 60);

      // const animatedStyle = useAnimatedStyle(() => {
      //   const isVisible = i % intervalHours === 0 && hoursDiff >= 0;
      //   if (isVisible) {
      //     return {
      //       transform: [
      //         {
      //           translateY: withTiming(getEntryPosition(markerTime), {
      //             duration: 16,
      //           }),
      //         },
      //       ],
      //       opacity: 1,
      //     };
      //   }
      //   return {
      //     transform: [{ translateY: getEntryPosition(markerTime) }],
      //     opacity: 0,
      //   };
      // });

      markers.push(
        <View
          key={i}
          style={[
            styles.timeMarker,
            {
              top: getEntryPosition(markerTime),
              opacity: i % intervalHours === 0 && hoursDiff >= 0 ? 1 : 0,
            },
          ]}
        >
          <Text style={styles.timeMarkerText}>
            {new Date(markerTime).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        </View>
      );
    }
    markers.push(
      <View
        key="now"
        style={[
          styles.timeMarker,
          {
            top: getEntryPosition(currentTime),
            opacity: 1,
          },
        ]}
      >
        <Text style={styles.timeMarkerText}>
          {new Date(currentTime).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      </View>
    );

    return <>{markers}</>;
  }
);
TimeMarkers.displayName = "TimeMarkers";

const HOUR_HEIGHT = 120;
const INITIAL_HOURS_SHOWN = 8;
const SCREEN_WIDTH = Dimensions.get("window").width;
const LINE_LEFT_MARGIN = Math.max(SCREEN_WIDTH * 0.2, 80);

type VerticalTimelineProps = {
  onEntryPress: (entry: Entry) => void;
};

const VerticalTimeline: React.FC<VerticalTimelineProps> = ({
  onEntryPress,
}) => {
  const [zoomLevel, setZoomLevel] = useState(0.5);
  const [visibleHours, setVisibleHours] = useState(INITIAL_HOURS_SHOWN);
  const [isPinching, setIsPinching] = useState(false);

  const updateVisibleHours = (newVisibleHours: number) => {
    //Round to nearest 1
    setVisibleHours(Math.round(newVisibleHours));
  };

  const scrollViewRef = useRef<ScrollView>(null);
  const pinchRef = useRef(null);
  const nativeViewRef = useRef(null);
  const lastPinchScale = useRef(1);
  const scrollOffset = useRef(0);
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [scrollViewHeight, setScrollViewHeight] = useState(600);

  const calcHours = () => {
    const date = new Date();
    return date.getHours() + date.getMinutes() / 60 + 1;
  };

  const [totalHoursLoaded, setTotalHoursLoaded] = useState(calcHours());

  const calcContentHeight = () => {
    return totalHoursLoaded * HOUR_HEIGHT * zoomLevel;
  };
  const [contentHeight, setContentHeight] = useState(calcContentHeight());
  const lastPinchHeight = useRef(contentHeight);

  const lastContentHeight = useRef(contentHeight);

  const onScrollViewLayout = (event) => {
    const { height } = event.nativeEvent.layout;
    setScrollViewHeight(height);
  };
  const { entries } = useJournalContext();

  useEffect(() => {
    const now = Date.now();
    setCurrentTime(now);

    const intervalId = setInterval(() => {
      const cur = Date.now();
      setCurrentTime((prevTime) => {
        if (Math.floor(cur / 60000) !== Math.floor(prevTime / 60000)) {
          if (Math.floor(cur / 3600000) !== Math.floor(prevTime / 3600000)) {
            setTotalHoursLoaded(new Date(cur).getHours());
          }
          return cur;
        }
        return prevTime;
      });
    }, 1000);

    // Clean up the interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    setContentHeight(calcContentHeight());
  }, [scrollViewHeight, totalHoursLoaded]);

  const getIntervalHours = () => {
    if (visibleHours >= 12) {
      return 6;
    } else if (visibleHours >= 6) {
      return 3;
    } else if (visibleHours >= 3) {
      return 1;
    } else {
      return 0.5;
    }
  };

  const renderEntries = () => {
    return entries.map((entry) => (
      <View key={entry.id}>
        <View
          style={[styles.entry, { top: getEntryPosition(entry.timestamp) }]}
        >
          <View style={styles.entryDot} />
          <View style={styles.entryLine} />
          <TouchableOpacity
            style={styles.entryContent}
            onPress={() => onEntryPress(entry)}
          >
            <Image
              source={{ uri: entry.images[0] }}
              style={styles.entryImage}
            />
            <Text style={styles.entryTitle}>{entry.title}</Text>
          </TouchableOpacity>
        </View>
      </View>
    ));
  };

  const getEntryPosition = (timestamp: number) => {
    const minutesDiff = (currentTime - timestamp) / (60 * 1000);
    return (minutesDiff / 60) * HOUR_HEIGHT * zoomLevel;
  };

  const onPinchGestureEvent = ({ nativeEvent }) => {
    const { scale, focalY } = nativeEvent;
    const diff = (scale - lastPinchScale.current) * 1.5;
    const zoomMin = scrollViewHeight / (totalHoursLoaded * HOUR_HEIGHT);
    const newZoomLevel = Math.max(zoomMin, Math.min(zoomLevel * (1 + diff), 3));
    setZoomLevel(newZoomLevel);
    const newContentHeight = calcContentHeight();

    lastContentHeight.current = newContentHeight;

    lastPinchScale.current = scale;
    const newVisibleHours = scrollViewHeight / (HOUR_HEIGHT * newZoomLevel);
    updateVisibleHours(newVisibleHours);

    if (scrollViewRef.current) {
      const newScrollPosition =
        (scrollOffset.current * newContentHeight) / lastPinchHeight.current;
      scrollViewRef.current.scrollTo({
        y: newScrollPosition,
        animated: false,
      });
    }
  };

  const onPinchHandlerStateChange = ({ nativeEvent }) => {
    if (nativeEvent.state === State.BEGAN) {
      lastPinchScale.current = 1;
      lastPinchHeight.current = contentHeight;
    } else if (nativeEvent.state === State.END) {
      lastPinchScale.current = 1;
      // Ensure final update of visible hours and animated zoom level
      const finalVisibleHours = scrollViewHeight / (HOUR_HEIGHT * zoomLevel);
      updateVisibleHours(finalVisibleHours);
      setContentHeight(calcContentHeight());

      setIsPinching(false);
    } else if (nativeEvent.state === State.ACTIVE) {
      setIsPinching(true);
    } else {
      setIsPinching(false);
    }
  };

  const onScroll = ({ nativeEvent }) => {
    if (contentHeight > scrollViewHeight && !isPinching) {
      scrollOffset.current = nativeEvent.contentOffset.y;
    }
  };
  return (
    <PinchGestureHandler
      ref={pinchRef}
      onGestureEvent={onPinchGestureEvent}
      onHandlerStateChange={onPinchHandlerStateChange}
      simultaneousHandlers={nativeViewRef}
    >
      <NativeViewGestureHandler
        ref={nativeViewRef}
        simultaneousHandlers={pinchRef}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.container}
          onScroll={onScroll}
          scrollEventThrottle={16}
          onLayout={onScrollViewLayout}
          scrollEnabled={!isPinching}
        >
          <View style={[styles.timeline, { height: contentHeight }]}>
            <View style={styles.verticalLine} />
            <TimeMarkers
              currentTime={currentTime}
              zoomLevel={zoomLevel}
              intervalHours={getIntervalHours()}
            />
            {renderEntries()}
          </View>
        </ScrollView>
      </NativeViewGestureHandler>
    </PinchGestureHandler>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  timeline: {
    width: "100%",
    position: "relative",
  },
  verticalLine: {
    position: "absolute",
    left: LINE_LEFT_MARGIN,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: "#666464",
  },
  timeMarker: {
    position: "absolute",
    left: 0,
    right: 0,
  },
  timeMarkerText: {
    position: "absolute",
    width: 70,
    textAlign: "right",
    fontWeight: "bold",
    fontSize: 14,
  },
  entry: {
    position: "absolute",
    left: LINE_LEFT_MARGIN - 5,
    right: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  entryDot: {
    width: 10,
    left: 2,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#007AFF",
  },
  entryLine: {
    height: 2,
    flex: 1,
    backgroundColor: "#007AFF",
  },
  entryContent: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    padding: 5,
    borderRadius: 5,
    marginLeft: 5,
  },
  entryImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 5,
  },
  entryTitle: {
    fontSize: 12,
  },
});

export default VerticalTimeline;
