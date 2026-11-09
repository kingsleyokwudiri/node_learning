const express = require("express");
const mongoose = require("mongoose");
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

const connectionString = process.env.MONGODB_URI;

if (!connectionString) {
  console.error(
    "MONGODB_URI is not set. Copy .env.example to .env and add your connection string."
  );
  process.exit(1);
}

mongoose.connect(connectionString)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error.message);
  });