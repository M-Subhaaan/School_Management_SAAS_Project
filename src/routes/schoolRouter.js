const express = require("express");
const schoolController = require("../controllers/schoolController");

const { protect } = require("../middlewares/authMiddleware");

const { createSchoolValidation } = require("../validations/schoolValidation");
const validate = require("../middlewares/validateMiddleware");

const router = express.Router();

router.post(
  "/",
  protect,
  createSchoolValidation,
  validate,
  schoolController.createSchool,
);

router.get("/", protect, schoolController.getMySchools);
router.get("/:id", protect, schoolController.getSchoolById);

module.exports = router;
