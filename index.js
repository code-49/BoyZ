//// modules
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const session = require("express-session");

//// environment file
require("dotenv").config();

////route files
//admin
const adminRoutes = require("./routes/admin/adminRoutes");
//user
const userRoutes = require("./routes/user/userRoutes");
const wishlistRoutes = require("./routes/user/wishlistRoutes");
const cartRoutes = require("./routes/user/cartRoutes");
const profileRoutes = require("./routes/user/profileRoutes");
const accountRoutes = require("./routes/user/accountRoutes");
const couponRoutes = require("./routes/user/couponRoutes");
const orderHistory = require("./routes/user/orderHistoryRoutes");
////utils
const CustomError = require("./utils/customError");

const db_connection_string = process.env.MONGO_CONN_STR;

const app = express();

app.set("view engine", "ejs");
app.use(express.static("public")); //express.static parameter path or folder name

//parsing form data
app.use(bodyParser.json(), bodyParser.urlencoded({ extended: true }));

//session configuration
app.use(
  session({
    secret: process.env.sessionSecret,
    resave: false,
    saveUninitialized: false,
  })
);

//admin routes
app.use("/admin", adminRoutes);
//user routes
app.use("/", userRoutes);
app.use("/wishlist", wishlistRoutes);
app.use("/profile", profileRoutes);
app.use("/cart", cartRoutes);
app.use("/account", accountRoutes);
app.use("/coupon", couponRoutes);
app.use("/order-history", orderHistory);

//if no other route doesnt exist
app.all("*", (req, res, next) => {
  const err = new CustomError("Page not found", 404);
  next(err);
});

const ErrorController = require("./middleware/errorHandler");
//global error handling middleware
app.use(ErrorController);

mongoose
  .connect(db_connection_string)
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log("Connected to DB and listening");
    });
  })
  .catch((error) => {
    console.log(error.message);
  });
