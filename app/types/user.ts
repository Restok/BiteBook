import { Timestamp } from "@react-native-firebase/firestore";

export interface User {
  id: string;
  name: string;
  photoURL: string;
  createdAt: Timestamp;
  journals: string[];
}
