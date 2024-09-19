import React, { useCallback, useEffect } from "react";
import CreateJournalOverlay from "../components/journals/CreateJournalOverlay";
import { StackNavigationProp } from "@react-navigation/stack";
import { useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "../types/navigation";
import { Journal } from "../types/journal";
import JournalCreatedScreen from "./JournalCreatedScreen";
import { View } from "react-native";
import { useConfetti } from "../contexts/ConfettiContext";

type CreateJournalScreenProps = {
  route: any;
};

const CreateJournalScreen: React.FC<CreateJournalScreenProps> = ({ route }) => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const onClose = useCallback(() => {
    navigation.goBack();
  }, [navigation]);
  const { triggerConfetti } = useConfetti();

  const onCreateJournal = (journal) => {
    triggerConfetti();

    navigation.navigate("JournalCreated", { journal });
  };

  return (
    <View style={{ flex: 1 }}>
      <CreateJournalOverlay
        onClose={onClose}
        onCreateJournal={onCreateJournal}
      />
    </View>
  );
};

export default CreateJournalScreen;
