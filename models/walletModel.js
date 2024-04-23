const { Transaction } = require("mongodb");
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  transaction: [
    {
      amount: {
        type: Number,
      },
    },
  ],
});
module.exports = mongoose.model("user", userSchema);
