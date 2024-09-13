import React from "react";
import { View } from "react-native";
import ExpandBitebookOverlay from "../components/journals/ExpandBitebookOverlay";
import { StackNavigationProp } from "@react-navigation/stack";

type ExpandBitebookScreenProps = {
  navigation: StackNavigationProp<any>;
  route: any;
};

const ExpandBitebookScreen: React.FC<ExpandBitebookScreenProps> = ({
  navigation,
  route,
}) => {
  const onClose = () => navigation.goBack();
  const onStartNewJournal = () => navigation.navigate("CreateJournal", {});
  const onJoinExistingJournal = () => navigation.navigate("EnterInviteCode");

  return (
    <ExpandBitebookOverlay
      onClose={onClose}
      onStartNewJournal={onStartNewJournal}
      onJoinExistingJournal={onJoinExistingJournal}
    />
  );
};

export default ExpandBitebookScreen;
