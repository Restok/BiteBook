import firestore from "@react-native-firebase/firestore";
import auth from "@react-native-firebase/auth";
import { Journal } from "../types/journal";
export async function leaveJournal(journal: Journal): Promise<void> {
  const user = auth().currentUser;
  if (!user) {
    throw new Error("User not authenticated");
  }

  const db = firestore();
  const journalRef = db.collection("journals").doc(journal.id);
  const userRef = db.collection("users").doc(user.uid);
  console.log(user.uid);
  console.log(journal.id);
  // Start a batch write
  const batch = db.batch();

  if (journal.members.length === 1) {
    // If user is the only member, delete the journal
    batch.delete(journalRef);
    if (journal.inviteCode) {
      batch.delete(db.collection("journalInvites").doc(journal.inviteCode));
    }
  } else {
    // Remove user from journal members
    batch.update(journalRef, {
      members: firestore.FieldValue.arrayRemove(user.uid),
    });

    if (journal.createdBy === user.uid) {
      const newCreator = journal.members.find(
        (memberId) => memberId !== user.uid
      );
      if (newCreator) {
        batch.update(journalRef, { createdBy: newCreator });
      }
    }
  }

  // Remove journal from user's journals
  batch.update(userRef, {
    journals: firestore.FieldValue.arrayRemove(journal.id),
  });

  try {
    await batch.commit();
  } catch (error) {
    console.error("Detailed error:", JSON.stringify(error, null, 2));
    throw error;
  }
}
