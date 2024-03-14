const express = require("express");

const adminController = require("../../controller/adminController");
const auth = require("../../middleware/adminAuth");

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
route.get("/dashboard", auth.isLogin, adminController.load_dashboard);
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

module.exports = route;
