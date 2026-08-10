const { body } = require("express-validator");

exports.createSchoolValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("School name is required")
    .isLength({ max: 150 })
    .withMessage("School name cannot exceed 150 characters"),

  body("email")
    .optional()
    .isEmail()
    .withMessage("Please provide a valid school email"),

  body("phone").optional().trim(),

  body("website")
    .optional()
    .trim()
    .isURL()
    .withMessage("Please provide a valid website URL"),

  body("registrationNumber").optional().trim(),

  body("country").trim().notEmpty().withMessage("Country is required"),

  body("state").trim().notEmpty().withMessage("State is required"),

  body("city").trim().notEmpty().withMessage("City is required"),

  body("address").trim().notEmpty().withMessage("Address is required"),

  body("postalCode").optional().trim(),

  body("timezone").optional().trim(),

  body("currency")
    .optional()
    .trim()
    .isLength({ min: 3, max: 3 })
    .withMessage("Currency must be a 3-letter code"),
];

exports.updateSchoolValidation = [
  body("name")
    .optional()
    .notEmpty()
    .withMessage("School name cannot be empty")
    .trim(),

  body("address")
    .optional()
    .notEmpty()
    .withMessage("School address cannot be empty")
    .trim(),

  body("phone")
    .optional()
    .notEmpty()
    .withMessage("School phone cannot be empty")
    .trim(),

  body("email")
    .optional()
    .isEmail()
    .withMessage("Valid school email is required")
    .normalizeEmail(),
];
