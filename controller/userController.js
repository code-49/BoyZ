const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");

const ProductSchema = require("../models/productModel");
const UserSchema = require("../models/userModel");
const CategorySchema = require("../models/categoryModel");

// user exist
const get_user = async (id) => {
  let user = await UserSchema.findOne({ _id: id });

  if (user) {
    return user;
  } else {
    return null;
  }
};

// mail verificationn
const sendVerifyMail = async (name, email, userid) => {
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
    const encodedUserId = encodeURIComponent(userid);
    const mailOption = {
      from: "aswinak1o1@gmail.com",
      to: email,
      subject: "For verification mail",
      html: `<p>Hi ${name}, please click here to <a href='http://localhost:3000/verify?id=${encodedUserId}'>verify</a> your mail</p>`,
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

// otp
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

const securePswd = async (password) => {
  try {
    const passwordHash = await bcrypt.hash(password, 10);
    return passwordHash;
  } catch (error) {
    console.log(error.message);
  }
};

const load_home = async (req, res) => {
  try {
    const shirts = await ProductSchema.find({
      category: {
        $in: ["shirts"],
      },
    }).limit(10);
    const pants = await ProductSchema.find({
      category: {
        $in: ["pants"],
      },
    }).limit(10);
    const footwear = await ProductSchema.find({
      category: {
        $in: ["footwear"],
      },
    }).limit(10);
    const watch = await ProductSchema.find({
      category: {
        $in: ["watch"],
      },
    }).limit(10);
    const accessories = await ProductSchema.find({
      category: {
        $in: ["accessories"],
      },
    }).limit(10);
    let userData = await get_user(req.session.user_id);
    const category = await CategorySchema.find({}, { name: 1 });

    res.render("home", {
      user: userData,
      shirts: shirts,
      pants: pants,
      footwear: footwear,
      watch: watch,
      accessories: accessories,
      category: category,
    });
  } catch (error) {
    console.log(error);
  }
};

const load_product_details = async (req, res) => {
  let id = req.query.id;
  let product = await ProductSchema.findOne({ _id: id });
  let userData = await get_user(req.session.user_id);
  const category = await CategorySchema.find({}, { name: 1 });

  res.render("productDetail", {
    user: userData,
    product: product,
    category: category,
  });
};

const register_user = async (req, res) => {
  const { name, password, email } = req.body;
  let sign_up_message;
  try {
    const user_exist = await UserSchema.findOne({ email: email });
    if (user_exist) {
      sign_up_message = {
        message: "User with the email already exist",
      };
      res.json(sign_up_message);
    } else {
      const encrypted_password = await securePswd(req.body.password);
      const new_user = new UserSchema({
        name: name,
        password: encrypted_password,
        email: email,
      });
      const saved = await new_user.save();
      sendVerifyMail(name, email, saved._id);
      res.json({ redirect: "/verify" });
      console.log("created a new user");
    }
  } catch (error) {
    console.log(error.message);
    res.redirect("/");
  }
};

const login_user = async (req, res) => {
  const { email, password } = req.body;
  let login_message = {
    message: "Wrong email or password",
  };

  const user = await UserSchema.findOne({ email: email });
  if (user) {
    const passMatch = bcrypt.compare(password, user.password);
    if (passMatch) {
      const otp = generateOTP(4);
      sendOpt(user.email, otp);
      req.session.loginOtp = otp;
      req.session.user_id = user._id;
      res.json({ redirect: "/otp" });
      console.log("logged in successfully");
    } else {
      res.json(login_message);
    }
  } else {
    res.json(login_message);
  }
};

const verifyMail = async (req, res) => {
  try {
    if (req.query.id) {
      const user = await UserSchema.updateOne(
        { _id: req.query.id },
        { $set: { is_verified: true } }
      );
      if (user) {
        console.log("udated verified field");
      } else {
        console.log("couldn't find user");
      }
      req.session.user_id = req.query.id;
      res.render("verifyEmail", { user: null, verify: true });
    } else {
      res.render("verifyEmail", { user: null, verify: false });
    }
  } catch (error) {
    console.log(error);
  }
};

const logout = (req, res) => {
  try {
    req.session.destroy();
    res.redirect("/");
  } catch (error) {
    console.log(error.message);
  }
};

const load_otp = (req, res) => {
  try {
    res.render("otp");
  } catch (error) {
    console.log(error.message);
  }
};

const verify_otp = (req, res) => {
  try {
    if (req.body.otp == req.session.loginOtp) {
      res.redirect("/");
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
    const user = await UserSchema.findOne({ email: req.body.email });
    if (user) {
      const otp = generateOTP(6);
      sendOpt(req.body.email, otp);
      req.session.loginOtp = otp;
      req.session.email = req.body.email;

      res.redirect("/newPass");
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
      let user = await UserSchema.updateOne(
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

const load_products = async (req, res) => {
  try {
    let userData = await get_user(req.session.user_id);
    const category = await CategorySchema.find({}, { name: 1 });
    const products = await ProductSchema.find(
      {
        category: {
          $in: [req.query.cat],
        },
      },
      { name: 1, price: 1, images: 1 }
    );
    res.render("products", {
      user: userData,
      category: category,
      products: products,
    });
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  load_home,
  load_product_details,
  register_user,
  login_user,
  verifyMail,
  logout,
  load_otp,
  verify_otp,
  load_forgot,
  send_otp,
  load_newpass,
  changePass,
  load_products,
};
