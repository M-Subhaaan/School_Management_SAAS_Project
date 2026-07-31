const { body } = require("express-validator");

exports.checkoutValidation = [
  body("plan")
    .notEmpty()
    .withMessage("Plan is required")
    .isIn(["GOLD", "PLATINUM"])
    .withMessage("Invalid subscription plan"),
];
