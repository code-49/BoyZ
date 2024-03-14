const tryCatch = require("../utils/tryCatch");

exports.isLogin = tryCatch(async (req, res, next) => {
  if (req.session.userID) {
  } else {
    res.redirect("/");
  }
  next();
});
