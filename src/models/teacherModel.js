const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Teacher = sequelize.define(
  "Teacher",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    accountId: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    schoolId: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    employeeId: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    qualification: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    joiningDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    status: {
      type: DataTypes.ENUM("ACTIVE", "INACTIVE"),
      allowNull: false,
      defaultValue: "ACTIVE",
    },
  },
  {
    tableName: "teachers",
    timestamps: true,
  },
);

module.exports = Teacher;
