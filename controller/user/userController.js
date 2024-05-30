const UserModel = require("../../models/userModel");
const ProductModel = require("../../models/productModel");
const CategoryModel = require("../../models/categoryModel");

//helpers
const categoryHelper = require("../../utils/helpers/categoryHelper");

//utils
const DatabaseOperation = require("../../utils/helpers/databaseOperations");
const tryCatch = require("../../utils/tryCatch");
const puppeteer = require("puppeteer");
//error
const CustomError = require("../../utils/customError");
const userModel = require("../../models/userModel");
const orderModel = require("../../models/orderModel");

//function for loading landing page
const load_landing = tryCatch(async (req, res) => {
  const user = (await UserModel.findOne({ _id: req.session.userID })) || null;
  const category = await categoryHelper.activeCategoryName();

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
  //throwing error if id is not provided
  if (req.params.productID == undefined)
    throw new CustomError("Product 'ID' not provided!", 500);

  //getting the requested product
  const product = await ProductModel.findById({ _id: req.params.productID });

  //throwing error if product does not exist
  if (!product) throw new Error("Product Does not exist!");

  //getting category & user
  const category = await categoryHelper.activeCategoryName();
  const user = (await userModel.findOne({ _id: req.session.userID })) || null;

  //getting recommended product
  const similar = await ProductModel.find({
    category: { $in: [product.category[0]] },
  }).limit(6);

  return res.render("./user/productDetail", {
    user: user,
    product: product,
    category: category,
    similar: similar,
    cat: req.session.category || product.category[0],
  });
});

//loading product listing page
const load_products = tryCatch(async (req, res) => {
  req.session.category = req.query.cat;
  const limit = 8;
  const user = (await userModel.findOne({ _id: req.session.userID })) || null;
  const category = await categoryHelper.activeCategoryName();

  const products = await ProductModel.find(req.productFilterData)
    .sort(req.sorting)
    .collation({ locale: "en", strength: 2 })
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
      size: req.query.size || "all",
      stock: req.query.stock,
    },
    sort: req.query.sort || "na",
  });
});

const post_review = async (req, res) => {
  try {
    const user = await UserModel.findOne({ _id: req.session.userID });
    if (req.body.review.trim() == "") {
      return res.json({
        success: false,
        message: "Review shouldn't be empty!",
      });
    }
    const product = await ProductModel.findOne({ _id: req.body.productID });
    if (!product)
      return res.json({
        success: false,
        message: "Product dosn't exist!",
      });
    const review = {
      user_id: user._id,
      name: user.name,
      review: req.body.review,
      rated: req.body.rating,
    };
    let rated = ((product.rating + parseInt(req.body.rating)) / 2).toFixed(1);
    rated = parseFloat(rated);
    console.log(
      product.rating + parseInt(req.body.rating),
      product.reviews.length
    );
    const addReview = await ProductModel.updateOne(
      { _id: req.body.productID },
      { $push: { reviews: review }, $set: { rating: rated } }
    );

    return res.json({
      success: true,
      message: "Review recorded successfully!",
    });
  } catch (error) {
    console.log(error.message);
    return res.json({
      success: false,
      message: error.message,
    });
  }
};
const download_invoice = async (req, res) => {
  try {
    const order = await orderModel.findOne({ _id: req.query.id });
    const reportHtml = await new Promise((resolve, reject) => {
      res.render("./user/invoice", { order }, (err, html) => {
        if (err) reject(err);
        else resolve(html);
      });
    });

    // Generate PDF from the HTML content
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
      timeout: 60000, // Increase timeout to 60 seconds
    });
    const page = await browser.newPage();
    await page.setContent(reportHtml);
    const pdfBuffer = await page.pdf({ format: "A4" });
    await browser.close();

    // Send the PDF as a response
    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="invoice.pdf"',
    });
    res.send(pdfBuffer);
  } catch (error) {
    res.send(error.message);
  }
};
module.exports = {
  download_invoice,
  load_landing,
  load_product_details,
  load_products,
  post_review,
};
