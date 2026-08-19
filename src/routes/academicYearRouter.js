const express = require("express");
const academicYearController = require("../controllers/academicYearController");

const { protect } = require("../middlewares/authMiddleware");
const {
  createAcademicYearValidation,
  updateAcademicYearValidation,
} = require("../validations/academicYearValidation");
const validate = require("../middlewares/validateMiddleware");

const router = express.Router();

outer = router;
router.post(
  "/",
  protect,
  createAcademicYearValidation,
  validate,
  academicYearController.createAcademicYear
);

router.get("/", protect, academicYearController.getAllAcademicYears);
router.get("/:id", protect, academicYearController.getAcademicYearById);

router.patch(
  "/:id",
  protect,
  updateAcademicYearValidation,
  validate,
  academicYearController.updateAcademicYear
);

router.patch("/:id/set-current", protect, academicYearController.setCurrentAcademicYear);
router.delete("/:id", protect, academicYearController.deleteAcademicYear);

module.exports = router;
