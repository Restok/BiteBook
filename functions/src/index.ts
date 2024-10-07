import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

// import { GoogleGenerativeAI } from "@google/generative-ai";

import axios from "axios";

admin.initializeApp();
const firestore = admin.firestore();

// const genAI = new GoogleGenerativeAI(functions.config().gemini.api_key);
import * as moment from "moment-timezone";
import * as stringSimilarity from "string-similarity";
import { Message } from "firebase-admin/lib/messaging/messaging-api";
import OpenAI from "openai";

export const processNewEntry = functions.firestore
  .document("entries/{entryId}")
  .onCreate(async (snapshot, context) => {
    const entryData = snapshot.data();
    const entryId = context.params.entryId;
    const entryType = entryData.entryType as string;
    sendNotificationsToJournalMembers(entryData).catch((error) => {
      console.error("Error sending notifications:", error);
    });
    if (entryType !== "meal" && entryType !== "snack") {
      return null;
    }
    try {
      const { points, score, totalWeight, ingredients } = await calculatePoints(
        entryData
      );
      await updatePointsAndLeaderboards(entryId, entryData, points);
      await updateUserHealthScores(
        entryData.userId,
        entryData.timestamp,
        score,
        totalWeight,
        1
      );
      await updateUserFoods(
        entryData.userId,
        entryId,
        ingredients,
        entryData.timestamp
      );
    } catch (error) {
      console.error("Error processing entry:", error);
    }

    return null; // Add this line
  });

async function sendNotificationsToJournalMembers(entryData: any) {
  const db = admin.firestore();
  const userId = entryData.userId;
  const journalIds: string[] = entryData.journals;

  // Fetch user data for the person posting
  const posterDoc = await db.collection("users").doc(userId).get();
  const posterName = posterDoc.data()?.name || "Someone";

  const notifiedUsers = new Set<string>();
  const notifications: Message[] = [];

  for (const journalId of journalIds) {
    const journalDoc = await db.collection("journals").doc(journalId).get();
    const journalData = journalDoc.data();

    if (!journalData) continue;

    const journalName = journalData.name;
    const memberIds = journalData.members || [];

    for (const memberId of memberIds) {
      if (memberId === userId || notifiedUsers.has(memberId)) continue;
      // if (notifiedUsers.has(memberId)) continue;

      const memberDoc = await db.collection("users").doc(memberId).get();
      const memberData = memberDoc.data();

      if (memberData?.fcmToken) {
        notifications.push({
          notification: {
            title: "New post",
            body: `${posterName} added a new entry to ${journalName}!`,
          },
          data: {
            journalId: journalId,
          },
          token: memberData.fcmToken,
        });
        notifiedUsers.add(memberId);
      }
    }
  }

  if (notifications.length > 0) {
    await admin.messaging().sendEach(notifications);
  }
}
async function calculatePoints(entryData: any): Promise<{
  score: number;
  points: number;
  totalWeight: number;
  ingredients: Ingredient[];
}> {
  const openai = new OpenAI({
    apiKey: functions.config().openai.api_key,
  });
  const imageParts = await Promise.all(
    entryData.images.map(async (imageUrl: string) => {
      const response = await axios.get(imageUrl, {
        responseType: "arraybuffer",
      });
      return Buffer.from(response.data, "binary").toString("base64");
    })
  );

  const prompt = `You are a nutrition analysis assistant in a food journal app.  Users upload images of their food, and you will analyze them to provide the following information:

1. **Ingredient Breakdown:** Identify all visible ingredients in the image.  If the dish is too complicated to name by ingredient, simplify to the dish name itself. But prefer ingredient breakdown wherever possible, and meaningful. Ingredient breakdown allows us to do much more fine-grained analysis. **Do not list both a dish name AND its individual components.**  For example, if you identify "cheeseburger," do *not* also list "bun," "patty," "cheese," etc.

2. **Serving Size Estimation:**  For each ingredient/dish, estimate the number of servings consumed in the image, rounded to the nearest 0.5.

3. **Health Score:** Rate each ingredient/dish with a color-coded health score: green, yellow, orange, or red.
    * **Green:** Natural, whole foods; generally beneficial and healthy options like lean proteins, healthy fats, and healthy carbohydrates. Any foods that are nutrient dense and generally recognized to be good for you, please put it here as green! Most nutritious homemade dishes, please put it here! Of course, it may be difficult to distinguish certain variations of foods(e.g sweetened vs. unsweetened). When you're not sure, give the user the benefit of the doubt and assume that it was cooked in a healthy way with healthy chocies ingredients score the food as green, if there are such caveats, make that suggestion/distinction in the reasoning rather than falsely penalizing.
    * **Yellow:**  Foods to consume in moderation. May contain some less healthy ingredients or be moderately processed.
    * **Orange:** Heavily processed, nutritionally sparse, or something to eat only occasionally.
    * **Red:** Ultra-processed foods that may have negative health impacts if consumed regularly or in large portions.

    **Important Note on Health Scores:** Evaluate based on the *quality* of the food, *not* on fat, sodium, or calorie content etc.  Healthy fats and naturally occurring sodium are beneficial.  Penalize ingredients based on excessive added sugar, preservatives, lack of nutritional value, etc.  Consider how the food is prepared (e.g., fried vs. baked) when assigning a score. Give the user the benefit of the doubt when you're not sure, aka, when you don't know, assume it's homemade with a healthy recipe! Prefer to avoid using portion size to contribute to your reasoning, just the quality of the food.

4. **Weight:** Assign a weight (1-10) to each ingredient/dish reflecting its caloric contribution to the meal.  Think of this as roughly the number of calories per 100.  So, 1 = ~100 calories, 5 = ~500 calories, 10 = ~1000+ calories. If the image incorporates a full hearty meal, the sum of all ingredients should almost always be >= 10.

5. **Category:** Assign each ingredient/dish to a category: Fruit, Vegetable, Protein, Nuts and seeds, Legumes, Dairy, Grains, Noodles/Pasta, Dessert, Drinks, Snacks, Other.

6. **Emoji:**  Include an emoji that *visually looks like* the ingredient/dish.

7. **Reasoning:** Provide a short, fun, and humorous 1-2 sentence explanation for the health score, directly addressing the user.  DO NOT MENTION "fat," "sodium," or "calories" in your reasoning. 




RESPOND WITH A LIST OF INGREDIENTS/DISHES aggregating all the images in the format below, do not include ANY other text.
**Response Format For each ingredient you see:** 
[Ingredient Name]: [Emoji], [Score: green, yellow, orange, or red], [Serving Size], [Category], [Weight], [Reasoning]


Example:
Broccoli: 🥦, green, 1, Vegetable, 2,  Steamed broccoli is a nutritional powerhouse!  Great choice for a healthy and delicious side.


If no food is visible or the image isn't about food, say nothing. Attached are image(s) to a user's post, titled: ${entryData.title}`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            ...imageParts.map(
              (base64Image) =>
                ({
                  type: "image_url",
                  image_url: {
                    url: `data:image/jpeg;base64,${base64Image}`,
                  },
                } as const)
            ),
          ],
        },
      ],
      max_tokens: 1024,
    });

    const analysisText = response.choices[0]?.message?.content || "";
    console.log("Analysis text:", analysisText);
    const ingredients = parseIngredients(analysisText);

    const { score, points, totalWeight } = calculateOverallScore(ingredients);
    await firestore.collection("entries").doc(entryData.id).update({
      nutritionAnalysis: ingredients,
      overallScore: score,
      points: points,
    });

    return { score, points, totalWeight, ingredients };
  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    throw error;
  }
}

