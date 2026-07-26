const express = require("express");
const accountController = require("../controllers/accountController");

const {
  createAccountValidation,
  accountIdValidation,
} = require("../validations/accountValidation");
const validate = require("../middlewares/validateMiddleware");

const router = express.Router();

router.post(
  "/",
  createAccountValidation,
  validate,
  accountController.createAccount,
);
router.get("/", accountController.getAllAccounts);
router.get(
  "/:id",
  accountIdValidation,
  validate,
  accountController.getAccountById,
);
router.get("/me", accountController.getMyAccount);

module.exports = router;
