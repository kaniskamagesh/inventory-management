const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  quantity: Number,
  totalAmount: Number,
  status: { type: String, default: "Pending" },
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  returnReason: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Order", orderSchema);