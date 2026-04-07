const express = require("express");
const router = express.Router();
const Product = require("../models/Product");

router.get("/", async (req, res) => {
  res.json(await Product.find());
});

router.post("/", async (req, res) => {
  res.json(await Product.create(req.body));
});

router.put("/:id", async (req, res) => {
  res.json(await Product.findByIdAndUpdate(req.params.id, req.body, { new: true }));
});

router.delete("/:id", async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
});

module.exports = router;