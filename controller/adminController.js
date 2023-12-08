const ProductModel = require("../models/productModel");
const CategoryModel = require("../models/categoryModel");
const UserModel = require("../models/userModel");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");

const securePswd = async (password) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    return passwordHash;
  } catch (error) {
    console.log(error.message);
  }
};

function generateOTP(length) {
  const characters = "0123456789";
  let otp = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    otp += characters.charAt(randomIndex);
  }

  return otp;
}

const sendOpt = async (email, otpNum) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // Set to false for STARTTLS
      requireTLS: true,
      auth: {
        user: "aswinak1o1@gmail.com",
        pass: "olka nsve obaw hktg",
      },
    });
    const mailOption = {
      from: "aswinak1o1@gmail.com",
      to: email,
      subject: "OTP for login",
      text: `the otp number is ${otpNum}`,
    };

    transporter.sendMail(mailOption, (error, info) => {
      if (error) {
        console.log(error);
      } else {
        console.log("Email has been sent", info.response);
      }
    });
  } catch (error) {
    console.log(error);
  }
};

const load_admin_login = (req, res) => {
  res.render("adminLogin", { user: null });
};

const load_product_list = async (req, res) => {
  const products = await ProductModel.find();
  const category = await CategoryModel.find({}, { name: 1 });

  res.render("productMan", {
    user: { is_admin: true },
    products: products,
    category: category,
  });
};

const load_category_list = async (req, res) => {
  const categorys = await CategoryModel.find();
  res.render("categoryMan", {
    user: { is_admin: true },
    categorys: categorys,
  });
};

const load_user_list = async (req, res) => {
  let userList = await UserModel.find({ is_admin: false });
  res.render("userMan", { user: { is_admin: true }, userList: userList });
};

const load_dashboard = (req, res) => {
  res.render("dashboard", { pageName: "Dashboard" });
};

const load_add_product = async (req, res) => {
  const category = await CategoryModel.find({}, { name: 1 });
  res.render("addProduct", { user: { is_admin: true }, category: category });
};

const load_order_list = (req, res) => {
  res.render("orderMan", { pageName: "Orders" });
};
// post
const add_category = async (req, res) => {
  const category = new CategoryModel({
    name: req.body.name,
    description: req.body.description,
    verified: true,
  });
  await category.save();
  const categorys = await CategoryModel.find();
  res.render("categoryMan", {
    user: { is_admin: true },
    categorys: categorys,
    categoryAddMessage: "Category added",
  });
};

const edit_category = async (req, res) => {
  try {
    let verified = req.body.verified === "on";
    let objectId = new mongoose.Types.ObjectId(req.body.user_id);
    const category = await CategoryModel.updateOne(
      { _id: objectId },
      {
        $set: {
          name: req.body.name,
          description: req.body.description,
          verified: verified,
        },
      }
    );

    res.redirect("/admin/category");
  } catch (error) {
    console.error("Error updating category:", error);
    res.status(500).send("Internal Server Error");
  }
};

const edit_product = async (req, res) => {
  try {
    let objectId = new mongoose.Types.ObjectId(req.body.user_id);
    const uploadedFileNames = [];
    Object.keys(req.files).forEach((fieldname) => {
      const filesForField = req.files[fieldname];

      filesForField.forEach((file) => {
        const filename = file.filename;
        uploadedFileNames.push(filename);
      });
    });
    const updateObject = {
      $set: {
        name: req.body.name,
        description: req.body.description,
        color: req.body.colors,
        size: req.body.size,
        price: req.body.price,
        discount: req.body.discount,
        stock: req.body.stock,
        category: req.body.category,
      },
    };

    // Conditionally add the images property
    if (uploadedFileNames && uploadedFileNames.length > 0) {
      updateObject.$set.images = uploadedFileNames;
    }

    const category = await CategoryModel.updateOne(
      { _id: objectId },
      updateObject
    );

    console.log(uploadedFileNames);
    res.redirect("/admin/product");
  } catch (error) {
    console.error("Error updating category:", error);
    res.status(500).send("Internal Server Error");
  }
};

