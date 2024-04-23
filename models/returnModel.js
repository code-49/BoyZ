const mongoose = require("mongoose");

const returnSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
  },
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  reason: {
    type: String,
  },
  status: {
    type: String,
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "order",
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "order",
  },
});

module.exports = mongoose.model("return", returnSchema);
