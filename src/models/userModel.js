const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    firstName: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },

    lastName: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },

    emailEncrypted: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    emailHash: {
      type: DataTypes.STRING(64),
      allowNull: false,
      unique: true,
    },

    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    changedPasswordAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    resetPasswordToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    resetPasswordExpires: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    status: {
      type: DataTypes.ENUM("ACTIVE", "SUSPENDED", "DELETED"),
      allowNull: false,
      defaultValue: "ACTIVE",
    },
  },
  {
    hooks: {
      beforeUpdate: (user) => {
        if (user.changed("password")) {
          user.set("changedPasswordAt", new Date());
        }
      },
    },
  },
  {
    tableName: "users",
    timestamps: true,
    paranoid: true,
  },
);

module.exports = User;
