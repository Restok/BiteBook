import firestore from "@react-native-firebase/firestore";
import auth from "@react-native-firebase/auth";

export async function updateReaction(
  entryId: string,
  journalId: string,
  emoji: string
): Promise<void> {
  const user = auth().currentUser;
  if (!user) {
    throw new Error("User not authenticated");
  }

  const db = firestore();
  const entryRef = db.collection("entries").doc(entryId);

  await db.runTransaction(async (transaction) => {
    const entryDoc = await transaction.get(entryRef);
    if (!entryDoc.exists) {
      throw new Error("Entry not found");
    }

    const entryData = entryDoc.data();
    const reactions = entryData?.reactions || {};
    const journalReactions = reactions[journalId] || {};
    let oldEmoji = "";
    Object.keys(journalReactions).forEach((reactionEmoji) => {
      if (journalReactions[reactionEmoji].includes(user.uid)) {
        oldEmoji = reactionEmoji;
        journalReactions[reactionEmoji] = journalReactions[
          reactionEmoji
        ].filter((uid) => uid !== user.uid);
        if (journalReactions[reactionEmoji].length === 0) {
          delete journalReactions[reactionEmoji];
        }
      }
    });

    if (oldEmoji !== emoji) {
      if (!journalReactions[emoji]) {
        journalReactions[emoji] = [];
      }
      journalReactions[emoji].push(user.uid);
    }

    transaction.update(entryRef, {
      [`reactions.${journalId}`]: journalReactions,
    });
  });
}
