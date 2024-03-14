const UserModel = require("../../models/userModel");
const ProductModel = require("../../models/productModel");
const CategoryModel = require("../../models/categoryModel");

//utils
const DatabaseOperation = require("../../utils/model helpers/databaseOperations");
const tryCatch = require("../../utils/tryCatch");

//custom error class
const CustomError = require("../../utils/customError");

//loading wishlist page
const load_wishlist = tryCatch(async (req, res) => {
  const user = await DatabaseOperation.get_one_document(UserModel, {
    _id: req.session.userID,
  });
  const category = await DatabaseOperation.get_documents(
    CategoryModel,
    {},
    { name: 1 }
  );
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
  const added = await DatabaseOperation.update_one_document(
    ProductModel,
    { _id: req.session.userID },
    { $addToSet: { whishlist: req.params.productId } }
  );
  return added ? res.json({ added: true }) : res.json({ added: false });
});

//deleting from wishlist
const delete_from_wishlist = tryCatch(async () => {
  const deleted = await DatabaseOperation.update_one_document(
    ProductModel,
    { _id: req.session.userID },
    { $pop: { whishlist: req.query.productId } }
  );
  return deleted ? res.json({ deleted: true }) : res.json({ deleted: false });
});

module.exports = {
  load_wishlist,
  add_to_wishlist,
  delete_from_wishlist,
};
