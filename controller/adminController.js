const ProductModel = require("../models/productModel");

const load_admin_login = (req, res) => {
  res.render("adminLogin");
};

const load_product_list = async (req, res) => {
  const products = await ProductModel.find();

  res.render("productMan", { pageName: "Category", products: products });
};

const load_category_list = (req, res) => {
  res.render("categoryMan", { pageName: "Category" });
};

const load_user_list = (req, res) => {
  res.render("userMan", { pageName: "Users" });
};

const load_dashboard = (req, res) => {
  res.render("dashboard", { pageName: "Dashboard" });
};

const load_add_product = (req, res) => {
  res.render("addProduct", { pageName: "Add Product" });
};

const load_order_list = (req, res) => {
  res.render("orderMan", { pageName: "Orders" });
};

const add_product = async (req, res) => {
  const product = new ProductModel({
    name: req.body.name,
    description: req.body.description,
    color: req.body.color,
    size: req.body.size,
    price: req.body.price,
    discount: req.body.discount,
    stock: req.body.stock,
    images: req.file.filename,
  });
  const productSaved = await product.save();
  res.render("addProduct", { pageName: "Add Product" });
};

module.exports = {
  load_admin_login,
  load_product_list,
  load_category_list,
  load_user_list,
  load_dashboard,
  load_add_product,
  load_order_list,
  add_product,
};
