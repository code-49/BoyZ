const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");

const ProductModel = require("../models/productModel");
const CategoryModel = require("../models/categoryModel");
const UserModel = require("../models/userModel");
const OrderModel = require("../models/orderModel");
const ReturnModel = require("../models/returnModel");
const WalletModel = require("../models/walletModel");
const OfferModel = require("../models/offerModel");
const { productValidation } = require("../utils/validtor");
const productSchema = require("../utils/validation/productVal");
const dates = require("../utils/dates");
const Joi = require("joi");

const puppeteer = require("puppeteer");

const categoryHelper = require("../utils/helpers/categoryHelper");

const upload = require("../utils/multer");

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

const load_admin_login = async (req, res) => {
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
    return res.render("productMan", {
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
  } catch (error) {
    res.send("Server Error");
  }
};
const catVal = require("../utils/validation/catVal");
const { name } = require("ejs");

const add_category = async (req, res) => {
  let success_message, error_message;
  try {
    await catVal.validateAsync(req.body);
    const user = await get_user(req.session.admin_id);
    const exist = await CategoryModel.findOne({ name: req.body.name });

    if (exist) {
      error_message = "Category already exist!";
    } else {
      const category = new CategoryModel({
        name: req.body.name,
        description: req.body.description,
        verified: true,
      });
      await category.save();
      success_message = "Category Added!";
    }

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
      error_message,
      success_message,
      categorys: categorys,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      search: search,
    });
  } catch (error) {
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
      error_message: error.message,
      success_message,
      categorys: categorys,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      search: search,
    });
  }
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
    res.send("Server Error");
  }
};

const loadDashboard = async (req, res) => {
  try {
    const user = await get_user(req.session.admin_id);
    let revenue = await OrderModel.aggregate([
      { $match: { status: "Delivered" } },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$totalAmount" },
        },
      },
    ]);
    const userNo = (await UserModel.find()).length;
    const productNo = (await ProductModel.find()).length;
    if (revenue.length > 0) revenue = revenue[0].totalAmount;
    const order = (await OrderModel.find()).length;
    const orderP = (await OrderModel.find({ status: "Pending" })).length;
    const orderC = (await OrderModel.find({ status: "Cancelled" })).length;
    const orderD = (await OrderModel.find({ status: "Delivered" })).length;
    const orderS = (await OrderModel.find({ status: "Shipped" })).length;

    const mostSoldProducts = await OrderModel.aggregate([
      { $unwind: "$products" },
      {
        $group: {
          _id: "$products.productID",
          totalSold: { $sum: "$products.quantity" },
          productImage: { $first: "$products.image" },
          productName: { $first: "$products.name" },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: 10 },
    ]);

    const category = await OrderModel.aggregate([
      { $unwind: "$products" },
      {
        $group: {
          _id: "$products.category",
          totalSold: { $sum: "$products.quantity" },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: 10 },
    ]);

    return res.render("dashboard", {
      user: user,
      revenue,
      userNo,
      productNo,
      order,
      orderP,
      orderC,
      orderD,
      orderS,
      mostSoldProducts,
      category,
    });
  } catch (error) {
    return res.send(error.message);
  }
};

const load_add_product = async (req, res) => {
  try {
    const user = await get_user(req.session.admin_id);
    const category = await categoryHelper.activeCategoryName();
    res.render("addProduct", { user: user, category: category });
  } catch (error) {
    res.send("Server Error");
  }
};

const load_order_list = async (req, res) => {
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

    const orders = await OrderModel.find({
      orderNo: { $regex: ".*" + search + ".*", $options: "i" },
    })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 })
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
  } catch (error) {
    res.send("Server Error");
  }
};
// post

const edit_category = async (req, res) => {
  try {
    let verified = req.body.verified === "on";
    let objectId = new mongoose.Types.ObjectId(req.body.user_id);
    const exist = await CategoryModel.findOne({ name: req.body.name });

    await catVal.validateAsync({
      name: req.body.name,
      description: req.body.description,
    });
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
    return res.json({
      success: true,
      redirect: "/admin/category",
    });
  } catch (error) {
    if (error.isJoi) {
      return res.json({
        success: false,
        message: error.message,
      });
    }
    if (error.code === 11000) {
      return res.json({
        success: false,
        message: "Category already exist!",
      });
    }
    res.json({
      success: false,
      message: "Internal server error!",
    });
  }
};

