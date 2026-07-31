const express = require("express");
const authController = require("../controllers/authController");
const { protect } = require("../middlewares/authMiddleware");

const {
  createUserValidation,
  loginUserValidation,
} = require("../validations/userValidation");
const validate = require("../middlewares/validateMiddleware");

const router = express.Router();

router.post(
  "/register",
  createUserValidation,
  validate,
  authController.register,
);

router.post("/login", loginUserValidation, validate, authController.login);
router.get("/me", protect, authController.getMe);

router.post("/logout", authController.logout);

router.post("/forgotPassword", authController.forgotPassword);
router.post("/reset-password/:token", authController.resetPassword);

module.exports = router;
