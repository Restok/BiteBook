import React, { useRef, useEffect } from "react";
import ConfettiCannon from "react-native-confetti-cannon";
import { useConfetti } from "../../contexts/ConfettiContext";
import { View, StyleSheet, Dimensions } from "react-native";
const SCREEN_WIDTH = Dimensions.get("window").width;
const SCREEN_HEIGHT = Dimensions.get("window").height;
const Confetti: React.FC = () => {
  const { shouldExplode, resetConfetti } = useConfetti();
  const confettiRef = useRef<ConfettiCannon>(null);

  useEffect(() => {
    if (shouldExplode) {
      confettiRef.current?.start();
      resetConfetti();
    }
  }, [shouldExplode, resetConfetti]);

  return (
    <View style={styles.container} pointerEvents="none">
      <ConfettiCannon
        ref={confettiRef}
        count={200}
        origin={{ x: SCREEN_WIDTH / 2, y: -20 }}
        explosionSpeed={600}
        autoStart={false}
        fadeOut
        fallSpeed={4000}
      />
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    position: "absolute",
    overflow: "hidden",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
});

export default Confetti;
