const express = require("express");
const router = express.Router();
const { Department } = require("../models");
const authMiddleware = require("../middleware/authMiddleware");

// Get all departments (Protected)
router.get("/", authMiddleware, async (req, res) => {
  try {
    const departments = await Department.findAll({ order: [["name", "ASC"]] });
    res.json(departments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Create a new department (Admin only)
router.post("/", authMiddleware, async (req, res) => {
  if (req.user.role !== "admin") {
    return res
      .status(403)
      .json({ message: "Only admin can create departments" });
  }

  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ message: "Department name is required" });
  }

  try {
    const department = await Department.create({ name });
    res.json({ message: "Department created", department });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
