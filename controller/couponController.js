const CouponModel = require("../models/couponModel");
const UserModel = require("../models/userModel");

const { generateCouponCode } = require("../utils/otpGeneretor");
const tryCatch = require("../utils/tryCatch");

const load_coupons = async (req, res) => {
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

  let coupons = await CouponModel.find({
    name: { $regex: ".*" + search + ".*", $options: "i" },
  })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .exec();
  let count = await CouponModel.find({
    name: { $regex: ".*" + search + ".*", $options: "i" },
  }).countDocuments();
  res.render("couponMan", {
    user: user,
    coupons: coupons,
    totalPages: Math.ceil(count / limit),
    currentPage: page,
    search: search,
  });
};

const add_coupon = async (req, res) => {
  const user = await get_user(req.session.admin_id);
  const code = generateCouponCode();
  const coupon = new CouponModel({
    name: req.body.name,
    code: code,
    offer: req.body.offer,
    maxAmount: req.body.max,
    minAmount: req.body.min,
    expiry: req.body.expiry,
  });
  await coupon.save();

  let search = "";
  if (req.query.search) {
    search = req.query.search;
  }
  let page = 1;
  if (req.query.page) {
    page = req.query.page;
  }

  const limit = 10;

  let coupons = await CouponModel.find({
    name: { $regex: ".*" + search + ".*", $options: "i" },
  })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .exec();
  let count = await CouponModel.find({
    name: { $regex: ".*" + search + ".*", $options: "i" },
  }).countDocuments();
  res.render("couponMan", {
    user: user,
    coupons: coupons,
    totalPages: Math.ceil(count / limit),
    currentPage: page,
    search: search,
    couponAddMessage: "Coupon added",
  });
};

const delete_coupon = async (req, res) => {
  let id = req.query.id;
  let deleted = await CouponModel.deleteOne({ _id: id });
  res.redirect("/admin/coupon");
};

const change_status = async (req, res) => {
  let id = req.query.id;
  let active = parseInt(req.query.value);
  if (active) {
    const updated = await CouponModel.updateOne(
      { _id: id },
      { $set: { isActive: true } }
    );
  } else {
    const updated = await CouponModel.updateOne(
      { _id: id },
      { $set: { isActive: false } }
    );
  }
  res.redirect("/admin/coupon");
};

const apply_coupon = tryCatch(async (req, res) => {
  req.session.coupons = req.session.coupons || [];
  if (req.session.coupons.length == 0) {
    const couponCode = req.query.code;
    const coupon = await CouponModel.findOne({ code: couponCode });
    if (coupon) {
      if (coupon.isActive) {
        req.session.coupons.push({
          name: coupon.name,
          offer: coupon.offer,
        });
        req.session.couponRes = "";
        return res.redirect("/cart");
      } else {
        req.session.couponRes = "Invalid Coupon!";
        return res.redirect("/cart");
      }
    }
  } else {
    req.session.couponRes = "Coupon All Ready Applied!";
    console.log(req.session.coupons);
    return res.redirect("/cart");
  }
});

module.exports = {
  load_coupons,
  add_coupon,
  delete_coupon,
  change_status,
  apply_coupon,
};

const get_user = async (id) => {
  let user = await UserModel.findOne({ _id: id });

  if (user) {
    return user;
  } else {
    return null;
  }
};
