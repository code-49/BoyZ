const UserModel = require("../../models/userModel");
const ProductModel = require("../../models/productModel");
const CategoryModel = require("../../models/categoryModel");

//utils
const DatabaseOperation = require("../../utils/model helpers/databaseOperations");
const tryCatch = require("../../utils/tryCatch");

//error
const CustomError = require("../../utils/customError");

//function for loading landing page
const load_landing = tryCatch(async (req, res) => {
  const user = await DatabaseOperation.get_one_document(UserModel, {
    _id: req.session.userID,
  });
  const category = await DatabaseOperation.get_documents(
    CategoryModel,
    {},
    { name: 1 }
  );

  const offer = await ProductModel.find({}).sort({ discount: -1 }).limit(6);
  const shirts = await ProductModel.find({
    category: {
      $in: ["shirts"],
    },
  }).limit(10);
  const pants = await ProductModel.find({
    category: {
      $in: ["pants"],
    },
  }).limit(10);
  const footwear = await ProductModel.find({
    category: {
      $in: ["footwear"],
    },
  }).limit(10);
  const watch = await ProductModel.find({
    category: {
      $in: ["watch"],
    },
  }).limit(10);
  const accessories = await ProductModel.find({
    category: {
      $in: ["accessories"],
    },
  }).limit(10);
  res.render("./user/landing.ejs", {
    user: user,
    category: category,
    offer: offer,
    shirts: shirts,
    pants: pants,
    footwear: footwear,
    watch: watch,
    accessories: accessories,
  });
});

//loading product details page
const load_product_details = tryCatch(async (req, res, next) => {
  if (req.params.productID == undefined) {
    throw new CustomError("Product 'ID' not provided!", 500);
  } else {
    // const product = await ProductModel.findById(req.params.productID);
    const product = await DatabaseOperation.get_one_document(ProductModel, {
      _id: req.params.productID,
    });
    const category = await DatabaseOperation.get_documents(
      CategoryModel,
      {},
      { name: 1 }
    );
    let user = await DatabaseOperation.get_one_document(UserModel, {
      _id: req.session.userID,
    });
    // user = user || null;
    const similar = await DatabaseOperation.get_documents(
      ProductModel,
      {
        category: {
          $in: [product.category[0]],
        },
      },
      {},
      5
    );
    res.render("./user/productDetail", {
      user: user,
      product: product,
      category: category,
      similar: similar,
    });
  }
});

//loading product listing page
const load_products = tryCatch(async (req, res) => {
  const limit = 12;
  const user = await DatabaseOperation.get_one_document(UserModel, {
    _id: req.session.userID,
  });
  const category = await CategoryModel.find({}, { name: 1 });
  const products = await ProductModel.find(req.productFilterData)
    .limit(limit * 1)
    .skip((req.filterPage - 1) * limit)
    .exec();

  let count = await ProductModel.find(req.productFilterData).countDocuments();
  res.render("./user/products", {
    user: user,
    category: category,
    products: products,
    totalPages: Math.ceil(count / limit),
    currentPage: req.filterPage,
    filterData: {
      cat: req.query.cat,
      min: req.query.min,
      max: req.query.max,
      size: req.query.size,
    },
  });
});

module.exports = {
  load_landing,
  load_product_details,
  load_products,
};
