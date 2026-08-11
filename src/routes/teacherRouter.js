const express = require("express");
const teacherController = require("../controllers/teacherController");

const { protect } = require("../middlewares/authMiddleware");

const { createTeacherValidation } = require("../validations/teacherValidation");
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

module.exports = router;