const add_product = async (req, res) => {
  const uploadedFileNames = [];
  Object.keys(req.files).forEach((fieldname) => {
    const filesForField = req.files[fieldname];

    filesForField.forEach((file) => {
      const filename = file.filename;
      uploadedFileNames.push(filename);
    });
  });
  const product = new ProductModel({
    name: req.body.name,
    description: req.body.description,
    color: req.body.colors,
    size: req.body.size,
    price: req.body.price,
    discount: req.body.discount,
    stock: req.body.stock,
    images: uploadedFileNames,
    category: req.body.category,
  });
  const productSaved = await product.save();
  res.redirect("/admin/add-product");
};

// delete

const delete_category = async (req, res) => {
  let id = req.query.id;
  let deleted = await CategoryModel.deleteOne({ _id: id });

  res.redirect("/admin/category");
};
const delete_product = async (req, res) => {
  let id = req.query.id;
  let deleted = await ProductModel.deleteOne({ _id: id });

  res.redirect("/admin/product");
};

const block_user = async (req, res) => {
  let id = req.query.id;
  let updated = await UserModel.updateOne(
    { _id: id },
    { $set: { blocked: true } }
  );
  console.log(updated);
  res.redirect("/admin/users");
};
const unblock_user = async (req, res) => {
  let id = req.query.id;
  let updated = await UserModel.updateOne(
    { _id: id },
    { $set: { blocked: false } }
  );

  res.redirect("/admin/users");
};
const login_admin = async (req, res) => {
  const { email, password } = req.body;
  let login_message = "Wrong email or password";

  const user = await UserModel.findOne({ email: email });
  if (user) {
    if (user.is_admin) {
      const passMatch = bcrypt.compare(password, user.password);
      if (passMatch) {
        const otp = generateOTP(4);
        console.log("logged in successfully");
        req.session.admin_id = user._id;
        req.session.loginOtp = otp;
        sendOpt(user.email, otp);
        res.redirect("/admin/otp");
      } else {
        res.render("adminLogin", { message: login_message });
      }
    } else {
      res.render("adminLogin", { message: login_message });
    }
  } else {
    res.render("adminLogin", { message: login_message });
  }
};

const logout = (req, res) => {
  try {
    req.session.destroy();
    res.redirect("/admin");
  } catch (error) {
    console.log(error.message);
  }
};

const otpLoad = (req, res) => {
  try {
    res.render("otp");
  } catch (error) {
    console.log(error.message);
  }
};

const otpVerify = (req, res) => {
  try {
    if (req.body.otp == req.session.loginOtp) {
      res.redirect("/admin/add-product");
    } else {
      res.render("otp", { message: "Invalid Otp" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const load_forgot = (req, res) => {
  try {
    res.render("forgot");
  } catch (error) {
    console.log(error.message);
  }
};

const send_otp = async (req, res) => {
  try {
    const user = await UserModel.findOne({ email: req.body.email });
    if (user) {
      const otp = generateOTP(6);
      sendOpt(req.body.email, otp);
      req.session.loginOtp = otp;
      req.session.email = req.body.email;

      res.redirect("/admin/newPass");
    } else {
      res.render("forgot", { message: "user with the email doesnt exist" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const load_newpass = (req, res) => {
  try {
    res.render("newPass");
  } catch (error) {
    console.log(error.message);
  }
};

const changePass = async (req, res) => {
  try {
    if (req.body.otp == req.session.loginOtp) {
      let password = await securePswd(req.body.password);
      let user = await UserModel.updateOne(
        { email: req.session.email },
        { $set: { password: password } }
      );
      req.session.destroy();
      res.render("newPass", { message: "Password chenged successfully" });
    } else {
      res.render("newPass", { message: "Wrong otp " });
    }
  } catch (error) {
    console.log(error.message);
  }
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
  add_category,
  delete_category,
  edit_category,
  delete_product,
  edit_product,
  block_user,
  unblock_user,
  login_admin,
  logout,
  otpVerify,
  otpLoad,
  load_forgot,
  send_otp,
  load_newpass,
  changePass,
};
