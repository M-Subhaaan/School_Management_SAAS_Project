const { body } = require("express-validator");

exports.createTeacherValidation = [
  body("schoolId")
    .notEmpty()
    .withMessage("School ID is required")
    .isUUID()
    .withMessage("Invalid School ID"),

  body("firstName").notEmpty().withMessage("First name is required").trim(),

  body("lastName").notEmpty().withMessage("Last name is required").trim(),

  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Valid email is required")
    .normalizeEmail(),

  body("phone").optional().trim(),

  body("employeeId").optional().trim(),

  body("qualification").optional().trim(),

  body("joiningDate")
    .optional()
    .isISO8601()
    .withMessage("Joining date must be a valid date"),
];

exports.updateTeacherValidation = [
  body("firstName")
    .optional()
    .notEmpty()
    .withMessage("First name cannot be empty")
    .trim(),

  body("lastName")
    .optional()
    .notEmpty()
    .withMessage("Last name cannot be empty")
    .trim(),

  body("email")
    .optional()
    .isEmail()
    .withMessage("Valid email is required")
    .normalizeEmail(),

  body("phone").optional().trim(),

  body("employeeId").optional().trim(),

  body("qualification").optional().trim(),

  body("joiningDate")
    .optional()
    .isISO8601()
    .withMessage("Joining date must be a valid date"),
];
