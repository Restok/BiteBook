import firestore from "@react-native-firebase/firestore";
import auth from "@react-native-firebase/auth";
import storage from "@react-native-firebase/storage";

export async function createEntry(entry: {
  images: string[];
  title: string;
  type: string;
  time: Date;
  journals: string[];
}): Promise<string> {
  const user = auth().currentUser;
  if (!user) {
    throw new Error("User not authenticated");
  }

  const db = firestore();
  const batch = db.batch();
  const entryRef = db.collection("entries").doc();
  // Upload images
  const imageUrls = await Promise.all(
    entry.images.map(async (imageUri, index) => {
      const reference = storage().ref(`entries/${entryRef.id}/image${index}`);
      await reference.putFile(imageUri);
      return await reference.getDownloadURL();
    })
  );
  const entryData = {
    id: entryRef.id,
    userId: user.uid,
    title: entry.title,
    entryType: entry.type.toLowerCase(),
    createdAt: firestore.FieldValue.serverTimestamp(),
    updatedAt: firestore.FieldValue.serverTimestamp(),
    timestamp: firestore.Timestamp.fromDate(entry.time),
    journals: entry.journals,
    images: imageUrls,
  };
  batch.set(entryRef, entryData);

  // Add entry to journalEntries for each journal
  entry.journals.forEach((journalId) => {
    const journalEntryRef = db
      .collection("journalEntries")
      .doc(journalId)
      .collection("entries")
      .doc(entryRef.id);
    batch.set(journalEntryRef, {
      createdAt: entryData.createdAt,
      timestamp: entryData.timestamp,
    });
  });

  // Commit the batch write
  await batch.commit();

  return entryRef.id;
}
