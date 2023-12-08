const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");

const passport = require("passport");
const userController = require("../controller/userController");

const routes = express();

require("dotenv").config();

routes.set("views", "./views/user");

//session
routes.use(
  session({
    secret: process.env.sessionSecret,
    resave: false,
    saveUninitialized: false,
  })
);
routes.use(express.static("public"));

routes.use(express.json());
routes.use(express.urlencoded({ extended: true }));

routes.get("/", userController.load_home);
routes.get("/product", userController.load_product_details);
routes.get("/products", userController.load_products);
routes.get("/verify", userController.verifyMail);
routes.get("/logout", userController.logout);
routes.get("/otp", userController.load_otp);
routes.get("/forgot", userController.load_forgot);
routes.get("/newPass", userController.load_newpass);

routes.post("/forgot", userController.send_otp);
routes.post("/newPass", userController.changePass);
routes.post("/otp", userController.verify_otp);
routes.post("/signup", userController.register_user);
routes.post("/login", userController.login_user);

// routes.get("*", userController.load_home);

module.exports = routes;
