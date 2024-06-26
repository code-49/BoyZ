const express = require("express");

const adminController = require("../../controller/adminController");
const auth = require("../../middleware/adminAuth");
const ProductModel = require("../../models/productModel");
const couponRoutes = require("./couponRoutes");

const route = express();

route.set("views", "./views/admin");

const upload = require("../../utils/multer");

route.use(express.static("public"));

route.use("/coupon", auth.isLogin, couponRoutes);
route.get("/", auth.isLogout, adminController.load_admin_login);
route.get("/product", auth.isLogin, adminController.load_product_list);
route.get("/category", auth.isLogin, adminController.load_category_list);
route.get("/users", auth.isLogin, adminController.load_user_list);
route.get("/dashboard", auth.isLogin, adminController.loadDashboard);
route.get("/add-product", auth.isLogin, adminController.load_add_product);
route.get("/order", auth.isLogin, adminController.load_order_list);
route.get("/delete-category", auth.isLogin, adminController.delete_category);
route.get("/delete-product", auth.isLogin, adminController.delete_product);
route.get("/unblock", auth.isLogin, adminController.unblock_user);
route.get("/block", auth.isLogin, adminController.block_user);
route.get("/logout", auth.isLogin, adminController.logout);
route.get("/otp", adminController.otpLoad);
route.get("/forgot", adminController.load_forgot);
route.get("/newPass", adminController.load_newpass);
route.get("/deleteImage", auth.isLogin, adminController.delete_image);
route.get("/changeStatus", auth.isLogin, adminController.change_status);
route.get("/offer", auth.isLogin, adminController.load_offer);
route.get("/add-offer", auth.isLogin, adminController.load_add_offer);
route.get("/sales", auth.isLogin, adminController.load_sales);
route.get("/download-sales", auth.isLogin, adminController.dowload_sales);
route.get(
  "/edit-product/:productId",
  auth.isLogin,
  adminController.load_edit_product
);
route.get(
  "/order-details/:orderId",
  auth.isLogin,
  adminController.load_order_details
);
route.get("/return", auth.isLogin, adminController.load_return);
route.get("/return-response", auth.isLogin, adminController.request_response);

route.post("/add-offer", auth.isLogin, adminController.add_offer);
route.post("/forgot", adminController.send_otp);
route.post("/newPass", adminController.changePass);
route.post("/otp", adminController.otpVerify);
route.post("/", adminController.login_admin);
route.post("/category", adminController.add_category);
route.post("/edit-category", adminController.edit_category);
route.post(
  "/edit-product",
  upload.fields([
    { name: "image1", maxCount: 1 },
    { name: "image2", maxCount: 1 },
    { name: "image3", maxCount: 1 },
    { name: "image4", maxCount: 1 },
  ]),
  adminController.edit_product
);
route.post(
  "/add-product",
  upload.fields([
    { name: "image1", maxCount: 1 },
    { name: "image2", maxCount: 1 },
    { name: "image3", maxCount: 1 },
    { name: "image4", maxCount: 1 },
  ]),
  adminController.add_product
);
route.post("/editImage1", upload.single("image1"), async (req, res) => {
  try {
    console.log(req.files);
    const edited = await ProductModel.updateOne(
      { _id: req.body.id },
      { $set: { "images.0": req.file.filename } }
    );
    console.log(edited);
    res.json({ success: true });
  } catch (error) {
    res.send(error.message);
  }
});
route.post("/editImage2", upload.single("image1"), async (req, res) => {
  try {
    console.log(req.file);
    const edited = await ProductModel.updateOne(
      { _id: req.body.id },
      { $set: { "images.1": req.file.filename } }
    );
    res.json({ success: true });
  } catch (error) {
    res.send(error.message);
  }
});
route.post("/editImage3", upload.single("image1"), async (req, res) => {
  try {
    const edited = await ProductModel.updateOne(
      { _id: req.body.id },
      { $set: { "images.2": req.file.filename } }
    );
    res.json({ success: true });
  } catch (error) {
    res.send(error.message);
  }
});
route.post("/editImage4", upload.single("image1"), async (req, res) => {
  try {
    const edited = await ProductModel.updateOne(
      { _id: req.body.id },
      { $set: { "images.3": req.file.filename } }
    );
    res.json({ success: true });
  } catch (error) {
    res.send(error.message);
  }
});

module.exports = route;
