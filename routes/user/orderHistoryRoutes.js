const express = require("express");

const UserModel = require("../../models/userModel");
const CategoryModel = require("../../models/categoryModel");
const OrderModel = require("../../models/orderModel");
const ReturnModel = require("../../models/returnModel");
const routes = express.Router();

routes.get("/", async (req, res, next) => {
  try {
    const id = req.session.userID;
    const user = await UserModel.findOne({ _id: id });
    if (!user) {
      return res.redirect("/");
    }
    const category = await CategoryModel.find({}, { name: 1 });
    const status = req.query.status || "Pending";
    const orders = await OrderModel.find({ customer: id, status: status }).sort(
      {
        createdAt: -1,
      }
    );

    const returns = await ReturnModel.find({});

    orders.forEach((order, orderIndex) => {
      order.products.forEach((product, productIndex) => {
        let isRequested = false;
        returns.forEach((item) => {
          // console.log("order =", order, item);
          if (order._id.toString() == item.order.toString()) {
            if (product.productID.toString() == item.product.toString()) {
              isRequested = true;
            }
          }
        });
        orders[orderIndex].products[productIndex].requested = isRequested;
      });
    });

    res.render("./user/orderHistory", {
      user: user,
      category: category,
      orders: orders,
      status: req.query.status || "Pending",
    });
  } catch (error) {
    next(error);
  }
});

routes.get("/status", async (req, res) => {
  try {
    const id = req.session.userID;
    const user = await UserModel.findOne({ _id: id });
    if (!user) {
      return res.redirect("/");
    }
    const category = await CategoryModel.find({}, { name: 1 });
    const data = await ReturnModel.find({ user: req.session.userID });
    res.render("./user/retrunStat.ejs", { user, category, orders: data });
  } catch (error) {
    res.send(error.message);
  }
});

module.exports = routes;
