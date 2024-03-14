const express = require("express");

const routes = express.Router();

const profileController = require("../../controller/user/profileController");

routes.get("/", profileController.load_profile);
routes.get("/changePassword", profileController.load_change_pass);
routes.get("/delete-address/:addressID", profileController.delete_address);
routes.get("/cancellOrder/:orderID", profileController.cancell_order);
routes.get("/returnOrder/:orderID", profileController.return_order);
routes.get("/newPass", profileController.load_new_pass);

routes.post("/add-address", profileController.add_address);
routes.post("/changePassword", profileController.send_change_pass_otp);
routes.post("/newPass", profileController.change_password);

module.exports = routes;
