const Subscription = require("../models/subscriptionModel");
const Account = require("../models/accountModel");
const SubscriptionPlan = require("../models/subscriptionPlanModel");

const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

exports.getMySubscription = catchAsync(async (req, res, next) => {
  const subscription = await Subscription.findOne({
    include: [
      {
        model: Account,
        as: "account",
        where: {
          ownerId: req.user.id,
        },
        attributes: ["id", "name", "slug", "status"],
      },

      {
        model: SubscriptionPlan,
        as: "plan",
        attributes: [
          "id",
          "name",
          "price",
          "billingCycle",
          "maxSchools",
          "maxTeachers",
          "maxStudents",
        ],
      },
    ],
  });

  if (!subscription) {
    return next(AppError("Subscription not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      subscription,
    },
  });
});
