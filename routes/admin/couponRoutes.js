const express = require("express");

const couponController = require("../../controller/couponController");
const { isLogin } = require("../../middleware/adminAuth");

const route = express.Router();

route.get("/", couponController.load_coupons);
route.get("/delete", couponController.delete_coupon);
route.get("/active", couponController.change_status);

route.post("/", isLogin, couponController.add_coupon);

module.exports = route;
