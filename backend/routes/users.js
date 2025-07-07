const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const authMiddleware = require("../middleware/authMiddleware");
const { User, Department } = require("../models");

// Admin check middleware
const adminOnly = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied. Admins only." });
  }
  next();
};

// Create new user (Admin only)
router.post("/", authMiddleware, adminOnly, async (req, res) => {
  const { username, email, password, role, department_id } = req.body;

  if (!username || !email || !password) {
    return res
      .status(400)
      .json({ message: "Username, Email, and Password are required." });
  }

  try {
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res.status(400).json({ message: "Username already taken." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      role: role || "user",
      department_id: department_id || null,
    });

    const { password: _, ...userData } = user.toJSON();
    res.json({ message: "User created successfully", user: userData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error creating user." });
  }
});

// Get all users
router.get("/", authMiddleware, adminOnly, async (req, res) => {
  try {
    const users = await User.findAll({
      include: [{ model: Department, as: "Department" }],
      attributes: { exclude: ["password"] },
      order: [["createdAt", "DESC"]],
    });
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get user by ID
router.get("/:id", authMiddleware, adminOnly, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      include: [{ model: Department, as: "Department" }],
      attributes: { exclude: ["password"] },
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
