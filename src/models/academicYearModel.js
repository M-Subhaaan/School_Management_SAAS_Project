const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const AcademicYear = sequelize.define(
  "AcademicYear",
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

    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },

    startDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },

    endDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },

    isCurrent: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },

    status: {
      type: DataTypes.ENUM("UPCOMING", "ACTIVE", "COMPLETED", "ARCHIVED"),
      allowNull: false,
      defaultValue: "UPCOMING",
    },
  },
  {
    tableName: "academic_years",
    timestamps: true,

    indexes: [
      { fields: ["accountId"] },
      { fields: ["schoolId"] },
      { fields: ["status"] },
      {
        unique: true,
        fields: ["accountId", "schoolId", "name"],
      },
    ],
  },
);

module.exports = AcademicYear;
