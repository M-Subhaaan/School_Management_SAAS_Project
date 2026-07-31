const express = require("express");
const subscriptionController = require("../controllers/subscriptionController");

const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/me", protect, subscriptionController.getMySubscription);

router.get("/checkout");

module.exports = router;
