const mongoose = require("mongoose");
const { type } = require("../utils/validation/productVal");

const orderSchema = new mongoose.Schema(
  {
    orderNo: {
      type: String,
      required: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    coupon: {
      name: {
        type: String,
        default: "none",
      },
      discount: {
        type: Number,
        defualt: 0,
      },
    },
    products: [
      {
        productID: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "product",
        },
        image: {
          type: String,
        },
        name: {
          type: String,
        },
        soldPrice: {
          type: Number,
        },
        quantity: {
          type: Number,
          default: 1,
        },
        discount: {
          type: Number,
          default: 0,
        },
        category: {
          type: String,
        },
      },
    ],
    status: {
      type: String,
      enum: [
        "Pending",
        "Processing",
        "Shipped",
        "Delivered",
        "Cancelled",
        "Returned",
      ],
      default: "Pending",
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    shippingAddress: {
      type: String,
      required: true,
    },
    paymentMethode: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("order", orderSchema);
