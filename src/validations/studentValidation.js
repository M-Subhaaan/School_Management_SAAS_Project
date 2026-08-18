const { body } = require("express-validator");

exports.createStudentValidation = [
  body("schoolId")
    .notEmpty()
    .withMessage("School ID is required")
    .isUUID()
    .withMessage("Invalid school ID format"),

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
    .optional({ checkFalsy: true })
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail(),

  body("phone")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 7, max: 20 })
    .withMessage("Phone number must be between 7 and 20 characters"),

  body("gender")
    .notEmpty()
    .withMessage("Gender is required")
    .isIn(["MALE", "FEMALE", "OTHER"])
    .withMessage("Gender must be MALE, FEMALE, or OTHER"),

  body("dateOfBirth")
    .optional({ checkFalsy: true })
    .isISO8601()
    .withMessage("Date of birth must be a valid ISO8601 date (YYYY-MM-DD)"),

  body("admissionNumber")
    .notEmpty()
    .withMessage("Admission number is required")
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage("Admission number must be between 1 and 50 characters"),

  body("admissionDate")
    .notEmpty()
    .withMessage("Admission date is required")
    .isISO8601()
    .withMessage("Admission date must be a valid ISO8601 date (YYYY-MM-DD)"),

  body("address").optional({ checkFalsy: true }).trim(),
];

exports.updateStudentValidation = [
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
    .optional({ checkFalsy: true })
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail(),

  body("phone")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 7, max: 20 })
    .withMessage("Phone number must be between 7 and 20 characters"),

  body("gender")
    .optional()
    .isIn(["MALE", "FEMALE", "OTHER"])
    .withMessage("Gender must be MALE, FEMALE, or OTHER"),

  body("dateOfBirth")
    .optional({ checkFalsy: true })
    .isISO8601()
    .withMessage("Date of birth must be a valid ISO8601 date (YYYY-MM-DD)"),

  body("address").optional({ checkFalsy: true }).trim(),
];
