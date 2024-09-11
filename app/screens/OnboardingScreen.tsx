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

const OnboardingScreen: React.FC<{ onComplete: () => void }> = ({
  onComplete,
}) => {
  const [name, setName] = useState("");
  const [profilePicture, setProfilePicture] = useState(null);

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

  const handleSubmit = async () => {
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
      });

      await user.updateProfile({ displayName: name, photoURL });

      try {
        await createJournal(`Your Journal`, photoURL, true);
        onComplete();
      } catch (error) {
        console.error("Failed to create personal journal:", error);
      }
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={pickImage} style={styles.imageContainer}>
        {profilePicture ? (
          <Image
            source={{ uri: profilePicture.uri }}
            style={styles.profilePicture}
          />
        ) : (
          <View style={styles.placeholderImage}>
            <Text>Profile picture</Text>
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
        disabled={!name || !profilePicture}
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
