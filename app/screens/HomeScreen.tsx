import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Modal,
  StatusBar,
} from "react-native";
import { Text, Button, Colors, Icon } from "react-native-ui-lib";
import {
  RouteProp,
  useFocusEffect,
  useIsFocused,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { useJournalContext } from "../contexts/JournalContext";

import VerticalTimeline from "../components/VerticalTimeline";
import GroupPicker from "../components/GroupPicker";
import CreatePostModal from "../components/post/CreatePostModal";
import GroupPickerOverlay from "../components/journals/GroupPickerOverlay";
import { Journal } from "../types/journal";
import { RootStackParamList } from "../types/navigation";
import { Ionicons } from "@expo/vector-icons";
import { Container } from "../components/ui";
import auth from "@react-native-firebase/auth";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";

import BottomSheet from "@gorhom/bottom-sheet";
import { useLoading } from "../contexts/LoadingContext";
type HomeScreenRouteProp = RouteProp<RootStackParamList, "Home">;

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const isFocused = useIsFocused();
  const route = useRoute<HomeScreenRouteProp>();
  const {
    selectedJournal,
    journals,
    setSelectedJournal,
    loadJournals,
    loadEntriesForDate,
    setSelectedDate,
    selectedDate,
    setSelectedJournalById,
  } = useJournalContext();
  const { isLoading, setIsLoading } = useLoading();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isGroupPickerOverlayVisible, setGroupPickerOverlayVisible] =
    useState(false);
  const bottomSheetRef = React.useRef<BottomSheet>(null);
  const [isSettingsModalVisible, setIsSettingsModalVisible] = useState(false);
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [journalIdFromParams, setJournalIdFromParams] = useState<string | null>(
    route.params?.journalId
  );
  useEffect(() => {
    if (journalIdFromParams) {
      setSelectedJournalById(journalIdFromParams);
      setJournalIdFromParams(null);
    }
  }, [route.params, setSelectedJournalById]);
  const handleDateChange = useCallback(
    (event: DateTimePickerEvent) => {
      setDatePickerVisible(false);
      const date = event.nativeEvent.timestamp;
      if (date) {
        setSelectedDate(new Date(date));
      }
    },
    [setSelectedDate]
  );
  const openDatePicker = useCallback(() => {
    setDatePickerVisible(true);
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      setIsLoading(true);
      await auth().signOut();
      setIsLoading(false);

      // The auth state listener in App.tsx will handle navigation
    } catch (error) {
      setIsLoading(false);
      console.error("Error signing out: ", error);
    } finally {
      setIsLoading(false);
    }
  }, []);
  useFocusEffect(
    useCallback(() => {
      if (isFocused) {
        loadJournals();
        setIsModalVisible(false);
        setGroupPickerOverlayVisible(false);
      }
    }, [isFocused, loadJournals])
  );
  useEffect(() => {
    if (!isFocused) {
      setIsModalVisible(false);
      setGroupPickerOverlayVisible(false);
    }
  }, [isFocused]);

  const handleJournalSelect = useCallback(
    async (journal: Journal) => {
      setSelectedJournal(journal);
      setGroupPickerOverlayVisible(false);
    },
    [setSelectedJournal]
  );

  const handleAddPost = useCallback(() => {
    setIsModalVisible(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalVisible(false);
  }, []);

  const handleSubmitPost = useCallback(() => {
    setIsModalVisible(false);
  }, []);
  const handleSettingsPress = useCallback(() => {
    setIsSettingsModalVisible(true);
    bottomSheetRef.current?.expand();
  }, []);

  const handleEntryPress = useCallback(
    (index) => {
      navigation.navigate("ExpandedPost", { index });
    },
    [navigation]
  );

  const handleJournalLeft = useCallback(() => {
    setSelectedJournal(null);
    loadJournals();
  }, [loadJournals]);

  const handleOpenGroupPicker = useCallback(() => {
    setGroupPickerOverlayVisible(true);
  }, []);

  const handleCloseGroupPicker = useCallback(() => {
    setGroupPickerOverlayVisible(false);
  }, []);

  const handlePodiumPress = useCallback(() => {
    navigation.navigate("Leaderboard");
  }, [navigation]);
  const handleDataPress = useCallback(() => {
    navigation.navigate("UserStats");
  }, [navigation]);
  return (
    <Container>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={Colors.white}
        translucent={true}
      />
      <View style={styles.listContainer}>
        <View style={styles.topBar}>
          <GroupPicker
            selectedJournal={selectedJournal}
            onOpenPicker={handleOpenGroupPicker}
          />
          <View
            style={{
              flexDirection: "row",
              width: "30%",
              justifyContent: "space-between",
            }}
          >
            <TouchableOpacity onPress={handleDataPress}>
              <Ionicons
                name="analytics-outline"
                size={24}
                color={Colors.primary}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={handlePodiumPress}>
              <Ionicons
                name="podium-outline"
                size={24}
                color={Colors.primary}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSettingsPress}>
              <Ionicons
                name="settings-outline"
                size={24}
                color={Colors.primary}
              />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.dateContainer}>
          <Text text40BL style={styles.dateText}>
            {selectedDate.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              weekday: "short",
            })}
          </Text>
          <TouchableOpacity onPress={openDatePicker}>
            <Ionicons
              name="calendar-outline"
              size={24}
              color={Colors.primary}
            />
          </TouchableOpacity>
          {datePickerVisible && (
            <DateTimePicker
              mode="date"
              value={selectedDate}
              maximumDate={new Date()}
              onChange={handleDateChange}
              style={styles.datePicker}
            />
          )}
        </View>

        <VerticalTimeline onEntryPress={handleEntryPress} />
      </View>
      <CreatePostModal
        visible={isModalVisible}
        onClose={handleCloseModal}
        onSubmit={handleSubmitPost}
      />
      <Button
        text40R
        label="+"
        size={Button.sizes.large}
        backgroundColor={Colors.purple30}
        style={styles.addButton}
        round
        onPress={handleAddPost}
      />
      {isGroupPickerOverlayVisible && (
        <GroupPickerOverlay
          visible={isGroupPickerOverlayVisible}
          onClose={handleCloseGroupPicker}
          onJournalSelect={handleJournalSelect}
        />
      )}
      <BottomSheet
        index={-1}
        snapPoints={["25%"]}
        animateOnMount={false}
        enablePanDownToClose
        ref={bottomSheetRef}
        backgroundStyle={{ backgroundColor: Colors.grey70 }}
      >
        <View style={styles.modalContainer}>
          <Button
            label="Log Out"
            onPress={handleLogout}
            backgroundColor={Colors.red30}
          />
        </View>
      </BottomSheet>
    </Container>
  );
};

const styles = StyleSheet.create({
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  dateContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  dateText: {
    textAlign: "left",
  },
  datePicker: {
    width: 120,
  },
  addButton: {
    position: "absolute",
    bottom: 20,
    alignSelf: "center",
    width: 60,
    height: 60,
    textAlign: "center",
    textAlignVertical: "center",
  },
  modalContainer: {
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
});

export default HomeScreen;
