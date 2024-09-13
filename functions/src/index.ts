import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { GoogleGenerativeAI } from "@google/generative-ai";
import axios from "axios";

admin.initializeApp();
const firestore = admin.firestore();

const genAI = new GoogleGenerativeAI(functions.config().gemini.api_key);
import * as moment from "moment-timezone";
import * as stringSimilarity from "string-similarity";

export const processNewEntry = functions.firestore
  .document("entries/{entryId}")
  .onCreate(async (snapshot, context) => {
    const entryData = snapshot.data();
    const entryId = context.params.entryId;
    const entryType = entryData.entryType as string;
    if (entryType !== "meal" && entryType !== "snack") {
      console.log("Entry is not a meal or snack. Skipping processing.");
      return null;
    }

    try {
      const points = await calculatePoints(entryData);
      await updatePointsAndLeaderboards(entryId, entryData, points);
      await updateUserHealthScores(
        entryData.userId,
        entryData.timestamp,
        entryData.overallScore,
        getTotalWeight(entryData.nutritionAnalysis),
        1
      );
      await updateUserFoods(
        entryData.userId,
        entryId,
        entryData.nutritionAnalysis,
        entryData.timestamp
      );
    } catch (error) {
      console.error("Error processing entry:", error);
    }
    return null; // Add this line
  });

async function calculatePoints(entryData: any): Promise<number> {
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-pro-exp-0827",
    generationConfig: {
      temperature: 0,
      maxOutputTokens: 1024,
    },
  });
  const imageParts = await Promise.all(
    entryData.images.map(async (imageUrl: string) => {
      const response = await axios.get(imageUrl, {
        responseType: "arraybuffer",
      });
      const base64Image = Buffer.from(response.data, "binary").toString(
        "base64"
      );
      return {
        inlineData: {
          data: base64Image,
          mimeType: "image/jpeg", // Adjust if needed based on the actual image type
        },
      };
    })
  );

  const prompt = `You are a nutrition analysis assistant in a food journal app. The user uploads images of food that they eat, and you are required to provide:
  A break down of the ingredients in the image
  for each ingredient, how many serving sizes they likely consumed, rounded to the nearest 0.5
  for each ingredient, a score of red, yellow, orange, to green. Any natural ingredients, please list as green, any foods recognized to be generally beneficial and health, healthy fats, healthy proteins, healthy carbs, please list as green. Yellow foods are still generally okay, but they're processed, such as white rice, compared to brown rice which would be green. Orange is starting to be fairly heavily processed, nutritionally sparse, or just something recognized as you shouldn't eat very often. Red is just ultra processed, would hurt your body consumed in more than a tiny portion.
  for each ingredient, also assign a weight of how much content it contributes to the overall meal. This is used to calculate the overall health score. The overall health score is scored as: sum of all ingredients(weight*health_score)/total weight. Each weight value should be 1-10. A meal worthy amount of an ingredient would be 10, a bite or 2 would be a 1.
  A category for each ingredient/food. Categories are: Fruit, Vegetable, Protein, Nuts and seeds, Legumes, Dairy, Grains, Noodles/Pasta, Dessert, Snacks, and Other

  If listing the ingredients doesn't give an accurate reflection of the nutritional content, then replace ALL the ingredients in that dish with just the dish name, score, and serving size. Otherwise, respond ONLY with the ingredient and scores in this format. If you already name a dish, for example, cheeseburger, DO NOT then also include burger patty, buns, etc in the ingredient list:

  Make sure NOTHING GETS INCLUDED TWICE. Meaning no ingredient gets double dipped. If you include a dish, DO NOT then also include the ingredients of that dish.  Low sugar desserts might be yellow, higher sugar desserts would be orange. Sugary drinks would be red. Very processed snacks and junk food would be red, cleaner snacks would be yellow-orange, or even green.
  If the way an ingredient is cooked, or prepared, influences your health score rating, please add the relevant adjective to the ingredient name.

Respond in this format. Do not say ANYTHING else:
  ingredient name: a good representative emoji, score, number for serving size, category, weight, short 1-2 sentences for score rating, talking to the user in a fun light hearted tone. Answer with life and personality! In your reasoning, try not to mention what the actual score is.
Each line should be  
[string]: [emoji char], [string, red, yellow, orange, or green], [number], [string], [number], [string]

If you do not see food, or the pictures does not look like that about food, return nothing. If a dish looks like it has more than 10 ingredients, just simplify to the dish name. If you are not confident about the ingredients, just give a general dish name

As a hollistic nutritionist, you believe FAT is NOT BAD, Sodium is NOT BAD, calories are NOT BAD. In fact, from healthy sources, they are GOOD. What is important is the QUALITY of the food and the nutritional value. You NEVER say FAT in your reasoning, you NEVER say SODIUM in your reasoning, you NEVER say calories. Concerning elements are excessive added sugar, preservatives, artificial flavoring and coloring, lack of nutrition, etc

If you do not see food, or the pictures does not look like that about food, return nothing. If a dish looks like it has more than 10 ingredients, just simplify to the dish name. If you are not confident about the ingredients, just give a general dish name`;
  const result = await model.generateContent([...imageParts, prompt]);
  const response = await result.response;
  const analysisText = response.text();
  console.log("Analysis text:", analysisText);
  const ingredients = parseIngredients(analysisText);

  const { score, points } = calculateOverallScore(ingredients);
  // Update the entry with the detailed analysis
  await firestore.collection("entries").doc(entryData.id).update({
    nutritionAnalysis: ingredients,
    overallScore: score,
    points: points,
  });

  return points;
}

