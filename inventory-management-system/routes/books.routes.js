const express = require("express");
const BookModel = require("../models/book.model");

const router = express.Router();

// Mounted at /books, so "/" here is /books.
router.post("/", async (req, res) => {
  try {
    const newBook = await BookModel.create(req.body);
    res.status(201).json(newBook);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const bookList = await BookModel.find();
    res.status(200).send(bookList);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// :id is a route parameter
router.get("/:id", async (req, res) => {
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

router.delete("/:id", async (req, res) => {
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

router.put("/:id", async (req, res) => {
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

module.exports = router;
