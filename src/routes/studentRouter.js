const express = require("express");
const studentController = require("../controllers/studentController");

const { protect } = require("../middlewares/authMiddleware");

const {
  createStudentValidation,
  updateStudentValidation,
} = require("../validations/studentValidation");
const validate = require("../middlewares/validateMiddleware");

const router = express.Router();

router.post(
  "/",
  protect,
  createStudentValidation,
  validate,
  studentController.createStudent,
);

router.get("/", protect, studentController.getAllStudents);
router.get("/:id", protect, studentController.getStudentById);

router.patch(
  "/:id",
  protect,
  updateStudentValidation,
  validate,
  studentController.updateStudent,
);

router.patch("/:id/deactivate", protect, studentController.deactivateStudent);
router.patch("/:id/activate", protect, studentController.activateStudent);

module.exports = router;
