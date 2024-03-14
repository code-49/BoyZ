const express = require("express");
//controllers
const couponController = require("../../controller/couponController");

const routes = express.Router();

routes.get("/", couponController.apply_coupon);

module.exports = routes;
