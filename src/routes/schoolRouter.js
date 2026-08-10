const express = require("express");
const schoolController = require("../controllers/schoolController");

const { protect } = require("../middlewares/authMiddleware");

const {
  createSchoolValidation,
  updateSchoolValidation,
} = require("../validations/schoolValidation");
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

router.patch(
  "/:id",
  protect,
  updateSchoolValidation,
  validate,
  schoolController.updateSchool,
);

router.patch("/:id/deactivate", protect, schoolController.deactivateSchool);
router.patch("/:id/activate", protect, schoolController.activateSchool);
module.exports = router;
