const express = require("express");
const app = express();
const port = 3000;

app.get("/", (req, res) => {
  res.send("Hello world");
});

app.get("/about", (req, res) => {
  res.send("About page");
});

app.get("/contatc", (req, res) => {
  res.send("Contact page");
});

app.listen(port, () => {
  console.log(`App listing on port ${3000}`);
});
