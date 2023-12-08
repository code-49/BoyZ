const express = require("express");
const bodyParser = require("body-parser");
const multer = require("multer");
const path = require("path");

const adminController = require("../controller/adminController");

const route = express();

route.set("views", "./views/admin");

route.use(bodyParser.json(), bodyParser.urlencoded({ extended: true }));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../public/productImages"));
  },
  filename: function (req, file, cb) {
    const name = file.originalname;
    cb(null, name);
  },
});
const upload = multer({ storage: storage });

route.use(express.static("public"));

route.get("/", adminController.load_admin_login);

route.get("/product", adminController.load_product_list);
route.get("/category", adminController.load_category_list);
route.get("/users", adminController.load_user_list);
route.get("/dashboard", adminController.load_dashboard);
route.get("/add-product", adminController.load_add_product);
route.get("/order", adminController.load_order_list);

route.post("/add-product", upload.single("image"), adminController.add_product);

module.exports = route;
