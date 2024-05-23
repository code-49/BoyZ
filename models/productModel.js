const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      unique: true,
      required: true,
      validate: {
        validator: async function (name) {
          const existingProduct = await this.constructor.findOne({ name });
          return !existingProduct;
        },
        message: (props) =>
          `The product "${props.value}" already exists. Please choose a different name.`,
      },
    },
    description: {
      type: String,
      required: true,
    },
    color: {
      type: [String],
      required: true,
    },
    size: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    discount: {
      type: Number,
      default: 0,
    },
    stock: {
      type: Number,
      required: true,
    },
    images: {
      type: [String],
      required: true,
    },
    category: {
      type: [String],
      required: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
    rating: {
      type: Number,
      default: 0,
    },
    reviews: [
      {
        user_id: {
          type: mongoose.Schema.Types.ObjectId,
        },
        name: {
          type: String,
        },
        review: {
          type: String,
        },
        rated: {
          type: Number,
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("product", productSchema);
