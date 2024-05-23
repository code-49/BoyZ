const express = require("express");

const routes = express.Router();

const cartController = require("../../controller/user/cartController");
routes.get("/", cartController.load_cart);
routes.get("/add-to-cart", cartController.add_to_cart);
routes.get("/change-quantity", cartController.change_quantity);
routes.get("/remove-from-cart", cartController.delete_from_cart);
routes.get("/checkout", cartController.load_checkout);
routes.get("/success", cartController.load_success);
routes.get("/wallet-fail", cartController.load_wallet_fail);

routes.post("/place-order", cartController.place_order);
routes.post("/create-order", cartController.create_order);
routes.post("/wallet-order", cartController.wallet_order);
routes.post("/save-order", cartController.save_order);

module.exports = routes;
