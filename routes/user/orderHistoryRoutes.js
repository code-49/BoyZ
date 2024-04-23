const express = require("express");

const UserModel = require("../../models/userModel");
const CategoryModel = require("../../models/categoryModel");
const OrderModel = require("../../models/orderModel");
const ReturnModel = require("../../models/returnModel");
const routes = express.Router();

routes.get("/", async (req, res) => {
  const id = req.session.userID;
  const user = await UserModel.findOne({ _id: id });
  if (!user) {
    return res.redirect("/");
  }
  const category = await CategoryModel.find({}, { name: 1 });

  const orders = await OrderModel.find({ customer: id }).sort({
    createdAt: -1,
  });
  res.render("./user/orderHistory", {
    user: user,
    category: category,
    orders: orders,
  });
});

routes.get("/status", async (req, res) => {
  const id = req.session.userID;
  const user = await UserModel.findOne({ _id: id });
  if (!user) {
    return res.redirect("/");
  }
  const category = await CategoryModel.find({}, { name: 1 });
  const data = await ReturnModel.find({ user: req.session.userID });
  res.render("./user/retrunStat.ejs", { user, category, orders: data });
});

module.exports = routes;
