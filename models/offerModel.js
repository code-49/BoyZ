const mongoose = require("mongoose");

const offerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      require: true,
    },
    type: {
      type: String,
      require: true,
    },
    item: {
      item_id: {
        type: mongoose.Schema.Types.ObjectId,
      },
      name: {
        type: String,
      },
    },
    active: {
      type: Boolean,
      default: true,
    },
    offer: {
      type: Number,
    },
    expiry: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("offer", offerSchema);
