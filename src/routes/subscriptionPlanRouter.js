const express = require("express");
const subscriptionController = require("../controllers/subscriptionPlanController");

const router = express.Router();

router.get("/", subscriptionController.getAllPlans);

module.exports = router;
