const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: String,
  price: Number,
  cost: Number,
  stock: Number
});

module.exports = mongoose.model("Product", productSchema);