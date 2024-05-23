const UserModel = require("../../models/userModel");
const ProductModel = require("../../models/productModel");
const CategoryModel = require("../../models/categoryModel");
const mongoose = require("mongoose");
const categoryHelper = require("../../utils/helpers/categoryHelper");

//utils
const DatabaseOperation = require("../../utils/helpers/databaseOperations");
const tryCatch = require("../../utils/tryCatch");

//custom error class
const CustomError = require("../../utils/customError");

//loading wishlist page
const load_wishlist = tryCatch(async (req, res) => {
  const user = await UserModel.findOne({ _id: req.session.userID });
  const category = await categoryHelper.activeCategoryName();

  let products = [];

  if (user)
    products = await ProductModel.find({
      _id: { $in: user.whishlist },
    });

  res.render("./user/wishlist", {
    user: user,
    category: category,
    products: products,
  });
});

//adding to wishlist
const add_to_wishlist = tryCatch(async (req, res) => {
  const added = await UserModel.updateOne(
    { _id: req.session.userID },
    { $addToSet: { whishlist: req.params.productID } }
  );
  return added ? res.json({ added: true }) : res.json({ added: false });
});

//deleting from wishlist
const delete_from_wishlist = tryCatch(async (req, res) => {
  let objectId = new mongoose.Types.ObjectId(req.params.productID);
  const deleted = await UserModel.updateOne(
    { _id: req.session.userID },
    { $pull: { whishlist: objectId } }
  );
  console.log(deleted);
  return res.redirect("/wishlist");
});

module.exports = {
  load_wishlist,
  add_to_wishlist,
  delete_from_wishlist,
};
