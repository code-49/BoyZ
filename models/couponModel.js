const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      require: true,
    },
    code: {
      type: String,
      require: true,
      unique: true,
    },
    offer: {
      type: Number,
      required: true,
    },
    isActive: {
      type: Boolean,
      require: true,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("coupon", couponSchema);
