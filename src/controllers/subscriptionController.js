const SubscriptionPlan = require("../models/subscriptionPlanModel");

const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

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
