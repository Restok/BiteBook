import React from "react";
import { View } from "react-native";
import ExpandedPostOverlay from "../components/post/ExpandedPostOverlay";
import { StackNavigationProp } from "@react-navigation/stack";

type ExpandedPostScreenProps = {
  navigation: StackNavigationProp<any>;
  route: any;
};

const ExpandedPostScreen: React.FC<ExpandedPostScreenProps> = ({
  navigation,
  route,
}) => {
  const onClose = () => navigation.goBack();
  const index = route.params.index;
  return <ExpandedPostOverlay onClose={onClose} index={index} />;
};

export default ExpandedPostScreen;
