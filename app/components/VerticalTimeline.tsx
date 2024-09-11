import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { Text, Avatar, Colors } from "react-native-ui-lib";
import { useUserContext } from "../contexts/UserContext";

import {
  PinchGestureHandler,
  State,
  NativeViewGestureHandler,
} from "react-native-gesture-handler";
import { useDebouncedCallback } from "use-debounce";
import { Entry } from "../types/entry";
import { useJournalContext } from "../contexts/JournalContext";
import { Container } from "./ui";

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
    const getDateString = (timestamp: number) => {
      return new Date(timestamp)
        .toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
        .replace(/\s/g, "");
    };

    const markers = [];
    for (let i = 0; i < 24; i += 1) {
      const markerTime = hourToDate(i);
      const hoursDiff = (currentTime - markerTime) / (1000 * 60 * 60);
      const isVisible =
        i % intervalHours === 0 &&
        hoursDiff >= 0 &&
        hoursDiff > intervalHours / 2;
      if (hoursDiff < 0) break;
      if (!isVisible) continue;
      const dateString = getDateString(markerTime);
      markers.push(
        <View
          key={i}
          style={[
            styles.timeMarker,
            {
              transform: [{ translateY: getEntryPosition(markerTime) }],
              opacity: isVisible ? 1 : 0,
            },
          ]}
        >
          <Text style={styles.timeMarkerText}>{dateString}</Text>
        </View>
      );
    }
    const dateString = getDateString(currentTime);
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
        <Text style={styles.timeMarkerText}>{dateString}</Text>
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
  onEntryPress: (index: number) => void;
};

const VerticalTimeline: React.FC<VerticalTimelineProps> = ({
  onEntryPress,
}) => {
  const { journalUsersById } = useUserContext();

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
  const { entries, selectedDate } = useJournalContext();

  const calcHours = () => {
    if (selectedDate.getDate() !== new Date().getDate()) {
      return 24;
    }
    return selectedDate.getHours() + selectedDate.getMinutes() / 60 + 1;
  };

  const [totalHoursLoaded, setTotalHoursLoaded] = useState(calcHours());
  const [zoomLevel, setZoomLevel] = useState(
    600 / (totalHoursLoaded * HOUR_HEIGHT)
  );

  useEffect(() => {
    if (selectedDate.getDate() !== new Date().getDate()) {
      const endOfDay = new Date(selectedDate);
      endOfDay.setHours(23, 59, 59, 999);
      setCurrentTime(endOfDay.getTime());
      setTotalHoursLoaded(24);
      return;
    }
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
  }, [selectedDate]);

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
  const groupEntries = useCallback(
    (entries: Entry[]) => {
      const TIME_THRESHOLD = HOUR_HEIGHT * zoomLevel * 0.5; // Adjust this factor as needed
      const groups: Entry[][] = [];
      let currentGroup: Entry[] = [];

      entries.forEach((entry, index) => {
        if (currentGroup.length === 0) {
          currentGroup.push(entry);
        } else {
          const firstEntryInGroup = currentGroup[0];
          const distance = Math.abs(
            getEntryPosition(entry.timestamp) -
              getEntryPosition(firstEntryInGroup.timestamp)
          );

          if (distance <= TIME_THRESHOLD) {
            currentGroup.push(entry);
          } else {
            groups.push(currentGroup);
            currentGroup = [entry];
          }
        }

        if (index === entries.length - 1 && currentGroup.length > 0) {
          groups.push(currentGroup);
        }
      });

      return groups;
    },
    [zoomLevel, getEntryPosition]
  );
  const renderEntries = () => {
    return entries.map((entry, index) => {
      const user = journalUsersById[entry.userId];
      return (
        <View key={entry.id}>
          <View
            style={[styles.entry, { top: getEntryPosition(entry.timestamp) }]}
          >
            <Avatar source={{ uri: user?.photoURL }} size={30} />
            <TouchableOpacity
              style={styles.entryTextContainer}
              onPress={() => onEntryPress(index)}
            >
              <Text style={styles.entryTitle} numberOfLines={1}>
                {entry.title}
              </Text>
              <View style={styles.entryLine} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.entryContent}
              onPress={() => onEntryPress(index)}
            >
              <Image
                source={{ uri: entry.images[0] }}
                style={styles.entryImage}
              />
            </TouchableOpacity>
          </View>
        </View>
      );
    });
  };

  const getEntryPosition = (timestamp: number) => {
    const minutesDiff = (currentTime - timestamp) / (60 * 1000);
    return (minutesDiff / 60) * HOUR_HEIGHT * zoomLevel;
  };

  const onPinchGestureEvent = ({ nativeEvent }) => {
    const { scale, focalY } = nativeEvent;
    const diff = (scale - lastPinchScale.current) * 2;
    const zoomMin = scrollViewHeight / (totalHoursLoaded * HOUR_HEIGHT);
    const newZoomLevel = Math.max(zoomMin, Math.min(zoomLevel * (1 + diff), 3));
    setZoomLevel(newZoomLevel);
    const newContentHeight = calcContentHeight();
    setContentHeight(newContentHeight);

    lastContentHeight.current = newContentHeight;

    lastPinchScale.current = scale;
    const newVisibleHours = scrollViewHeight / (HOUR_HEIGHT * newZoomLevel);
    updateVisibleHours(newVisibleHours);

    if (scrollViewRef.current) {
      const newScrollPosition =
        (scrollOffset.current * newContentHeight) / lastPinchHeight.current;
      // scrollViewRef.current.scrollTo({
      //   y: newScrollPosition,
      //   animated: false,
      // });
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
    <Container level="1" style={styles.container}>
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
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // borderRadius: 20,
    // paddingHorizontal: 10,
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
    fontSize: 16,
  },
  entry: {
    position: "absolute",
    left: LINE_LEFT_MARGIN - 12,
    right: 10,
    flexDirection: "row",
    alignItems: "center",
  },

  entryLine: {
    height: 2,
    backgroundColor: "#007AFF",
  },
  entryContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  entryImage: {
    width: 40,
    height: 40,
    borderRadius: 15,
  },
  entryTitle: {
    fontSize: 14,
    textAlign: "center",
  },
  entryTextContainer: {
    flex: 1,
    height: 36,
  },
});

export default VerticalTimeline;
