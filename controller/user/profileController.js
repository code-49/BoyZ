const UserModel = require("../../models/userModel");
const CategoryModel = require("../../models/categoryModel");
const OrderModel = require("../../models/orderModel");

const tryCatch = require("../../utils/tryCatch");
const { generateOTP } = require("../../utils/otpGeneretor");
const mailSender = require("../../utils/emailSender");
const { securePswd } = require("../../utils/passwordFunctions");

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
  const order = await OrderModel.findOne({ _id: req.params.orderID });
  const edited = await UserModel.updateOne(
    { _id: req.session.userID },
    { $inc: { wallet: order.totalAmount } }
  );
  await OrderModel.updateOne(
    { _id: req.params.orderID },
    { $set: { status: "Returned" } }
  );
  return res.json({ success: true, message: "Request for returning send!" });
});

module.exports = {
  load_profile,
  load_change_pass,
  delete_address,
  add_address,
  cancell_order,
  send_change_pass_otp,
  load_new_pass,
  change_password,
  return_order,
};
