// success
// 200 - ok, 201 - created, 202 - accepted, 204 - no content
// redirection
// 301 - moved permanently, 302 - found, 304 - not modified
// client errors
// 400 - bad request, 401 - unauthorized, 403 - forbidden, 404 - not found
// 405 - method not allowed, 409 - conflict, 422 - unprocessable entity, 429 - too many requests

const express = require("express");
const booksRouter = require("./routes/books.routes");

const app = express();
// for JSON request body parsing
app.use(express.json());

// The book handlers live in routes/books.routes.js; mounting them here keeps
// the /books prefix in one place. Must stay above the 404 handler.
app.use("/books", booksRouter);

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
