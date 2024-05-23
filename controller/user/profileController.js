const UserModel = require("../../models/userModel");
const CategoryModel = require("../../models/categoryModel");
const OrderModel = require("../../models/orderModel");
const ReturnModel = require("../../models/returnModel");
const WalletModel = require("../../models/walletModel");
const ProductModel = require("../../models/productModel");

const categoryHelper = require("../../utils/helpers/categoryHelper");

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const tryCatch = require("../../utils/tryCatch");
const { generateOTP } = require("../../utils/otpGeneretor");
const mailSender = require("../../utils/emailSender");
const { securePswd } = require("../../utils/passwordFunctions");
const {
  nameSchema,
  passSchema,
  addressSchema,
} = require("../../utils/validation/userVal");

//loading profile page
const load_profile = tryCatch(async (req, res) => {
  const id = req.session.userID;
  const user = await UserModel.findOne({ _id: id });
  if (!user) {
    return res.redirect("/");
  }
  const category = await categoryHelper.activeCategoryName();

  const orders = await OrderModel.find({ customer: id }).sort({
    createdAt: -1,
  });

  return res.render("./user/userProfile", {
    user: user,
    category: category,
    orders: orders,
  });
});

//delete address
const delete_address = tryCatch(async (req, res) => {
  let result = await UserModel.updateOne(
    { _id: req.session.userID },
    { $pull: { address: { _id: req.params.addressID } } }
  );

  res.redirect("/profile");
});

//add address
const add_address = tryCatch(async (req, res) => {
  try {
    const validatedAddress = await addressSchema.validateAsync(req.body);
    await UserModel.updateOne(
      { _id: req.session.userID },
      { $addToSet: { address: validatedAddress } }
    );
    res.json({
      success: true,
    });
  } catch (error) {
    res.json({
      success: false,
      message: error.message,
    });
  }
});

//edit address
const edit_address = tryCatch(async (req, res) => {
  try {
    const { building, locality, state, city, pin } = req.body;
    const validatedAddress = await addressSchema.validateAsync({
      building,
      locality,
      state,
      city,
      pin,
    });
    // await UserModel.updateOne(
    //   { _id: req.session.userID },
    //   { $pull: { address: { _id: req.body.addId } } }
    // );
    // await UserModel.updateOne(
    //   { _id: req.session.userID },
    //   { $addToSet: { address: validatedAddress } }
    // );
    await UserModel.updateOne(
      { _id: req.session.userID, "address._id": req.body.addId },
      { $set: { "address.$": validatedAddress } }
    );
    res.json({
      success: true,
    });
  } catch (error) {
    res.json({
      success: false,
      message: error.message,
    });
  }
});

//cancelling order
const cancell_order = tryCatch(async (req, res) => {
  const order = await OrderModel.findOne({ _id: req.params.orderID });
  await restock(order.products);
  if (order.paymentMethode == "paypal") {
    const wallet = await WalletModel.findOne({ user: req.session.userID });
    if (wallet) {
      wallet.amount += order.totalAmount;
      wallet.transaction.push({ amount: order.totalAmount, type: "refund" });
      await wallet.save();
    } else {
      const new_wallet = new WalletModel({
        user: req.session.userID,
        amount: order.totalAmount,
      });
      new_wallet.transaction.push({
        amount: order.totalAmount,
        type: "refund",
      });
      await new_wallet.save();
    }

    await OrderModel.updateOne(
      { _id: req.params.orderID },
      { $set: { status: "Cancelled" } }
    );
    return res.json({
      success: true,
      message: "Cancelled Order Successfully!",
    });
  } else {
    await OrderModel.updateOne(
      { _id: req.params.orderID },
      { $set: { status: "Cancelled" } }
    );
    return res.json({
      success: true,
      message: "Cancelled Order Successfully!",
    });
  }
});

//load changing password page
const load_change_pass = tryCatch(async (req, res) => {
  res.render("./user/forgot");
});

const load_password = tryCatch(async (req, res) => {
  const id = req.session.userID;
  if (!id) {
    return res.redirect("/");
  }
  res.render("./user/changePass");
});

//checking email and sending otp
const send_change_pass_otp = tryCatch(async (req, res) => {
  const user = await UserModel.findOne({ email: req.body.email });
  if (user) {
    const otp = generateOTP(6);

    req.session.passwordOTP = otp;
    req.session.email = req.body.email;
    mailSender.sendEmail(
      req.body.email,
      "OTP for changing Password",
      "text",
      `otp for changing password is ${otp}`
    );
    res.redirect("/profile/newPass");
  } else {
    res.render("./user/forgot", {
      message: "user with the email doesnt exist",
    });
  }
});

//new password load
const load_new_pass = tryCatch(async (req, res) => {
  res.render("./user/newPass");
});

