import firestore from "@react-native-firebase/firestore";

export type LeaderboardEntry = {
  id: string;
  points: number;
};

export type LeaderboardType = "daily" | "monthly" | "allTime";

export async function getLeaderboard(
  journalId: string,
  type: LeaderboardType,
  date?: Date
): Promise<LeaderboardEntry[]> {
  const db = firestore();
  const journalRef = db.collection("journals").doc(journalId);
  let leaderboardRef;

  if (type === "allTime") {
    leaderboardRef = journalRef
      .collection("leaderboard")
      .doc("allTime")
      .collection("users");
  } else if (type === "monthly") {
    const yearMonth = date
      ? `${date.getFullYear()}-${(date.getMonth() + 1)
          .toString()
          .padStart(2, "0")}`
      : `${new Date().getFullYear()}-${(new Date().getMonth() + 1)
          .toString()
          .padStart(2, "0")}`;
    leaderboardRef = journalRef
      .collection("leaderboard")
      .doc("monthly")
      .collection(yearMonth);
  } else {
    const dateString = date
      ? date.toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0];
    leaderboardRef = journalRef
      .collection("leaderboard")
      .doc("daily")
      .collection(dateString);
  }

  const leaderboardSnapshot = await leaderboardRef.get();
  const leaderboard: LeaderboardEntry[] = leaderboardSnapshot.docs
    .map((doc) => ({
      id: doc.id,
      points: doc.data().points as number,
    }))
    .sort((a, b) => b.points - a.points);

  return leaderboard;
}
