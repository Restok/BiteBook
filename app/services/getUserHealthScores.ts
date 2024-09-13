import firestore from "@react-native-firebase/firestore";
import auth from "@react-native-firebase/auth";

export type HealthScore = {
  date: string;
  score: number;
};

export type Period = "daily" | "weekly" | "monthly";

export async function getUserHealthScores(
  period: Period,
  startDate: Date,
  endDate: Date
): Promise<HealthScore[]> {
  const user = auth().currentUser;
  if (!user) {
    throw new Error("User not authenticated");
  }

  const db = firestore();
  const userHealthScoresRef = db
    .collection("userHealthScores")
    .doc(user.uid)
    .collection(`${period}Scores`);

  const snapshot = await userHealthScoresRef
    .where("timestamp", ">=", startDate)
    .where("timestamp", "<=", endDate)
    .orderBy("timestamp", "asc")
    .get();

  const healthScores: HealthScore[] = snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      date: doc.id,
      score: data.totalScore / data.totalWeight,
    };
  });

  return healthScores;
}
