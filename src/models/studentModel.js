// src/models/studentModel.js

const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Student = sequelize.define(
  "Student",
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
      type: DataTypes.STRING(50),
      allowNull: false,
    },

    lastName: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },

    email: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },

    gender: {
      type: DataTypes.ENUM("MALE", "FEMALE", "OTHER"),
      allowNull: false,
    },

    dateOfBirth: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },

    admissionNumber: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },

    admissionDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },

    address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    status: {
      type: DataTypes.ENUM("ACTIVE", "INACTIVE"),
      allowNull: false,
      defaultValue: "ACTIVE",
    },
  },
  {
    tableName: "students",
    timestamps: true,

    indexes: [
      { fields: ["schoolId"] },
      { fields: ["status"] },
      {
        unique: true,
        fields: ["accountId", "schoolId", "admissionNumber"],
      },
    ],
  },
);

module.exports = Student;
