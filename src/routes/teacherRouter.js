const express = require("express");
const teacherController = require("../controllers/teacherController");

const { protect } = require("../middlewares/authMiddleware");

const {
  createTeacherValidation,
  updateTeacherValidation,
} = require("../validations/teacherValidation");
const validate = require("../middlewares/validateMiddleware");

const router = express.Router();

router.post(
  "/",
  protect,
  createTeacherValidation,
  validate,
  teacherController.createTeacher,
);

router.get("/", protect, teacherController.getAllTeachers);
router.get("/:id", protect, teacherController.getTeacherById);

router.patch(
  "/:id",
  protect,
  updateTeacherValidation,
  validate,
  teacherController.updateTeacher,
);

router.patch("/:id/deactivate", protect, teacherController.deactivateTeacher);
router.patch("/:id/activate", protect, teacherController.activateTeacher);

module.exports = router;
