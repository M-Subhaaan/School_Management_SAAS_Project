const { body } = require("express-validator");

exports.checkoutValidation = [
  body("plan")
    .trim()
    .notEmpty()
    .withMessage("Plan is required")
    .isIn(["GOLD", "PLATINUM", "gold", "platinum", "Gold", "Platinum"])
    .withMessage("Only GOLD and PLATINUM plans can be purchased"),
];