interface Ingredient {
  name: string;
  score: string;
  servingSize: number;
  category: string;
  weight: number;
  reasoning: string;
  emoji: string;
}

function parseIngredients(analysisText: string): Ingredient[] {
  if (!analysisText) {
    console.error("Empty analysis text");
    return [];
  }
  const lines = analysisText.split("\n").filter((line) => line.trim() !== "");
  return lines
    .map((line) => {
      const [name, details] = line.split(":");
      if (!details) {
        console.error(`Invalid line format: ${line}`);
        return null;
      }
      const [emoji, score, servingSize, category, weight, ...reasoningParts] =
        details.split(",").map((s) => s.trim());
      const reasoning = reasoningParts.join(", ").trim().replace(/"/g, "");
      return {
        name: name.trim(),
        emoji,
        score,
        servingSize: parseFloat(servingSize) || 0,
        category,
        weight: parseFloat(weight) || 0,
        reasoning: reasoning,
      };
    })
    .filter((ingredient): ingredient is Ingredient => ingredient !== null);
}

function getTotalWeight(ingredients: Ingredient[]): number {
  return ingredients.reduce((sum, ing) => sum + (ing.weight || 0), 0);
}

function calculateOverallScore(ingredients: Ingredient[]): {
  score: number;
  points: number;
} {
  if (ingredients.length === 0) {
    console.warn("No valid ingredients to calculate score");
    return { score: 0, points: 0 };
  }
  const scoreMap = { green: 1, yellow: 0.7, orange: 0.5, red: 0.2 };
  const totalWeight = getTotalWeight(ingredients);
  const weightedScore = ingredients.reduce((sum, ing) => {
    const score = (ing.score || "").toLowerCase() as keyof typeof scoreMap;
    return sum + (scoreMap[score] || 0) * (ing.weight || 0);
  }, 0);
  const score =
    totalWeight > 0 ? Math.round((weightedScore / totalWeight) * 10) / 10 : 0;
  const points = Math.round(score * Math.min(10, totalWeight) * 10);
  return { score, points };
}

async function updatePointsAndLeaderboards(
  entryId: string,
  entryData: any,
  points: number
) {
  const batch = firestore.batch();

  // Ensure the timestamp is a Firestore Timestamp
  const timestamp =
    entryData.timestamp instanceof admin.firestore.Timestamp
      ? entryData.timestamp
      : admin.firestore.Timestamp.fromDate(new Date(entryData.timestamp));

  // Update points for each journal the entry belongs to
  for (const journalId of entryData.journals) {
    await updateJournalPoints(
      batch,
      journalId,
      entryData.userId,
      points,
      timestamp
    );
  }

  await batch.commit();
}

// Modify the existing updateJournalPoints function to handle negative points
async function updateJournalPoints(
  batch: FirebaseFirestore.WriteBatch,
  journalId: string,
  userId: string,
  points: number,
  timestamp: admin.firestore.Timestamp
) {
  const journalRef = firestore.collection("journals").doc(journalId);

  const dateStr = timestamp.toDate().toISOString().split("T")[0];
  const monthStr = dateStr.substring(0, 7);

  // Update all-time leaderboard
  batch.set(
    journalRef
      .collection("leaderboard")
      .doc("allTime")
      .collection("users")
      .doc(userId),
    {
      points: admin.firestore.FieldValue.increment(points),
    },
    { merge: true }
  );

  // Update monthly leaderboard
  batch.set(
    journalRef
      .collection("leaderboard")
      .doc("monthly")
      .collection(monthStr)
      .doc(userId),
    {
      points: admin.firestore.FieldValue.increment(points),
    },
    { merge: true }
  );

  // Update daily leaderboard
  batch.set(
    journalRef
      .collection("leaderboard")
      .doc("daily")
      .collection(dateStr)
      .doc(userId),
    {
      points: admin.firestore.FieldValue.increment(points),
    },
    { merge: true }
  );
}

export const handleEntryDeletion = functions.firestore
  .document("entries/{entryId}")
  .onDelete(async (snapshot, context) => {
    const entryData = snapshot.data();
    const entryId = context.params.entryId;
    const entryType = entryData.entryType as string;
    if (entryType !== "meal" && entryType !== "snack") {
      console.log(
        "Deleted entry was not a meal or snack. Skipping point removal."
      );
      return null;
    }

    try {
      await removePointsAndUpdateLeaderboards(entryId, entryData);
      await updateUserHealthScores(
        entryData.userId,
        entryData.timestamp,
        -entryData.overallScore,
        -getTotalWeight(entryData.nutritionAnalysis),
        -1
      );
      await removeUserFoods(
        entryData.userId,
        entryId,
        entryData.nutritionAnalysis
      );
    } catch (error) {
      console.error("Error removing points for deleted entry:", error);
    }
    return null;
  });

async function removePointsAndUpdateLeaderboards(
  entryId: string,
  entryData: any
) {
  const batch = firestore.batch();

  // Ensure the timestamp is a Firestore Timestamp
  const timestamp =
    entryData.timestamp instanceof admin.firestore.Timestamp
      ? entryData.timestamp
      : admin.firestore.Timestamp.fromDate(new Date(entryData.timestamp));
  if (!entryData.points) {
    console.log("Entry does not have an overallScore. Skipping point removal.");
    return;
  }
  const points = -entryData.points;

  // Remove points for each journal the entry belonged to
  for (const journalId of entryData.journals) {
    await updateJournalPoints(
      batch,
      journalId,
      entryData.userId,
      points,
      timestamp
    );
  }

  await batch.commit();
}

async function updateUserHealthScores(
  userId: string,
  timestamp: admin.firestore.Timestamp,
  score: number,
  weight: number,
  entryCountDelta: number
) {
  // Fetch user's timezone from user collection
  const userDoc = await firestore.collection("users").doc(userId).get();
  const userTimezone = userDoc.data()?.timezone || "UTC"; // Default to UTC if not set

  const date = moment(timestamp.toDate()).tz(userTimezone);
  const dayKey = date.format("YYYY-MM-DD");
  const weekKey = date.format("YYYY-WW");
  const monthKey = date.format("YYYY-MM");

  const batch = firestore.batch();
  const userHealthScoresRef = firestore
    .collection("userHealthScores")
    .doc(userId);
  const weightedScore = score * weight;

  // Update daily scores
  const dailyRef = userHealthScoresRef.collection("dailyScores").doc(dayKey);
  batch.set(
    dailyRef,
    {
      totalScore: admin.firestore.FieldValue.increment(weightedScore),
      totalWeight: admin.firestore.FieldValue.increment(weight),
      entryCount: admin.firestore.FieldValue.increment(entryCountDelta),
      timestamp: timestamp,
    },
    { merge: true }
  );

  // Update weekly scores
  const weeklyRef = userHealthScoresRef.collection("weeklyScores").doc(weekKey);
  batch.set(
    weeklyRef,
    {
      totalScore: admin.firestore.FieldValue.increment(weightedScore),
      totalWeight: admin.firestore.FieldValue.increment(weight),
      entryCount: admin.firestore.FieldValue.increment(entryCountDelta),
      timestamp: date.startOf("isoWeek").toDate(),
    },
    { merge: true }
  );

  // Update monthly scores
  const monthlyRef = userHealthScoresRef
    .collection("monthlyScores")
    .doc(monthKey);
  batch.set(
    monthlyRef,
    {
      totalScore: admin.firestore.FieldValue.increment(weightedScore),
      totalWeight: admin.firestore.FieldValue.increment(weight),
      entryCount: admin.firestore.FieldValue.increment(entryCountDelta),
      timestamp: date.startOf("month").toDate(),
    },
    { merge: true }
  );

  await batch.commit();
}
// Function to normalize food names
function normalizeFoodName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
  // .replace(/\s+/g, "_");
}

