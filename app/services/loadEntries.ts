import firestore, { Timestamp } from "@react-native-firebase/firestore";
import { Entry } from "../types/entry";

export async function loadEntries(
  journalId: string,
  date: Date
): Promise<Entry[]> {
  const db = firestore();

  // Set the start and end of the day
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  // Query the journalEntries collection
  const journalEntriesSnapshot = await db
    .collection("journalEntries")
    .doc(journalId)
    .collection("entries")
    .where("createdAt", ">=", Timestamp.fromDate(startOfDay))
    .where("createdAt", "<=", Timestamp.fromDate(endOfDay))
    .get();

  // Get the entry IDs
  const entryIds = journalEntriesSnapshot.docs.map((doc) => doc.id);
  if (entryIds.length === 0) {
    return [];
  }
  // Fetch the full entry documents
  const entriesSnapshot = await db
    .collection("entries")
    .where(firestore.FieldPath.documentId(), "in", entryIds)
    .get();

  // Map the documents to Entry objects
  if (entriesSnapshot.empty) {
    return [];
  }
  const entries: Entry[] = entriesSnapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      timestamp: data.timestamp.toMillis(),
      reactions: data.reactions?.[journalId] || {},
    } as Entry;
  });

  entries.sort((a, b) => b.timestamp - a.timestamp);
  return entries;
}
