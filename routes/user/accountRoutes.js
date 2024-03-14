const express = require("express");
//controllers
const accountController = require("../../controller/user/accountController");

const routes = express.Router();

routes.get("/verify/:verifyCode?", accountController.user_verification_page);
routes.get("/otp", accountController.load_otp_verification);
routes.get("/logout", accountController.user_logout);
routes.get("/resent-otp", accountController.resent_otp);

routes.post("/otp", accountController.otp_verification);
routes.post("/login", accountController.login_verification);
routes.post("/signup", accountController.register_user);

module.exports = routes;
