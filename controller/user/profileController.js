const UserModel = require("../../models/userModel");
const CategoryModel = require("../../models/categoryModel");
const OrderModel = require("../../models/orderModel");
const ReturnModel = require("../../models/returnModel");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const tryCatch = require("../../utils/tryCatch");
const { generateOTP } = require("../../utils/otpGeneretor");
const mailSender = require("../../utils/emailSender");
const { securePswd } = require("../../utils/passwordFunctions");
const orderModel = require("../../models/orderModel");

//loading profile page
const load_profile = tryCatch(async (req, res) => {
  const id = req.session.userID;
  const user = await UserModel.findOne({ _id: id });
  if (!user) {
    return res.redirect("/");
  }
  const category = await CategoryModel.find({}, { name: 1 });

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
  await UserModel.updateOne(
    { _id: req.session.userID },
    { $addToSet: { address: req.body } }
  );
  res.redirect("/profile");
});

//cancelling order
const cancell_order = tryCatch(async (req, res) => {
  const order = await OrderModel.findOne({ _id: req.params.orderID });
  if (order.paymentMethode == "paypal") {
    const edited = await UserModel.updateOne(
      { _id: req.session.userID },
      { $inc: { wallet: order.totalAmount } }
    );
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
  const orderid = req.body.order;
  const productid = new mongoose.Types.ObjectId(req.body.product);
  const pro = await OrderModel.findById(orderid);
  const prod = pro.products.find(
    (productE) => productE._id.toString() === productid.toString()
  );
  console.log(prod);
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
};
const update_password = tryCatch(async (req, res) => {
  const user = await UserModel.findOne({ _id: req.session.userID });
  const passMatch = await bcrypt.compare(req.body.old, user.password);
  if (passMatch) {
    let password = await securePswd(req.body.password);
    let updated = await UserModel.updateOne(
      { _id: user._id },
      { $set: { password: password } }
    );

    res.redirect("/profile");
  } else {
    res.render("./user/changePass", { message: "Unable to change password " });
  }
});
const edit_email = async (req, res) => {
  await UserModel.updateOne(
    { _id: req.session.userID },
    { $set: { email: req.body.email } }
  );
  res.redirect("/profile");
};
const edit_name = async (req, res) => {
  await UserModel.updateOne(
    { _id: req.session.userID },
    { $set: { name: req.body.name } }
  );
  res.redirect("/profile");
};
const load_email = async (req, res) => {
  res.render("./user/changeEmail");
};
const load_name = async (req, res) => {
  res.render("./user/changeName");
};
module.exports = {
  load_name,
  load_email,
  edit_email,
  edit_name,
  update_password,
  load_password,
  load_profile,
  load_change_pass,
  delete_address,
  add_address,
  cancell_order,
  send_change_pass_otp,
  load_new_pass,
  change_password,
  return_order,
  return_request,
};
