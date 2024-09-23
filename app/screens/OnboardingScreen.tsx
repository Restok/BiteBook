import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { Text, Button } from "react-native-ui-lib";
import * as ImagePicker from "expo-image-picker";
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";
import storage from "@react-native-firebase/storage";
import { createJournal } from "../services/createJournal";
import { compressImage } from "../utils/compressImage";
import * as Localization from "expo-localization"; // Add this import
import se from "rn-emoji-keyboard";
import { useOnboarding } from "../contexts/OnboardingContext";
import { useLoading } from "../contexts/LoadingContext";

const OnboardingScreen: React.FC = () => {
  const [name, setName] = useState("");
  const [profilePicture, setProfilePicture] = useState(null);
  const { setOnboardingComplete } = useOnboarding();

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const compressedImage = await compressImage(result.assets[0].uri);
      setProfilePicture(compressedImage);
    }
  };
  const { isLoading, setIsLoading } = useLoading();
  const handleSubmit = async () => {
    setIsLoading(true);
    const user = auth().currentUser;
    if (user) {
      let photoURL = "";
      if (profilePicture) {
        const reference = storage().ref(`profilePictures/${user.uid}`);
        await reference.putFile(profilePicture);
        photoURL = await reference.getDownloadURL();
      }

      await firestore().collection("users").doc(user.uid).set({
        name: name,
        photoURL: photoURL,
        createdAt: firestore.FieldValue.serverTimestamp(),
        journals: [],
        timezone: Localization.getCalendars()[0].timeZone,
      });

      await user.updateProfile({ displayName: name, photoURL });

      try {
        await createJournal(`Personal Journal`, profilePicture, true);
        setOnboardingComplete(true);
      } catch (error) {
        console.error("Failed to create personal journal:", error);
      }
    }
    setIsLoading(false);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={pickImage} style={styles.imageContainer}>
        {profilePicture ? (
          <Image
            source={{ uri: profilePicture }}
            style={styles.profilePicture}
          />
        ) : (
          <View style={styles.placeholderImage}>
            <Text>Upload Image</Text>
          </View>
        )}
      </TouchableOpacity>
      <Text text60 style={styles.question}>
        What is your name?
      </Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Jane Doe"
      />
      <Button
        label="Let's go!"
        onPress={handleSubmit}
        disabled={!name || !profilePicture || isLoading}
        style={styles.button}
      />
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
  imageContainer: {
    marginBottom: 20,
  },
  profilePicture: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  placeholderImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#e0e0e0",
    justifyContent: "center",
    alignItems: "center",
  },
  question: {
    marginBottom: 10,
  },
  input: {
    width: "100%",
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  button: {
    width: "100%",
  },
});

export default OnboardingScreen;
