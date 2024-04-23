const express = require("express");

const routes = express.Router();

const profileController = require("../../controller/user/profileController");

routes.get("/", profileController.load_profile);
routes.get("/changePassword", profileController.load_password);
routes.get("/forgotPassword", profileController.load_change_pass);
routes.get("/delete-address/:addressID", profileController.delete_address);
routes.get("/cancellOrder/:orderID", profileController.cancell_order);
routes.get("/return", profileController.return_order);
routes.get("/newPass", profileController.load_new_pass);
routes.get("/changeName", profileController.load_name);
routes.get("/changeEmail", profileController.load_email);

routes.post("/changeName", profileController.edit_name);
routes.post("/changeEmail", profileController.edit_email);
routes.post("/return-request", profileController.return_request);
routes.post("/add-address", profileController.add_address);
routes.post("/forgotPassword", profileController.send_change_pass_otp);
routes.post("/newPass", profileController.change_password);
routes.post("/changePassword", profileController.update_password);
module.exports = routes;
