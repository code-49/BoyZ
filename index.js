const express = require("express");
const mongoose = require("mongoose");

const db_connection_string = "mongodb://127.0.0.1:27017/boyzDB";

const app = express();

app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.render("index");
});

mongoose.connect(db_connection_string).then(() => {
  app.listen(2020, () => {
    console.log("Connected to DB and listening to port 2020...");
  });
});
