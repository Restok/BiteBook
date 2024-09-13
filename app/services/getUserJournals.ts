import firestore from "@react-native-firebase/firestore";
import auth from "@react-native-firebase/auth";
import { Journal } from "../types/journal";

export async function getUserJournals(): Promise<Journal[]> {
  const user = auth().currentUser;
  if (!user) {
    throw new Error("User not authenticated");
  }

  const userDoc = await firestore().collection("users").doc(user.uid).get();
  const userData = userDoc.data();

  if (!userData || !userData.journals) {
    return [];
  }

  const journalPromises = userData.journals.map((journalId: string) =>
    firestore().collection("journals").doc(journalId).get()
  );

  const journalDocs = await Promise.all(journalPromises);

  return journalDocs
    .filter((doc) => doc.exists)
    .map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data?.name || "",
        icon: data?.icon || "",
        createdBy: data?.createdBy || "",
        members: data?.members || [],
        isPersonal: data?.isPersonal || false,
        mode: data?.mode || "",
        inviteCode: data?.inviteCode,
      } as Journal;
    });
}