//changing password
const change_password = tryCatch(async (req, res) => {
  if (req.body.otp == req.session.passwordOTP) {
    try {
      await passSchema.validateAsync(req.body.password);
    } catch (error) {
      return res.render("./user/newPass", { message: error.message });
    }
    let password = await securePswd(req.body.password);
    let user = await UserModel.updateOne(
      { email: req.session.email },
      { $set: { password: password } }
    );
    req.session.destroy();
    res.render("./user/newPass", { message: "Password changed successfully" });
  } else {
    res.render("./user/newPass", { message: "Wrong otp " });
  }
});
//adding to wallet
const return_order = tryCatch(async (req, res) => {
  const order = req.query.order;
  const product = req.query.product;
  const pro = await OrderModel.findById(order);
  const prod = pro.products.find(
    (productE) => productE._id.toString() === product.toString()
  );
  console.log(prod);
  res.render("./user/return", {
    order,
    product,
    isMessage: false,
  });
});

const return_request = async (req, res) => {
  try {
    const orderid = req.body.order;
    const productid = new mongoose.Types.ObjectId(req.body.product);
    const pro = await OrderModel.findById(orderid);
    const prod = pro.products.find(
      (productE) => productE.productID.toString() === productid.toString()
    );

    const return_request = new ReturnModel({
      user: req.session.userID,
      name: prod.name,
      price: prod.soldPrice,
      quantity: prod.quantity,
      order: orderid,
      product: productid,
      reason: req.body.reason,
      status: "pending",
    });
    await return_request.save();
    res.render("./user/return", {
      isMessage: true,
      message: "Request have sent.",
    });
  } catch (error) {
    res.send(error.message);
  }
};
const update_password = tryCatch(async (req, res) => {
  const id = req.session.userID;
  if (!id) {
    return res.redirect("/");
  }
  const user = await UserModel.findOne({ _id: id });
  const passMatch = await bcrypt.compare(req.body.old, user.password);
  console.log(passMatch);
  if (passMatch) {
    try {
      await passSchema.validateAsync(req.body.password);
    } catch (error) {
      return res.render("./user/changePass", {
        message: "New password should be between 8 to 20 ",
      });
    }
    let password = await securePswd(req.body.password);
    let updated = await UserModel.updateOne(
      { _id: user._id },
      { $set: { password: password } }
    );

    res.redirect("/profile");
  } else {
    res.render("./user/changePass", { message: "Old password wrong! " });
  }
});
const edit_email = async (req, res) => {
  try {
    await UserModel.updateOne(
      { _id: req.session.userID },
      { $set: { email: req.body.email } }
    );
    res.redirect("/profile");
  } catch (error) {
    res.send(error.message);
  }
};
const edit_name = async (req, res, next) => {
  const id = req.session.userID;
  if (!id) {
    return res.redirect("/");
  }
  try {
    const validatedName = await nameSchema.validateAsync(req.body.name);
    await UserModel.updateOne({ _id: id }, { $set: { name: validatedName } });
    res.redirect("/profile");
  } catch (error) {
    const user = await UserModel.findOne({ _id: id });

    res.render("./user/changeName", {
      user,
      message: "Name should'nt be empty!",
    });
  }
};
const load_email = async (req, res) => {
  try {
    res.render("./user/changeEmail");
  } catch (error) {
    res.send(error.message);
  }
};
const load_name = async (req, res) => {
  try {
    const id = req.session.userID;
    if (!id) {
      return res.redirect("/");
    }
    const user = await UserModel.findOne({ _id: id });

    res.render("./user/changeName", { user, message: "" });
  } catch (error) {
    res.send(error.message);
  }
};
const load_wallet = async (req, res) => {
  try {
    const id = req.session.userID;
    const user = await UserModel.findOne({ _id: id });
    if (!user) {
      return res.redirect("/");
    }
    const category = await categoryHelper.activeCategoryName();
    const wallet = await WalletModel.findOne({ user: id });
    res.render("./user/wallet", { user, category, wallet });
  } catch (error) {
    res.send(error.message);
  }
};

const resentOtp = tryCatch(async (req, res) => {
  const otp = generateOTP(6);

  req.session.passwordOTP = otp;
  mailSender.sendEmail(
    req.session.email,
    "OTP for changing Password",
    "text",
    `otp for changing password is ${otp}`
  );
  res.redirect("/profile/newPass");
});

module.exports = {
  load_name,
  load_email,
  load_wallet,
  load_password,
  load_profile,
  load_change_pass,
  load_new_pass,

  send_change_pass_otp,

  add_address,
  edit_address,

  edit_email,
  edit_name,
  update_password,
  change_password,

  delete_address,
  cancell_order,

  return_order,
  return_request,
  resentOtp,
};

async function restock(products) {
  for (const element of products) {
    await ProductModel.updateOne(
      { _id: element.productID },
      { $inc: { stock: parseInt(element.quantity) } }
    );
  }
}
