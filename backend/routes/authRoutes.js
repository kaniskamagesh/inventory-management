const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// REGISTER
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || "user"
    });

    res.json({ message: "Registered Successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// LOGIN
router.post("/login/:role", async (req, res) => {
  try {
    const { email, password } = req.body;
    const requestedRole = req.params.role;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User Not Found" });
    }

    if (user.role !== requestedRole) {
      return res.status(400).json({ message: `This account is not a ${requestedRole}` });
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(400).json({ message: "Invalid Password" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || "secret123",
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login Successful",
      token,
      role: user.role,
      userId: user._id
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET ALL USERS
router.get("/users", async (req, res) => {
  const users = await User.find().select("-password");
  res.json(users);
});

// GET SINGLE USER
router.get("/user/:id", async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");
  res.json(user);
});

// UPDATE USER
router.put("/:id", async (req, res) => {
  const { name, email, password, role } = req.body;

  let updateData = { name, email, role };

  if (password) {
    const hashed = await bcrypt.hash(password, 10);
    updateData.password = hashed;
  }

  const updated = await User.findByIdAndUpdate(req.params.id, updateData, {
    new: true
  });

  res.json(updated);
});

// DELETE USER
router.delete("/:id", async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: "User Deleted" });
});

module.exports = router;