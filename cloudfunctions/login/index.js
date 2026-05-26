const cloud = require("wx-server-sdk");

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();

exports.main = async () => {
  const { OPENID } = cloud.getWXContext();
  const now = db.serverDate();
  const users = db.collection("users");

  const existing = await users.where({ openid: OPENID }).limit(1).get();
  if (existing.data.length) {
    await users.doc(existing.data[0]._id).update({
      data: {
        lastLoginAt: now
      }
    });
  } else {
    await users.add({
      data: {
        openid: OPENID,
        mode: "free",
        createdAt: now,
        lastLoginAt: now
      }
    });
  }

  return {
    openid: OPENID
  };
};
