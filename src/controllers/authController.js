const bcrypt = require("bcrypt");
const crypto = require("crypto");
const { sequelize } = require("../config/db");

const User = require("../models/userModel");
const Account = require("../models/accountModel");
const SubscriptionPlan = require("../models/subscriptionPlanModel");

const { encrypt, decrypt } = require("../utils/encryption");
const hashValue = require("../utils/hash");

const generateToken = require("../utils/generateToken");

const emailService = require("../services/emailService");

const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

exports.register = catchAsync(async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    // User Creation
    const { firstName, lastName, email, password } = req.body;

    const normalizedEmail = email.toLowerCase().trim();

    const emailHash = hashValue(normalizedEmail);

    const existingUser = await User.findOne({
      where: {
        emailHash,
      },
      transaction,
    });

    if (existingUser) {
      await transaction.rollback();
      return next(AppError("User with this email already exists", 400));
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const encryptedEmail = encrypt(normalizedEmail);

    const user = await User.create(
      {
        firstName,
        lastName,
        emailEncrypted: encryptedEmail,
        emailHash,
        password: hashedPassword,
      },
      {
        transaction,
      },
    );

    // Account Creation
    const accountName = `${firstName} ${lastName}'s Account`;
    const accountSlug = `${firstName}-${lastName}-${Date.now()}`
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "");

    const account = await Account.create(
      {
        name: accountName,
        slug: accountSlug,
        ownerId: user.id,
      },
      {
        transaction,
      },
    );

    //Find Silver Plan
    const silverPlan = await SubscriptionPlan.findOne({
      where: {
        name: "SILVER",
      },
      transaction,
    });

    if (!silverPlan) {
      await transaction.rollback();
      return next(AppError("Silver Subscription plan not found", 400));
    }
    await transaction.commit();

    const token = generateToken(user, res);

    res.status(201).json({
      status: "success",
      data: {
        user: {
          token,
          id: user.id,
          name: `${user.firstName} ${user.lastName}`,
          email: normalizedEmail,
        },

        account: {
          id: account.id,
          name: account.name,
          slug: account.slug,
        },

        plan: {
          name: silverPlan.name,
          price: silverPlan.price,
          maxSchools: silverPlan.maxSchools,
          maxTeachers: silverPlan.maxTeachers,
          maxStudents: silverPlan.maxStudents,
        },
      },
    });
  } catch (error) {
    await transaction.rollback();
    return next(error);
  }
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  const normalizedEmail = email.toLowerCase().trim();

  const emailHash = hashValue(normalizedEmail);

  const user = await User.findOne({
    where: {
      emailHash,
    },
  });

  if (!user) {
    return next(AppError("Invalid email or password", 401));
  }

  if (user.status !== "ACTIVE") {
    return next(AppError("Your account is not active", 403));
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return next(AppError("Invalid email or password", 401));
  }

  const token = generateToken(user, res);

  res.status(200).json({
    status: "success",
    token,
    data: {
      user: {
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        email: normalizedEmail,
      },
    },
  });
});

exports.getMe = catchAsync(async (req, res, next) => {
  const user = await User.findByPk(req.user.id, {
    attributes: [
      "id",
      "firstName",
      "lastName",
      "status",
      "createdAt",
      "updatedAt",
    ],
  });

  if (!user) {
    return next(AppError("User not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      user: {
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        status: user.status,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    },
  });
});

exports.logout = catchAsync(async (req, res, next) => {
  res.clearCookie("jwt", {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV !== "development",
  });

  res.status(200).json({
    status: "success",
    message: "Logged out successfully",
  });
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const email = req.body.email;

  if (!email) {
    return next(AppError("Please Provide You Email Address", 400));
  }

  const normalizedEmail = email.toLowerCase().trim();

  const emailHash = hashValue(normalizedEmail);

  const user = await User.findOne({
    where: {
      emailHash,
    },
  });

  if (!user) {
    return next(AppError("No User Found with That Email Address", 400));
  }

  const resetToken = crypto.randomBytes(32).toString("hex");

  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  user.resetPasswordToken = hashedToken;

  user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);

  await user.save();

  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

  await emailService.sendPasswordResetEmail(normalizedEmail, resetUrl);

  res.status(200).json({
    status: "Success",
    message: "A Reset Link Has Been Sent to Your Email Address",
  });
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const token = req.params.token;
  const password = req.body.newPassword;

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    where: {
      resetPasswordToken: hashedToken,
    },
  });

  if (!user) {
    return next(AppError("Invalid Reset Token", 400));
  }

  if (user.resetPasswordExpires < new Date()) {
    return next(AppError("Reset token has been expired", 400));
  }

  const newPassword = await bcrypt.hash(password, 10);

  user.password = newPassword;

  user.resetPasswordToken = null;

  user.resetPasswordExpires = null;

  await user.save();

  res.status(200).json({
    status: "Success",
    message: "Password reset successfully",
  });
});
