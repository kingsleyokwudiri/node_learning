const mongoose = require("mongoose");

const bookSchema = mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  countInStock: { type: Number, required: true },
});

module.exports = mongoose.model("Book", bookSchema);
