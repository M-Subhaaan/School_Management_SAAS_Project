const jwt = require("jsonwebtoken");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const User = require("../models/userModel");

exports.protect = catchAsync(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  if (!token) {
    return next(
      AppError("You are not logged in...Please Log in to get Access", 401),
    );
  }
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return next(AppError("Invalid Token", 401));
  }

  const currentUser = await User.findByPk(decoded.id);
  if (!currentUser) {
    return next(
      AppError("The User belonging to this token does no longer exist", 401),
    );
  }

  if (currentUser.changedPasswordAt) {
    const changedTimeStamp = Math.floor(
      currentUser.changedPasswordAt.getTime() / 1000,
    );

    if (changedTimeStamp > decoded.iat) {
      return next(
        AppError(
          "You Recently Changed Your Password. Please Login again to get access",
          401,
        ),
      );
    }
  }
  req.user = currentUser;

  next();
});
