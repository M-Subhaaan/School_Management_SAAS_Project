const User = require("../models/userModel");

const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

exports.createUser = catchAsync(async (req, res, next) => {
  const { firstName, lastName, email, password } = req.body;

  const user = await User.create;
});
