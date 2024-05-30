const bcrypt = require("bcrypt");

const UserModel = require("../../models/userModel");
const WalletModel = require("../../models/walletModel");

const DatabaseOperation = require("../../utils/helpers/databaseOperations");
const mailSender = require("../../utils/emailSender");
const otpGenerator = require("../../utils/otpGeneretor");
const tryCatch = require("../../utils/tryCatch");

const {
  emailSchema,
  passSchema,
  nameSchema,
} = require("../../utils/validation/userVal");

//verifying login request
const login_verification = tryCatch(async (req, res) => {
  const { email, password } = req.body;
  //validating email using joi
  await emailSchema.validateAsync(email);

  //checking if user exist
  const user = await UserModel.findOne({ email });
  if (!user)
    return res.json({
      message: "Wrong email or password",
    });
  //checking if user is blocked
  if (user.blocked)
    return res.json({
      message: "You are blocked from this store!",
    });

  //checking the password
  await passSchema.validateAsync(password);
  const passMatch = await bcrypt.compare(password, user.password);
  if (!passMatch)
    return res.json({
      message: "Wrong email or password",
    });

  //assigning user id for session and redirecting to home
  req.session.userID = user._id;
  return res.json({ redirect: "/" });
});

//registering user
const register_user = tryCatch(async (req, res) => {
  const { name, password, email } = req.body;

  await nameSchema.validateAsync(name);
  await emailSchema.validateAsync(email);
  await passSchema.validateAsync(password);
  const user_exist = await UserModel.findOne({ email: email });
  if (user_exist)
    return res.json({
      message: "User with the email already exist",
    });

  const encrypted_password = await bcrypt.hash(password, 10);
  const new_user = new UserModel({
    name: name,
    password: encrypted_password,
    email: email,
  });
  const saved = await new_user.save();
  const wallet = new WalletModel({
    user: new_user._id,
  });
  await wallet.save();
  const verifyCode = otpGenerator.generateOTP(6);
  req.session.verifyCode = verifyCode;
  req.session.verifyID = new_user._id;
  req.session.signUpEmail = new_user.email;
  req.session.time = new Date().getTime();
  mailSender.sendEmail(
    email,
    "SignUp Verification",
    "text",
    `The OTP for verifying your account is ${verifyCode}.`
  );
  return res.json({ redirect: "/account/otp" });
});

// loading verify page
const user_verification_page = tryCatch(async (req, res) => {
  if (req.session.verifyCode == req.params.verifyCode) {
    return res.render("./user/verifyEmail", { user: null, verify: true });
  } else {
    return res.render("./user/verifyEmail", { user: null, verify: false });
  }
});

//loading the page for sending otp
const load_otp_verification = tryCatch(async (req, res) => {
  res.render("./user/otp", { time: req.session.time });
});

//verifying otp from user
const otp_verification = tryCatch(async (req, res) => {
  const dateNow = new Date().getTime();
  const date = dateNow - req.session.time;
  if (date / 1000 > 180) {
    return res.json({
      success: true,
      redirect: "/account/otp",
    });
  }
  if (req.body.otp == req.session.verifyCode) {
    req.session.userID = req.session.verifyID;
    await UserModel.updateOne(
      { _id: req.session.userID },
      { $set: { is_verified: true } }
    );
    return res.json({
      success: true,
      redirect: "/",
    });
  } else {
    return res.json({
      success: false,
      message: "Otp is incorrect!",
    });
  }
});

//user logging out
const user_logout = tryCatch(async (req, res) => {
  req.session.destroy();
  res.redirect("/");
});

const resent_otp = tryCatch(async (req, res) => {
  req.session.verifyCode = otpGenerator.generateOTP(6);
  mailSender.sendEmail(
    req.session.signUpEmail,
    "SignUp Verification",
    "text",
    `The OTP for verifying your account is ${req.session.verifyCode}.`
  );
  req.session.time = new Date().getTime();
  res.redirect("/account/otp");
});

module.exports = {
  login_verification,
  register_user,
  user_verification_page,
  load_otp_verification,
  otp_verification,
  user_logout,
  resent_otp,
};
