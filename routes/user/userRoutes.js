const express = require("express");
//controllers
const userController = require("../../controller/user/userController");

const productFilter = require("../../utils/productFilterData");

const routes = express.Router();

routes.get("/", userController.load_landing);
routes.get("/product/:productID?", userController.load_product_details);
routes.use(
  "/products",
  productFilter.setFilterData,
  userController.load_products
);

module.exports = routes;
