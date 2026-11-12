// success
// 200 - ok, 201 - created, 202 - accepted, 204 - no content
// redirection
// 301 - moved permanently, 302 - found, 304 - not modified
// client errors
// 400 - bad request, 401 - unauthorized, 403 - forbidden, 404 - not found
// 405 - method not allowed, 409 - conflict, 422 - unprocessable entity, 429 - too many requests

const express = require("express");
const mongoose = require("mongoose");

const app = express();
// for JSON request body parsing
app.use(express.json());

const bookSchema = mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  countInStock: { type: Number, required: true },
});
const BookModel = mongoose.model("Book", bookSchema);

// /books is an endpoint.
app.post("/books", async (req, res) => {
  try {
    const newBook = await BookModel.create(req.body);
    res.status(201).json(newBook);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.get("/books", async (req, res) => {
  try {
    const bookList = await BookModel.find();
    res.status(200).send(bookList);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
// :id is a route parameter
app.get("/books/:id", async (req, res) => {
  try {
    const book = await BookModel.findById(req.params.id);
    if (!book) {
      return res.status(400).json({ message: "Book not found" });
    }
    res.status(200).json(book);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.delete("/books/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deletedBook = await BookModel.findByIdAndDelete(id);
    if (!deletedBook) {
      return res.status(400).json({ message: "Book not found" });
    }
    res.status(200).json({ message: "Book deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.put("/books/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updatedBook = await BookModel.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!updatedBook) {
      return res.status(400).json({ message: "Book not found" });
    }
    res.status(200).json({ message: "Book updated successfully", updatedBook });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Unmatched routes return JSON instead of Express's default HTML page.
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Express 5 forwards rejected promises from async handlers here, so a failed
// validation becomes a 400 instead of an HTML 500 leaking a stack trace.
// `next` is unused but required: Express only treats 4-arg middleware as an
// error handler.
app.use((error, req, res, next) => {
  if (error.name === "ValidationError") {
    return res.status(400).json({
      message: "Validation failed",
      errors: Object.fromEntries(
        Object.entries(error.errors).map(([field, detail]) => [
          field,
          detail.message,
        ]),
      ),
    });
  }

  if (error.name === "SyntaxError" && error.status === 400) {
    return res.status(400).json({ message: "Invalid JSON body" });
  }

  console.error(error);
  res.status(500).json({ message: "Internal server error" });
});

module.exports = app;
