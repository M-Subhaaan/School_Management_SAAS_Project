const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const School = sequelize.define(
  "School",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    accountId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "accounts",
        key: "id",
      },
    },

    name: {
      type: DataTypes.STRING(150),
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "School name is required",
        },
      },
    },

    slug: {
      type: DataTypes.STRING(180),
      allowNull: false,
      unique: true,
    },

    email: {
      type: DataTypes.STRING(150),
      allowNull: true,
      validate: {
        isEmail: {
          msg: "Please provide a valid email",
        },
      },
    },

    phone: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },

    website: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    registrationNumber: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },

    logo: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },

    country: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },

    state: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },

    city: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },

    address: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },

    postalCode: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },

    timezone: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: "Asia/Karachi",
    },

    currency: {
      type: DataTypes.STRING(10),
      allowNull: false,
      defaultValue: "PKR",
    },

    status: {
      type: DataTypes.ENUM("ACTIVE", "INACTIVE", "SUSPENDED"),
      allowNull: false,
      defaultValue: "ACTIVE",
    },
  },
  {
    tableName: "schools",
    timestamps: true,

    indexes: [
      {
        fields: ["accountId"],
      },
      {
        unique: true,
        fields: ["slug"],
      },
      {
        fields: ["status"],
      },
    ],
  },
);

module.exports = School;
