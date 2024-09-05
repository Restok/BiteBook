import { FirebaseFirestoreTypes } from "@react-native-firebase/firestore";

export interface Journal {
  id: string;
  name: string;
  createdBy: string;
  createdAt: FirebaseFirestoreTypes.FieldValue;
  members: string[];
  icon: string;
  inviteCode?: string;
  isPersonal: boolean;
  mode: string;
}

export type JournalData = Omit<Journal, "id">;
