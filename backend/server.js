require("dotenv").config();
const express = require("express");
const cors = require("cors");
const sequelize = require("./config/db");

// Import Models
const User = require("./models/User");
const Department = require("./models/Department");
const Customer = require("./models/Customer");
const Fault = require("./models/Fault");
const FaultNote = require("./models/FaultNote");

// Import Middleware
const authMiddleware = require("./middleware/authMiddleware");

// Initialize Express App
const app = express();
app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);

const faultRoutes = require("./routes/faults");
app.use("/api/faults", faultRoutes);

const departmentRoutes = require("./routes/departments");
app.use("/api/departments", departmentRoutes);

const customerRoutes = require("./routes/customers");
app.use("/api/customers", customerRoutes);

const faultNoteRoutes = require("./routes/faultNotes");
app.use("/api/fault-notes", faultNoteRoutes);

const userRoutes = require("./routes/users");
app.use("/api/users", userRoutes);

// Test Route
app.get("/", (req, res) => {
  res.send("NOC Fault Logger API Running");
});

// ✅ Protected Route Example
app.get("/api/protected", authMiddleware, (req, res) => {
  res.json({
    message: "Access granted to protected route",
    user: req.user, // Comes from decoded token
  });
});

// Sync Database and Start Server
sequelize
  .sync({ alter: true })
  .then(() => {
    console.log("Database synced successfully");
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("Database sync failed:", err);
  });
