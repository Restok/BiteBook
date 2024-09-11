import firestore from "@react-native-firebase/firestore";
import { User } from "../types/user"; // Assuming you have a User type defined

export async function getBatchUsersByIds(
  userIds: string[]
): Promise<Record<string, User | null>> {
  const usersRef = firestore().collection("users");
  const userSnapshots = await Promise.all(
    userIds.map((id) => usersRef.doc(id).get())
  );

  const users: Record<string, User> = {};
  userSnapshots.forEach((snapshot) => {
    if (snapshot.exists) {
      const userData = snapshot.data() as User;
      users[snapshot.id] = { id: snapshot.id, ...userData };
    }
  });

  return users;
}
