const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Subscription = sequelize.define(
  "Subscription",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    accountId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
    },

    planId: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    status: {
      type: DataTypes.ENUM("ACTIVE", "CANCELED", "EXPIRED", "PAST_DUE"),
      allowNull: false,
      defaultValue: "ACTIVE",
    },

    billingCycle: {
      type: DataTypes.ENUM("FREE", "MONTHLY"),
      allowNull: false,
    },

    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },

    currentPeriodStart: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },

    currentPeriodEnd: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    cancelAtPeriodEnd: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },

    canceledAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "subscriptions",
    timestamps: true,
  },
);

module.exports = Subscription;
