const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");

const ProductModel = require("../models/productModel");
const CategoryModel = require("../models/categoryModel");
const UserModel = require("../models/userModel");
const OrderModel = require("../models/orderModel");

const { productValidation } = require("../utils/validtor");

const get_user = async (id) => {
  let user = await UserModel.findOne({ _id: id });

  if (user) {
    return user;
  } else {
    return null;
  }
};

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
  try {
    res.render("adminLogin", { user: null });
  } catch (error) {
    console.log(error);
  }
};

const load_product_list = async (req, res) => {
  const user = await get_user(req.session.admin_id);
  try {
    let search = "";
    if (req.query.search) {
      search = req.query.search;
    }
    let page = 1;
    if (req.query.page) {
      page = req.query.page;
    }

    const limit = 5;

    const products = await ProductModel.find({
      name: { $regex: ".*" + search + ".*", $options: "i" },
    })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();
    const category = await CategoryModel.find({}, { name: 1 });

    const count = await ProductModel.find({
      name: { $regex: ".*" + search + ".*", $options: "i" },
    }).countDocuments();
    res.render("productMan", {
      user: user,
      products: products,
      category: category,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      search: search,
    });
  } catch (error) {
    console.log(error);
  }
};

const load_category_list = async (req, res) => {
  const user = await get_user(req.session.admin_id);
  let search = "";
  if (req.query.search) {
    search = req.query.search;
  }
  let page = 1;
  if (req.query.page) {
    page = req.query.page;
  }

  const limit = 6;
  const categorys = await CategoryModel.find({
    name: { $regex: ".*" + search + ".*", $options: "i" },
  })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .exec();
  const count = await CategoryModel.find({
    name: { $regex: ".*" + search + ".*", $options: "i" },
  }).countDocuments();
  res.render("categoryMan", {
    user: user,
    categorys: categorys,
    totalPages: Math.ceil(count / limit),
    currentPage: page,
    search: search,
  });
};

const load_user_list = async (req, res) => {
  try {
    const user = await get_user(req.session.admin_id);
    let search = "";
    if (req.query.search) {
      search = req.query.search;
    }
    let page = 1;
    if (req.query.page) {
      page = req.query.page;
    }

    const limit = 10;

    let userList = await UserModel.find({
      is_admin: false,
      $or: [
        { name: { $regex: ".*" + search + ".*", $options: "i" } },
        { email: { $regex: ".*" + search + ".*", $options: "i" } },
      ],
    })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();
    let count = await UserModel.find({
      is_admin: false,
      $or: [
        { name: { $regex: ".*" + search + ".*", $options: "i" } },
        { email: { $regex: ".*" + search + ".*", $options: "i" } },
      ],
    }).countDocuments();
    res.render("userMan", {
      user: user,
      userList: userList,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      search: search,
    });
  } catch (error) {
    console.log(error);
  }
};

const load_dashboard = async (req, res) => {
  const user = await get_user(req.session.admin_id);
  res.render("dashboard", { user: user });
};

const load_add_product = async (req, res) => {
  try {
    const user = await get_user(req.session.admin_id);
    const category = await CategoryModel.find({}, { name: 1 });
    res.render("addProduct", { user: user, category: category });
  } catch (error) {
    console.log(error);
  }
};

