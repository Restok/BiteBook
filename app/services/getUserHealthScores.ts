import firestore from "@react-native-firebase/firestore";
import auth from "@react-native-firebase/auth";
import * as Localization from "expo-localization";
import moment from "moment-timezone";

export type HealthScore = {
  date: string;
  score: number;
  i: number;
  target: number;
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
    .orderBy("timestamp", "desc")
    .get();

  const fetchedScores: { [date: string]: HealthScore } = {};
  snapshot.docs.forEach((doc) => {
    const data = doc.data();
    fetchedScores[doc.id] = {
      date: doc.id,
      score: data.totalScore / Math.max(data.totalWeight, 1),
      i: 0,
      target: 1,
    };
  });

  const healthScores: HealthScore[] = [];
  let currentDate = startDate;
  while (currentDate <= endDate) {
    const dateString = getHealthScoreDateString(currentDate, period);
    const fetchedScore = fetchedScores[dateString];

    healthScores.push(
      fetchedScore || {
        date: dateString,
        score: 0,
        i: 0,
        target: 1,
      }
    );
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return healthScores;
}

export function getHealthScoreDateString(date, period) {
  const d = moment(date).tz(Localization.getCalendars()[0].timeZone);
  switch (period) {
    case "daily":
      return d.format("YYYY-MM-DD");
    case "weekly":
      return d.format("YYYY-WW");
    case "monthly":
      return d.format("YYYY-MM");
  }
}
