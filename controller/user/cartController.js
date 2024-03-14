const paypal = require("@paypal/checkout-server-sdk");
require("dotenv").config();

const UserModel = require("../../models/userModel");
const ProductModel = require("../../models/productModel");
const CategoryModel = require("../../models/categoryModel");
const OrderModel = require("../../models/orderModel");

const tryCatch = require("../../utils/tryCatch");
const { generateOTP } = require("../../utils/otpGeneretor");

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

  const category = await CategoryModel.find({}, { name: 1 });

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
      const total = subtotal - discount - (subtotal * couponRedux) / 100;

      res.render("./user/cart", {
        paypalClientId: process.env.PAYPAL_CLIENT_ID,
        user: user,
        category: category,
        products: products,
        subtotal: subtotal,
        discount: discount,
        total: total,
        coupons: coupons,
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

  const doc = await UserModel.findOne({ _id: id });
  if (doc.cart) {
    let product_exist = false;
    doc.cart.forEach((ele) => {
      if (ele.product == req.query.productId) {
        product_exist = true;
      }
    });
    if (product_exist) {
      return res.json({ message: "product already exist in cart" });
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

  user.cart[productIndex].quantity = req.query.quantity;
  await user.save();
  res.send("/cart");
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
  const id = req.session.userID;
  const user = await UserModel.findOne({ _id: id });
  const products = await getCartProduct(user.cart);
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

  res.json({
    message: "successful",
    orderNo: orderNo,
    totalAmount: req.body.total,
  });
});

const create_order = tryCatch(async (req, res) => {
  const id = req.session.userID;
  const user = await UserModel.findOne({ _id: id });
  const products = await getCartProduct(user.cart);
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
    paymentMethode: "paypal",
  });

  //payment
  const request = new paypal.orders.OrdersCreateRequest();
  const total = req.body.total;
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
  console.log(order);

  //end of payment
  await new_order.save();

  await UserModel.updateOne({ _id: id }, { $set: { cart: [] } });
  res.json({ id: order.result.id });
});

const load_success = tryCatch(async (req, res) => {
  const category = await CategoryModel.find({}, { name: 1 });
  const user = await UserModel.findOne({ _id: req.session.userID });
  console.log(req.query.orderNo);
  res.render("./user/orderSuccess", {
    user: user,
    category: category,
    orderNo: req.query.orderNo,
    totalAmount: req.query.total,
  });
});

module.exports = {
  load_cart,
  add_to_cart,
  change_quantity,
  delete_from_cart,
  load_checkout,
  place_order,
  load_success,
  create_order,
};

async function getCartProduct(productId) {
  try {
    const products = await Promise.all(
      productId.map(async (element) => {
        let product = await ProductModel.findOne({ _id: element.product });
        product = { ...product.toObject(), quantity: element.quantity };
        return product;
      })
    );
    return products;
  } catch (error) {
    return error.message;
  }
}
