const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  password: {
    type: String,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phone: {
    type: Number,
  },
  is_admin: {
    type: Boolean,
    default: false,
  },
  address: [
    {
      pin: {
        type: String,
      },
      locality: {
        type: String,
      },
      building: {
        type: String,
      },
      city: {
        type: String,
      },
      state: {
        type: String,
      },
    },
  ],
  whishlist: {
    type: [mongoose.Schema.Types.ObjectId],
  },
  cart: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "product",
      },
      quantity: {
        type: Number,
        default: 1,
      },
    },
  ],
  is_verified: {
    type: Boolean,
    default: false,
  },
  blocked: {
    type: Boolean,
    default: false,
  },
  wallet: {
    type: Number,
    defualt: 0,
  },
});
module.exports = mongoose.model("user", userSchema);
