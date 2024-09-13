import firestore from "@react-native-firebase/firestore";
import auth from "@react-native-firebase/auth";

export async function joinJournal(journalId: string): Promise<void> {
  const user = auth().currentUser;
  if (!user) {
    throw new Error("User not authenticated");
  }

  const db = firestore();
  const batch = db.batch();

  const journalRef = db.collection("journals").doc(journalId);
  const userRef = db.collection("users").doc(user.uid);

  batch.update(journalRef, {
    members: firestore.FieldValue.arrayUnion(user.uid),
  });

  batch.update(userRef, {
    journals: firestore.FieldValue.arrayUnion(journalId),
  });

  await batch.commit();
}
