const paypal = require("@paypal/checkout-server-sdk");
require("dotenv").config();

const UserModel = require("../../models/userModel");
const ProductModel = require("../../models/productModel");
const CategoryModel = require("../../models/categoryModel");
const OrderModel = require("../../models/orderModel");
const CouponModel = require("../../models/couponModel");
const WalletModel = require("../../models/walletModel");

const categoryHelper = require("../../utils/helpers/categoryHelper");

const tryCatch = require("../../utils/tryCatch");
const { generateOTP } = require("../../utils/otpGeneretor");
const { message } = require("../../utils/validation/productVal");

const Environment =
  process.env.NODE_ENV === "production"
    ? paypal.core.LiveEnvironment
    : paypal.core.SandboxEnvironment;
const paypalClient = new paypal.core.PayPalHttpClient(
  new Environment(
    process.env.PAYPAL_CLIENT_ID,
    process.env.PAYPAL_CLIENT_SECRET
  )
);

const load_cart = tryCatch(async (req, res) => {
  let id = req.session.userID;
  let coupon;
  if (req.session.coupon) {
    coupon = req.session.coupon;
  }

  const category = await categoryHelper.activeCategoryName();
  const couponData = await CouponModel.find({}).limit(3);

  if (id) {
    const user = await UserModel.findOne({ _id: id });

    let products = [];
    if (user) {
      products = await getCartProduct(user.cart);
    }
    if (products.length > 0) {
      const subtotal = products.reduce((acc, ele) => {
        acc += ele.price * ele.quantity;
        return acc;
      }, 0);
      const discount = products.reduce((acc, ele) => {
        acc += ((ele.price * ele.discount) / 100) * ele.quantity;
        return acc;
      }, 0);

      const coupons = req.session.coupons ? req.session.coupons : [];
      const couponRes = req.session.couponRes ? req.session.couponRes : "";
      const couponRedux = coupons.reduce((acc, ele) => {
        return acc + parseInt(ele.offer);
      }, 0);
      const total =
        subtotal - discount - ((subtotal - discount) * couponRedux) / 100;

      res.render("./user/cart", {
        paypalClientId: process.env.PAYPAL_CLIENT_ID,
        user: user,
        category: category,
        products: products,
        subtotal: subtotal,
        discount: discount,
        total: total,
        coupons: coupons,
        couponData,
        couponRes: couponRes,
      });
    } else {
      res.render("./user/cart", {
        user: user,
        category: category,
        products: [],
        paypalClientId: process.env.PAYPAL_CLIENT_ID,
      });
    }
  } else {
    res.render("./user/cart", {
      user: null,
      category: category,
      paypalClientId: process.env.PAYPAL_CLIENT_ID,
    });
  }
});

//add to cart
const add_to_cart = tryCatch(async (req, res) => {
  const id = req.session.userID;
  const quantity = parseInt(req.query.quantity);
  if (!id) {
    return res.json({ message: "Login to add to cart!" });
  }
  const doc = await UserModel.findOne({ _id: id });
  if (doc.cart) {
    let product_exist = false;
    doc.cart.forEach((ele) => {
      if (ele.product == req.query.productId) {
        product_exist = true;
      }
    });
    if (product_exist) {
      const productIndex = doc.cart.findIndex((cartItem) =>
        cartItem.product.equals(req.query.productId)
      );
      doc.cart[productIndex].quantity =
        doc.cart[productIndex].quantity + quantity;
      await doc.save();
      return res.json({ message: "added to cart" });
    }
  }

  const cart = await UserModel.updateOne(
    { _id: id },
    {
      $addToSet: {
        cart: { product: req.query.productId, quantity: quantity },
      },
    }
  );
  return cart
    ? res.json({ message: "added to cart" })
    : res.json({ message: "unable to add to the cart" });
});
//change quantity
const change_quantity = tryCatch(async (req, res) => {
  const user = await UserModel.findOne({ _id: req.session.userID });
  const productIndex = user.cart.findIndex((cartItem) =>
    cartItem.product.equals(req.query.productId)
  );
  const product = await ProductModel.findOne({ _id: req.query.productId });
  if (parseInt(req.query.quantity) <= product.stock) {
    user.cart[productIndex].quantity = req.query.quantity;
    await user.save();
    res.send("/cart");
  } else {
    res.send("Product limit reached!");
  }
});

//delete product from cart
const delete_from_cart = tryCatch(async (req, res) => {
  await UserModel.updateOne(
    { _id: req.session.userID },
    { $pull: { cart: { product: req.query.productId } } }
  );
  res.redirect("/cart");
});

//loading checkout
const load_checkout = tryCatch(async (req, res) => {
  const user = await UserModel.findOne({ _id: req.session.userID });
  res.render("./partials/address", {
    user: user,
  });
});

