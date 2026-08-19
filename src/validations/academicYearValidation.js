const { body } = require("express-validator");

exports.createAcademicYearValidation = [
  body("schoolId")
    .notEmpty()
    .withMessage("School ID is required")
    .isUUID()
    .withMessage("Invalid school ID format"),

  body("name")
    .notEmpty()
    .withMessage("Academic year name is required")
    .trim()
    .isLength({ max: 100 })
    .withMessage("Name cannot exceed 100 characters"),

  body("startDate")
    .notEmpty()
    .withMessage("Start date is required")
    .isISO8601()
    .withMessage("Start date must be a valid date (YYYY-MM-DD)"),

  body("endDate")
    .notEmpty()
    .withMessage("End date is required")
    .isISO8601()
    .withMessage("End date must be a valid date (YYYY-MM-DD)")
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.startDate)) {
        throw new Error("End date must be after start date");
      }
      return true;
    }),

  body("isCurrent")
    .optional()
    .isBoolean()
    .withMessage("isCurrent must be a boolean"),

  body("status")
    .optional()
    .isIn(["UPCOMING", "ACTIVE", "COMPLETED", "ARCHIVED"])
    .withMessage("Invalid status value"),
];

exports.updateAcademicYearValidation = [
  body("name")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Name cannot exceed 100 characters"),

  body("startDate")
    .optional()
    .isISO8601()
    .withMessage("Start date must be a valid date"),

  body("endDate")
    .optional()
    .isISO8601()
    .withMessage("End date must be a valid date"),

  body("isCurrent")
    .optional()
    .isBoolean()
    .withMessage("isCurrent must be a boolean"),

  body("status")
    .optional()
    .isIn(["UPCOMING", "ACTIVE", "COMPLETED", "ARCHIVED"])
    .withMessage("Invalid status value"),
];
