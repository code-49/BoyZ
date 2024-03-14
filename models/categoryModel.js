const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
  },
  verified: {
    type: Boolean,
    required: true,
  },
});

module.exports = mongoose.model("category", categorySchema);