interface Ingredient {
  name: string;
  score: string;
  servingSize: number;
  category: string;
  weight: number;
  reasoning: string;
  emoji: string;
  foodKey?: string;
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
        console.warn(`Invalid line format: ${line}`);
        return null;
      }
      const [emoji, score, servingSize, category, weight, ...reasoningParts] =
        details.split(",").map((s) => s.trim());
      const reasoning = reasoningParts.join(", ").trim().replace(/"/g, "");
      return {
        name: name.trim(),
        emoji,
        score: ["green", "yellow", "orange", "red"].includes(
          score.toLowerCase()
        )
          ? score.toLowerCase()
          : "yellow",
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
  totalWeight: number;
} {
  if (ingredients.length === 0) {
    console.warn("No valid ingredients to calculate score");
    return { score: 0, points: 0, totalWeight: 0 };
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
  return { score, points, totalWeight };
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
    if (!entryData.nutritionAnalysis) {
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
  let weightedScore = score * weight;
  if (score < 0) {
    weightedScore = -weightedScore;
  }
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
  const entryRef = firestore.collection("entries").doc(entryId);
  const updatedNutritionAnalysis = [];

  for (const ingredient of nutritionAnalysis) {
    const normalizedName = normalizeFoodName(ingredient.name);
    const similarFood = await findSimilarFood(userId, normalizedName);
    const foodKey = similarFood || normalizedName;
    const foodRef = userFoodsRef.doc(foodKey);

    batch.set(
      foodRef,
      {
        emoji: ingredient.emoji,
        count: admin.firestore.FieldValue.increment(1),
        lastConsumed: timestamp,
        category: ingredient.category,
        scores: {
          [ingredient.score]: admin.firestore.FieldValue.increment(1),
        },
      },
      { merge: true }
    );
    updatedNutritionAnalysis.push({
      ...ingredient,
      foodKey: foodKey,
    });
    // Add entry to the entries subcollection
    const foodRefEntryRef = foodRef.collection("entries").doc(entryId);
    batch.set(foodRefEntryRef, { timestamp: timestamp });
  }
  batch.update(entryRef, { nutritionAnalysis: updatedNutritionAnalysis });

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
  if (existingFoodNames.length === 0) {
    return null;
  }
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
    const foodKey = ingredient.foodKey;
    if (!foodKey) continue;

    const foodRef = userFoodsRef.doc(foodKey);
    batch.update(foodRef, {
      count: admin.firestore.FieldValue.increment(-1),
      scores: {
        [ingredient.score]: admin.firestore.FieldValue.increment(-1),
      },
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
