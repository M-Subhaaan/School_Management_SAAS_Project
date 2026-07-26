const express = require("express");
const userController = require("../controllers/userController");

const {
  createUserValidation,
  loginUserValidation,
} = require("../validations/userValidation");
const validate = require("../middlewares/validateMiddleware");

const router = express.Router();

module.exports = router;