async function updateUserFoods(
  userId: string,
  entryId: string,
  nutritionAnalysis: Ingredient[],
  timestamp: admin.firestore.Timestamp
) {
  const batch = firestore.batch();
  const userFoodsRef = firestore
    .collection("userFoods")
    .doc(userId)
    .collection("foods");

  for (const ingredient of nutritionAnalysis) {
    const normalizedName = normalizeFoodName(ingredient.name);
    const similarFood = await findSimilarFood(userId, normalizedName);
    const foodRef = userFoodsRef.doc(similarFood || normalizedName);

    batch.set(
      foodRef,
      {
        emoji: ingredient.emoji,
        count: admin.firestore.FieldValue.increment(1),
        lastConsumed: timestamp,
        category: ingredient.category,
        [`scores.${ingredient.score}`]: admin.firestore.FieldValue.increment(1),
      },
      { merge: true }
    );
    // Add entry to the entries subcollection
    const entryRef = foodRef.collection("entries").doc(entryId);
    batch.set(entryRef, { timestamp: timestamp });
  }

  await batch.commit();
}

// Function to find the most similar existing food name
async function findSimilarFood(
  userId: string,
  foodName: string
): Promise<string | null> {
  const userFoodsRef = firestore
    .collection("userFoods")
    .doc(userId)
    .collection("foods");
  const existingFoods = await userFoodsRef.listDocuments();
  const existingFoodNames = existingFoods.map((doc) => doc.id);

  const matches = stringSimilarity.findBestMatch(
    normalizeFoodName(foodName),
    existingFoodNames
  );
  if (matches.bestMatch.rating > 0.8) {
    // If we find a similar food, we should return its normalized name (which is the document ID)
    return matches.bestMatch.target;
  }
  return null;
}

