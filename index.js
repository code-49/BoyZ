const express = require("express");
const mongoose = require("mongoose");

require("dotenv").config();

const adminRoutes = require("./routes/adminRoutes");
const userRoutes = require("./routes/userRoutes");

const db_connection_string = process.env.MONGO_CONN_STR;

const app = express();

app.set("view engine", "ejs");

app.use("/", userRoutes);
app.use("/admin", adminRoutes);

mongoose
  .connect(db_connection_string)
  .then(() => {
    app.listen(3000, () => {
      console.log("Connected to DB and listening to port 3000...");
    });
  })
  .catch((error) => {
    console.log(error.message);
  });
