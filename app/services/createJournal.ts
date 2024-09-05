import firestore from "@react-native-firebase/firestore";
import auth from "@react-native-firebase/auth";
import "react-native-get-random-values";
import { customAlphabet } from "nanoid/non-secure";
import { Journal, JournalData } from "../types/journal";
import storage from "@react-native-firebase/storage";
const nanoid = customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789", 8);

export async function createJournal(
  name: string,
  icon: string,
  isPersonal: boolean = false
): Promise<Journal> {
  const user = auth().currentUser;
  if (!user) {
    throw new Error("User not authenticated");
  }

  const db = firestore();

  let journalId = isPersonal ? user.uid : db.collection("journals").doc().id;
  let inviteCode: string | undefined;

  if (!isPersonal) {
    // Generate a unique invite code for non-personal journals
    let isUnique = false;
    while (!isUnique) {
      inviteCode = nanoid(8);
      const inviteDoc = await db
        .collection("journalInvites")
        .doc(inviteCode)
        .get();
      if (!inviteDoc.exists) {
        isUnique = true;
      }
    }
  }
  let iconUrl: string | undefined;

  if (icon) {
    const iconRef = storage().ref(`journals/${journalId}/icon`);
    await iconRef.putFile(icon);
    iconUrl = await iconRef.getDownloadURL();
  }
  const journalData: JournalData = {
    name,
    createdBy: user.uid,
    createdAt: firestore.FieldValue.serverTimestamp(),
    members: [user.uid],
    icon: iconUrl || "", // Use the uploaded icon URL or an empty string
    isPersonal,
    mode: "",
  };

  if (inviteCode) {
    journalData.inviteCode = inviteCode;
  }

  // Perform a batch write to ensure atomicity
  const batch = db.batch();
  batch.set(db.collection("journals").doc(journalId), journalData);

  if (!isPersonal && inviteCode) {
    batch.set(db.collection("journalInvites").doc(inviteCode), { journalId });
  }

  batch.update(db.collection("users").doc(user.uid), {
    journals: firestore.FieldValue.arrayUnion(journalId),
  });

  await batch.commit();

  return {
    id: journalId,
    ...journalData,
  };
}