async function removeUserFoods(
  userId: string,
  entryId: string,
  nutritionAnalysis: Ingredient[]
) {
  const batch = firestore.batch();
  const userFoodsRef = firestore
    .collection("userFoods")
    .doc(userId)
    .collection("foods");

  for (const ingredient of nutritionAnalysis) {
    const normalizedName = normalizeFoodName(ingredient.name);
    const similarFood = await findSimilarFood(userId, normalizedName);
    const foodRef = userFoodsRef.doc(similarFood || normalizedName);

    batch.update(foodRef, {
      count: admin.firestore.FieldValue.increment(-1),
      [`scores.${ingredient.score}`]: admin.firestore.FieldValue.increment(-1),
    });

    // Remove entry from the entries subcollection
    const entryRef = foodRef.collection("entries").doc(entryId);
    batch.delete(entryRef);

    // Check if this was the last entry for this food
    const entriesSnapshot = await foodRef.collection("entries").count().get();
    if (entriesSnapshot.data().count === 1) {
      // If this was the last entry, delete the entire food document
      batch.delete(foodRef);
    } else {
      // Update lastConsumed to the timestamp of the most recent remaining entry
      const latestEntrySnapshot = await foodRef
        .collection("entries")
        .orderBy("timestamp", "desc")
        .limit(1)
        .get();
      if (!latestEntrySnapshot.empty) {
        const latestTimestamp = latestEntrySnapshot.docs[0].data().timestamp;
        batch.update(foodRef, { lastConsumed: latestTimestamp });
      }
    }
  }

  await batch.commit();
}
