import firestore from "@react-native-firebase/firestore";
import auth from "@react-native-firebase/auth";

export type UserFood = {
  name: string;
  count: number;
  category: string;
  emoji: string;
  score: string;
  entryIds: string[];
};

export async function getUserTopFoods(limit: number = 5): Promise<UserFood[]> {
  const user = auth().currentUser;
  if (!user) {
    throw new Error("User not authenticated");
  }

  const db = firestore();
  const userFoodsRef = db
    .collection("userFoods")
    .doc(user.uid)
    .collection("foods");

  const snapshot = await userFoodsRef
    .orderBy("count", "desc")
    .limit(limit)
    .get();

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    const scores = (data.scores as Record<string, number>) || {};
    const score = getMostFrequentScore(scores);
    return {
      name: doc.id,
      ...data,
      score,
    } as UserFood;
  });
}
function getMostFrequentScore(scores: Record<string, number>): string {
  return Object.entries(scores).reduce((a, b) =>
    scores[a[0]] > scores[b[0]] ? a : b
  )[0];
}

export async function getUserFoodsByCategory(): Promise<
  Record<string, UserFood[]>
> {
  const user = auth().currentUser;
  if (!user) {
    throw new Error("User not authenticated");
  }

  const db = firestore();
  const userFoodsRef = db
    .collection("userFoods")
    .doc(user.uid)
    .collection("foods");

  const snapshot = await userFoodsRef.orderBy("count", "desc").get();

  const foodsByCategory: Record<string, UserFood[]> = {};

  snapshot.docs.forEach((doc) => {
    const data = doc.data();
    const scores = data.scores || {};
    const score = getMostFrequentScore(scores);
    const food = { name: doc.id, ...data, score } as UserFood;
    if (!foodsByCategory[food.category]) {
      foodsByCategory[food.category] = [];
    }
    foodsByCategory[food.category].push(food);
  });

  return foodsByCategory;
}
