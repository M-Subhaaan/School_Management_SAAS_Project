const { validationResult } = require("express-validator");
const AppError = require("../utils/appError");

module.exports = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const message = errors
      .array()
      .map((err) => err.msg)
      .join(". ");

    return next(AppError(message, 400));
  }

  next();
};
