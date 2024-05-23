const mongoose = require("mongoose");

const walletSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    unique: true,
  },
  amount: {
    type: Number,
    default: 0,
  },
  transaction: [
    {
      amount: {
        type: Number,
      },
      type: {
        type: String,
        enum: ["refund", "withdrawl"],
      },
    },
  ],
});
module.exports = mongoose.model("wallet", walletSchema);
