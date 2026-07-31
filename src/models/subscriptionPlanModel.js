const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const SubscriptionPlan = sequelize.define(
  "SubscriptionPlan",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    name: {
      type: DataTypes.ENUM("SILVER", "GOLD", "PLATINUM"),
      allowNull: false,
      unique: true,
    },

    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },

    billingCycle: {
      type: DataTypes.ENUM("FREE", "MONTHLY"),
      allowNull: false,
    },

    maxSchools: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    maxTeachers: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    maxStudents: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    stripePriceId: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
    },

    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "subscription_plans",
    timestamps: true,
  },
);

module.exports = SubscriptionPlan;
