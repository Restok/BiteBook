import firestore from "@react-native-firebase/firestore";
import { Entry } from "../types/entry";

export async function loadSingleEntry(
  entryId: string,
  journalId: string
): Promise<Entry | null> {
  const db = firestore();

  const entryDoc = await db.collection("entries").doc(entryId).get();

  if (!entryDoc.exists) {
    return null;
  }

  const data = entryDoc.data();
  return {
    id: entryDoc.id,
    ...data,
    timestamp: data?.timestamp.toMillis(),
    reactions: data?.reactions?.[journalId] || {},
  } as Entry;
}
