const express = require("express");
const accountController = require("../controllers/accountController");

const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/me", protect, accountController.getMyAccount);
router.patch("/me", protect, accountController.updateMyAccount);

module.exports = router;
