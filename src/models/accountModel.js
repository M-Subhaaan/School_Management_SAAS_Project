const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Account = sequelize.define(
  "Account",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    name: {
      type: DataTypes.STRING(150),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Account name is required",
        },
        len: {
          args: [6, 15],
          msg: "Account name must be between 6 and 15 characters",
        },
      },
    },

    slug: {
      type: DataTypes.STRING(180),
      allowNull: false,
      unique: true,
    },

    status: {
      type: DataTypes.ENUM("ACTIVE", "SUSPENDED", "DELETED"),
      allowNull: false,
      defaultValue: "ACTIVE",
    },
  },
  {
    tableName: "accounts",
    timestamps: true,
    paranoid: true,
    indexes: [
      {
        unique: true,
        fields: ["slug"],
      },
    ],
  },
);

module.exports = Account;
