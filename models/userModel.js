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
  address: {
    pin: {
      type: Number,
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
  whishlist: {
    type: [mongoose.Schema.Types.ObjectId],
  },
  cart: [
    {
      item: {
        type: [mongoose.Schema.Types.ObjectId],
      },
      number: {
        type: Number,
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
});

module.exports = mongoose.model("user", userSchema);
