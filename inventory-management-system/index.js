const path = require("node:path");
const express = require("express");
const mongoose = require("mongoose");

// Load .env from this file's directory so `node index.js` works from any cwd.
// Existing environment variables take precedence over values in the file.
try {
  process.loadEnvFile(path.join(__dirname, ".env"));
} catch (error) {
  if (error.code !== "ENOENT") {
    throw error;
  }
}

const connectionString = process.env.MONGODB_URI;

if (!connectionString) {
  console.error(
    "MONGODB_URI is not set. Copy .env.example to .env and add your connection string."
  );
  console.error(`Expected env file: ${path.join(__dirname, ".env")}`);
  process.exit(1);
}

const app = express();
const port = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Hello world");
});

app.get("/about", (req, res) => {
  res.send("About page");
});

app.get("/contact", (req, res) => {
  res.send("Contact page");
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});

mongoose.connect(connectionString)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error.message);
  });