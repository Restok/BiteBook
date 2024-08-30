import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { Button, Text } from "react-native-ui-lib";
import {
  GoogleSignin,
  GoogleSigninButton,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import auth from "@react-native-firebase/auth";

const LoginScreen: React.FC = () => {
  const [error, setError] = useState<string | null>(null);

  const signIn = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const { idToken } = await GoogleSignin.signIn();
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      await auth().signInWithCredential(googleCredential);
    } catch (e) {
      if (e.code === statusCodes.SIGN_IN_CANCELLED) {
        setError("Sign in was cancelled");
      } else if (e.code === statusCodes.IN_PROGRESS) {
        setError("Sign in is already in progress");
      } else if (e.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        setError("Play services not available");
      } else {
        setError("An unknown error occurred. Please try again.");
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text text60 style={styles.title}>
        LoveYumDiary
      </Text>
      <GoogleSigninButton
        onPress={signIn}
        size={GoogleSigninButton.Size.Standard}
      />
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    marginBottom: 20,
  },
  error: {
    color: "red",
    marginTop: 10,
  },
});

export default LoginScreen;