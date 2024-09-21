import messaging from "@react-native-firebase/messaging";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import firestore from "@react-native-firebase/firestore";
import auth from "@react-native-firebase/auth";

export async function setupNotifications() {
  // Request permission (required for iOS)
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (!enabled) {
    console.log("Failed to get push token for push notification!");
    return;
  }

  // Get the token
  const token = await messaging().getToken();

  // Save the token to AsyncStorage
  await AsyncStorage.setItem("fcmToken", token);

  // Save the token to Firestore if user is logged in
  const user = auth().currentUser;
  if (user) {
    await firestore().collection("users").doc(user.uid).update({
      fcmToken: token,
    });
  }
  // Handle token refresh
  messaging().onTokenRefresh((token) => {
    AsyncStorage.setItem("fcmToken", token);
    const user = auth().currentUser;
    if (user) {
      firestore().collection("users").doc(user.uid).update({
        fcmToken: token,
      });
    }
  });
}