//place order
const place_order = tryCatch(async (req, res) => {
  if (req.body.total > 1000) {
    return res.json({
      message: "Cannot purchase more than 1000 with Cash on Delivery",
    });
  }
  const id = req.session.userID;
  const user = await UserModel.findOne({ _id: id });
  const products = await getCartProduct(user.cart);
  const changed = await changeStock(user.cart);
  console.log("changed: ", changed);
  if (!changed) {
    return res.json({
      message: "fail",
    });
  }
  const orderNo = `#${generateOTP(4)}`;
  const orderProducts = products.map((element) => {
    const sold = element.price * (1 - element.discount / 100);
    return {
      productID: element._id,
      name: element.name,
      soldPrice: sold,
      quantity: element.quantity,
      image: element.images[0],
    };
  });
  const new_order = new OrderModel({
    orderNo: orderNo,
    customer: id,
    products: orderProducts,
    totalAmount: req.body.total,
    shippingAddress: req.body.address,
    paymentMethode: "cash on delivery",
  });
  await new_order.save();
  await UserModel.updateOne({ _id: id }, { $set: { cart: [] } });
  req.session.coupons = [];
  req.session.couponRes = "";
  res.json({
    message: "successful",
    orderNo: orderNo,
    totalAmount: req.body.total,
  });
});

//wallet order
const wallet_order = tryCatch(async (req, res) => {
  const id = req.session.userID;
  const user = await UserModel.findOne({ _id: id });
  const category = await CategoryModel.find({}, { name: 1 });
  const wallet = await WalletModel.findOne({ user: id });

  //checking if wallet has enough amount
  if (req.body.total <= wallet.amount) {
    const products = await getCartProduct(user.cart);
    const changed = await changeStock(user.cart);
    console.log("changed: ", changed);
    if (!changed) {
      return res.json({
        message: "fail",
      });
    }
    const orderNo = `#${generateOTP(4)}`;
    const orderProducts = products.map((element) => {
      const sold = element.price * (1 - element.discount / 100);
      return {
        productID: element._id,
        name: element.name,
        soldPrice: sold,
        quantity: element.quantity,
        image: element.images[0],
      };
    });
    const new_order = new OrderModel({
      orderNo: orderNo,
      customer: id,
      products: orderProducts,
      totalAmount: req.body.total,
      shippingAddress: req.body.address,
      paymentMethode: "wallet",
    });
    await new_order.save();

    await UserModel.updateOne({ _id: id }, { $set: { cart: [] } });
    req.session.coupons = [];
    req.session.couponRes = "";

    const wallet = await WalletModel.findOne({ user: req.session.userID });

    wallet.amount -= req.body.total;
    wallet.transaction.push({ amount: req.body.total, type: "withdrawl" });
    await wallet.save();
    res.json({
      message: "successful",
      orderNo: orderNo,
    });
  } else {
    res.json({
      message: "nomo",
    });
  }
});

const create_order = tryCatch(async (req, res) => {
  const id = req.session.userID;
  const user = await UserModel.findOne({ _id: id });
  const products = await getCartProduct(user.cart);
  // await changeStock(user.cart);
  const isStock = await checkStock(user.cart);
  if (!isStock) {
    return res.json({
      stock: "fail",
    });
  }
  const orderNo = `#${generateOTP(4)}`;
  const coupons = req.session.coupons ? req.session.coupons : [];
  const couponRedux = coupons.reduce((acc, ele) => {
    return acc + parseInt(ele.offer);
  }, 0);
  let total = 0;
  const orderProducts = products.map((element) => {
    const sold = parseInt(
      element.price * (1 - element.discount / 100) * (1 - couponRedux / 100)
    );
    total += sold * element.quantity;
    return {
      productID: element._id,
      name: element.name,
      soldPrice: sold,
      quantity: element.quantity,
      image: element.images[0],
    };
  });
  // const new_order = new OrderModel({
  //   orderNo: orderNo,
  //   customer: id,
  //   products: orderProducts,
  //   totalAmount: req.body.total,
  //   shippingAddress: req.body.address,
  //   paymentMethode: "paypal",
  // });

  //payment
  const request = new paypal.orders.OrdersCreateRequest();

  request.prefer("return=representation");
  request.requestBody({
    intent: "CAPTURE",
    purchase_units: [
      {
        amount: {
          currency_code: "USD",
          value: total,
          breakdown: {
            item_total: {
              currency_code: "USD",
              value: total,
            },
          },
        },
        items: orderProducts.map((item) => {
          return {
            name: item.name,
            unit_amount: {
              currency_code: "USD",
              value: item.soldPrice,
            },
            quantity: item.quantity,
          };
        }),
      },
    ],
  });

  const order = await paypalClient.execute(request);

  //end of payment
  // await new_order.save();

  // await UserModel.updateOne({ _id: id }, { $set: { cart: [] } });
  // req.session.coupons = [];
  // req.session.couponRes = "";
  res.json({
    stock: "ok",
    id: order.result.id,
  });
});

