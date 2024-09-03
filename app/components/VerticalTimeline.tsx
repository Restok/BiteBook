import React, { useState, useEffect, useRef } from "react";
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

interface TimelineEntry {
  id: string;
  timestamp: Date;
  imageUrl: string;
  userId: string;
  title: string;
}

const HOUR_HEIGHT = 120;
const INITIAL_HOURS_SHOWN = 8;
const SCREEN_WIDTH = Dimensions.get("window").width;
const LINE_LEFT_MARGIN = Math.max(SCREEN_WIDTH * 0.2, 80);

type VerticalTimelineProps = {
  onEntryPress: (entry: TimelineEntry) => void;
};

const VerticalTimeline: React.FC<VerticalTimelineProps> = ({
  onEntryPress,
}) => {
  const [entries, setEntries] = useState<TimelineEntry[]>([]);
  const [zoomLevel, setZoomLevel] = useState(0.5);
  const [visibleHours, setVisibleHours] = useState(INITIAL_HOURS_SHOWN);
  const scrollViewRef = useRef<ScrollView>(null);
  const pinchRef = useRef(null);
  const nativeViewRef = useRef(null);
  const lastPinchScale = useRef(1);
  const lastPinchCenter = useRef(0);
  const scrollOffset = useRef(0);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [scrollViewHeight, setScrollViewHeight] = useState(600);
  const [totalHoursLoaded, setTotalHoursLoaded] = useState(
    new Date().getHours()
  );
  const [contentHeight, setContentHeight] = useState(
    totalHoursLoaded * HOUR_HEIGHT * zoomLevel
  );
  const lastContentHeight = useRef(contentHeight);
  const [isLoading, setIsLoading] = useState(false);

  const onScrollViewLayout = (event) => {
    const { height } = event.nativeEvent.layout;
    setScrollViewHeight(height);
  };
  useEffect(() => {
    const now = new Date();
    setCurrentTime(now);
    fetchEntries(now);

    const intervalId = setInterval(() => {
      const cur = new Date();
      setCurrentTime((prevTime) => {
        if (cur.getMinutes() !== prevTime.getMinutes()) {
          fetchEntries(cur);
          if (cur.getHours() !== prevTime.getHours()) {
            setTotalHoursLoaded(cur.getHours());
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
    setContentHeight(totalHoursLoaded * HOUR_HEIGHT * zoomLevel);
  }, [scrollViewHeight, totalHoursLoaded]);

  const fetchEntries = async (endDate: Date) => {
    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Mock data
    const mockEntries: TimelineEntry[] = [
      {
        id: `${Date.now()}-1`,
        timestamp: new Date(endDate.getTime() - 3 * 60 * 60 * 1000),
        imageUrl: "https://via.placeholder.com/50",
        userId: "user1",
        title: "New entry",
      },
      {
        id: `${Date.now()}-2`,
        timestamp: new Date(endDate.getTime() - 6 * 60 * 60 * 1000),
        imageUrl: "https://via.placeholder.com/50",
        userId: "user2",
        title: "Another new entry",
      },
    ];

    setEntries(mockEntries);
    setIsLoading(false);
  };
  const hourToDate = (hour: number) => {
    const date = new Date(currentTime);
    date.setHours(Math.floor(hour), (hour % 1) * 60, 0, 0);
    return date;
  };
  const renderTimeMarkers = () => {
    const markers = [];
    const intervalHours = getIntervalHours();
    for (let i = 0; i < totalHoursLoaded; i += intervalHours) {
      const markerTime = hourToDate(i);

      const hoursDiff =
        (currentTime.getTime() - markerTime.getTime()) / (1000 * 60 * 60);
      const yPosition = hoursDiff * HOUR_HEIGHT * zoomLevel;

      const isCloseToCurrentTime = Math.abs(hoursDiff) < intervalHours / 2;
      if (!isCloseToCurrentTime) {
        markers.push(
          <View key={i} style={[styles.timeMarker, { top: yPosition }]}>
            <Text style={styles.timeMarkerText}>
              {markerTime.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
          </View>
        );
      }
    }

    markers.push(
      <View key="current" style={[styles.timeMarker, { top: 0 }]}>
        <Text style={styles.timeMarkerText}>
          {currentTime.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      </View>
    );

    return markers;
  };

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
            <Image source={{ uri: entry.imageUrl }} style={styles.entryImage} />
            <Text style={styles.entryTitle}>{entry.title}</Text>
          </TouchableOpacity>
        </View>
      </View>
    ));
  };

  const getEntryPosition = (timestamp: Date) => {
    const minutesDiff =
      (currentTime.getTime() - timestamp.getTime()) / (60 * 1000);
    return (minutesDiff / 60) * HOUR_HEIGHT * zoomLevel;
  };

  const onPinchGestureEvent = ({ nativeEvent }) => {
    const { scale, focalY } = nativeEvent;
    const diff = scale - lastPinchScale.current;
    const zoomMin = scrollViewHeight / (totalHoursLoaded * HOUR_HEIGHT);
    const newZoomLevel = Math.max(zoomMin, Math.min(zoomLevel * (1 + diff), 3));

    const oldContentHeight = totalHoursLoaded * HOUR_HEIGHT * zoomLevel;
    const newContentHeight = totalHoursLoaded * HOUR_HEIGHT * newZoomLevel;

    const focusPointRatio = (scrollOffset.current + focalY) / oldContentHeight;
    const newOffset = focusPointRatio * newContentHeight - focalY;

    setZoomLevel(newZoomLevel);
    setContentHeight(newContentHeight);
    lastContentHeight.current = newContentHeight;

    lastPinchScale.current = scale;

    // Adjust binning based on zoom level
    const newVisibleHours = scrollViewHeight / (HOUR_HEIGHT * newZoomLevel);
    setVisibleHours(newVisibleHours);

    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: newOffset, animated: true });
    }
  };

  const onPinchHandlerStateChange = ({ nativeEvent }) => {
    if (nativeEvent.state === State.BEGAN) {
      lastPinchScale.current = 1;
      lastPinchCenter.current = nativeEvent.focalY;
    } else if (nativeEvent.state === State.END) {
      lastPinchScale.current = 1;
    }
  };

  const onScroll = ({ nativeEvent }) => {
    scrollOffset.current = nativeEvent.contentOffset.y;
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
          keyboardShouldPersistTaps={"always"}
          scrollEventThrottle={400}
          onLayout={onScrollViewLayout}
        >
          <View style={[styles.timeline, { height: contentHeight }]}>
            <View style={styles.verticalLine} />
            {renderTimeMarkers()}
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
