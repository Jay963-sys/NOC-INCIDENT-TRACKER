const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { User, Fault, Department, Customer, FaultNote } = require("../models");
const { Op } = require("sequelize");
const ExcelJS = require("exceljs");

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
        { model: User, as: "resolvedBy", attributes: ["id", "username"] },
        {
          model: User,
          as: "closedBy",
          attributes: ["id", "username"],
        },
      ],
    });

    const now = new Date();
    const result = faults.map((fault) => {
      const json = fault.toJSON();

      if (fault.status === "Open" || fault.status === "In Progress") {
        const created = new Date(fault.createdAt);
        const diffHours = (now - created) / (1000 * 60 * 60);
        json.pending_hours = parseFloat(diffHours.toFixed(1));
        json.severity = calculateSeverity(diffHours);
      }

      return json;
    });

    res.json(result);
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

const { FaultHistory } = require("../models"); // make sure this is at the top

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
      note,
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

    let previousStatus = fault.status;

    if (status && status !== fault.status) {
      fault.status = status;

      if (status === "Resolved") {
        fault.resolvedAt = new Date();
        fault.resolved_by = req.user.id;
        const diffMs = fault.resolvedAt - fault.createdAt;
        const calculatedPendingHours = diffMs / (1000 * 60 * 60);
        fault.pending_hours = calculatedPendingHours.toFixed(1);
        fault.severity = calculateSeverity(calculatedPendingHours);
      }

      if (status === "Closed") {
        fault.closedAt = new Date();
        fault.closed_by = req.user.id;
        const diffMs = fault.closedAt - fault.createdAt;
        const calculatedPendingHours = diffMs / (1000 * 60 * 60);
        fault.pending_hours = calculatedPendingHours.toFixed(1);
        fault.severity = calculateSeverity(calculatedPendingHours);
      }

      // ✅ Save to FaultHistory table
      await FaultHistory.create({
        fault_id: fault.id,
        previous_status: previousStatus,
        new_status: status,
        changed_by: req.user.id,
        note: note || null,
      });
    }

    await fault.save();
    res.json({ message: "Fault updated", fault });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error updating fault" });
  }
});

module.exports = router;

// GET /api/faults/:id/details - Get full fault details with customer and notes
router.get("/:id/details", authMiddleware, async (req, res) => {
  try {
    const fault = await Fault.findByPk(req.params.id, {
      include: [
        { model: Customer, as: "customer" },
        { model: Department, as: "department" },
        {
          model: FaultNote,
          as: "notes",
          include: [{ model: Department, as: "department" }],
        },
        {
          model: User,
          as: "resolvedBy",
          attributes: ["id", "username"],
        },
        {
          model: User,
          as: "closedBy",
          attributes: ["id", "username"],
        },
      ],
    });

    if (!fault) return res.status(404).json({ message: "Fault not found" });

    const created = new Date(fault.createdAt);
    const now = new Date();
    const diffHours = Math.abs(now - created) / 36e5;

    fault.pending_hours =
      fault.status === "Resolved" || fault.status === "Closed"
        ? "Resolved"
        : parseFloat(diffHours.toFixed(1));

    if (fault.status === "Resolved" || fault.status === "Closed") {
      // Keep existing severity
    } else {
      if (diffHours < 4) fault.severity = "Low";
      else if (diffHours < 12) fault.severity = "Medium";
      else if (diffHours < 24) fault.severity = "High";
      else fault.severity = "Critical";
    }

    res.json({ fault, notes: fault.notes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error fetching fault details" });
  }
});

router.post("/:id/notes", authMiddleware, async (req, res) => {
  try {
    const fault = await Fault.findByPk(req.params.id);
    if (!fault) return res.status(404).json({ message: "Fault not found" });

    const note = await FaultNote.create({
      fault_id: fault.id,
      content: req.body.content,
      created_by: req.user.id,
      department_id: req.user.department_id,
    });

    res.status(201).json(note);
  } catch (err) {
    console.error("Error adding note:", err);
    res.status(500).json({ message: "Failed to add note" });
  }
});

// GET /api/faults/:id/history - Get fault status change history
router.get("/:id/history", authMiddleware, async (req, res) => {
  try {
    const { FaultHistory, User } = require("../models");
    const history = await FaultHistory.findAll({
      where: { fault_id: req.params.id },
      include: [{ model: User, as: "user", attributes: ["id", "username"] }],
      order: [["createdAt", "DESC"]],
    });

    res.json(history);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching fault history" });
  }
});

router.get("/export", authMiddleware, async (req, res) => {
  try {
    const { status, department_id, severity, search } = req.query;
    const whereClause = {};
    const { Op } = require("sequelize");

    if (status && status !== "all") whereClause.status = status;
    if (department_id && department_id !== "all")
      whereClause.assigned_to_id = department_id;
    if (severity && severity !== "all") whereClause.severity = severity;

    let customerIds = [];
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
      include: [
        { model: Department, as: "department", attributes: ["name"] },
        {
          model: Customer,
          as: "customer",
          attributes: ["company", "circuit_id", "location"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    // Create Excel Workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Faults");

    // Define Header
    worksheet.columns = [
      { header: "Ticket #", key: "ticket_number", width: 12 },
      { header: "Description", key: "description", width: 30 },
      { header: "Type", key: "type", width: 15 },
      { header: "Location", key: "location", width: 20 },
      { header: "Owner", key: "owner", width: 20 },
      { header: "Status", key: "status", width: 15 },
      { header: "Severity", key: "severity", width: 12 },
      { header: "Pending (hrs)", key: "pending_hours", width: 15 },
      { header: "Department", key: "department", width: 18 },
      { header: "Customer", key: "customer", width: 25 },
      { header: "Circuit ID", key: "circuit_id", width: 18 },
      { header: "Logged At", key: "createdAt", width: 22 },
    ];

    // Add Rows
    faults.forEach((fault) => {
      worksheet.addRow({
        ticket_number: fault.ticket_number || fault.id,
        description: fault.description,
        type: fault.type,
        location: fault.location,
        owner: fault.owner,
        status: fault.status,
        severity: fault.severity,
        pending_hours: fault.pending_hours,
        department: fault.department?.name,
        customer: fault.customer?.company,
        circuit_id: fault.customer?.circuit_id,
        createdAt: new Date(fault.createdAt).toLocaleString(),
      });
    });

    // Set response headers
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=faults_export.xlsx"
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error("Excel export error:", err);
    res.status(500).json({ message: "Failed to export faults" });
  }
});
