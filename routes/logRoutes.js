const express = require("express");
const router = express();
const passport = require("passport");
const userModel = require("../models/userModel");
require("../utils/passport2");

router.use(passport.initialize());
router.use(passport.session());

// Auth
router.get(
  "/google",
  passport.authenticate("google", { scope: ["email", "profile"] })
);

// Auth Callback
router.get(
  "/google/callback",
  passport.authenticate("google", {
    successRedirect: "/log/google-auth-success",
    failureRedirect: "/log/google-auth-failure",
  })
);
router.get("/google-auth-success", async (req, res) => {
  try {
    const user = await userModel.findOne({ email: req.user.email });
    if (user) {
      req.session.userID = user._id;
    } else {
      const new_user = new UserModel({
        name: req.user.name,
        email: req.user.email,
      });
      const saved = await new_user.save();
      const wallet = new WalletModel({
        user: new_user._id,
      });
      await wallet.save();
      req.session.userID = new_user._id;
    }
    res.redirect("/");
  } catch (error) {
    res.send(error.message);
  }
});
router.get("/google-auth-failure", (req, res) => {
  try {
    res.send("Google authentication failed!");
  } catch (error) {
    res.send(error.message);
  }
});
module.exports = router;
