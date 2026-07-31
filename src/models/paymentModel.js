const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Payment = sequelize.define(
  "Payment",
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

    subscriptionId: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    stripePaymentIntentId: {
      type: DataTypes.STRING,
    },

    stripeInvoiceId: {
      type: DataTypes.STRING,
    },

    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },

    currency: {
      type: DataTypes.STRING,
      defaultValue: "usd",
    },

    status: {
      type: DataTypes.ENUM("PENDING", "SUCCEEDED", "FAILED", "REFUNDED"),
      defaultValue: "PENDING",
    },

    paymentMethod: {
      type: DataTypes.STRING,
    },

    paidAt: {
      type: DataTypes.DATE,
    },
  },
  {
    tableName: "payments",
    timestamps: true,
  },
);

module.exports = Payment;
