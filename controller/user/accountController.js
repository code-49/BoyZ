const bcrypt = require("bcrypt");

const UserModel = require("../../models/userModel");

const DatabaseOperation = require("../../utils/model helpers/databaseOperations");
const mailSender = require("../../utils/emailSender");
const otpGenerator = require("../../utils/otpGeneretor");
const tryCatch = require("../../utils/tryCatch");

//verifying login request
const login_verification = tryCatch(async (req, res) => {
  const { email, password } = req.body;
  if (email == "" || password == "") {
    return res.json({
      message: "Please enter all input",
    });
  } else if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
    return res.json({
      message: "Please enter a valid email",
    });
  } else if (password.length < 8) {
    return res.json({
      message: "Enter a password 8 to 20 character",
    });
  } else {
    const user = await DatabaseOperation.get_one_document(UserModel, {
      email: email,
    });
    if (user) {
      const passMatch = await bcrypt.compare(password, user.password);
      if (passMatch) {
        req.session.userID = user._id; //loginID if not in dev
        req.session.loginOtp = otpGenerator.generateOTP(4);
        req.session.email = email;
        // req.session.assignTime = new Date();
        mailSender.sendEmail(
          email,
          "Login OTP",
          "text",
          `OTP for logging in is ${req.session.loginOtp}`
        );
        return res.json({ redirect: "/" }); //"/account/otp"
      } else {
        return res.json({
          message: "Wrong email or password",
        });
      }
    } else {
      return res.json({
        message: "Wrong email or password",
      });
    }
  }
});

//registering user
const register_user = tryCatch(async (req, res) => {
  const { name, password, email } = req.body;

  if (email == "" || password == "" || name == "") {
    return res.json({
      message: "Please enter all input",
    });
  } else if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
    return res.json({
      message: "Please enter a valid email",
    });
  } else if (password.length < 8) {
    return res.json({
      message: "Enter a password 8 to 20 character",
    });
  } else {
    const user_exist = await UserModel.findOne({ email: email });
    if (user_exist) {
      return res.json({
        message: "User with the email already exist",
      });
    } else {
      const encrypted_password = await bcrypt.hash(password, 10);
      const new_user = new UserModel({
        name: name,
        password: encrypted_password,
        email: email,
      });
      const saved = await new_user.save();
      const verifyCode = otpGenerator.generateOTP(6);
      req.session.verifyCode = verifyCode;
      mailSender.sendEmail(
        email,
        "Verification of account.",
        "html",
        `Please click here to verify your email.<a href='http://localhost:3000/account/verify/${verifyCode}'>verify</a>`
      );
      return res.json({ redirect: "/account/verify" });
    }
  }
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
  res.render("./user/otp");
});

//verifying otp from user
const otp_verification = tryCatch(async (req, res) => {
  if (req.body.otp == req.session.loginOtp) {
    req.session.userID = req.session.loginID;
    res.redirect("/");
  } else {
    res.render("./user/otp", { message: "Invalid Otp" });
  }
});

//user logging out
const user_logout = tryCatch(async (req, res) => {
  req.session.destroy();
  res.redirect("/");
});

const resent_otp = tryCatch(async (req, res) => {
  req.session.loginOtp = otpGenerator.generateOTP(4);
  mailSender.sendEmail(
    req.session.email,
    "Login OTP",
    "text",
    `OTP for logging in is ${req.session.loginOtp}`
  );
  req.session.loginOtp;
  res.render("./user/otp");
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
