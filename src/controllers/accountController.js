const Account = require("../models/accountModel");

const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

exports.getMyAccount = catchAsync(async (req, res, next) => {
  const account = await Account.findOne({
    where: {
      ownerId: req.user.id,
    },
  });

  if (!account) {
    return next(AppError("Account not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      account,
    },
  });
});

exports.updateMyAccount = catchAsync(async (req, res, next) => {
  const { name } = req.body;

  const accountSlug = `${name}-${Date.now()}`
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "");

  const account = await Account.findOne({
    where: {
      ownerId: req.user.id,
    },
  });

  if (!account) {
    return next(AppError("Account not found", 404));
  }

  await account.update({
    name,
    slug: accountSlug,
  });

  res.status(200).json({
    status: "success",
    message: "Account updated successfully",
    data: {
      account,
    },
  });
});
