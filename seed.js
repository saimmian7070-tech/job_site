const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env.local") });

const { seedJobs } = require("./lib/seedJobs.js");

seedJobs()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });