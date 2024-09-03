import firestore from "@react-native-firebase/firestore";
import auth from "@react-native-firebase/auth";
import { nanoid } from "nanoid";

export async function createJournal(name: string, icon: string) {
  const user = auth().currentUser;
  if (!user) {
    throw new Error("User not authenticated");
  }
  const db = firestore();

  // Generate a unique invite code
  let inviteCode;
  let isUnique = false;
  while (!isUnique) {
    inviteCode = nanoid(8); // Generate an 8-character nanoid
    const inviteDoc = await db
      .collection("journalInvites")
      .doc(inviteCode)
      .get();
    if (!inviteDoc.exists) {
      isUnique = true;
    }
  }

  // Create the journal document
  const journalRef = db.collection("journals").doc();
  const journalData = {
    name,
    createdBy: user.uid,
    createdAt: firestore.FieldValue.serverTimestamp(),
    members: [user.uid],
    icon,
    inviteCode,
  };

  // Create the journal invite document
  const inviteData = {
    journalId: journalRef.id,
  };

  const batch = db.batch();
  batch.set(journalRef, journalData);
  batch.set(db.collection("journalInvites").doc(inviteCode), inviteData);
  batch.update(db.collection("users").doc(user.uid), {
    journals: firestore.FieldValue.arrayUnion(journalRef.id),
  });

  await batch.commit();

  return {
    id: journalRef.id,
    ...journalData,
  };
}
