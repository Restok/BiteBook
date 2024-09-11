import firestore from "@react-native-firebase/firestore";
import auth from "@react-native-firebase/auth";
import storage from "@react-native-firebase/storage";

export async function deleteEntry(entryId: string): Promise<void> {
  const user = auth().currentUser;
  if (!user) {
    throw new Error("User not authenticated");
  }

  const db = firestore();
  const batch = db.batch();

  const entryRef = db.collection("entries").doc(entryId);
  const entryDoc = await entryRef.get();

  if (!entryDoc.exists) {
    throw new Error("Entry not found");
  }

  const entryData = entryDoc.data();
  if (entryData?.userId !== user.uid) {
    throw new Error("User not authorized to delete this entry");
  }

  // Delete the entry document
  batch.delete(entryRef);

  // Remove entry from journalEntries for each journal
  const journals = entryData?.journals || [];
  journals.forEach((journalId: string) => {
    const journalEntryRef = db
      .collection("journalEntries")
      .doc(journalId)
      .collection("entries")
      .doc(entryId);
    batch.delete(journalEntryRef);
  });

  // Commit the batch write
  await batch.commit();

  const images = entryData?.images || [];
  await Promise.all(
    images.map(async (imageUrl: string) => {
      const imageRef = storage().refFromURL(imageUrl);
      await imageRef.delete();
    })
  );
}
