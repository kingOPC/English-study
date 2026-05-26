const cloud = require("wx-server-sdk");

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext();
  const log = {
    openid: OPENID,
    level: event.level || "",
    mode: event.mode || "level",
    score: Number(event.score) || 0,
    total: Number(event.total) || 0,
    wrongWordIds: Array.isArray(event.wrongWordIds) ? event.wrongWordIds : [],
    createdAt: db.serverDate()
  };

  const result = await db.collection("quiz_logs").add({
    data: log
  });

  return {
    id: result._id
  };
};
