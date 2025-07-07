"use strict";

module.exports = (sequelize, DataTypes) => {
  const Fault = sequelize.define("Fault", {
    ticket_number: DataTypes.STRING,
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    type: DataTypes.STRING,
    location: DataTypes.STRING,
    owner: DataTypes.STRING,
    severity: DataTypes.STRING,
    status: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    pending_hours: DataTypes.FLOAT,
    resolvedAt: DataTypes.DATE,
    closedAt: DataTypes.DATE,
  });

  Fault.associate = (models) => {
    Fault.belongsTo(models.Customer, {
      foreignKey: "customer_id",
      as: "customer",
    });
    Fault.belongsTo(models.Department, {
      foreignKey: "assigned_to_id",
      as: "department",
    });
    Fault.hasMany(models.FaultNote, { foreignKey: "fault_id", as: "notes" });
  };

  return Fault;
};
