const SubscriptionPlan = require("../models/subscriptionPlanModel");

const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

exports.getPlanByName = catchAsync(async (req, res, next) => {
  const name = req.params.subscriptionPlanName;

  const plan = await SubscriptionPlan.findOne({
    where: {
      name,
    },
  });

  if (!plan) {
    return next(AppError("Subscription Plan Not Found", 400));
  }

  res.status(200).json({
    status: "Success",
    data: {
      plan,
    },
  });
});

exports.getAllPlans = catchAsync(async (req, res, next) => {
  const plans = await SubscriptionPlan.findAll({
    where: {
      isActive: true,
    },
    order: [["price", "ASC"]],
  });

  res.status(200).json({
    status: "Success",
    data: {
      plans,
    },
  });
});
