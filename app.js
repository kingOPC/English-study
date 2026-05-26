const store = require("./utils/store");

const CLOUD_ENV_ID = "cloud1-d6gqkkzru5ded9220";

App({
  onLaunch() {
    if (wx.cloud) {
      const cloudConfig = {
        traceUser: true
      };
      if (CLOUD_ENV_ID !== "YOUR_CLOUD_ENV_ID") {
        cloudConfig.env = CLOUD_ENV_ID;
      }
      wx.cloud.init(cloudConfig);
    }
    store.ensureSeedData();
  }
});
