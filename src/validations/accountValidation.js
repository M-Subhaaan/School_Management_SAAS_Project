const { body, param } = require("express-validator");

exports.createAccountValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Account name is required")
    .isLength({ min: 2, max: 150 })
    .withMessage("Account name must be between 2 and 150 characters"),

  body("slug")
    .trim()
    .notEmpty()
    .withMessage("Slug is required")
    .isLength({ min: 2, max: 180 })
    .withMessage("Slug must be between 2 and 180 characters")
    .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .withMessage(
      "Slug can only contain lowercase letters, numbers, and hyphens",
    ),
];

exports.accountIdValidation = [
  param("id").isUUID().withMessage("Valid account ID is required"),
];