const edit_product = async (req, res) => {
  let objectId = new mongoose.Types.ObjectId(req.body.user_id);
  try {
    const user = await get_user(req.session.admin_id);
    const categorys = await categoryHelper.activeCategoryName();
    const { name, description, color, size, price, discount, stock, category } =
      req.body;
    const validatedProduct = await productSchema.validateAsync({
      name,
      description,
      color,
      size,
      price,
      discount,
      stock,
      category,
    });
    // let product = await ProductModel.findOne({ _id: objectId });
    // const proVal = productValidation(req.body);
    // if (proVal) {
    //   return res.render("editProduct", {
    //     user,
    //     category,
    //     product,
    //     add_product_message: proVal,
    //   });
    // } else {
    // const uploadedFileNames = [];

    // Object.keys(req.files).forEach((fieldname) => {
    //   const filesForField = req.files[fieldname];

    //   filesForField.forEach((file) => {
    //     const filename = file.filename;
    //     console.log("Files: ", file.filename);
    //     uploadedFileNames.push(filename);
    //   });
    // });
    const active = req.body.active == "on" ? true : false;
    const updateObject = {
      $set: {
        name: req.body.name,
        description: req.body.description,
        color: req.body.colors,
        size: validatedProduct.size,
        price: req.body.price,
        discount: req.body.discount,
        stock: req.body.stock,
        active: active,
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
    res.render("editProduct", {
      user,
      categorys,
      product,
    });
    console.log(updateResponse);
    // }
  } catch (error) {
    const user = await get_user(req.session.admin_id);
    const categorys = await categoryHelper.activeCategoryName();

    let product = await ProductModel.findOne({ _id: objectId });
    return res.render("editProduct", {
      user: user,
      categorys: categorys,
      product,
      add_product_message: error.message,
    });
  }
};

const add_product = async (req, res) => {
  try {
    const validatedProduct = await productSchema.validateAsync(req.body);
    const uploadedFileNames = [];
    Object.keys(req.files).forEach((fieldname) => {
      const filesForField = req.files[fieldname];

      filesForField.forEach((file) => {
        const filename = file.filename;
        uploadedFileNames.push(filename);
      });
    });
    validatedProduct.images = uploadedFileNames;

    const product = new ProductModel(validatedProduct);
    await product.save();

    //returning success message
    return res.json({
      success: true,
      message: "Product added successfully!",
    });
  } catch (error) {
    //returning failure message
    return res.json({
      success: false,
      message: error.message,
    });
  }
};

// delete

const delete_category = async (req, res) => {
  try {
    let id = req.query.id;
    let deleted = await CategoryModel.deleteOne({ _id: id });

    res.redirect("/admin/category");
  } catch (error) {
    res.send("Server Error");
  }
};
const delete_product = async (req, res) => {
  try {
    let id = req.query.id;
    let deleted = await ProductModel.deleteOne({ _id: id });

    res.redirect("/admin/product");
  } catch (error) {
    res.send("Server Error");
  }
};

const block_user = async (req, res) => {
  try {
    let id = req.query.id;
    let updated = await UserModel.updateOne(
      { _id: id },
      { $set: { blocked: true } }
    );
    console.log(updated);
    res.redirect("/admin/users");
  } catch (error) {
    res.send("Server Error");
  }
};
const unblock_user = async (req, res) => {
  try {
    let id = req.query.id;
    let updated = await UserModel.updateOne(
      { _id: id },
      { $set: { blocked: false } }
    );

    res.redirect("/admin/users");
  } catch (error) {
    res.send("Server Error");
  }
};
const login_admin = async (req, res) => {
  try {
    //for dev time easy login
    const user = await UserModel.findOne({ email: "aswinak1o1@gmail.com" });
    req.session.admin_id = user._id;
    return res.redirect("/admin/dashboard");

    // const { email, password } = req.body;
    // let login_message = "Wrong email or password";

    // const user = await UserModel.findOne({ email: email });
    // if (user) {
    //   if (user.is_admin) {
    //     const passMatch = await bcrypt.compare(password, user.password);
    //     if (passMatch) {
    //       const otp = generateOTP(4);
    //       console.log("logged in successfully");
    //       req.session.admin_id = user._id;
    //       req.session.loginOtp = otp;
    //       // sendOpt(user.email, otp);
    //       return res.redirect("/admin/product");
    //     } else {
    //       return res.render("adminLogin", { message: login_message });
    //     }
    //   } else {
    //     return res.render("adminLogin", { message: login_message });
    //   }
    // } else {
    //   return res.render("adminLogin", { message: login_message });
    // }
  } catch (error) {
    res.send("Server Error");
  }
};

const logout = (req, res) => {
  try {
    req.session.destroy();
    res.redirect("/admin");
  } catch (error) {
    res.send("Server Error");
  }
};

const otpLoad = (req, res) => {
  try {
    res.render("otp");
  } catch (error) {
    res.send("Server Error");
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
    res.send("Server Error");
  }
};

const load_forgot = (req, res) => {
  try {
    res.render("forgot");
  } catch (error) {
    res.send("Server Error");
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
    res.send("Server Error");
  }
};

const load_newpass = (req, res) => {
  try {
    res.render("newPass");
  } catch (error) {
    res.send("Server Error");
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
    res.send("Server Error");
  }
};

const delete_image = async (req, res, next) => {
  let id = req.query.id;
  let image = req.query.image;
  let delete_message;
  try {
    console.log("delete", id);
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
    next(error);
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
    const categorys = await categoryHelper.activeCategoryName();

    const product = await ProductModel.findOne({ _id: req.params.productId });

    res.render("editProduct", { user, categorys, product });
  } catch (error) {
    res.json(error);
    console.log(error.message);
  }
};

const load_order_details = async (req, res) => {
  try {
    const id = req.params.orderId;
    const user = await get_user(req.session.admin_id);
    const order = await OrderModel.findOne({ _id: id });
    res.render("orderDetails", { user, order });
  } catch (error) {
    res.send("Server Error");
  }
};

const load_return = async (req, res) => {
  try {
    const id = req.params.orderId;
    const user = await get_user(req.session.admin_id);
    const request = await ReturnModel.find({});
    res.render("return", {
      user,
      orders: request,
    });
  } catch (error) {
    res.send("Server Error");
  }
};

const request_response = async (req, res) => {
  try {
    const returnDoc = await ReturnModel.findOne({ _id: req.query.id });
    const order = await OrderModel.findOne({ _id: returnDoc.order });
    if (req.query.accept == "true") {
      const prod = order.products.find(
        (productE) =>
          productE.productID.toString() === returnDoc.product.toString()
      );

      //restocking product
      // const product = await ProductModel.findOne({ _id: prod.productID });
      // product.stock += parseInt(prod.quantity);
      // await product.save();
      await ProductModel.updateOne(
        { _id: prod.productID },
        { $inc: { stock: parseInt(prod.quantity) } }
      );

      let total = order.totalAmount - prod.soldPrice * prod.quantity;
      await OrderModel.updateOne(
        { _id: returnDoc.order },
        { $pull: { products: { productID: returnDoc.product } } }
      );
      await OrderModel.updateOne(
        { _id: returnDoc.order },
        { $set: { totalAmount: total } }
      );
      const neworder = await OrderModel.findOne({ _id: returnDoc.order });

      if (neworder.products.length == 0) {
        await OrderModel.deleteOne({ _id: returnDoc.order });
      }
      await ReturnModel.updateOne(
        { _id: req.query.id },
        {
          $set: {
            status: "accepted",
          },
        }
      );
      const wallet = await WalletModel.findOne({ user: order.customer });

      wallet.amount += prod.soldPrice * prod.quantity;
      wallet.transaction.push({
        amount: prod.soldPrice * prod.quantity,
        type: "refund",
      });
      await wallet.save();
    } else {
      await ReturnModel.updateOne(
        { _id: req.query.id },
        {
          $set: {
            status: "rejected",
          },
        }
      );
    }
    res.redirect("/admin/return");
  } catch (error) {
    console.log(error.message);
    res.send("Server Error");
  }
};

//offer controller
const load_offer = async (req, res) => {
  try {
    const offer = await OfferModel.find({}).sort({ createdAt: -1 });
    const user = await get_user(req.session.admin_id);

    res.render("offerMan", { user, offer });
  } catch (error) {
    res.send("Server Error");
  }
};

const load_add_offer = async (req, res) => {
  try {
    const user = await get_user(req.session.admin_id);
    const products = await ProductModel.find();
    const category = await categoryHelper.activeCategoryName();
    res.render("addOffer", { user, products, category });
  } catch (error) {
    return res.send(error.message);
  }
};

const add_offer = async (req, res) => {
  try {
    const nameSchema = Joi.string()
      .trim()
      .uppercase()
      .min(4)
      .required()
      .messages({
        "string.min": "Name must be at least {#limit}",
        "string.required": "Name is required.",
      });
    const offerSchema = Joi.number().min(0).max(100).required().messages({
      "number.min": "Offer must be at least {#limit}",
      "number.max": "Offer must be at most {#limit}",
    });
    const expirySchema = Joi.date().greater("now").required().messages({
      "date.greater": "Date should be greater than today.",
    });
    await nameSchema.validateAsync(req.body.name);
    await offerSchema.validateAsync(req.body.offer);
    await expirySchema.validateAsync(req.body.expiry);
    let item;
    if (req.body.type == "product") {
      item = await ProductModel.findOne({ _id: req.body.itemP }, { name: 1 });
    } else {
      item = await CategoryModel.findOne({ _id: req.body.itemC }, { name: 1 });
    }

    const newOffer = await OfferModel({
      name: req.body.name,
      type: req.body.type,
      offer: req.body.offer,
      expiry: req.body.expiry,
      item: {
        item_id: item._id,
        name: item.name,
      },
    });
    await newOffer.save();
    return res.json({
      success: true,
      message: "Offer added successfully!",
    });
  } catch (error) {
    return res.json({
      success: false,
      message: error.message,
    });
  }
};
// sales
const load_sales = async (req, res) => {
  try {
    const user = await get_user(req.session.admin_id);
    let date = new Date();
    const period = req.query.period;
    let orders;
    if (period === "daily") {
      orders = await dates.getDailySales(date);
    } else if (period === "weekly") {
      orders = await dates.getWeeklySales(date);
    } else if (period === "yearly") {
      orders = await dates.getYearlySales(date);
    } else {
      orders = await dates.getDailySales(date);
    }

    // let query = {
    //   status: "Delivered",
    //   createdAt: {
    //     $gte: new Date(start),
    //     $lte: new Date(end),
    //   },
    // };
    let salesData = {};
    // const orders = await OrderModel.find(query);
    salesData.date = date;
    salesData.totalAmount = orders.reduce((acc, val) => {
      return acc + val.totalAmount;
    }, 0);
    salesData.totalOrder = orders.length;
    res.render("salesReport", { user, salesData, orders, period });
  } catch (error) {
    return res.send(error.message);
  }
};
const dowload_sales = async (req, res) => {
  try {
    // let start = req.query.start;
    // let end = req.query.end;
    // let query = {
    //   status: "Delivered",
    //   // createdAt: {
    //   //   $gte: new Date(start),
    //   //   $lte: new Date(end),
    //   // },
    // };
    let date = new Date();
    const period = req.query.period;
    let orders;
    if (period === "daily") {
      orders = await dates.getDailySales(date);
    } else if (period === "weekly") {
      orders = await dates.getWeeklySales(date);
    } else if (period === "yearly") {
      orders = await dates.getYearlySales(date);
    } else {
      orders = await dates.getDailySales(date);
    }
    let salesData = {};
    // const orders = await OrderModel.find(query);
    salesData.date = new Date();
    salesData.totalAmount = orders.reduce((acc, val) => {
      return acc + val.totalAmount;
    }, 0);
    salesData.totalOrder = orders.length;

    const reportHtml = await new Promise((resolve, reject) => {
      res.render("report", { salesData, orders }, (err, html) => {
        if (err) reject(err);
        else resolve(html);
      });
    });

    // Generate PDF from the HTML content
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
      timeout: 60000, // Increase timeout to 60 seconds
    });
    const page = await browser.newPage();
    await page.setContent(reportHtml);
    const pdfBuffer = await page.pdf({ format: "A4" });
    await browser.close();

    // Send the PDF as a response
    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="sales_report.pdf"',
    });
    res.send(pdfBuffer);
  } catch (error) {
    res.send("Server Error");
  }
};

module.exports = {
  dowload_sales,
  load_sales,
  add_offer,
  load_offer,
  load_add_offer,
  request_response,
  load_admin_login,
  load_product_list,
  load_category_list,
  load_user_list,
  loadDashboard,
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
  load_order_details,
  load_return,
};
