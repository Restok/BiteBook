import firestore from "@react-native-firebase/firestore";
import { User } from "../types/user";

export async function loadUserByUid(uid: string): Promise<User | null> {
  const userDoc = await firestore().collection("users").doc(uid).get();

  if (userDoc.exists) {
    const userData = userDoc.data() as User;
    return {
      id: uid,
      name: userData.name,
      photoURL: userData.photoURL,
      createdAt: userData.createdAt,
      journals: userData.journals,
    };
  } else {
    return null;
  }
}
