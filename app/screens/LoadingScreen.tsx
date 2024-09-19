import React from "react";
import { LoaderScreen } from "react-native-ui-lib";
import { useLoading } from "../contexts/LoadingContext";
import { View, StyleSheet, Modal } from "react-native";

const LoadingScreen = () => {
  const { isLoading } = useLoading();
  if (!isLoading) return null;
  return (
    <Modal animationType="fade" style={styles.container}>
      <LoaderScreen loaderColor="#d1d1d1" overlay backgroundColor="#FFFFFF" />
    </Modal>
  );
};
const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    // backgroundColor: "rgba(0,0,0,0.5)",
  },
});

export default LoadingScreen;
