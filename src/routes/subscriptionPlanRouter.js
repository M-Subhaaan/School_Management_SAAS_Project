const express = require("express");
const subscriptionController = require("../controllers/subscriptionController");

const router = express.Router();

router.get("/:subscriptionPlanName", subscriptionController.getPlanByName);
router.get("/", subscriptionController.getAllPlans);

module.exports = router;
