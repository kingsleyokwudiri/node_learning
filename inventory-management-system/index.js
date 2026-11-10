// success
// 200 - ok, 201 - created, 202 - accepted, 204 - no content
// redirection
// 301 - moved permanently, 302 - found, 304 - not modified
// client errors
// 400 - bad request, 401 - unauthorized, 403 - forbidden, 404 - not found
// 405 - method not allowed, 409 - conflict, 422 - unprocessable entity, 429 - too many requests

const path = require("node:path");
require("dotenv").config({ path: path.join(__dirname, ".env"), quiet: true });

const express = require("express");
const mongoose = require("mongoose");

const connectionString = process.env.MONGODB_URI;

if (!connectionString) {
  console.error(
    "MONGODB_URI is not set. Copy .env.example to .env and add your connection string.",
  );
  console.error(`Expected env file: ${path.join(__dirname, ".env")}`);
  process.exit(1);
}

const app = express();
const port = process.env.PORT || 3000;
// for JSON request body parsing
app.use(express.json());

const bookSchema = mongoose.Schema({});
BookModel = mongoose.model("Book", bookSchema);

app.post("/books", async (req, res) => {
  const newBook = await BookModel.create(req.body);
  res.status(201).json(newBook);
});

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
