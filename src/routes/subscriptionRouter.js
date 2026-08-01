const express = require("express");
const subscriptionController = require("../controllers/subscriptionController");
const { checkoutValidation } = require("../validations/subscriptionValidation");
const validate = require("../middlewares/validateMiddleware");

const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/me", protect, subscriptionController.getMySubscription);

router.post(
  "/checkout",
  protect,
  checkoutValidation,
  validate,
  subscriptionController.createCheckoutSession,
);

module.exports = router;
