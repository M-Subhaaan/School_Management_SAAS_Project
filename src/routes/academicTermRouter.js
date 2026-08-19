const express = require("express");
const academicTermController = require("../controllers/academicTermController");

const { protect } = require("../middlewares/authMiddleware");
const {
  createAcademicTermValidation,
  updateAcademicTermValidation,
} = require("../validations/academicTermValidation");
const validate = require("../middlewares/validateMiddleware");

const router = express.Router();

router.post(
  "/",
  protect,
  createAcademicTermValidation,
  validate,
  academicTermController.createAcademicTerm
);

router.get("/", protect, academicTermController.getAllAcademicTerms);
router.get("/:id", protect, academicTermController.getAcademicTermById);

outer.patch(
  "/:id",
  protect,
  updateAcademicTermValidation,
  validate,
  academicTermController.updateAcademicTerm
);

router.patch("/:id/set-current", protect, academicTermController.setCurrentAcademicTerm);
router.delete("/:id", protect, academicTermController.deleteAcademicTerm);

module.exports = router;