const load_order_list = async (req, res) => {
  const user = await get_user(req.session.admin_id);
  let search = "";
  if (req.query.search) {
    search = req.query.search;
  }
  let page = 1;
  if (req.query.page) {
    page = req.query.page;
  }
  const limit = 10;

  const orders = await OrderModel.find({
    orderNo: { $regex: ".*" + search + ".*", $options: "i" },
  })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .exec();
  let count = await OrderModel.find({
    orderNo: { $regex: ".*" + search + ".*", $options: "i" },
  }).countDocuments();
  res.render("orderMan", {
    user: user,
    orders: orders,
    totalPages: Math.ceil(count / limit),
    currentPage: page,
    search: search,
  });
};
// post
const add_category = async (req, res) => {
  try {
    const user = await get_user(req.session.admin_id);
    const category = new CategoryModel({
      name: req.body.name,
      description: req.body.description,
      verified: true,
    });
    await category.save();

    let search = "";
    if (req.query.search) {
      search = req.query.search;
    }
    let page = 1;
    if (req.query.page) {
      page = req.query.page;
    }

    const limit = 6;
    const categorys = await CategoryModel.find({
      name: { $regex: ".*" + search + ".*", $options: "i" },
    })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();
    const count = await CategoryModel.find({
      name: { $regex: ".*" + search + ".*", $options: "i" },
    }).countDocuments();
    res.render("categoryMan", {
      user: user,
      categoryAddMessage: "Category added",
      categorys: categorys,
      totalPages: Math.ceil(count / limit),
      currentPage: Math.ceil(count / limit),
      search: search,
    });
  } catch (error) {
    console.log(error);
  }
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
    const user = await get_user(req.session.admin_id);
    const category = await CategoryModel.find({}, { name: 1 });
    let product = await ProductModel.findOne({ _id: objectId });
    const proVal = productValidation(req.body);
    if (proVal) {
      return res.render("editProduct", {
        user,
        category,
        product,
        add_product_message: proVal,
      });
    } else {
      // const uploadedFileNames = [];

      // Object.keys(req.files).forEach((fieldname) => {
      //   const filesForField = req.files[fieldname];

      //   filesForField.forEach((file) => {
      //     const filename = file.filename;
      //     console.log("Files: ", file.filename);
      //     uploadedFileNames.push(filename);
      //   });
      // });
      const updateObject = {
        $set: {
          name: req.body.name,
          description: req.body.description,
          color: req.body.colors,
          size: req.body.size,
          price: req.body.price,
          discount: req.body.discount,
          stock: req.body.stock,
        },
        $addToSet: {
          category: req.body.category,
        },
      };

      // Conditionally add the images property
      // if (uploadedFileNames && uploadedFileNames.length > 0) {
      //   updateObject.$set.images = uploadedFileNames;
      // }

      const updateResponse = await ProductModel.updateOne(
        { _id: objectId },
        updateObject
      );
      let product = await ProductModel.findOne({ _id: objectId });
      res.render("editProduct", { user, category, product });
      console.log(updateResponse);
    }
  } catch (error) {
    console.error("Error updating category:", error);
    res.status(500).send("Internal Server Error");
  }
};

const add_product = async (req, res) => {
  if (
    req.body.name == "" ||
    req.body.description == "" ||
    req.body.colors == "" ||
    req.body.price == "" ||
    req.body.discount == "" ||
    req.body.stock == "" ||
    req.body.category == ""
  ) {
    const user = await get_user(req.session.admin_id);
    const category = await CategoryModel.find({}, { name: 1 });
    res.render("addProduct", {
      user: user,
      category: category,
      add_product_message: "Fill all inputs",
    });
  } else if (
    parseInt(req.body.price, 10) < 1 ||
    parseInt(req.body.discount, 10) < 1 ||
    parseInt(req.body.stock, 10) < 1
  ) {
    const user = await get_user(req.session.admin_id);
    const category = await CategoryModel.find({}, { name: 1 });
    res.render("addProduct", {
      user: user,
      category: category,
      add_product_message: "price,discount or stock cannot be less than 0",
    });
  } else if (parseInt(req.body.discount, 10) > 100) {
    const user = await get_user(req.session.admin_id);
    const category = await CategoryModel.find({}, { name: 1 });
    res.render("addProduct", {
      user: user,
      category: category,
      add_product_message: "discount cannot be higher than 100",
    });
  } else {
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
    await product.save();
    res.redirect("/admin/add-product");
  }
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
        return res.redirect("/admin/otp");
      } else {
        return res.render("adminLogin", { message: login_message });
      }
    } else {
      return res.render("adminLogin", { message: login_message });
    }
  } else {
    return res.render("adminLogin", { message: login_message });
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

const delete_image = async (req, res) => {
  let id = req.query.id;
  let image = req.query.image;
  let delete_message;
  try {
    ProductModel.updateOne({ _id: id }, { $pull: { images: image } })
      .then((result) => {
        console.log("Image removed successfully:", result);
        delete_message = {
          message: "Image removed successfully",
        };
      })
      .catch((err) => {
        console.error("Error updating product:", err);
        delete_message = {
          message: "Unable to remove image",
        };
      });
    res.json(delete_message);
  } catch (error) {
    console.log(error);
    res.send("internal server error");
  }
};

const change_status = async (req, res) => {
  try {
    await OrderModel.updateOne(
      { _id: req.query.orderId },
      { $set: { status: req.query.status } }
    );

    res.json({ redirectUrl: "/admin/order" });
  } catch (error) {
    res.send("internal server error");
  }
};

const load_edit_product = async (req, res) => {
  try {
    const user = await get_user(req.session.admin_id);
    const category = await CategoryModel.find({}, { name: 1 });
    const product = await ProductModel.findOne({ _id: req.params.productId });

    res.render("editProduct", { user, category, product });
  } catch (error) {
    res.json(error);
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
  load_edit_product,
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
  delete_image,
  change_status,
};
