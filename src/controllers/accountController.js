const Account = require("../models/accountModel");

const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

exports.createAccount = catchAsync(async (req, res, next) => {
  const { name, slug } = req.body;

  if (!name) {
    return next(AppError("Name is Compulsory to Create a Account", 400));
  }

  const account = await Account.create({
    name,
    slug,
  });

  res.status(200).json({
    status: "Success",
    data: {
      account,
    },
  });
});

exports.getAccountById = catchAsync(async (req, res, next) => {
  const id = req.params.id;

  if (!id) {
    return next(AppError("ID is Needed to Search Account by ID", 400));
  }

  const account = await Account.findByPk(id);

  if (!account) {
    return next(AppError("Account not Found with That ID", 400));
  }

  res.status(200).json({
    status: "Success",
    data: {
      account,
    },
  });
});

exports.getAllAccounts = catchAsync(async (req, res, next) => {
  const accounts = await Account.findAll();

  if (!accounts) {
    return next(AppError("There is no account in DB", 400));
  }

  res.status(200).json({
    status: "Success",
    data: {
      accounts,
    },
  });
});

exports.getMyAccount = catchAsync(async (req, res, next) => {});
