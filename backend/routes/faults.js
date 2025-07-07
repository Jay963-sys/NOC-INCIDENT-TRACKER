const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { Fault, Department, Customer } = require("../models");
const { Op } = require("sequelize");

function calculateSeverity(pendingHours) {
  if (pendingHours < 4) return "Low";
  if (pendingHours < 12) return "Medium";
  if (pendingHours < 24) return "High";
  return "Critical";
}

router.get("/", authMiddleware, async (req, res) => {
  try {
    const { status, department_id, severity, search } = req.query;

    const whereClause = {};

    if (status && status !== "all") {
      whereClause.status = status;
    }

    if (department_id && department_id !== "all") {
      whereClause.assigned_to_id = department_id;
    }

    if (severity && severity !== "all") {
      whereClause.severity = severity;
    }

    let customerIds = [];

    // Step 1: Search customers if search term provided
    if (search) {
      const customers = await Customer.findAll({
        where: {
          [Op.or]: [
            { company: { [Op.like]: `%${search}%` } },
            { circuit_id: { [Op.like]: `%${search}%` } },
          ],
        },
        attributes: ["id"],
      });
      customerIds = customers.map((c) => c.id);
    }

    // Step 2: Build Fault search
    if (search) {
      whereClause[Op.or] = [
        { ticket_number: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
        { type: { [Op.like]: `%${search}%` } },
      ];

      if (customerIds.length > 0) {
        whereClause[Op.or].push({ customer_id: { [Op.in]: customerIds } });
      }
    }

    const faults = await Fault.findAll({
      where: whereClause,
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: Department,
          as: "department",
          attributes: ["id", "name"],
        },
        {
          model: Customer,
          as: "customer",
          attributes: [
            "id",
            "company",
            "circuit_id",
            "type",
            "location",
            "ip_address",
            "pop_site",
            "email",
            "switch_info",
            "owner",
          ],
        },
      ],
    });

    res.json(faults);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error fetching faults" });
  }
});

module.exports = router;

router.post("/", authMiddleware, async (req, res) => {
  const {
    description,
    type,
    location,
    owner,
    assigned_to_id,
    status,
    pending_hours,
    customer_id,
  } = req.body;

  if (!description || !status || !customer_id || !assigned_to_id) {
    return res.status(400).json({
      message: "Description, Status, Customer, and Department are required.",
    });
  }

  try {
    const severity = calculateSeverity(pending_hours || 0);

    const fault = await Fault.create({
      description,
      type,
      location,
      owner,
      severity,
      status,
      pending_hours,
      customer_id,
      assigned_to_id,
    });

    res.json({ message: "Fault created successfully", fault });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error creating fault" });
  }
});

router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const fault = await Fault.findByPk(req.params.id);
    if (!fault) return res.status(404).json({ message: "Fault not found" });

    const {
      description,
      type,
      location,
      owner,
      assigned_to_id,
      status,
      pending_hours,
      customer_id,
    } = req.body;

    if (description) fault.description = description;
    if (type) fault.type = type;
    if (location) fault.location = location;
    if (owner) fault.owner = owner;
    if (assigned_to_id) fault.assigned_to_id = assigned_to_id;
    if (customer_id) fault.customer_id = customer_id;
    if (pending_hours != null) {
      fault.pending_hours = pending_hours;
      fault.severity = calculateSeverity(pending_hours);
    }

    if (status && status !== fault.status) {
      fault.status = status;

      if (status === "Resolved") {
        fault.resolvedAt = new Date();
        const diffMs = fault.resolvedAt - fault.createdAt;
        const calculatedPendingHours = diffMs / (1000 * 60 * 60);
        fault.pending_hours = calculatedPendingHours.toFixed(1);
        fault.severity = calculateSeverity(calculatedPendingHours);
      }

      if (status === "Closed") {
        fault.closedAt = new Date();
        const diffMs = fault.closedAt - fault.createdAt;
        const calculatedPendingHours = diffMs / (1000 * 60 * 60);
        fault.pending_hours = calculatedPendingHours.toFixed(1);
        fault.severity = calculateSeverity(calculatedPendingHours);
      }
    }

    await fault.save();
    res.json({ message: "Fault updated", fault });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error updating fault" });
  }
});

module.exports = router;
