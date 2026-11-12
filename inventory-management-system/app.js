const path = require("node:path");
require("dotenv").config({ path: path.join(__dirname, ".env"), quiet: true });

const mongoose = require("mongoose");

const connectionString = process.env.MONGODB_URI;

if (!connectionString) {
  console.error(
    "MONGODB_URI is not set. Copy .env.example to .env and add your connection string.",
  );
  console.error(`Expected env file: ${path.join(__dirname, ".env")}`);
  process.exit(1);
}

// The routes, schema model and middleware live in index.js, routes/ and
// models/; requiring it after dotenv means any process.env reads there see
// .env values.
const app = require("./index");

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});

mongoose
  .connect(connectionString)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error.message);
  });
