const cloud = require("wx-server-sdk");

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();
const BATCH_SIZE = 20;

async function upsertProgress(openid, wordId, progress) {
  const docId = `${openid}_${wordId}`;
  const data = {
    openid,
    wordId,
    status: progress.status || "new",
    ease: progress.ease || 0,
    mistakes: progress.mistakes || 0,
    correct: progress.correct || 0,
    nextReviewAt: progress.nextReviewAt || "",
    lastReviewedAt: progress.lastReviewedAt || "",
    updatedAt: db.serverDate()
  };

  try {
    await db.collection("user_progress").doc(docId).set({ data });
  } catch (error) {
    await db.collection("user_progress").add({
      data: {
        _id: docId,
        ...data
      }
    });
  }
}

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext();
  const progress = event.progress || {};
  const entries = Object.keys(progress).map((wordId) => [wordId, progress[wordId]]);

  for (let index = 0; index < entries.length; index += BATCH_SIZE) {
    const batch = entries.slice(index, index + BATCH_SIZE);
    await Promise.all(batch.map(([wordId, item]) => upsertProgress(OPENID, wordId, item)));
  }

  return {
    synced: entries.length
  };
};
