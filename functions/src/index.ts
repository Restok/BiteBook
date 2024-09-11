import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { GoogleGenerativeAI } from "@google/generative-ai";
import axios from "axios";

admin.initializeApp();
const firestore = admin.firestore();

const genAI = new GoogleGenerativeAI(functions.config().gemini.api_key);

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
  // Fetch and upload images to Gemini
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
  A category for each ingredient/food. Categories are: Fruit, Vegetable, Protein, Nuts and seeds, Legumes, Dairy, Grains, Noodles/Pasta, and Other

  If listing the ingredients doesn't give an accurate reflection of the nutritional content, then replace ALL the ingredients in that dish with just the dish name, score, and serving size. Otherwise, respond ONLY with the ingredient and scores in this format. If you already name a dish, for example, cheeseburger, DO NOT then also include burger patty, buns, etc in the ingredient list:

  Make sure NOTHING GETS INCLUDED TWICE. Meaning no ingredient gets double dipped. If you include a dish, DO NOT then also include the ingredients of that dish.  Low sugar desserts might be yellow, higher sugar desserts would be orange. Sugary drinks would be red. Very processed snacks and junk food would be red, cleaner snacks would be yellow-orange, or even green.

Respond in this format. Do not say ANYTHING else:
  ingredient name: a good representative emoji, score, number for serving size, category, weight, short 1-2 sentences for score rating, talking to the user in a fun light hearted tone. In your reasoning, try not to mention what the actual score is.
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