const save_order = tryCatch(async (req, res) => {
  const id = req.session.userID;
  const user = await UserModel.findOne({ _id: id });
  const products = await getCartProduct(user.cart);
  const changed = await changeStock(user.cart);
  console.log("changed: ", changed);
  if (!changed) {
    return res.json({
      message: "fail",
    });
  }
  let coupon = {};
  const orderNo = `#${generateOTP(4)}`;
  const coupons = req.session.coupons ? req.session.coupons : [];
  const couponRedux = coupons.reduce((acc, ele) => {
    return acc + parseInt(ele.offer);
  }, 0);
  if (coupons.length > 0) {
    coupon.name = coupons[0].name;
    coupon.discount = req.body.total - req.body.sub;
  }
  let total = 0;
  const orderProducts = products.map((element) => {
    const sold = parseInt(
      element.price * (1 - element.discount / 100) * (1 - couponRedux / 100)
    );
    total += sold;
    return {
      productID: element._id,
      name: element.name,
      soldPrice: sold,
      quantity: element.quantity,
      image: element.images[0],
      discount: element.price - sold,
      category: element.category[0],
    };
  });
  const new_order = new OrderModel({
    orderNo: orderNo,
    customer: id,
    products: orderProducts,
    totalAmount: total,
    shippingAddress: req.body.address,
    paymentMethode: "paypal",
    coupon: coupon,
  });

  // //payment
  // const request = new paypal.orders.OrdersCreateRequest();
  // const total = req.body.total;
  // request.prefer("return=representation");
  // request.requestBody({
  //   intent: "CAPTURE",
  //   purchase_units: [
  //     {
  //       amount: {
  //         currency_code: "USD",
  //         value: total,
  //         breakdown: {
  //           item_total: {
  //             currency_code: "USD",
  //             value: total,
  //           },
  //         },
  //       },
  //       items: orderProducts.map((item) => {
  //         return {
  //           name: item.name,
  //           unit_amount: {
  //             currency_code: "USD",
  //             value: item.soldPrice,
  //           },
  //           quantity: item.quantity,
  //         };
  //       }),
  //     },
  //   ],
  // });

  // const order = await paypalClient.execute(request);

  //end of payment
  await new_order.save();

  await UserModel.updateOne({ _id: id }, { $set: { cart: [] } });
  req.session.coupons = [];
  req.session.couponRes = "";
  res.json({
    message: "successful",
    orderNo: orderNo,
  });
});

const load_success = tryCatch(async (req, res) => {
  const category = await categoryHelper.activeCategoryName();
  const user = await UserModel.findOne({ _id: req.session.userID });
  const order = await OrderModel.findOne({ orderNo: req.query.orderNo });
  console.log("order no = ", req.query.orderNo);
  res.render("./user/orderSuccess", {
    user: user,
    category: category,
    order: order,
  });
});

const load_wallet_fail = async (req, res) => {
  try {
    const category = await categoryHelper.activeCategoryName();
    const user = await UserModel.findOne({ _id: req.session.userID });
    if (req.query.stock) {
      return res.render("./user/walletNil", {
        user: user,
        category: category,
        message:
          "Insufficiant stock in some product. Please remove them and continue.",
      });
    }
    res.render("./user/walletNil", {
      user: user,
      category: category,
      message: "The wallet does not have enough amount for payment.",
    });
  } catch (error) {
    res.send(error.message);
  }
};

module.exports = {
  load_cart,
  load_wallet_fail,
  add_to_cart,
  change_quantity,
  delete_from_cart,
  load_checkout,
  load_success,

  place_order,
  create_order,
  save_order,
  wallet_order,
};

async function getCartProduct(productId) {
  try {
    const products = await Promise.all(
      productId.map(async (element) => {
        let product = await ProductModel.findOne({ _id: element.product });
        product = { ...product.toObject(), quantity: element.quantity };
        if (element.quantity > product.stock)
          product.message = "Product stock limit!";
        return product;
      })
    );
    return products;
  } catch (error) {
    return error.message;
  }
}

async function changeStock(productId) {
  for (const element of productId) {
    const product = await ProductModel.findOne({ _id: element.product });

    if (product.stock < parseInt(element.quantity)) {
      return false;
    }

    const result = await ProductModel.updateOne(
      { _id: element.product },
      { $inc: { stock: -parseInt(element.quantity) } }
    );
  }

  return true;
}

async function checkStock(productId) {
  for (const element of productId) {
    const product = await ProductModel.findOne({ _id: element.product });

    if (product.stock < parseInt(element.quantity)) {
      return false;
    }
  }

  return true;
}
