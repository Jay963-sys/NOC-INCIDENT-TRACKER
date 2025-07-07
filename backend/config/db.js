const { Sequelize } = require("sequelize");

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "./database.sqlite", // We'll use SQLite for now, like your faults.db
  logging: false,
});

module.exports = sequelize;
