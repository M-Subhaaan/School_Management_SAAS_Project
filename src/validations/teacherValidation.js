const { body } = require("express-validator");

exports.createTeacherValidation = [
  body("schoolId")
    .notEmpty()
    .withMessage("School ID is required")
    .isUUID()
    .withMessage("Invalid school ID"),

  body("firstName")
    .notEmpty()
    .withMessage("First name is required")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("First name must be between 2 and 50 characters"),

  body("lastName")
    .notEmpty()
    .withMessage("Last name is required")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Last name must be between 2 and 50 characters"),

  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),

  body("phone")
    .optional()
    .trim()
    .isLength({ min: 10, max: 20 })
    .withMessage("Phone number must be between 10 and 20 characters"),

  body("gender")
    .notEmpty()
    .withMessage("Gender is required")
    .isIn(["MALE", "FEMALE", "OTHER"])
    .withMessage("Invalid gender"),

  body("dateOfBirth")
    .optional()
    .isISO8601()
    .withMessage("Date of birth must be a valid date"),

  body("employeeId")
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage("Employee ID cannot exceed 50 characters"),

  body("qualification")
    .optional()
    .trim()
    .isLength({ max: 150 })
    .withMessage("Qualification cannot exceed 150 characters"),

  body("designation")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Designation cannot exceed 100 characters"),

  body("joiningDate")
    .optional()
    .isISO8601()
    .withMessage("Joining date must be a valid date"),

  body("status")
    .optional()
    .isIn(["ACTIVE", "INACTIVE"])
    .withMessage("Invalid status"),
];

exports.updateTeacherValidation = [
  body("schoolId").optional().isUUID().withMessage("Invalid school ID"),

  body("firstName")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("First name must be between 2 and 50 characters"),

  body("lastName")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Last name must be between 2 and 50 characters"),

  body("email")
    .optional()
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),

  body("phone")
    .optional()
    .trim()
    .isLength({ min: 10, max: 20 })
    .withMessage("Phone number must be between 10 and 20 characters"),

  body("gender")
    .optional()
    .isIn(["MALE", "FEMALE", "OTHER"])
    .withMessage("Invalid gender"),

  body("dateOfBirth")
    .optional()
    .isISO8601()
    .withMessage("Date of birth must be a valid date"),

  body("employeeId")
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage("Employee ID cannot exceed 50 characters"),

  body("qualification")
    .optional()
    .trim()
    .isLength({ max: 150 })
    .withMessage("Qualification cannot exceed 150 characters"),

  body("designation")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Designation cannot exceed 100 characters"),

  body("joiningDate")
    .optional()
    .isISO8601()
    .withMessage("Joining date must be a valid date"),

  body("status")
    .optional()
    .isIn(["ACTIVE", "INACTIVE"])
    .withMessage("Invalid status"),
];
