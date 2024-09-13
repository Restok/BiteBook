import firestore from "@react-native-firebase/firestore";
import { Journal } from "../types/journal";
import auth from "@react-native-firebase/auth";

export async function getJournalFromInviteCode(
  inviteCode: string
): Promise<Journal | null> {
  const db = firestore();

  const inviteDoc = await db.collection("journalInvites").doc(inviteCode).get();

  if (!inviteDoc.exists) {
    return null;
  }

  const journalId = inviteDoc.data()?.journalId;

  if (!journalId) {
    return null;
  }

  const journalDoc = await db.collection("journals").doc(journalId).get();

  if (!journalDoc.exists) {
    return null;
  }

  const journalData = journalDoc.data();
  const currentUserId = auth().currentUser?.uid;
  if (journalData?.members?.includes(currentUserId)) {
    throw new Error("User is already a member of this journal");
  }
  return {
    id: journalDoc.id,
    name: journalData?.name || "",
    icon: journalData?.icon || "",
    createdBy: journalData?.createdBy || "",
    members: journalData?.members || [],
    isPersonal: journalData?.isPersonal || false,
    mode: journalData?.mode || "",
    inviteCode: inviteCode,
  } as Journal;
}
