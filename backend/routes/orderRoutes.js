const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const Product = require("../models/Product");

// BUY
router.post("/buy", async (req, res) => {
  const { productId, userId, quantity, price } = req.body;

  if (!userId) {
    return res.status(400).json({ message: "User not logged in" });
  }

  const totalAmount = quantity * price;

  const order = await Order.create({
    productId,
    userId,
    quantity,
    totalAmount
  });

  res.json(order);
});

router.get("/", async (req, res) => {
  res.json(await Order.find()
    .populate("productId")
    .populate("userId")
    .populate("verifiedBy"));
});

router.get("/user/:id", async (req, res) => {
  if (!req.params.id || req.params.id === "null") {
    return res.status(400).json({ message: "Invalid UserId" });
  }

  res.json(await Order.find({ userId: req.params.id })
    .populate("productId"));
});

// APPROVE
router.put("/approve", async (req, res) => {
  const { orderId, staffId, productId, qty } = req.body;

  await Product.findByIdAndUpdate(productId, { $inc: { stock: -qty }});

  const order = await Order.findByIdAndUpdate(
    orderId,
    { status: "approved", verifiedBy: staffId },
    { new: true }
  );

  res.json(order);
});

// RETURN (24 hours)
router.put("/return/:id", async (req, res) => {
  const order = await Order.findById(req.params.id);
  const { reason } = req.body;

  const now = new Date();
  const diff = (now - order.createdAt) / (1000 * 60 * 60);

  if (diff > 24) {
    return res.status(400).json({ message: "Return period expired" });
  }

  await Product.findByIdAndUpdate(order.productId, {
    $inc: { stock: order.quantity }
  });

  order.status = "returned";
  order.returnReason = reason || "No reason provided";
  await order.save();

  res.json({ message: "Returned Successfully" });
});

// ADMIN SUMMARY
router.get("/summary", async (req, res) => {
  const totalProducts = await Product.countDocuments();

  const approved = await Order.find({ status: "approved" })
    .populate("productId")
    .populate("userId")
    .populate("verifiedBy");

  const totalRevenue = approved.reduce((sum, o) => sum + o.totalAmount, 0);

  res.json({
    totalProducts,
    totalOrders: approved.length,
    totalRevenue,
    orders: approved
  });
});

module.exports = router;